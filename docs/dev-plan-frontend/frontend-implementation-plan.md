# University Admissions Frontend Implementation Plan

## Phase 1: Core Infrastructure (Week 1)

### 1.1 Authentication System
```typescript
// src/services/auth.service.ts
interface LoginCredentials {
  email: string;
  password: string;
  device_name: string; // Required by Sanctum
}

interface AuthResponse {
  token: string;
  user?: UserProfile;
}

// Key endpoints:
// POST /api/v1/tokens/create - Login
// POST /api/v1/forgot-password - Password reset
// POST /api/v1/reset-password - Complete reset
```

### 1.2 API Client Setup
```typescript
// src/services/api.client.ts
class ApiClient {
  baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
  
  // Auto-attach bearer token
  // Handle 401/403 responses
  // Implement request/response interceptors
  // Handle pagination metadata
}
```

### 1.3 Type Definitions (from API Resources)
```typescript
// src/types/models.ts
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

interface Student {
  id: number;
  user_id: number;
  student_id: string; // e.g., "STU2024001"
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  enrollment_date: string;
  graduation_date: string | null;
  gpa: number;
  total_credits: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

interface Staff {
  id: number;
  user_id: number;
  department_id: number;
  job_title: string;
  bio: string;
  office_location: string;
  created_at: string;
  updated_at: string;
  user?: User;
  department?: Department;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_section_id: number;
  status: 'enrolled' | 'waitlisted' | 'withdrawn' | 'completed';
  enrollment_date: string;
  grade: string | null;
  grade_points: number | null;
  waitlist_position: number | null;
  reason_for_change: string | null;
  created_at: string;
  updated_at: string;
  course_section?: CourseSection;
}

interface CourseSection {
  id: number;
  course_id: number;
  term_id: number;
  instructor_id: number;
  room_id: number;
  section_number: string;
  capacity: number;
  enrolled_count: number;
  waitlisted_count: number;
  status: 'open' | 'closed' | 'cancelled' | 'full';
  schedule_days: string[];
  start_time: string;
  end_time: string;
  add_drop_deadline: string;
  withdrawal_deadline: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  term?: Term;
  instructor?: Staff;
  room?: Room;
  enrollments?: Enrollment[];
}

interface Course {
  id: number;
  department_id: number;
  course_code: string;
  title: string;
  description: string;
  credits: number;
  prerequisites: Course[];
  created_at: string;
  updated_at: string;
  department?: Department;
}

interface AdmissionApplication {
  id: number;
  student_id: number;
  term_id: number;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'deferred';
  submitted_at: string | null;
  reviewed_at: string | null;
  decision_date: string | null;
  personal_statement: string;
  academic_history: string;
  extracurricular_activities: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  term?: Term;
  program_choices?: ProgramChoice[];
}

interface ProgramChoice {
  id: number;
  admission_application_id: number;
  program_id: number;
  preference_order: number;
  status: 'pending' | 'accepted' | 'rejected';
  program?: Program;
}

interface Department {
  id: number;
  faculty_id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  faculty?: Faculty;
}

interface Faculty {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Building {
  id: number;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  building_id: number;
  room_number: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'lecture_hall' | 'office' | 'other';
  building?: Building;
}

interface Term {
  id: number;
  name: string;
  academic_year: number;
  semester: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface Program {
  id: number;
  department_id: number;
  name: string;
  degree_level: string;
  duration: number;
  department?: Department;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    application_id?: number;
    old_status?: string;
    new_status?: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
```

## Phase 2: Role-Based Dashboards (Week 2)

### 2.1 Student Dashboard
**Key Components:**
- Application Status Card (draft/submitted/accepted/rejected)
- Enrollment Summary (current courses, credits, GPA)
- Document Checklist (required vs uploaded)
- Upcoming Deadlines
- Recent Notifications

**Primary Actions:**
- Start New Application
- View/Upload Documents
- Browse Available Courses
- Register for Courses

### 2.2 Admin Dashboard
**Key Components:**
- System Statistics (total students, applications, enrollments)
- Pending Applications Queue
- Course Capacity Overview
- Recent System Activity
- Quick Actions Menu

**Primary Actions:**
- Review Applications
- Manage Course Sections
- Import Bulk Data (CSV)
- Generate Reports

### 2.3 Faculty Dashboard
**Key Components:**
- My Course Sections
- Student Rosters
- Grade Upload Status
- Office Hours Schedule

**Primary Actions:**
- Upload Grades (CSV)
- View Class Lists
- Manage Course Materials

## Phase 3: Core CRUD Operations (Week 3-4)

### 3.1 Student Management
```typescript
// Components needed:
// - StudentList (with filters: status, program, term)
// - StudentDetail (profile + enrollments + documents)
// - StudentForm (create/edit with validation)
// - StudentSearch (by ID, name, email)

// Key API endpoints:
// GET /api/v1/students?page=1&per_page=20
// GET /api/v1/students/{id}
// POST /api/v1/students
// PUT /api/v1/students/{id}
// DELETE /api/v1/students/{id}
```

### 3.2 Course & Enrollment Management
```typescript
// Components needed:
// - CourseList (filterable by department, term, availability)
// - CourseDetail (with sections, prerequisites, enrollment stats)
// - EnrollmentForm (with capacity checking, waitlist handling)
// - EnrollmentHistory (student's course history with grades)

// Business logic to handle:
// - Capacity management (auto-waitlist when full)
// - Prerequisites checking
// - Add/drop deadline enforcement
// - Enrollment swap (atomic operation)
```

### 3.3 Document Management
```typescript
// Components needed:
// - DocumentUpload (drag-drop, file validation)
// - DocumentList (by type, status, version)
// - DocumentViewer (PDF preview)
// - DocumentStatus (approved/rejected/pending)

// File constraints:
// - Types: PDF, DOC, DOCX only
// - Max size: 5MB
// - Versioning supported
```

## Phase 4: Complex Workflows (Week 5-6)

### 4.1 Admission Application Flow
```
1. Create Draft → 2. Add Program Choices → 3. Upload Documents 
→ 4. Submit Application → 5. Admin Review → 6. Decision
```

**Components:**
- ApplicationWizard (multi-step form)
- ProgramSelector (with prerequisites display)
- DocumentChecklist (required docs by program)
- ApplicationReview (admin interface)
- DecisionModal (accept/reject with comments)

### 4.2 Course Registration Flow
```
1. Browse Catalog → 2. Check Prerequisites → 3. Add to Cart 
→ 4. Check Conflicts → 5. Submit Registration → 6. Handle Waitlist
```

**Components:**
- CourseCatalog (searchable, filterable)
- RegistrationCart (conflict detection)
- ScheduleBuilder (visual timetable)
- WaitlistManager (position tracking)

### 4.3 Grade Management Flow
```
1. Download Roster → 2. Enter Grades → 3. Bulk Upload CSV 
→ 4. Review Changes → 5. Submit with Reason → 6. Audit Trail
```

**Components:**
- GradeSheet (editable table)
- CSVUploader (with validation preview)
- GradeChangeModal (requires reason)
- AuditLog (grade history viewer)

## Phase 5: Advanced Features (Week 7-8)

### 5.1 Real-time Features
- Notification Bell (WebSocket/Polling)
- Live Enrollment Counter
- Waitlist Position Updates
- Application Status Changes

### 5.2 Analytics & Reports
- Enrollment Trends Chart
- Application Pipeline Funnel
- Course Popularity Heatmap
- Student Performance Dashboard

### 5.3 Bulk Operations
- CSV Import for Courses
- Batch Application Processing
- Mass Email Communications
- Bulk Grade Upload

## Technical Decisions

### State Management
```typescript
// Use React Query for server state
import { useQuery, useMutation } from '@tanstack/react-query';

// Use Zustand for client state
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}));
```

### Form Handling
```typescript
// Use React Hook Form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const studentSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  date_of_birth: z.string().date(),
  // ... matches Laravel validation rules
});
```

### Error Handling
```typescript
// Standardized error component
interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

// Global error boundary
// Toast notifications for actions
// Inline validation errors
```

### Performance Optimizations
- Lazy load route components
- Virtualize long lists (react-window)
- Implement pagination (server-side)
- Cache API responses (React Query)
- Optimize bundle splitting

## Development Priorities

### MVP (2-3 weeks)
1. ✅ Authentication flow
2. ✅ Student dashboard
3. ✅ Basic CRUD for students
4. ✅ Document upload
5. ✅ Simple enrollment

### Phase 2 (2-3 weeks)
1. Admin dashboard
2. Application workflow
3. Course management
4. Bulk operations

### Phase 3 (2-3 weeks)
1. Faculty features
2. Advanced analytics
3. Real-time updates
4. Mobile optimization

## Component Library Structure
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── auth/           # Login, register, forgot password
│   ├── dashboards/     # Role-specific dashboards
│   ├── students/       # Student management
│   ├── courses/        # Course & section management
│   ├── enrollments/    # Registration & enrollment
│   ├── applications/   # Admission applications
│   └── documents/      # File upload & management
├── hooks/              # Custom React hooks
├── services/           # API clients & utilities
├── types/              # TypeScript definitions
├── stores/             # State management
└── utils/              # Helper functions
```