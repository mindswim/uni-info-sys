# Frontend Patterns & Code Snippets

## 1. Business Rule Patterns

### Enrollment Capacity Management
```typescript
// Pattern: Handle full course sections
const isFull = section.enrolled_count >= section.capacity;
const canEnroll = new Date() < new Date(section.add_drop_deadline);

// UI Logic
if (isFull) {
  return <Button onClick={joinWaitlist}>Join Waitlist</Button>;
} else {
  return <Button onClick={enroll}>Enroll in Course</Button>;
}
```

### Waitlist Position Display
```typescript
// Pattern: Show waitlist status
if (enrollment.status === 'waitlisted') {
  return (
    <Badge variant="warning">
      Waitlist Position: {enrollment.waitlist_position}
    </Badge>
  );
}
```

### Deadline Enforcement
```typescript
// Pattern: Disable actions after deadlines
const isAfterDeadline = new Date() > new Date(section.add_drop_deadline);
const isAfterWithdrawal = new Date() > new Date(section.withdrawal_deadline);

// Disable enrollment after add/drop deadline
// Disable withdrawal after withdrawal deadline
```

## 2. Error Handling Patterns

### RFC 7807 Problem Details
```typescript
// Pattern: Handle business rule violations
if (error.response?.data?.context?.waitlist_available) {
  // Show waitlist option
  showWaitlistDialog(error.response.data.context);
} else {
  // Show regular error
  showError(error.response.data.detail);
}
```

### Validation Error Mapping
```typescript
// Pattern: Map API validation errors to form fields
if (error.response?.data?.errors) {
  Object.entries(error.response.data.errors).forEach(([field, messages]) => {
    form.setError(field, { message: messages[0] });
  });
}
```

## 3. Permission-Based UI Patterns

### Role-Based Component Rendering
```typescript
// Pattern: Show/hide based on permissions
{hasPermission('enrollments.manage') && <AdminEnrollmentPanel />}
{hasPermission('enrollments.manage.own') && <StudentEnrollmentPanel />}
```

### Navigation Based on Primary Role
```typescript
// Pattern: Get primary role for navigation
const getPrimaryRole = (user: User) => {
  return user.roles[0]?.name || 'Student';
};

// Usage in navigation config
const navItems = navigationConfig[getPrimaryRole(user)] || [];
```

## 4. Data Loading Patterns

### Relationship Loading with Include
```typescript
// Pattern: Load related data efficiently
const endpoint = `/api/v1/students/1?include=user,enrollments,applications`;
const endpoint = `/api/v1/enrollments?include=student.user,courseSection.course`;
```

### Pagination with React Query
```typescript
// Pattern: Handle paginated data
const { data, isLoading } = useQuery({
  queryKey: ['students', page, filters],
  queryFn: () => apiClient.get(`/students?page=${page}&${params}`),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 5. Form Validation Patterns

### Match Backend Validation
```typescript
// Pattern: Zod schema matching Laravel validation
const studentSchema = z.object({
  student_number: z.string().regex(/^STU\d{7}$/, 'Invalid format'),
  email: z.string().email(),
  gpa: z.number().min(0).max(4.0),
  // Match backend validation exactly
});
```

### File Upload Validation
```typescript
// Pattern: Document upload constraints
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Only PDF and Word documents allowed');
}
```

## 6. Status Management Patterns

### Application Status Flow
```typescript
// Pattern: Valid status transitions
const validTransitions = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['accepted', 'rejected', 'deferred']
};

const canTransition = (currentStatus: string, newStatus: string) => {
  return validTransitions[currentStatus]?.includes(newStatus);
};
```

### Enrollment Status Display
```typescript
// Pattern: Status badge variants
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'enrolled': return 'default';
    case 'waitlisted': return 'warning';
    case 'completed': return 'success';
    case 'withdrawn': return 'destructive';
    default: return 'secondary';
  }
};
```

## 7. Date/Time Handling Patterns

### ISO 8601 Date Display
```typescript
// Pattern: Format API dates consistently
import { format, parseISO } from 'date-fns';

const displayDate = format(parseISO(enrollment.enrollment_date), 'PPP');
const displayTime = format(parseISO(`2000-01-01T${section.start_time}`), 'h:mm a');
```

### Deadline Checking
```typescript
// Pattern: Check if action is allowed by deadline
const isBeforeDeadline = (deadline: string) => {
  return new Date() < new Date(deadline);
};

const canEnroll = isBeforeDeadline(section.add_drop_deadline);
const canWithdraw = isBeforeDeadline(section.withdrawal_deadline);
```

## 8. Real-time Update Patterns

### Optimistic Updates
```typescript
// Pattern: Update UI immediately, sync with server
const enrollMutation = useMutation({
  mutationFn: (data) => apiClient.post('/enrollments', data),
  onMutate: async (newEnrollment) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['enrollments']);
    
    // Snapshot previous value
    const previousEnrollments = queryClient.getQueryData(['enrollments']);
    
    // Optimistically update
    queryClient.setQueryData(['enrollments'], (old: any) => ({
      ...old,
      data: [...old.data, newEnrollment]
    }));
    
    return { previousEnrollments };
  },
  onError: (err, newEnrollment, context) => {
    // Rollback on error
    queryClient.setQueryData(['enrollments'], context?.previousEnrollments);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['enrollments']);
  }
});
```

## 9. Search and Filter Patterns

### Debounced Search
```typescript
// Pattern: Debounce search input
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
  setSearchParams({ search: searchTerm, page: '1' });
}, 300);

// Usage in input
<Input 
  onChange={(e) => debouncedSearch(e.target.value)}
  placeholder="Search students..."
/>
```

### URL-based Filters
```typescript
// Pattern: Sync filters with URL
const [searchParams, setSearchParams] = useSearchParams();

const updateFilter = (key: string, value: string) => {
  const newParams = new URLSearchParams(searchParams);
  if (value) {
    newParams.set(key, value);
  } else {
    newParams.delete(key);
  }
  newParams.set('page', '1'); // Reset to first page
  setSearchParams(newParams);
};
```

## 10. Loading State Patterns

### Skeleton Loading
```typescript
// Pattern: Show skeleton while loading
if (isLoading) {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
```

### Loading States for Mutations
```typescript
// Pattern: Disable UI during mutations
<Button 
  onClick={submitForm}
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Submitting...' : 'Submit'}
</Button>
```

These patterns provide reusable code snippets without being prescriptive about the overall implementation approach. 