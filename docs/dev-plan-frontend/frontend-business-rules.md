# Frontend Business Rules Implementation

## Overview
These business rules are extracted from your backend implementation and must be enforced in the frontend UI. They ensure consistency between frontend and backend behavior.

## 1. Enrollment Business Rules

### Capacity Management
- **Rule**: When a course section reaches capacity, new enrollments are automatically placed on waitlist
- **Frontend Implementation**: 
  - Show "Join Waitlist" button when `enrolled_count >= capacity`
  - Display current capacity: `{enrolled_count}/{capacity}`
  - Show waitlist count if `waitlisted_count > 0`

### Prerequisites Checking
- **Rule**: Students cannot enroll in courses without meeting prerequisites
- **Frontend Implementation**:
  - Check prerequisites before allowing enrollment
  - Show warning if prerequisites not met
  - Disable enrollment button if prerequisites failed

### Add/Drop Deadlines
- **Rule**: Enrollment actions are restricted by term deadlines
- **Frontend Implementation**:
  - Disable enrollment after `add_drop_deadline`
  - Disable withdrawal after `withdrawal_deadline`
  - Show deadline warnings in UI
  - Display countdown to deadline

### Waitlist Management
- **Rule**: Waitlist positions are assigned FIFO based on `created_at`
- **Frontend Implementation**:
  - Show waitlist position number
  - Display "You are #X on waitlist"
  - Update position in real-time when others drop

### Enrollment Swap
- **Rule**: Course swaps are atomic operations (drop + add in single transaction)
- **Frontend Implementation**:
  - Provide swap interface showing both courses
  - Validate swap doesn't create conflicts
  - Show confirmation before executing swap

## 2. Application Business Rules

### One Draft Per Student
- **Rule**: Students can only have one draft application at a time
- **Frontend Implementation**:
  - Show existing draft if present
  - Disable "Create New Application" if draft exists
  - Provide "Continue Draft" option

### Status Flow Validation
- **Rule**: Applications follow strict status progression
- **Frontend Implementation**:
  - `draft` → `submitted` (student action)
  - `submitted` → `under_review` (staff action)
  - `under_review` → `accepted`/`rejected`/`deferred` (staff action)
  - Prevent invalid status transitions in UI

### Program Choice Limits
- **Rule**: Students can select up to 3 programs with preference order
- **Frontend Implementation**:
  - Limit program selection to 3
  - Require preference order (1, 2, 3)
  - Validate no duplicate programs

### Document Requirements
- **Rule**: Required documents vary by program
- **Frontend Implementation**:
  - Show program-specific document checklist
  - Mark documents as required/optional
  - Prevent submission if required docs missing

## 3. Grade Management Business Rules

### Instructor-Only Grade Updates
- **Rule**: Only the assigned instructor can update grades for their course sections
- **Frontend Implementation**:
  - Show grade management only to assigned instructor
  - Hide grade fields for non-instructors
  - Display instructor name on grade sheets

### Grade Change Audit Trail
- **Rule**: All grade changes require a reason and are audited
- **Frontend Implementation**:
  - Require reason field when updating grades
  - Show grade change history
  - Display audit trail with timestamps

### Completed Enrollment Only
- **Rule**: Grades can only be assigned to enrollments with 'completed' status
- **Frontend Implementation**:
  - Only show grade fields for completed enrollments
  - Disable grade entry for active enrollments
  - Show status-based grade availability

### Bulk Grade Upload
- **Rule**: Grades can be uploaded via CSV with specific format
- **Frontend Implementation**:
  - Provide CSV template download
  - Validate CSV format before upload
  - Show preview of grade changes
  - Require confirmation before applying

## 4. Document Management Business Rules

### File Type Restrictions
- **Rule**: Only PDF, DOC, DOCX files accepted
- **Frontend Implementation**:
  - Validate file types before upload
  - Show accepted file types in UI
  - Reject invalid files with clear error

### File Size Limits
- **Rule**: Maximum 5MB per file
- **Frontend Implementation**:
  - Check file size before upload
  - Show size limit in UI
  - Prevent upload of oversized files

### Version Management
- **Rule**: New uploads create new versions, only latest is active
- **Frontend Implementation**:
  - Show version history
  - Indicate which version is active
  - Allow viewing previous versions
  - Show upload date for each version

### Document Type Validation
- **Rule**: Documents must be associated with valid document types
- **Frontend Implementation**:
  - Show document type selection
  - Validate document type is required
  - Group documents by type

## 5. User Permission Business Rules

### Role-Based Access Control
- **Rule**: UI elements are shown/hidden based on user roles and permissions
- **Frontend Implementation**:
  - Check permissions before rendering components
  - Hide unauthorized actions
  - Show appropriate error messages for denied access

### Primary Role Determination
- **Rule**: User's primary role is the first role in their roles array
- **Frontend Implementation**:
  - Use `user.roles[0].name` for primary navigation
  - Show role-appropriate dashboard
  - Filter available actions by primary role

### Permission Inheritance
- **Rule**: Permissions are inherited through roles
- **Frontend Implementation**:
  - Check all user roles for permissions
  - Show features if user has permission in any role
  - Display role-based feature availability

## 6. Academic Structure Business Rules

### Hierarchical Navigation
- **Rule**: Academic structure follows Faculty → Department → Program → Course → CourseSection
- **Frontend Implementation**:
  - Show hierarchical breadcrumbs
  - Filter programs by department
  - Filter courses by department
  - Filter sections by course and term

### Term-Based Restrictions
- **Rule**: Many operations are restricted to specific terms
- **Frontend Implementation**:
  - Show current term prominently
  - Filter enrollments by term
  - Show term-specific deadlines
  - Allow term switching where appropriate

### Department-Based Access
- **Rule**: Staff access is often limited to their department
- **Frontend Implementation**:
  - Filter course sections by department
  - Show department-specific dashboards
  - Limit student management to department

## 7. Notification Business Rules

### Real-Time Updates
- **Rule**: Users receive notifications for status changes and important events
- **Frontend Implementation**:
  - Poll for new notifications
  - Show unread notification count
  - Mark notifications as read when viewed
  - Provide notification preferences

### Status Change Notifications
- **Rule**: Users are notified when application status changes
- **Frontend Implementation**:
  - Show status change notifications
  - Highlight status changes in UI
  - Provide context for status changes

## 8. Data Validation Business Rules

### Student ID Format
- **Rule**: Student IDs follow pattern `STU` + 7 digits
- **Frontend Implementation**:
  - Validate student ID format
  - Show format hint in forms
  - Prevent submission of invalid IDs

### Email Validation
- **Rule**: Email addresses must be unique and valid format
- **Frontend Implementation**:
  - Validate email format
  - Check for uniqueness on blur
  - Show appropriate error messages

### GPA Constraints
- **Rule**: GPA must be between 0.0 and 4.0
- **Frontend Implementation**:
  - Validate GPA range
  - Show GPA scale in forms
  - Prevent invalid GPA entry

## Implementation Guidelines

### Error Handling
- Always show business rule violations clearly
- Provide actionable error messages
- Use RFC 7807 Problem Details format
- Show context when available (e.g., waitlist availability)

### User Experience
- Prevent invalid actions before they happen
- Show warnings for upcoming deadlines
- Provide clear feedback for all actions
- Use progressive disclosure for complex rules

### Performance
- Cache business rule results where appropriate
- Validate on client-side for immediate feedback
- Always validate on server-side for security
- Use optimistic updates where safe

### Accessibility
- Ensure business rules are clear to all users
- Provide alternative text for status indicators
- Use appropriate ARIA labels for dynamic content
- Ensure keyboard navigation works with rule-based UI 