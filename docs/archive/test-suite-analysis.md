# Test Suite Analysis & Business Logic Guide

**Generated:** $(date)  
**Purpose:** Key insights from 422 comprehensive tests for frontend development team

## Test Suite Overview

The system has **422 comprehensive tests** covering:
- **Feature Tests:** Complete API endpoint testing with real HTTP requests
- **Unit Tests:** Individual service and model logic testing  
- **Integration Tests:** Cross-system workflow testing
- **Business Rule Tests:** Complex validation and constraint testing

## Key Data Structures from Tests

### Student Data Structure
```php
// From StudentApiTest - Required fields for student creation
$studentData = [
    'user_id' => $userId,
    'student_number' => 'STU2024001', // Must be unique
    'first_name' => 'Maria',
    'last_name' => 'Rodriguez', 
    'date_of_birth' => '2000-05-15',
    'gender' => 'female',
    'nationality' => 'Mexican',
    'address' => '123 Main St',
    'city' => 'Mexico City',
    'state' => 'CDMX',
    'postal_code' => '01000',
    'country' => 'Mexico',
    'phone' => '+52-555-123-4567',
    'emergency_contact_name' => 'Carlos Rodriguez',
    'emergency_contact_phone' => '+52-555-987-6543'
];
```

### Enrollment Data Structure
```php
// From EnrollmentApiTest - Core enrollment fields
$enrollmentData = [
    'student_id' => $studentId,
    'course_section_id' => $courseSectionId,
    'status' => 'enrolled', // 'enrolled', 'waitlisted', 'withdrawn', 'completed'
    'grade' => 'A+', // Optional, only for completed enrollments
    'enrollment_date' => '2024-08-15T09:00:00Z',
    'waitlist_position' => null, // Auto-assigned for waitlisted students
    'reason_for_change' => 'Initial enrollment' // Required for status changes
];
```

### Course Section Data Structure
```php
// From CourseSectionApiTest - Full course section structure
$courseSectionData = [
    'course_id' => $courseId,
    'term_id' => $termId,
    'instructor_id' => $instructorId,
    'room_id' => $roomId,
    'section_number' => '001',
    'capacity' => 30,
    'status' => 'open', // 'open', 'closed', 'cancelled', 'full'
    'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
    'start_time' => '10:00:00',
    'end_time' => '11:00:00',
    'add_drop_deadline' => '2024-09-15T23:59:59Z',
    'withdrawal_deadline' => '2024-11-01T23:59:59Z'
];
```

### Admission Application Data Structure
```php
// From AdmissionApplicationApiTest - Application requirements
$applicationData = [
    'student_id' => $studentId,
    'term_id' => $termId,
    'status' => 'draft', // 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'deferred'
    'personal_statement' => 'I am passionate about computer science...',
    'academic_history' => 'Graduated from XYZ High School with honors...',
    'extracurricular_activities' => 'President of Programming Club...',
    'submitted_at' => null, // Auto-set when status changes to 'submitted'
    'reviewed_at' => null, // Set by admissions officer
    'decision_date' => null // Set when final decision is made
];
```

## Critical Business Rules from Tests

### 1. Enrollment Business Rules
```php
// From EnrollmentServiceTest - Core enrollment logic
- Students can only enroll if status is 'active'
- Cannot enroll in past terms
- Cannot have duplicate enrollments for same course section
- When capacity is full, students are automatically waitlisted
- Waitlisted students are promoted automatically when spots open
- Enrollment/withdrawal deadlines are strictly enforced
- Grade can only be assigned to 'completed' enrollments
```

### 2. Course Prerequisites
```php
// From ProcessCourseImportTest - Prerequisites handling
- Prerequisites are stored as relationships between courses
- Multiple prerequisites supported: "CS101,CS201"
- Prerequisites must exist before being assigned
- Circular dependencies are prevented
```

### 3. Application Status Transitions
```php
// From AdmissionApplicationApiTest - Valid status transitions
'draft' → 'submitted' (student action)
'submitted' → 'under_review' (staff action)
'under_review' → 'accepted'/'rejected'/'deferred' (staff action)
// Students cannot modify submitted applications
// Only admissions officers can change status after submission
```

### 4. Capacity Management
```php
// From EnrollmentApiTest - Automatic capacity handling
- enrolled_count and waitlisted_count are automatically maintained
- When requesting 'enrolled' status but no capacity: auto-waitlist
- When someone withdraws: promote first waitlisted student
- Capacity validation happens at database level
```

### 5. Academic Hierarchy Constraints
```php
// From AcademicHierarchyTest - Data integrity rules
- Faculty names can be duplicate (no unique constraint)
- Department codes must be unique globally
- Department names can be duplicate across different faculties  
- Programs belong to departments, departments to faculties
- Cascade delete: Faculty → Departments (sets NULL on programs)
```

## Validation Rules from Tests

### Student Validation
```php
// Required fields that will cause 422 errors if missing
'user_id', 'student_number', 'first_name', 'last_name', 
'date_of_birth', 'gender', 'nationality', 'address', 
'city', 'state', 'postal_code', 'country', 'phone',
'emergency_contact_name', 'emergency_contact_phone'

// Unique constraints
'student_number' // Must be globally unique
'user_id' // One student per user account
```

### Enrollment Validation
```php
// Required fields
'student_id', 'course_section_id'

// Business rule validations
- student_id must exist and be active
- course_section_id must exist and be open
- Cannot enroll same student in same course section twice
- Cannot enroll in past terms
- Cannot withdraw after withdrawal deadline
```

### Course Section Validation
```php
// Required fields
'course_id', 'term_id', 'instructor_id', 'room_id', 
'section_number', 'capacity'

// Constraints
- section_number must be unique per course per term
- capacity must be positive integer
- deadlines must be within term dates
- schedule_days must be valid weekdays
```

## Error Handling Patterns

### RFC 7807 Problem Details Format
```json
// All API errors follow this standard format
{
  "type": "https://university-admissions.com/problems/enrollment-capacity-exceeded",
  "title": "Enrollment Capacity Exceeded", 
  "status": 422,
  "detail": "Cannot enroll student directly - course section is at capacity. Student will be waitlisted.",
  "error_code": "ENROLLMENT_CAPACITY_EXCEEDED",
  "context": {
    "course_section_id": 1,
    "current_capacity": 30,
    "max_capacity": 30,
    "waitlist_available": true
  }
}
```

### Common Error Codes
```php
// From ErrorHandlingTest - Standard error responses
'ENROLLMENT_CAPACITY_EXCEEDED' // 422
'DUPLICATE_ENROLLMENT' // 422  
'STUDENT_NOT_ACTIVE' // 422
'RESOURCE_NOT_FOUND' // 404
'VALIDATION_ERROR' // 422
'UNAUTHORIZED' // 401
'FORBIDDEN' // 403
```

## Relationship Loading Patterns

### Eager Loading from Tests
```php
// From EnrollmentApiTest - Optimal relationship loading
$enrollment->load([
    'student.user',
    'courseSection.course.department.faculty',
    'courseSection.term',
    'courseSection.instructor.user',
    'courseSection.room.building'
]);

// Available include parameters for API
?include=student,courseSection,course,term,instructor,room,building
```

### Filtering Patterns
```php
// From various API tests - Common filter patterns
?status=enrolled // Filter by enrollment status
?department_id=1 // Filter by department
?term_id=1 // Filter by term
?student_id=1 // Filter by student (where permitted)
?course_id=1 // Filter by course
?instructor_id=1 // Filter by instructor
```

## Authorization Patterns from Tests

### Role-Based Access Control
```php
// From RoleBasedAccessControlTest - Permission checking
- Super Admin: All permissions
- Admin: Most management permissions except role management
- Admissions Officer: Application and document management
- Faculty: Limited to their own course sections
- Student: Only their own data (applications, enrollments, documents)
```

### Ownership Validation
```php
// From AdmissionApplicationApiTest - Data ownership rules
- Students can only view/edit their own applications
- Students can only view their own enrollments
- Faculty can only manage their assigned course sections
- Admissions officers can view all applications
- Cross-student access attempts return 403 Forbidden
```

## Background Job Testing

### Asynchronous Operations
```php
// From BackgroundJobIntegrationTest - Jobs that run automatically
'SendEnrollmentConfirmation' // On enrollment/waitlist
'ProcessWaitlistPromotion' // When spots open up
'SendApplicationStatusNotification' // On status changes
'ProcessCourseImport' // For bulk course uploads
'ProcessGradeImport' // For bulk grade uploads
```

## Frontend Implementation Insights

### State Management Requirements
```typescript
// Based on test patterns, frontend needs to handle:
interface EnrollmentState {
  status: 'enrolled' | 'waitlisted' | 'withdrawn' | 'completed';
  waitlistPosition?: number; // Only for waitlisted
  canWithdraw: boolean; // Based on deadlines
  canSwap: boolean; // Based on deadlines and status
  grade?: string; // Only for completed
}
```

### Real-time Updates Needed
```typescript
// Tests show these events trigger automatic changes:
- Enrollment withdrawal → Waitlist promotion
- Capacity changes → Status updates
- Deadline passes → Action restrictions
- Grade assignment → Status completion
```

### Form Validation Requirements
```typescript
// Frontend must validate before API calls:
interface StudentFormValidation {
  required: ['first_name', 'last_name', 'student_number', /* 13 more */];
  unique: ['student_number'];
  format: {
    phone: /^\+?[\d\s\-\(\)]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    student_number: /^STU\d{7}$/
  };
}
```

### Loading States
```typescript
// Tests show complex operations that need loading indicators:
- Enrollment with capacity checking
- Waitlist promotion processing  
- Application status changes
- Grade imports
- Course swaps with validation
```

## Performance Considerations

### Pagination Requirements
```php
// All list endpoints support pagination
- Default: 15 items per page
- Maximum: 100 items per page
- Always include pagination metadata
- Support cursor-based pagination for large datasets
```

### Caching Opportunities
```php
// From test patterns, these are expensive queries:
- Course sections with full relationships
- Student enrollment history
- Academic hierarchy traversal
- Role/permission checking
```

This test analysis reveals a sophisticated system with comprehensive business rules, proper error handling, and complex relationship management. The frontend should be prepared to handle these intricacies with appropriate validation, state management, and user feedback mechanisms. 