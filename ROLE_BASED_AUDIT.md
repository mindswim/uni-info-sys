# Role-Based Audit Framework -- Enterprise SIS

> Source of truth for roadmapping and implementation.
> Maps every user journey an enterprise-grade Student Information System must support.
> Status key: [x] Exists (backend + frontend), [B] Backend only, [ ] Not built yet.

---

## System Inventory Summary

| Layer | Count |
|-------|-------|
| API Routes | 340+ endpoints |
| Controllers | 51 |
| Services | 14 (with deep business logic) |
| Models | 41+ |
| Frontend Pages | 76+ |
| Frontend Components | 150+ |
| Background Jobs | 16 |
| Policy Classes | 20 |
| Custom Exceptions | 14 |
| Tests | 59 files |

---

## 1. Prospective Student (Unauthenticated / New User)

### Journey: "I discover the university, apply, and get accepted"

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 1.1 | I visit the university landing page | [x] | `/` |
| 1.2 | I register for an account | [x] | `/auth/register` + API |
| 1.3 | I log in | [x] | `/auth/login` + API |
| 1.4 | I reset a forgotten password | [x] | `/auth/forgot-password` + API (E1) |
| 1.5 | I browse the course catalog | [x] | `/apply` + `GET /course-catalog` |
| 1.6 | I start an admission application | [x] | `/student/apply` + API |
| 1.7 | I select programs by preference order | [x] | apply-tab.tsx + program-choices API |
| 1.8 | I upload supporting documents | [x] | document-uploader.tsx + API |
| 1.9 | I submit my application | [x] | Status transition draft -> submitted |
| 1.10 | I track my application status | [x] | `/student/admissions` + admissions-status-tab.tsx |
| 1.11 | I receive acceptance and confirm enrollment | [x] | Confirm enrollment button + matriculation service |
| 1.12 | I receive rejection with explanation | [x] | Status display in admissions-status-tab.tsx |
| 1.13 | I am waitlisted and get notified when promoted | [x] | Waitlist UI + background job notifications |

**Gaps:**
- [ ] Application fee payment during submission
- ~~Forgot password page~~ Done (E1)
- ~~Public program directory~~ Done (E22)
- ~~Email verification flow UI~~ Done (E21)

---

## 2. Enrolled Student

### 2a. Registration & Enrollment

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 2.1 | I see my student dashboard | [x] | `/student` with widgets |
| 2.2 | I browse courses for the upcoming term | [x] | `/student/registration` + course-registration-wizard.tsx |
| 2.3 | I check prerequisites before registering | [x] | Prerequisite validation in EnrollmentService |
| 2.4 | I register for courses (multi-step wizard) | [x] | 5-step wizard: catalog, prerequisites, schedule, cart, summary |
| 2.5 | I see schedule conflict warnings | [x] | EnrollmentService time/day overlap detection |
| 2.6 | I am auto-waitlisted when section is full | [x] | Capacity check + auto-waitlist in EnrollmentService |
| 2.7 | I am auto-promoted when a spot opens | [x] | ProcessWaitlistPromotion job |
| 2.8 | I view my weekly schedule | [x] | `/student/schedule` |
| 2.9 | I drop a course during add/drop | [x] | `/student/drop-add` + withdraw endpoint |
| 2.10 | I swap one section for another | [x] | Swap endpoint |
| 2.11 | I get blocked from registration by a hold | [x] | RegistrationHoldException + holds check |
| 2.12 | I view my enrollment list | [x] | `/student/enrollments` |
| 2.13 | I receive enrollment confirmation email | [x] | SendEnrollmentConfirmation job |

**Gaps:**
- ~~Registration time ticket system~~ Done (E11)
- ~~Advisor approval before registration~~ Done (E12)
- ~~Repeat course policy~~ Done (E9)
- ~~Credit hour limit per term~~ Done (E8)
- [ ] Cross-listed course handling (same course, different department codes)

### 2b. Academics & Coursework

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 2.14 | I view my grades (current + historical) | [x] | `/student/grades` + gradebook/me |
| 2.15 | I check my degree audit / progress | [x] | `/student/degree-audit` + degree requirements API |
| 2.16 | I view academic records (prior education) | [x] | `/student/academic-records` |
| 2.17 | I view and submit assignments | [x] | `/student/assignments` + submissions API |
| 2.18 | I view course materials / syllabus | [x] | `/student/materials` |
| 2.19 | I check my class schedule / sessions | [x] | `/student/calendar` |
| 2.20 | I view my attendance record | [x] | Attendance student report API |
| 2.21 | I request a transcript | [x] | `/student/transcripts` with PDF generation (E13) |
| 2.22 | I check GPA (semester + cumulative) | [x] | StudentService GPA calculations |
| 2.23 | I see my academic standing | [x] | Good standing / probation / dean's list logic |
| 2.24 | I see my class standing (freshman-senior) | [x] | Credit-based calculation in Student model |

**Gaps:**
- ~~Transcript PDF generation~~ Done (E13)
- ~~What-if degree audit~~ Done (E14)
- ~~Course evaluation submissions~~ Done (E15)
- ~~Academic plan / 4-year planner~~ Done (E16)
- ~~Transfer credit display~~ Done (E24)
- [ ] Incomplete grade resolution workflow (student side)

### 2c. Financial

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 2.25 | I view my account balance / invoices | [x] | `/student/billing` + BillingService |
| 2.26 | I make a payment | [x] | `/student/payment` + payments API |
| 2.27 | I view my financial aid package | [x] | `/student/financial-aid` |
| 2.28 | I see tuition breakdown by line item | [x] | Invoice line items (tuition, fees) |
| 2.29 | I view payment history | [x] | Payments listing |

**Gaps:**
- ~~Payment plan setup~~ Done (E17)
- ~~1098-T tax form~~ Done (E30)
- [ ] Financial aid application/FAFSA status tracking
- [ ] Scholarship application submission
- [ ] Refund request for dropped courses
- ~~Automated financial holds~~ Done (E18)

### 2d. Student Life & Support

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 2.30 | I view holds and to-do items | [x] | `/student/holds` + action items |
| 2.31 | I complete action items | [x] | Complete/dismiss endpoints |
| 2.32 | I view my advisor | [x] | `/student/advisor` |
| 2.33 | I book advising appointments | [x] | Appointments API |
| 2.34 | I read announcements | [x] | `/student/announcements` |
| 2.35 | I send/receive messages | [x] | `/messages` |
| 2.36 | I view notifications | [x] | `/notifications` |
| 2.37 | I update my profile | [x] | `/profile` |
| 2.38 | I update settings (notifications, theme) | [x] | `/settings` |

**Gaps:**
- [ ] Student organization / club directory
- [ ] Campus map / building directory (public)
- [ ] Emergency contact management
- [ ] Address / contact info self-service update
- ~~Graduation application~~ Done (E10)
- [ ] Diploma / commencement status tracking

---

## 3. Faculty / Instructor

### 3a. Course Delivery

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 3.1 | I see my faculty dashboard | [x] | `/faculty` |
| 3.2 | I view my assigned sections | [x] | `/faculty/sections` + staff/me/sections |
| 3.3 | I view class rosters | [x] | `/faculty/students` |
| 3.4 | I take attendance | [x] | `/faculty/attendance` + bulk API |
| 3.5 | I manage class sessions | [x] | `/faculty/courses` |
| 3.6 | I cancel / reschedule a session | [x] | Class session cancel/reschedule endpoints |
| 3.7 | I assign a substitute instructor | [x] | Substitute endpoint |

### 3b. Assignments & Grading

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 3.8 | I create assignments with due dates | [x] | `/faculty/assignments` |
| 3.9 | I publish/unpublish assignments | [x] | Publish/unpublish endpoints |
| 3.10 | I duplicate an assignment | [x] | Duplicate endpoint |
| 3.11 | I view/grade student submissions | [x] | Submissions endpoints |
| 3.12 | I batch grade submissions | [x] | batch-grade endpoint |
| 3.13 | I return submissions for revision | [x] | Return endpoint |
| 3.14 | I manage the gradebook | [x] | `/faculty/grades` + gradebook API |
| 3.15 | I submit final grades | [x] | Grade submission + bulk endpoint |
| 3.16 | I finalize grades for the term | [x] | Finalize endpoint |
| 3.17 | I export gradebook | [x] | Export endpoint |
| 3.18 | I view grade distribution | [x] | Distribution endpoint |
| 3.19 | I view grading progress (% complete) | [x] | Progress endpoint |
| 3.20 | I request a grade change after finalization | [x] | API + faculty UI (E3) |

### 3c. Course Content

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 3.21 | I upload course materials | [x] | `/faculty/materials` |
| 3.22 | I publish/unpublish materials | [x] | Publish endpoints |
| 3.23 | I reorder materials | [x] | Reorder endpoint |
| 3.24 | I create section announcements | [x] | `/faculty/announcements` |

### 3d. Advising

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 3.25 | I view my advisees | [x] | `/faculty/advisees` |
| 3.26 | I manage appointments | [x] | `/faculty/appointments` |
| 3.27 | I confirm/complete/no-show appointments | [x] | Status transition endpoints |

### 3e. Communication

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 3.28 | I send/receive messages | [x] | `/messages` |
| 3.29 | I update my profile/settings | [x] | `/profile`, `/settings` |

**Gaps:**
- ~~Grade change request UI~~ Done (E3)
- ~~Office hours management~~ Done (E28)
- [ ] Course section request / preference submission (for next term scheduling)
- ~~Student early alert system~~ Done (E25)
- [ ] Syllabus template / builder
- [ ] Peer review assignment type
- ~~Discussion forums~~ Done (E26)
- ~~Rubric-based grading~~ Done (E27)

---

## 4. System Administrator

### 4a. Dashboard & Analytics

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.1 | I see system overview dashboard | [x] | `/admin` |
| 4.2 | I view analytics and reports | [x] | `/admin/analytics` |

### 4b. People Management

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.3 | I manage students (CRUD + soft delete) | [x] | `/admin/students` |
| 4.4 | I manage faculty/staff | [x] | `/admin/faculty` |
| 4.5 | I manage user accounts | [x] | `/admin/system` |
| 4.6 | I assign roles to users | [x] | Roles API + roles-tab.tsx |
| 4.7 | I import/export people via CSV | [x] | CSV endpoints (students, staff) + csv-import-export.tsx |
| 4.7b | I restore soft-deleted student records | [x] | `POST /students/{id}/restore`, `DELETE .../force` |

### 4c. Academic Structure

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.8 | I manage faculties | [x] | `/admin/faculties` |
| 4.9 | I manage departments | [x] | `/admin/departments` |
| 4.10 | I manage programs | [x] | `/admin/programs` |
| 4.11 | I manage courses (with prerequisites) | [x] | `/admin/courses` |
| 4.12 | I manage course sections | [x] | `/admin/sections` |
| 4.13 | I manage academic terms | [x] | `/admin/terms` |
| 4.14 | I manage degree requirements | [x] | API + admin UI (E2) |
| 4.15 | I manage buildings | [x] | `/admin/buildings` |
| 4.16 | I manage rooms | [x] | Rooms API (part of buildings) |

### 4d. Enrollment & Registration

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.17 | I manage enrollments | [x] | `/admin/enrollments` |
| 4.18 | I manage holds (create, resolve) | [x] | `/admin/holds` |
| 4.19 | I manage waitlists | [x] | `/admin/waitlists` |
| 4.20 | I manage grades | [x] | `/admin/grades` |
| 4.21 | I review/approve grade change requests | [x] | API + admin UI (E3) |
| 4.22 | I generate class sessions for a term | [x] | API + UI trigger (E4) |

### 4e. Admissions

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.23 | I view all applications | [x] | `/admin/admissions` |
| 4.24 | I review applications individually | [x] | `/admin/admissions/review` |
| 4.25 | I bulk accept/reject/waitlist | [x] | Bulk actions API |
| 4.26 | I view admission statistics | [x] | Stats endpoint |
| 4.27 | I enroll accepted students | [x] | Enroll endpoint |
| 4.28 | I verify student documents | [x] | Document verification queue UI (E5) |

### 4f. Financial

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.29 | I manage billing / invoices | [x] | `/admin/billing` |
| 4.30 | I manage tuition rates | [x] | `/admin/tuition-rates` |
| 4.31 | I manage financial aid | [x] | `/admin/financial-aid` |
| 4.32 | I process refunds | [x] | Refund endpoint |
| 4.33 | I add discounts/adjustments to invoices | [x] | Discount/adjustment endpoints |

### 4g. Communications

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.34 | I create university-wide announcements | [x] | `/admin/announcements` |
| 4.35 | I send/receive messages | [x] | `/messages` |
| 4.36 | I manage events/calendar | [x] | `/admin/events` (E6) |

### 4h. System Configuration

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.37 | I manage roles and permissions | [x] | `/admin/roles` |
| 4.38 | I manage system settings | [x] | `/admin/settings` |
| 4.39 | I view system info | [x] | System info endpoint in settings |
| 4.40 | I clear cache / toggle maintenance | [x] | Cache/maintenance endpoints |
| 4.41 | I import/export data via CSV | [x] | CSV on all major resources |

### 4i. Data Recovery & Administration

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 4.42 | I restore soft-deleted records (students, courses, enrollments, applications, documents) | [x] | Restore + force-delete endpoints on all soft-deletable models |
| 4.43 | I view a specific student's sessions/assignments/submissions (cross-user lookup) | [x] | `/class-sessions/student`, `/assignments/student`, admin-scoped queries |
| 4.44 | I bulk import courses via dedicated importer | [x] | `POST /imports/courses` (CourseImportController) |
| 4.45 | I import grades from file for a section | [x] | `POST /course-sections/{id}/import-grades` (GradeImportController) |

**Gaps:**
- ~~Degree requirements admin UI~~ Done (E2)
- ~~Grade change request review UI~~ Done (E3)
- ~~Session generation UI trigger~~ Done (E4)
- ~~Admin events/calendar page~~ Done (E6)
- ~~Document verification queue UI~~ Done (E5)
- ~~Audit log viewer~~ Done (E7)
- [ ] Automated report generation / scheduled reports
- [ ] User activity log / login history
- ~~Batch academic standing updates~~ Done (E19)
- ~~Academic calendar builder~~ Done (E20)
- [ ] Notification template management
- [ ] Email template management

---

## 5. Staff / Registrar

> Currently shares admin infrastructure with permission-scoped access. The sidebar routes staff to "faculty" navigation.

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 5.1 | I process admission applications | [x] | Via admin pages |
| 5.2 | I verify student documents | [x] | Document verification queue (E5) |
| 5.3 | I manage enrollment overrides | [x] | Via admin pages |
| 5.4 | I generate invoices for students | [x] | Via admin billing |
| 5.5 | I process transcript requests | [x] | Transcript PDF generation (E13) |
| 5.6 | I handle enrollment verifications | [x] | Enrollment verification letter PDF (E29) |
| 5.7 | I manage commencement / graduation clearance | [B] | Graduation application exists (E10), clearance workflow partial |

**Gaps:**
- [ ] Dedicated registrar dashboard (not same as admin)
- ~~Transcript request processing~~ Done (E13)
- ~~Enrollment verification letter generation~~ Done (E29)
- [ ] Full graduation clearance workflow (multi-step approval -- E32)
- [ ] FERPA compliance tools (access restrictions, disclosure logging)

---

## 6. Department Chair

> Role added via E23 with `department-chair` role, `EnsureIsDepartmentChair` middleware, and scoped dashboard/views.

| # | User Story | Status | Notes |
|---|-----------|--------|-------|
| 6.1 | I view my department's courses and sections | [x] | `/chair/sections` + DepartmentChairController (E23) |
| 6.2 | I approve course section offerings for next term | [x] | ApprovalRequest(type=section_offering) + `/chair/approvals` page |
| 6.3 | I assign instructors to sections | [x] | PUT sections/{id}/assign-instructor + dropdown in sections page |
| 6.4 | I review grade distributions for my department | [x] | `/chair/grades` + gradeDistribution() (E23) |
| 6.5 | I approve enrollment overrides / capacity increases | [x] | ApprovalRequest(type=enrollment_override) + `/chair/approvals` page |
| 6.6 | I approve grade change requests for my department | [x] | Scoped grade-change-requests endpoints + grades page tab |
| 6.7 | I review faculty performance data | [x] | facultyPerformance() endpoint + faculty page performance tab |

---

## 7. Cross-Cutting Concerns (All Roles)

### 7a. Implemented

| Concern | Status | Details |
|---------|--------|---------|
| Authentication (token-based) | [x] | Sanctum |
| Role-based access control | [x] | 20 policy classes, 4 role middleware (admin, staff, student, chair) |
| Permission-based access | [x] | HasPermission middleware, role-permission sync |
| Audit trail | [x] | Laravel Auditing on critical models + audit log viewer (E7) |
| Background job processing | [x] | 16 jobs (waitlist, notifications, CSV imports) |
| Prometheus metrics | [x] | Request tracking, duration observability |
| Request tracing | [x] | AddTraceIdToLogs middleware |
| Security headers | [x] | AddSecurityHeaders middleware |
| CORS | [x] | CorsHeaders middleware |
| Soft deletes | [x] | Students, courses, enrollments, applications, documents |
| CSV import/export | [x] | All major resources |
| Domain exceptions | [x] | 14 custom exception classes |
| Input validation | [x] | Form request classes |

### 7b. Gaps

| Concern | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email delivery system | [ ] | High | Jobs dispatch notifications but no verified email delivery (Mailgun/SES) |
| Real-time notifications (WebSocket) | [ ] | Medium | Currently polling-based only |
| File storage abstraction | [ ] | Medium | Documents upload but no S3/cloud storage config |
| Rate limiting on auth endpoints | [ ] | Medium | Standard Laravel throttle may be configured but not explicit |
| API versioning strategy | [x] | -- | Already using `/api/v1/` |
| Multi-tenancy | [ ] | Low | Single institution only (typical for portfolio) |
| Internationalization (i18n) | [ ] | Low | English only |
| Accessibility (WCAG compliance) | [ ] | Medium | No explicit audit done |
| Mobile responsiveness | [x] | -- | Tailwind responsive classes used |
| Dark mode | [x] | -- | Theme provider exists |
| Search (global) | [x] | -- | global-search.tsx component exists |

---

## Backend API Completeness Verification

> Every backend endpoint is accounted for in the user stories above or in this reference table.
> This section exists to confirm no API capability is missing from the audit.

### Endpoints mapped to user stories above (confirmed complete)

| API Domain | Endpoints | Covered In |
|-----------|-----------|------------|
| Auth (register, login, logout, user, forgot/reset password, email verify) | 8 | Section 1 |
| Students (CRUD, /me, restore, force-delete, CSV) | 10 | Sections 2, 4b |
| Staff (CRUD, /me, sections, students, CSV) | 9 | Sections 3, 4b |
| Academic Hierarchy (faculties, departments, programs + CSV) | 18 | Section 4c |
| Courses (CRUD, catalog, restore, force-delete, CSV, import) | 11 | Sections 2a, 4c, 4i |
| Course Sections (CRUD, CSV) | 7 | Sections 2a, 4c |
| Terms (CRUD, CSV, session generation) | 8 | Section 4c, 4d |
| Degree Requirements (CRUD) | 5 | Section 4c |
| Buildings & Rooms (CRUD, CSV) | 12 | Section 4g |
| Admission Applications (CRUD, accept/reject/waitlist/enroll/confirm, bulk, stats, restore) | 14 | Sections 1, 4e |
| Program Choices (CRUD) | 5 | Section 1 |
| Enrollments (CRUD, withdraw/complete/swap, /me, by-student, by-section, restore, CSV) | 14 | Sections 2a, 4d |
| Grades (submit, bulk, distribution, progress, valid-grades, import) | 7 | Sections 3b, 4d, 4i |
| Grade Change Requests (list, create, approve, deny) | 4 | Sections 3b, 4d |
| Gradebook (me, student, class, export, stats, finalize, categories, needed) | 9 | Sections 2b, 3b |
| Assignments (CRUD, /me, upcoming, by-section, for-student, publish, duplicate, types, progress) | 14 | Sections 2b, 3b, 4i |
| Submissions (submit, draft, grade, batch, return, resubmit, /me, by-assignment, stats, pending) | 14 | Sections 2b, 3b |
| Attendance (CRUD, bulk, stats, student-report, CSV) | 8 | Sections 2b, 3a |
| Class Sessions (CRUD, /me, instructor, for-date, by-section, generate, stats, complete/cancel/reschedule/substitute, student/instructor queries) | 18 | Sections 2b, 3a, 4d, 4i |
| Course Materials (CRUD, /me, by-section, syllabus, by-session, publish, reorder, types) | 12 | Sections 2b, 3c |
| Announcements (CRUD, /me, created, university-wide, by-section, by-department, publish, pin, priorities) | 13 | Sections 2d, 3c, 4g |
| Documents (CRUD, upload, versions, verify, reject, restore, force-delete) | 9 | Sections 1, 4e, 4i |
| Academic Records (CRUD, /me) | 6 | Section 2b |
| Invoices (CRUD, student-summary, discount, adjustment) | 7 | Sections 2c, 4f |
| Payments (CRUD, refund) | 6 | Sections 2c, 4f |
| Holds (CRUD, summary, admin-summary, resolve) | 7 | Sections 2d, 4d |
| Action Items (CRUD, dashboard, complete, dismiss) | 7 | Section 2d |
| Financial Aid (CRUD, /me, scholarships, stats, student-packages) | 8 | Sections 2c, 4f |
| Events (CRUD, /me, upcoming, types, rsvp, cancel) | 8 | Sections 2d, 4g |
| Appointments (CRUD, /me, advisor, advisees, advisor-appointments, cancel/confirm/complete/no-show) | 10 | Sections 2d, 3d |
| Messages (conversations, send, read, archive, unread, search-users) | 7 | Sections 2d, 3e, 4g |
| Tuition Rates (CRUD) | 5 | Section 4f |
| Settings (user: me, notifications, appearance; system: all, info, group, setting, cache, maintenance) | 11 | Sections 2d, 4h |
| Roles (CRUD, sync-permissions) | 6 | Section 4h |
| Permissions (list, show) | 2 | Section 4h |
| Users (list, show, roles) | 3 | Section 4b |
| Notifications (list, mark-read) | 2 | Section 2d |
| Health + Metrics | 2 | Section 7a |
| Department Chair (dashboard, faculty, sections, grades) | 4 | Section 6 (E23) |
| Office Hours (CRUD, available) | 5 | Section 3 (E28) |
| Enrollment Verification (generate PDF) | 1 | Section 5 (E29) |
| Tax Forms 1098-T (index, generate, download) | 3 | Section 2c (E30) |
| Early Alerts (CRUD, comments, my-alerts) | 6 | Sections 3, 4 (E25) |
| Transfer Credits (CRUD, evaluate, equivalencies) | 6 | Sections 2b, 4e (E24) |
| Rubrics (CRUD, templates, duplicate, score, results) | 7 | Section 3b (E27) |
| Discussion Forums (topics, replies, pin, lock) | 6 | Sections 2d, 3c (E26) |
| Registration Time Tickets (CRUD, assign, check) | 5 | Section 2a (E11) |
| Advisor Registration Approval (request, approve, deny) | 3 | Section 2a (E12) |
| Course Evaluations (submit, view, stats) | 4 | Section 2b (E15) |
| Academic Planner (CRUD, templates) | 5 | Section 2b (E16) |
| Payment Plans (create, installments, status) | 4 | Section 2c (E17) |
| Academic Standing (batch update, history) | 3 | Section 4d (E19) |
| Academic Calendar (CRUD, events) | 4 | Section 4c (E20) |
| Graduation Application (submit, status, clearance) | 4 | Section 2d (E10) |
| Transcript PDF (generate, download) | 2 | Section 2b (E13) |
| What-if Degree Audit (simulate) | 2 | Section 2b (E14) |
| Audit Log (view, filter) | 3 | Section 4h (E7) |
| **Total** | **~340** | **All mapped** |

---

## Enterprise Feature Gap Analysis

These are features found in production SIS platforms (Banner, PeopleSoft, Workday Student) that are not yet in this system. Organized by domain and priority.

### Tier 1: Important for Completeness -- All Done

| # | Feature | Domain | Backend | Frontend | Status |
|---|---------|--------|---------|----------|--------|
| E1 | Forgot password page | Auth | Done | Done | Done |
| E2 | Degree requirements admin UI | Academics | Done | Done | Done |
| E3 | Grade change request UI (faculty + admin) | Grading | Done | Done | Done |
| E4 | Session generation trigger | Scheduling | Done | Done | Done |
| E5 | Document verification queue | Admissions | Done | Done | Done |
| E6 | Admin events/calendar page | Admin | Done | Done | Done |
| E7 | Audit log viewer | System | Done | Done | Done |
| E8 | Credit hour limit per term | Enrollment | Done | Done | Done |
| E9 | Repeat course policy | Enrollment | Done | Done | Done |
| E10 | Graduation application | Student Life | Done | Done | Done |

### Tier 2: Nice to Have -- All Done

| # | Feature | Domain | Backend | Frontend | Status |
|---|---------|--------|---------|----------|--------|
| E11 | Registration time tickets | Registration | Done | Done | Done |
| E12 | Advisor approval for registration | Registration | Done | Done | Done |
| E13 | Transcript PDF generation | Records | Done | Done | Done |
| E14 | What-if degree audit | Academics | Done | Done | Done |
| E15 | Course evaluation submissions | Academics | Done | Done | Done |
| E16 | Academic plan / 4-year planner | Advising | Done | Done | Done |
| E17 | Payment plan / installments | Financial | Done | Done | Done |
| E18 | Automated financial holds on balance | Financial | Done | N/A (job) | Done |
| E19 | Batch academic standing update | Admin | Done | Done | Done |
| E20 | Academic calendar builder | Admin | Done | Done | Done |
| E21 | Email verification flow page | Auth | Done | Done | Done |
| E22 | Public program directory | Marketing | Done | Done | Done |

### Tier 3: Advanced / Enterprise -- All Done

| # | Feature | Domain | Backend | Frontend | Status |
|---|---------|--------|---------|----------|--------|
| E23 | Department Chair role | Governance | Done | Done | Done |
| E24 | Transfer credit evaluation | Admissions | Done | Done | Done |
| E25 | Student early alert system | Retention | Done | Done | Done |
| E26 | Discussion forums | LMS | Done | Done | Done |
| E27 | Rubric-based grading | LMS | Done | Done | Done |
| E28 | Office hours management | Faculty | Done | Done | Done |
| E29 | Enrollment verification letters | Registrar | Done | Done | Done |
| E30 | 1098-T tax form | Financial | Done | Done | Done |

### Tier 4: Remaining Enterprise Gaps (Not Built)

| # | Feature | Domain | Notes |
|---|---------|--------|-------|
| E31 | FERPA compliance tools | Compliance | Access logging, disclosure tracking |
| E32 | Graduation clearance workflow | Registrar | Multi-step approval |
| E33 | Course section request workflow | Scheduling | Faculty preference submission |
| E34 | Notification template management | System | Configurable email/notification templates |
| E35 | WebSocket real-time updates | System | Live notifications, chat |
| E36 | Peer review assignments | LMS | Student-to-student evaluation |
| E37 | Multi-institution / multi-tenancy | System | Beyond portfolio scope |

---

## Scorecard

| Domain | Stories | Built | Backend Only | Not Built | Coverage |
|--------|---------|-------|-------------|-----------|----------|
| Prospective Student | 13 | 13 | 0 | 0 | 100% |
| Student: Registration | 13 | 13 | 0 | 0 | 100% |
| Student: Academics | 11 | 11 | 0 | 0 | 100% |
| Student: Financial | 5 | 5 | 0 | 0 | 100% |
| Student: Life/Support | 9 | 9 | 0 | 0 | 100% |
| Faculty: Course Delivery | 7 | 7 | 0 | 0 | 100% |
| Faculty: Grading | 13 | 13 | 0 | 0 | 100% |
| Faculty: Content | 4 | 4 | 0 | 0 | 100% |
| Faculty: Advising | 3 | 3 | 0 | 0 | 100% |
| Faculty: Communication | 2 | 2 | 0 | 0 | 100% |
| Admin: All | 46 | 46 | 0 | 0 | 100% |
| Staff / Registrar | 7 | 6 | 1 | 0 | 86% |
| Department Chair | 7 | 7 | 0 | 0 | 100% |
| **Totals** | **140** | **139** | **1** | **0** | **99%** |

### Key Takeaway

The system has **99% coverage** across 140 user stories spanning 6 active roles (prospective student, enrolled student, faculty, admin, staff/registrar, department chair). All core student, faculty, admin, and department chair journeys are complete. All 30 enterprise gap features (E1-E30) across Tiers 1-3 have been implemented. The remaining gaps are:

1. **1 backend-only feature** -- graduation clearance workflow (partial)
2. **7 Tier 4 enterprise features** (E31-E37) -- FERPA compliance, graduation clearance, section requests, notification templates, WebSockets, peer review, multi-tenancy
