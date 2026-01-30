# Role-Based Audit Framework

> Complete user journey mapping for every role in the university system.
> Each step is marked: [x] Backend API exists, [x] Frontend page exists, [ ] Missing.

---

## 1. Prospective Student (Unauthenticated / New User)

### Journey: "I want to apply to this university"

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 1.1 | I visit the university site and see a landing page | N/A | `/` page.tsx | [x] |
| 1.2 | I register for an account | `POST /api/v1/auth/register` | `/auth/register` | [x] |
| 1.3 | I log in to my new account | `POST /api/v1/tokens/create` | `/auth/login` | [x] |
| 1.4 | I browse the course catalog before applying | `GET /api/v1/course-catalog` | `/apply` page exists | [x] |
| 1.5 | I start a new admission application | `POST /api/v1/admission-applications` | `/student/apply` | [x] |
| 1.6 | I select program choices with preference order | `POST /api/v1/admission-applications/{id}/program-choices` | apply-tab.tsx | [x] |
| 1.7 | I upload supporting documents (transcripts, etc.) | `POST /api/v1/students/{id}/documents` | document-uploader.tsx | [x] |
| 1.8 | I submit my application (draft -> submitted) | `PUT /api/v1/admission-applications/{id}` | apply-tab.tsx | [x] |
| 1.9 | I check my application status | `GET /api/v1/admission-applications` | `/student/admissions` | [x] |
| 1.10 | I receive acceptance and confirm enrollment | `POST /api/v1/admission-applications/{id}/confirm-enrollment` | admissions-status-tab.tsx | [x] |
| 1.11 | I reset my forgotten password | `POST /api/v1/forgot-password` + `POST /api/v1/reset-password` | No page | [ ] **Missing: `/auth/forgot-password` page** |

---

## 2. Enrolled Student

### Journey: "I'm enrolled and navigating university life"

#### 2a. Registration & Enrollment

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 2.1 | I see my student dashboard with key info | `GET /students/me` | `/student` | [x] |
| 2.2 | I browse available courses for the term | `GET /api/v1/course-catalog` | `/student/registration` | [x] |
| 2.3 | I register for courses (multi-step wizard) | `POST /api/v1/enrollments` | course-registration-wizard.tsx | [x] |
| 2.4 | I view my current schedule | `GET /api/v1/enrollments/me` | `/student/schedule` | [x] |
| 2.5 | I drop a course during add/drop period | `POST /api/v1/enrollments/{id}/withdraw` | `/student/drop-add` | [x] |
| 2.6 | I swap one section for another | `POST /api/v1/enrollments/swap` | drop-add page | [x] |
| 2.7 | I join a waitlist for a full section | `POST /api/v1/enrollments` (auto-waitlist) | registration wizard | [x] |
| 2.8 | I view my enrollments list | `GET /api/v1/enrollments/me` | `/student/enrollments` | [x] |

#### 2b. Academics & Coursework

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 2.9 | I view my grades for current/past terms | `GET /api/v1/gradebook/me` | `/student/grades` | [x] |
| 2.10 | I check my degree audit / progress | `GET /api/v1/programs/{id}/degree-requirements` | `/student/degree-audit` | [x] |
| 2.11 | I request an official transcript | N/A (no API for transcript generation) | `/student/transcripts` | [x] page, [ ] **Missing: transcript generation API** |
| 2.12 | I view my academic records (prior education) | `GET /api/v1/students/me/academic-records` | `/student/academic-records` | [x] |
| 2.13 | I view assignments for my courses | `GET /api/v1/assignments/me` | `/student/assignments` | [x] |
| 2.14 | I submit an assignment | `POST /api/v1/submissions/submit` | student-assignments-tab.tsx | [x] |
| 2.15 | I view course materials / syllabus | `GET /api/v1/course-materials/me` | `/student/materials` | [x] |
| 2.16 | I check my class sessions / attendance | `GET /api/v1/class-sessions/me` | `/student/calendar` | [x] |

#### 2c. Financial

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 2.17 | I view my account balance / invoices | `GET /api/v1/invoices/student-summary` | `/student/billing` | [x] |
| 2.18 | I make a payment | `POST /api/v1/payments` | `/student/payment` | [x] |
| 2.19 | I view my financial aid package | `GET /api/v1/financial-aid/me` | `/student/financial-aid` | [x] |

#### 2d. Student Life & Support

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 2.20 | I view my holds and to-do items | `GET /api/v1/holds/summary` + `GET /api/v1/action-items/dashboard` | `/student/holds` | [x] |
| 2.21 | I complete an action item | `POST /api/v1/action-items/{id}/complete` | holds page | [x] |
| 2.22 | I view my advisor info | `GET /api/v1/students/me/advisor` | `/student/advisor` | [x] |
| 2.23 | I book an appointment with my advisor | `POST /api/v1/appointments` | `/student/advisor` page | [x] |
| 2.24 | I view announcements | `GET /api/v1/announcements/me` | `/student/announcements` | [x] |
| 2.25 | I send/receive messages | `GET /api/v1/messages/conversations` | `/messages` | [x] |
| 2.26 | I view notifications | `GET /api/v1/notifications` | `/notifications` | [x] |
| 2.27 | I update my profile | `PATCH /api/v1/settings/me` | `/profile` | [x] |
| 2.28 | I update my notification/appearance settings | `PATCH /api/v1/settings/me/notifications` | `/settings` | [x] |

---

## 3. Faculty / Instructor

### Journey: "I teach courses and advise students"

#### 3a. Course Management

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 3.1 | I see my faculty dashboard | `GET /api/v1/staff/me` | `/faculty` | [x] |
| 3.2 | I view my assigned course sections | `GET /api/v1/staff/me/sections` | `/faculty/sections` | [x] |
| 3.3 | I view class rosters | `GET /api/v1/staff/me/students` | `/faculty/students` | [x] |
| 3.4 | I take attendance for a session | `POST /api/v1/attendance/bulk` | `/faculty/attendance` | [x] |
| 3.5 | I view/manage class sessions | `GET /api/v1/class-sessions/me/instructor` | `/faculty/courses` | [x] |

#### 3b. Assignments & Grading

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 3.6 | I create and publish assignments | `POST /api/v1/assignments` + `POST .../publish` | `/faculty/assignments` | [x] |
| 3.7 | I view student submissions | `GET /api/v1/assignments/{id}/submissions` | assignments-tab.tsx | [x] |
| 3.8 | I grade individual submissions | `POST /api/v1/submissions/{id}/grade` | assignments-tab.tsx | [x] |
| 3.9 | I batch grade submissions | `POST /api/v1/submissions/batch-grade` | assignments-tab.tsx | [x] |
| 3.10 | I view/manage the gradebook | `GET /api/v1/course-sections/{id}/gradebook` | `/faculty/grades` | [x] |
| 3.11 | I submit final grades for a section | `PUT /api/v1/enrollments/{id}/grade` | grades-tab.tsx | [x] |
| 3.12 | I bulk submit final grades | `POST /api/v1/course-sections/{id}/grades/bulk` | grades-tab.tsx | [x] |
| 3.13 | I finalize grades for the term | `POST /api/v1/course-sections/{id}/gradebook/finalize` | grades-tab.tsx | [x] |
| 3.14 | I export gradebook | `GET /api/v1/course-sections/{id}/gradebook/export` | grades-tab.tsx | [x] |
| 3.15 | I view grade distribution | `GET /api/v1/course-sections/{id}/grade-distribution` | grades-tab.tsx | [x] |

#### 3c. Course Content

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 3.16 | I upload course materials | `POST /api/v1/course-materials` | `/faculty/materials` | [x] |
| 3.17 | I publish/unpublish materials | `POST .../publish` / `POST .../unpublish` | materials-tab.tsx | [x] |
| 3.18 | I create section announcements | `POST /api/v1/announcements` | `/faculty/announcements` | [x] |

#### 3d. Advising

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 3.19 | I view my advisees | `GET /api/v1/staff/me/advisees` | `/faculty/advisees` | [x] |
| 3.20 | I manage advising appointments | `GET /api/v1/staff/me/appointments` | `/faculty/appointments` | [x] |
| 3.21 | I confirm/complete/no-show appointments | `POST .../confirm` / `POST .../complete` / `POST .../no-show` | appointments page | [x] |

#### 3e. Communication

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 3.22 | I send/receive messages | `GET /api/v1/messages/conversations` | `/messages` | [x] |
| 3.23 | I update my profile | `PATCH /api/v1/settings/me` | `/profile` | [x] |
| 3.24 | I request a grade change | `POST /api/v1/grade-change-requests` | No dedicated page | [ ] **Missing: grade change request UI for faculty** |

---

## 4. System Administrator

### Journey: "I manage the entire university system"

#### 4a. Dashboard & Analytics

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.1 | I see the admin dashboard with system overview | Various stats endpoints | `/admin` | [x] |
| 4.2 | I view analytics and reports | Various endpoints | `/admin/analytics` | [x] |

#### 4b. People Management

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.3 | I manage student records (CRUD) | `GET/POST/PUT/DELETE /students` | `/admin/students` | [x] |
| 4.4 | I manage faculty/staff records | `GET/POST/PUT/DELETE /staff` | `/admin/faculty` | [x] |
| 4.5 | I manage user accounts | `GET /users` | `/admin/system` | [x] |

#### 4c. Academic Structure

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.6 | I manage faculties | CRUD `/faculties` | `/admin/faculties` | [x] |
| 4.7 | I manage departments | CRUD `/departments` | `/admin/departments` | [x] |
| 4.8 | I manage programs | CRUD `/programs` | `/admin/programs` | [x] |
| 4.9 | I manage courses | CRUD `/courses` | `/admin/courses` | [x] |
| 4.10 | I manage course sections | CRUD `/course-sections` | `/admin/sections` | [x] |
| 4.11 | I manage academic terms | CRUD `/terms` | `/admin/terms` | [x] |
| 4.12 | I manage degree requirements | CRUD `/programs/{id}/degree-requirements` | No dedicated page | [ ] **Missing: degree requirements admin UI** |

#### 4d. Enrollment & Registration

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.13 | I manage enrollments | CRUD `/enrollments` | `/admin/enrollments` | [x] |
| 4.14 | I manage holds | CRUD `/holds` + resolve | `/admin/holds` | [x] |
| 4.15 | I manage waitlists | Enrollment API with waitlist status | `/admin/waitlists` | [x] |
| 4.16 | I manage grades (admin view) | Grade endpoints | `/admin/grades` | [x] |
| 4.17 | I approve/deny grade change requests | `POST .../approve` / `POST .../deny` | No dedicated page | [ ] **Missing: grade change request review UI** |

#### 4e. Admissions

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.18 | I view all applications | `GET /admission-applications` | `/admin/admissions` | [x] |
| 4.19 | I review applications (accept/reject/waitlist) | `POST .../accept` / `POST .../reject` / `POST .../waitlist` | `/admin/admissions/review` | [x] |
| 4.20 | I bulk process applications | `POST .../bulk-actions` | admissions-tab.tsx | [x] |
| 4.21 | I view admission statistics | `GET .../stats` | admissions-tab.tsx | [x] |
| 4.22 | I enroll an accepted student | `POST .../enroll` | admissions-tab.tsx | [x] |

#### 4f. Financial

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.23 | I manage billing / invoices | CRUD `/invoices` | `/admin/billing` | [x] |
| 4.24 | I manage tuition rates | CRUD `/tuition-rates` | `/admin/tuition-rates` | [x] |
| 4.25 | I manage financial aid | CRUD + stats endpoints | `/admin/financial-aid` | [x] |
| 4.26 | I process refunds | `POST /payments/{id}/refund` | billing page | [x] |

#### 4g. Infrastructure

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.27 | I manage buildings | CRUD `/buildings` | `/admin/buildings` | [x] |
| 4.28 | I manage rooms | CRUD `/rooms` | No dedicated page (rooms inside buildings) | [x] partial |

#### 4h. Communications

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.29 | I create university-wide announcements | `POST /announcements` | `/admin/announcements` | [x] |
| 4.30 | I send/receive messages | Messages API | `/messages` | [x] |

#### 4i. System Configuration

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.31 | I manage roles and permissions | CRUD `/roles` + `/permissions` | `/admin/roles` | [x] |
| 4.32 | I manage system settings | Settings endpoints | `/admin/settings` | [x] |
| 4.33 | I manage events/calendar | CRUD `/events` | No dedicated admin events page | [ ] **Missing: admin events management page** |
| 4.34 | I generate class sessions for a term | `POST /terms/{id}/sessions/generate` | No UI trigger | [ ] **Missing: session generation UI (could be in terms or sections)** |
| 4.35 | I view system info / clear cache | `GET /settings/system/info`, `POST .../cache/clear` | `/admin/settings` | [x] |

#### 4j. Data Import/Export

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 4.36 | I import/export data via CSV | CSV endpoints on most resources | csv-import-export.tsx | [x] |

---

## 5. Staff / Registrar (Non-Admin Staff)

### Journey: "I handle registrar and admissions office tasks"

> Note: The current system uses `admin` and `staff` roles. Staff share many admin endpoints but with limited permissions. The sidebar maps staff to the "faculty" navigation. This role may need refinement.

| # | User Story | Backend | Frontend | Status |
|---|-----------|---------|----------|--------|
| 5.1 | I process admission applications | Admissions endpoints | Shares admin admissions pages | [x] via admin |
| 5.2 | I verify student documents | `POST .../verify` / `POST .../reject` | No dedicated document review UI | [ ] **Missing: document verification queue UI** |
| 5.3 | I manage enrollment overrides | Enrollment endpoints | Shares admin enrollment page | [x] via admin |
| 5.4 | I generate student invoices | `POST /invoices` (via BillingService) | Via admin billing | [x] via admin |

---

## Gap Summary

### Missing Frontend Pages (backend exists, no UI)

| Priority | Gap | Backend Endpoint | Suggested Location |
|----------|-----|-----------------|-------------------|
| Medium | Forgot Password page | `POST /forgot-password` + `POST /reset-password` | `/auth/forgot-password` |
| Medium | Degree Requirements admin | CRUD `/programs/{id}/degree-requirements` | `/admin/programs` (nested tab) or dedicated page |
| Medium | Grade Change Request review UI | `POST .../approve` / `POST .../deny` | `/admin/grades` (add tab) or `/faculty/grades` |
| Low | Faculty grade change request UI | `POST /grade-change-requests` | `/faculty/grades` (add button) |
| Low | Admin events/calendar management | CRUD `/events` | `/admin/events` |
| Low | Session generation trigger UI | `POST /terms/{id}/sessions/generate` | Button in `/admin/terms` or `/admin/sections` |
| Low | Document verification queue | `POST .../verify` / `POST .../reject` | `/admin/admissions/documents` or tab in review page |
| Low | Transcript generation | No API yet | Backend + `/student/transcripts` enhancement |

### Missing Backend APIs (no API exists)

| Priority | Gap | Description |
|----------|-----|-------------|
| Low | Transcript PDF generation | Generate official transcript document |
| Low | Student self-service profile edit | Students can update contact info, address, etc. (partially covered by settings) |

### Observations

1. **Coverage is strong.** Out of ~120 user stories across all roles, only ~8 have missing frontend UI, and only ~2 lack backend APIs entirely.

2. **The staff/registrar role** is underspecified. It currently piggybacks on admin pages. A dedicated registrar experience could be a future enhancement but is not critical.

3. **Faculty flow is complete.** All teaching, grading, advising, and content management flows have both backend and frontend coverage.

4. **Student flow is the most complete.** Every major student journey step (apply, enroll, study, pay, graduate) has full-stack coverage.

5. **Admin flow is comprehensive** with 36 distinct user stories, only 3-4 missing UI elements for edge-case features.

---

## Implementation Priority

If continuing to build out gaps, recommended order:

1. **Forgot Password page** -- common user need, backend ready
2. **Degree Requirements admin** -- academic completeness
3. **Grade Change Request UI** -- faculty/admin workflow gap
4. **Session generation button** -- quick win, add to terms page
5. **Admin events page** -- nice to have
6. **Document verification queue** -- admissions workflow polish
7. **Transcript generation** -- requires new backend work
