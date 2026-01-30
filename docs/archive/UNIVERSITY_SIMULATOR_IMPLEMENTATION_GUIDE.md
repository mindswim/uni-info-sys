# University Simulator - Complete Implementation Guide

**Last Updated**: 2025-11-09
**Project**: University Admissions & Management System
**Goal**: Build a complete "University Simulator" where you can manage the entire student lifecycle

---

## Table of Contents

1. [Feature Status Overview](#feature-status-overview)
2. [Completion Levels Explained](#completion-levels-explained)
3. [Current System Status](#current-system-status)
4. [Implementation Phases](#implementation-phases)
5. [Detailed Implementation Plans](#detailed-implementation-plans)

---

## Feature Status Overview

### Legend
- ✅ **Complete** - Fully implemented (API + Frontend + CSV)
- 🟨 **Partial** - Some parts implemented
- ❌ **Missing** - Not implemented
- 🔄 **In Progress** - Currently being built

### Quick Status Table

| Feature Area | Backend API | Frontend UI | CSV Import/Export | Overall Status |
|--------------|-------------|-------------|-------------------|----------------|
| **Academic Structure** | ✅ | ✅ | ✅ | ✅ Complete |
| **Course Management** | ✅ | ✅ | ✅ | ✅ Complete |
| **Student Records** | ✅ | ✅ | ✅ | ✅ Complete |
| **Staff Management** | ✅ | ✅ | ✅ | ✅ Complete |
| **Enrollment System** | ✅ | ✅ | ❌ | 🟨 Needs CSV |
| **Grading System** | ✅ | ✅ | ✅ | ✅ Complete |
| **Admissions Workflow** | 🟨 | 🟨 | ❌ | ❌ Needs Work |
| **Financial System** | ❌ | ❌ | ❌ | ❌ Not Started |
| **Reporting/Analytics** | 🟨 | 🟨 | ❌ | 🟨 Basic Only |

---

## Completion Levels Explained

### Level 1: Backend API Only
- Database models + migrations exist
- API endpoints (CRUD operations)
- Validation and authorization
- **Missing**: No frontend UI, No CSV bulk operations

### Level 2: Backend + Frontend UI
- Everything in Level 1
- Frontend forms, tables, dialogs
- Users can interact through UI
- **Missing**: No CSV bulk operations

### Level 3: Complete (Production Ready)
- Everything in Level 2
- CSV import/export for bulk operations
- CSV template downloads
- Full admin management capabilities

---

## Current System Status

### ✅ LEVEL 3 COMPLETE (Production Ready)

#### Academic Structure
- **Faculties**: app/Http/Controllers/Api/V1/FacultyController.php
- **Departments**: app/Http/Controllers/Api/V1/DepartmentController.php
- **Programs**: app/Http/Controllers/Api/V1/ProgramController.php

#### Course System
- **Courses**: app/Http/Controllers/Api/V1/CourseController.php
- **Course Sections**: app/Http/Controllers/Api/V1/CourseSectionController.php
- **Terms**: app/Http/Controllers/Api/V1/TermController.php

#### People Management
- **Students**: app/Http/Controllers/Api/V1/StudentController.php
- **Staff**: app/Http/Controllers/Api/V1/StaffController.php

#### Infrastructure
- **Buildings**: app/Http/Controllers/Api/V1/BuildingController.php
- **Rooms**: app/Http/Controllers/Api/V1/RoomController.php

#### Academic Records
- **Grades**: app/Http/Controllers/Api/V1/GradeController.php + GradeImportController.php

### 🟨 LEVEL 2 (Needs CSV)

#### Enrollment System
- **Backend**: app/Http/Controllers/Api/V1/EnrollmentController.php ✅
- **Frontend**: frontend/src/components/admin/enrollments-tab.tsx ✅
- **CSV**: ❌ Missing
- **Additional Features**:
  - Enrollment swaps: app/Http/Controllers/Api/V1/EnrollmentSwapController.php ✅
  - Waitlist management ✅
  - Drop/Add functionality ✅

### 🟨 LEVEL 1-2 (Partial Implementation)

#### Admissions System
- **Backend**: app/Http/Controllers/Api/V1/AdmissionApplicationController.php 🟨
  - Basic CRUD ✅
  - Status changes ❌
  - Auto-enrollment ❌
  - Notifications ❌
- **Frontend**: 🟨
  - Student can submit ✅
  - Admin review interface ❌
  - Accept/Reject actions ❌
- **CSV**: ❌ Missing

#### Supporting Systems
- **Academic Records**: app/Http/Controllers/Api/V1/AcademicRecordController.php (Level 1)
- **Documents**: app/Http/Controllers/Api/V1/DocumentController.php (Level 1)
- **Program Choices**: app/Http/Controllers/Api/V1/ProgramChoiceController.php (Level 1)

### ❌ NOT STARTED

#### Financial System
- Tuition calculation
- Billing system
- Payment processing
- Financial aid/scholarships
- Payment plans
- Refunds
- Financial holds

#### Advanced Features
- Attendance tracking
- Assignment/homework management
- Exam scheduling
- Office hours
- Academic advising
- Transcript generation
- Degree audit
- Graduation management

---

## Implementation Phases

### 🔥 PHASE 1: Complete Admissions Workflow (HIGHEST PRIORITY)
**Goal**: Full applicant → student conversion workflow
**Estimated Time**: 90 minutes

#### What We're Building:
1. Admin can review pending applications
2. Admin can accept/reject/waitlist applications
3. Accepted students automatically become enrolled students
4. Email notifications sent on decisions
5. Acceptance letters generated
6. Bulk actions (accept/reject multiple at once)
7. CSV import/export for applications

#### Implementation Steps:

##### Step 1.1: Backend API Enhancements (30 min)
**File**: `app/Http/Controllers/Api/V1/AdmissionApplicationController.php`

```php
// New endpoints to add:
POST   /api/v1/admission-applications/{id}/accept      // Accept application
POST   /api/v1/admission-applications/{id}/reject      // Reject application
POST   /api/v1/admission-applications/{id}/waitlist    // Waitlist application
POST   /api/v1/admission-applications/{id}/enroll      // Convert to enrolled student
POST   /api/v1/admission-applications/bulk-actions     // Bulk accept/reject
GET    /api/v1/admission-applications/{id}/letter      // Generate acceptance letter
GET    /api/v1/admission-applications/stats            // Dashboard stats
```

**New Methods Needed**:
- `accept(AdmissionApplication $application)` - Accept and send notification
- `reject(AdmissionApplication $application, Request $request)` - Reject with reason
- `waitlist(AdmissionApplication $application)` - Move to waitlist
- `enroll(AdmissionApplication $application)` - Create Student record from application
- `bulkAction(Request $request)` - Process multiple applications at once
- `generateLetter(AdmissionApplication $application)` - Generate PDF acceptance letter
- `getStats()` - Get counts by status

**Business Logic**:
```php
// When accepting:
1. Update application status to 'accepted'
2. Create notification for applicant
3. Send email with acceptance letter
4. Generate acceptance letter PDF
5. Log the action

// When enrolling (after acceptance):
1. Create User account (if doesn't exist)
2. Create Student record
3. Link to chosen program
4. Set enrollment status to 'enrolled'
5. Update application status to 'enrolled'
6. Send welcome email
```

**New Job**: `app/Jobs/SendAdmissionDecisionEmail.php`
**New Mail**: `app/Mail/AdmissionAccepted.php`, `app/Mail/AdmissionRejected.php`
**New PDF**: `app/Services/AcceptanceLetterService.php` (uses DomPDF)

##### Step 1.2: Frontend Admin UI (45 min)
**File**: `frontend/src/components/admin/admissions-tab.tsx`

**Features to Build**:
1. **Application List View**
   - Table showing all applications
   - Columns: Applicant Name, Email, Program, Status, Submitted Date, Actions
   - Filter by status (pending, under_review, accepted, rejected, waitlisted)
   - Filter by program
   - Search by name/email
   - Bulk selection checkboxes

2. **Application Detail Dialog**
   - Full application details
   - Academic records from high school
   - Uploaded documents (view/download)
   - Program choices (ranked)
   - Personal information
   - Accept/Reject/Waitlist buttons
   - Notes/comments section

3. **Status Action Buttons**
   - Accept button (green)
   - Reject button (red) with reason textarea
   - Waitlist button (yellow)
   - Enroll button (only for accepted applications)

4. **Bulk Actions Toolbar**
   - "Accept Selected" button
   - "Reject Selected" button
   - "Move to Waitlist" button
   - Confirmation dialogs

5. **Stats Cards**
   - Total Applications
   - Pending Review
   - Accepted
   - Rejected
   - Waitlisted
   - Enrolled

6. **Email Preview**
   - Show acceptance/rejection email before sending
   - Toggle to send email immediately or later

**API Integration**:
```typescript
// services/admin.service.ts
acceptApplication(id: number): Promise<AdmissionApplication>
rejectApplication(id: number, reason: string): Promise<AdmissionApplication>
waitlistApplication(id: number): Promise<AdmissionApplication>
enrollStudent(applicationId: number): Promise<Student>
bulkAction(ids: number[], action: 'accept'|'reject'|'waitlist'): Promise<void>
downloadAcceptanceLetter(id: number): Promise<Blob>
```

##### Step 1.3: CSV Import/Export (15 min)
**File**: `app/Http/Controllers/Api/V1/AdmissionApplicationController.php`

Add CSV trait and methods:
```php
use App\Http\Controllers\Traits\HandlesCsvImportExport;

protected function getEntityName(): string { return 'admission-applications'; }
protected function getImportJobClass(): string { return ProcessAdmissionImport::class; }
protected function getCsvHeaders(): array {
    return [
        'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'nationality', 'address',
        'program_code', 'high_school_name', 'gpa',
        'application_status'
    ];
}
```

**New Job**: `app/Jobs/ProcessAdmissionImport.php`

**Frontend**: Add CSV component to admissions-tab.tsx

##### Step 1.4: Notifications & Emails (Optional Enhancement)

**Email Templates**:
- Acceptance email with congratulations
- Rejection email with encouragement
- Waitlist email with instructions
- Enrollment welcome email

**Notification Types**:
- In-app notifications
- Email notifications
- (Future: SMS notifications)

---

### 🎯 PHASE 2: Enhanced Student Experience
**Goal**: Better registration and student portal
**Estimated Time**: 2 hours

#### Features to Build:

##### 2.1: Registration Periods & Deadlines
**Backend**:
- Add `registration_periods` table
  - Columns: term_id, student_group, start_date, end_date
- Add validation to prevent registration outside periods
- Add "holds" system to block registration

**Frontend**:
- Show registration period info
- Display holds blocking registration
- Countdown timer to registration opening

##### 2.2: Class Schedule Calendar View
**Frontend**:
- Visual calendar showing enrolled classes
- Color-coded by course
- Show time, room, instructor
- Print schedule option

##### 2.3: Degree Progress Tracker
**Backend**:
- `degree_requirements` table
- `requirement_fulfillments` table
- Logic to calculate completion %

**Frontend**:
- Progress bars for each requirement category
- Checklist of completed courses
- Courses needed to graduate
- "What-if" analysis (try different programs)

##### 2.4: Registration Shopping Cart
**Frontend**:
- Add courses to cart before enrolling
- Check for conflicts automatically
- Show total credits
- Validate prerequisites
- One-click enroll all

---

### 💰 PHASE 3: Financial System
**Goal**: Complete billing and payment system
**Estimated Time**: 4 hours

#### Features to Build:

##### 3.1: Tuition Calculation
**Backend**:
- `tuition_rates` table (by program, per credit, fees)
- Service to calculate student bill
- Factor in: program, credits, fees, discounts

##### 3.2: Billing System
**Backend**:
- `invoices` table
- `line_items` table (tuition, fees, charges)
- Generate invoice on enrollment
- Due dates, payment terms

**Frontend**:
- View current bill
- View past invoices
- Payment history

##### 3.3: Payment Processing
**Backend**:
- `payments` table
- `payment_plans` table
- Integration with Stripe/PayPal (sandbox)
- Record payments, update balances

**Frontend**:
- Payment form
- Payment plan setup
- Receipt download

##### 3.4: Financial Aid & Scholarships
**Backend**:
- `scholarships` table
- `financial_aid_applications` table
- `awards` table
- Auto-apply awards to invoices

**Frontend**:
- Apply for financial aid
- View awarded scholarships
- See aid package

##### 3.5: Financial Holds
**Backend**:
- Block registration if balance > $0
- Block transcript if balance unpaid
- Auto-remove hold on payment

**Frontend**:
- Display hold status
- Show balance owed
- Link to payment

---

### 👨‍🏫 PHASE 4: Faculty Tools
**Goal**: Empower instructors to manage courses
**Estimated Time**: 3 hours

#### Features to Build:

##### 4.1: Course Roster Management
**Frontend**:
- Faculty view of their sections
- Student roster with photos
- Filter by section
- Export roster to CSV/PDF

##### 4.2: Enhanced Grade Submission
**Backend**:
- Grade submission deadlines
- Grade approval workflow
- Grade change requests

**Frontend**:
- Improved grade entry interface
- Bulk grade import from CSV
- Grade statistics (average, distribution)
- Submit grades workflow

##### 4.3: Attendance Tracking
**Backend**:
- `attendance` table (student_id, section_id, date, status)
- Attendance policies
- Auto-calculate attendance grade

**Frontend**:
- Quick attendance entry (checkboxes)
- Attendance reports per student
- Export attendance

##### 4.4: Course Materials
**Backend**:
- `course_materials` table (syllabus, slides, etc.)
- File storage

**Frontend**:
- Upload materials
- Organize by week/topic
- Students can download

---

### 📊 PHASE 5: Advanced Features
**Goal**: Professional university systems
**Estimated Time**: 5+ hours

#### Features to Build:

##### 5.1: Transcript Generation
**Backend**:
- Generate official transcript PDF
- Include: all courses, grades, GPA, degree
- Watermark for unofficial vs official
- Digital signature for official

**Frontend**:
- Request official transcript
- Download unofficial transcript
- Transcript request history

##### 5.2: Degree Audit
**Backend**:
- Complex logic to check all requirements
- General education requirements
- Major requirements
- Elective requirements
- Credit hour minimums
- GPA requirements

**Frontend**:
- Visual audit showing completion
- "Apply for Graduation" button
- Degree works-style interface

##### 5.3: Graduation Management
**Backend**:
- `graduation_applications` table
- Degree conferral workflow
- Graduation ceremony management

**Frontend**:
- Apply for graduation
- Track graduation status
- Ceremony registration

##### 5.4: Alumni Tracking
**Backend**:
- `alumni` table
- Update status to alumni on graduation
- Alumni surveys

**Frontend**:
- Alumni directory
- Update alumni info
- Stay connected

##### 5.5: Reporting System
**Backend**:
- Pre-built reports:
  - Enrollment by program
  - Grade distribution by course
  - Student demographics
  - Financial summary
  - Retention rates

**Frontend**:
- Report builder interface
- Export to PDF/Excel
- Schedule automated reports
- Dashboard with charts

---

## Implementation Checklist Template

For each feature, track progress with this checklist:

```markdown
### Feature: [Name]

#### Backend
- [ ] Database migration created
- [ ] Model relationships defined
- [ ] Validation rules written
- [ ] API endpoints created
- [ ] Authorization policies set
- [ ] Unit tests written
- [ ] Integration tests written

#### Frontend
- [ ] TypeScript interfaces defined
- [ ] API service methods created
- [ ] UI components built
- [ ] Forms with validation
- [ ] Tables/lists with filtering
- [ ] Error handling implemented
- [ ] Loading states added

#### CSV Operations
- [ ] Import job created
- [ ] Export logic implemented
- [ ] Template generation
- [ ] Frontend CSV component added

#### Documentation
- [ ] API endpoints documented
- [ ] User guide updated
- [ ] Code comments added
```

---

## File Organization Reference

### Backend Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── AdmissionApplicationController.php
│   │           ├── EnrollmentController.php
│   │           ├── GradeController.php
│   │           └── [Entity]Controller.php
│   ├── Requests/
│   │   ├── StoreAdmissionApplicationRequest.php
│   │   └── [Action][Entity]Request.php
│   └── Resources/
│       ├── AdmissionApplicationResource.php
│       └── [Entity]Resource.php
├── Models/
│   ├── AdmissionApplication.php
│   ├── Student.php
│   └── [Entity].php
├── Services/
│   ├── AdmissionService.php
│   ├── EnrollmentService.php
│   └── [Feature]Service.php
├── Jobs/
│   ├── ProcessAdmissionImport.php
│   └── Process[Entity]Import.php
└── Mail/
    ├── AdmissionAccepted.php
    └── [Notification]Mail.php
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── admissions-tab.tsx
│   │   ├── enrollments-tab.tsx
│   │   └── [entity]-tab.tsx
│   ├── student/
│   │   ├── application-form.tsx
│   │   ├── class-schedule.tsx
│   │   └── [feature].tsx
│   └── ui/
│       └── [shadcn components]
├── services/
│   ├── admin.service.ts
│   ├── student.service.ts
│   └── [feature].service.ts
└── types/
    └── api-types.ts
```

---

## Testing Strategy

### For Each Feature:

1. **Unit Tests** (Backend)
   - Test individual methods
   - Mock dependencies
   - Test edge cases

2. **Integration Tests** (Backend)
   - Test API endpoints
   - Test database interactions
   - Test authorization

3. **Feature Tests** (Backend)
   - Test complete workflows
   - Test user scenarios
   - Test error conditions

4. **Manual Testing** (Frontend)
   - Test all user flows
   - Test on different devices
   - Test edge cases

5. **CSV Testing**
   - Test valid CSV imports
   - Test invalid data
   - Test large files
   - Test template downloads

---

## Next Steps

### To Start Implementation:

1. **Choose a phase** from above (recommend Phase 1: Admissions)
2. **Review the detailed steps** for that phase
3. **Start with backend** (database + API)
4. **Then frontend** (UI components)
5. **Then CSV** (bulk operations)
6. **Test thoroughly**
7. **Move to next feature**

### Current Priority:
🔥 **PHASE 1: Complete Admissions Workflow**
- Start with Step 1.1 (Backend API)
- File: `app/Http/Controllers/Api/V1/AdmissionApplicationController.php`
- Add new methods for accept/reject/waitlist/enroll

---

## Notes & Conventions

### API Response Format
```json
{
  "data": { /* resource */ },
  "message": "Success message",
  "meta": { /* pagination, etc */ }
}
```

### Error Response Format
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### CSV Headers Convention
- Use snake_case
- Match database column names
- Use `_code` for foreign key lookups (e.g., `program_code` instead of `program_id`)

### File Naming Conventions
- Controllers: `[Entity]Controller.php`
- Models: `[Entity].php` (singular)
- Migrations: `create_[entities]_table.php` (plural)
- Jobs: `Process[Entity]Import.php`
- Frontend: `[entity]-tab.tsx` (kebab-case, plural)

---

## Changelog

### 2025-11-09
- Initial guide created
- Completed CSV import/export for all core entities
- Documented current system status
- Outlined 5 implementation phases
- Prioritized admissions workflow as Phase 1
