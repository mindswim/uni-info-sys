# Frontend Development Insights & Recommendations

Based on the comprehensive API response data and test suite analysis, here are the key insights and recommendations for building your frontend:

## 1. Key Data Structure Differences from Initial Assumptions

### Student Model
- **Actual**: Uses `student_id` (not `student_id_number`) as the unique identifier
- **Has**: `status`, `enrollment_date`, `graduation_date`, `gpa`, `total_credits`
- **Important**: Student is linked to User via `user_id`, and User contains name/email/roles

### Enrollment Model
- **Complex Fields**: `waitlist_position`, `reason_for_change`, `grade_points`
- **Status Flow**: `enrolled` → `waitlisted` → `completed` → `withdrawn`
- **Business Logic**: Automatic waitlist assignment when capacity is full

### Course Section Model
- **Rich Data**: `enrolled_count`, `waitlisted_count`, `status` (open/closed/cancelled/full)
- **Deadlines**: `add_drop_deadline`, `withdrawal_deadline` for business rule enforcement
- **Schedule**: `schedule_days` as array, separate `start_time` and `end_time`

## 2. Critical Business Rules to Implement in UI

### Enrollment Management
```typescript
// Key rules from tests:
1. Capacity checking happens automatically on backend
2. Frontend should show real-time capacity (enrolled_count / capacity)
3. Show waitlist position when status === 'waitlisted'
4. Disable enrollment actions after add_drop_deadline
5. Show different button text: "Enroll" vs "Join Waitlist"
```

### Grade Management
```typescript
// Grade change requirements:
1. Must provide 'reason_for_change' when updating grade
2. Only instructor of course section can update grades
3. Grades can only be assigned to 'completed' enrollments
4. All grade changes are audited
```

### Application Status Flow
```typescript
// Valid transitions:
'draft' → 'submitted' (student action)
'submitted' → 'under_review' (staff action)  
'under_review' → 'accepted'/'rejected'/'deferred' (staff action)

// UI should prevent invalid transitions
```

## 3. Performance Optimizations

### Pagination Implementation
```typescript
// All list endpoints use Laravel pagination:
interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Use React Query for caching:
const { data } = useQuery({
  queryKey: ['students', page, filters],
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});
```

### Relationship Loading
```typescript
// Use ?include parameter to load relationships:
'/api/v1/students/1?include=user,enrollments,applications'
'/api/v1/enrollments?include=student.user,courseSection.course,courseSection.term'

// This prevents N+1 queries
```

## 4. Error Handling Strategy

### Business Rule Violations
```typescript
// The API returns context for business rules:
if (error.response?.data?.context?.waitlist_available) {
  // Show waitlist option
  showWaitlistDialog(error.response.data.context);
} else {
  // Show error
  showError(error.response.data.detail);
}
```

### Validation Errors
```typescript
// 422 errors include field-specific messages:
{
  "errors": {
    "student_number": ["The student number has already been taken."],
    "email": ["The email field is required.", "Must be valid email."]
  }
}

// Map these to form fields:
Object.entries(errors).forEach(([field, messages]) => {
  form.setError(field, { message: messages[0] });
});
```

## 5. State Management Recommendations

### Global State (Zustand)
```typescript
// User/Auth state
interface AuthStore {
  user: User | null;
  token: string | null;
  permissions: string[];
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// UI State
interface UIStore {
  sidebarOpen: boolean;
  activeFilters: Record<string, any>;
  toggleSidebar: () => void;
  setFilter: (key: string, value: any) => void;
}
```

### Server State (React Query)
```typescript
// Configure with proper defaults:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
});

// Use mutations for all write operations:
const enrollMutation = useMutation({
  mutationFn: (data) => apiClient.post('/enrollments', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['enrollments']);
    queryClient.invalidateQueries(['course-sections']);
  }
});
```

## 6. Component Architecture

### Shared Components Priority
1. **DataTable** - Used everywhere for lists
2. **StatusBadge** - Consistent status display
3. **DatePicker** - With deadline validation
4. **FileUpload** - For documents (PDF, DOC, DOCX, 5MB limit)
5. **SearchableSelect** - For course/program selection
6. **PermissionGuard** - Wrap components needing permissions

### Form Patterns
```typescript
// Use React Hook Form + Zod for all forms
const schema = z.object({
  student_number: z.string().regex(/^STU\d{7}$/, 'Invalid format'),
  email: z.string().email(),
  gpa: z.number().min(0).max(4.0),
  // Match backend validation exactly
});
```

## 7. Testing Strategy

### Component Testing
```typescript
// Test permission-based rendering:
test('shows edit button for admin', () => {
  renderWithAuth(<StudentProfile />, { 
    user: mockAdminUser 
  });
  expect(screen.getByText('Edit')).toBeInTheDocument();
});

// Test business rules:
test('disables enrollment after deadline', () => {
  const pastDeadline = new Date('2020-01-01');
  renderWithAuth(<CourseEnrollment courseSection={{
    ...mockSection,
    add_drop_deadline: pastDeadline
  }} />);
  expect(screen.getByText('Enroll')).toBeDisabled();
});
```

### API Mocking
```typescript
// Use MSW for consistent mocking:
handlers = [
  rest.get('/api/v1/students', (req, res, ctx) => {
    return res(ctx.json(mockPaginatedStudents));
  }),
  
  rest.post('/api/v1/enrollments', (req, res, ctx) => {
    const { course_section_id } = req.body;
    if (mockSections[course_section_id].enrolled_count >= capacity) {
      return res(ctx.status(200), ctx.json({
        data: { ...mockEnrollment, status: 'waitlisted' }
      }));
    }
    return res(ctx.json({ data: mockEnrollment }));
  })
];
```

## 8. Development Priorities (Updated)

### Week 1: Foundation ✅
1. Auth system with real token management
2. API client with RFC 7807 error handling
3. Basic routing with permission guards
4. Core type definitions from real API

### Week 2: Student Features 🎯
1. Student dashboard with real data structure
2. Course browsing with capacity display
3. Enrollment with waitlist handling
4. Document upload (with version tracking)

### Week 3: Admin Features
1. Student management table with filters
2. Application review workflow
3. Course section management
4. Real-time enrollment tracking

### Week 4: Advanced Features
1. Grade upload with audit trail
2. Bulk operations (CSV import)
3. Notification center
4. Analytics dashboard

## 9. Key Implementation Details

### Date/Time Handling
```typescript
// All dates from API are ISO 8601 with timezone
// Use date-fns for consistent formatting:
import { format, parseISO } from 'date-fns';

const displayDate = format(parseISO(enrollment.enrollment_date), 'PPP');
const displayTime = format(parseISO(`2000-01-01T${section.start_time}`), 'h:mm a');
```

### File Upload Constraints
```typescript
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Validate before upload:
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Only PDF and Word documents allowed');
}
```

### Role-Based UI
```typescript
// Navigation items based on primary role:
const getPrimaryRole = (user: User) => {
  // Roles are ordered by priority in the API
  return user.roles[0]?.name || 'Student';
};

// Show/hide features based on permissions:
{hasPermission('enrollments.manage') && <AdminEnrollmentPanel />}
{hasPermission('enrollments.manage.own') && <StudentEnrollmentPanel />}
```

## 10. Production Considerations

### Security
- Never store sensitive data in localStorage (only token)
- Implement CSRF protection for state-changing operations
- Use HTTPS in production
- Implement request rate limiting on frontend

### Performance
- Lazy load routes and heavy components
- Implement virtual scrolling for large lists
- Use React.memo for expensive renders
- Prefetch critical data on route change

### Monitoring
- Add error boundary with Sentry integration
- Track user actions with analytics
- Monitor API response times
- Set up alerts for failed enrollments

This comprehensive guide should help you build a robust, production-ready frontend that fully leverages the sophisticated backend you've created.