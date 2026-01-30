# University System Audit Framework

A lifecycle-based verification framework mapping the complete university experience from institutional setup through graduation. Each item is audited across three layers: **Data** (seeder), **API** (endpoints), and **Frontend** (UI pages).

## The University Lifecycle

```
SETUP → ADMISSIONS → ONBOARDING → SEMESTER → ACADEMICS → COMPLETION → GRADUATION
  ↑                                              ↓
  └──── repeats each term ◄──────────────────────┘
```

### Status Legend

- **COMPLETE** -- Data + API + Frontend all exist and work
- **PARTIAL** -- Some layers implemented, gaps noted
- **MISSING** -- Not implemented
- **BROKEN** -- Exists but non-functional

---

## Stage 0: Institutional Setup (Admin, one-time)

Before anything else, the university itself needs to exist in the system.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 0.1 | Create faculties | COMPLETE | Seeder creates 3 | Full CRUD + CSV | `/admin/faculties` | -- |
| 0.2 | Create departments under faculties | COMPLETE | 5 departments linked to faculties | Full CRUD + CSV, faculty_id filter | `/admin/departments` | -- |
| 0.3 | Create programs under departments | COMPLETE | 5 programs linked to departments | Full CRUD + CSV | `/admin/programs` | -- |
| 0.4 | Define degree requirements per program | MISSING | No seeder | No controller or routes | No UI | Model + migration exist but nothing else. Cannot define what courses a degree requires. |
| 0.5 | Create buildings and rooms | COMPLETE | 3 buildings, 30 rooms | Full CRUD + CSV for both | `/admin/buildings` | -- |
| 0.6 | Create academic terms | COMPLETE | 3 terms (Fall, Spring, Summer) | Full CRUD + CSV | `/admin/terms` | -- |
| 0.7 | Set tuition rates per program | PARTIAL | BillingSeeder creates 60 rate records | No controller or routes | No UI | Model exists, data is seeded, but rates can only be managed via database. No API or admin page. |
| 0.8 | Create staff accounts, assign to departments | COMPLETE | 25 staff across departments | Full CRUD + CSV, department filter | `/admin/staff` | -- |
| 0.9 | Assign roles and permissions | PARTIAL | 7 roles, 22+ permissions seeded | Full CRUD for roles + permission sync | No UI | API works but no frontend page to manage role/permission assignments. Admin must use API directly. |
| 0.10 | Configure system settings | COMPLETE | SystemSettingSeeder populates defaults | Full settings API (user + system) | `/admin/settings` with tabs | Registration, notifications, academic, system tabs all functional. |

**Key question:** Is the foundational data correctly seeded and are all admin CRUD pages functional?

**Answer:** Mostly yes. 7 of 10 items are complete. Three gaps: degree requirements (model only), tuition rate management (no API/UI), and role/permission UI (API-only).

### Stage 0 Action Items

1. **HIGH** -- Build degree requirements API + admin UI (model/migration already exist)
2. **MEDIUM** -- Build tuition rate CRUD API + admin UI (model/seeder already exist)
3. **LOW** -- Build role/permission management UI (API already works)

---

## Stage 1: Admissions Pipeline

A prospective student discovers the university and applies.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 1.1 | Student creates account | MISSING | DemoSeeder creates accounts manually | No public registration endpoint | No signup page | Students cannot self-register. Accounts must be admin-created. Only login exists. |
| 1.2 | Submit application | COMPLETE | AdmissionsSeeder creates realistic apps | POST admission-applications | `/student/apply` | Supports draft, personal info, term selection. |
| 1.3 | Rank program choices | COMPLETE | 1-3 choices per application seeded | Full CRUD nested under applications | Integrated in apply page | Preference ordering works. |
| 1.4 | Upload documents | COMPLETE | Documents seeded with types/statuses | POST with versioning + file upload | Integrated in apply page | Supports transcripts, essays, recommendations. Auto-versioning. |
| 1.5 | Admissions officer reviews application | COMPLETE | Applications with various statuses | GET with filters + stats endpoint | `/admin/admissions` + `/admin/admissions/review` | Filtering by status, term, student. Statistics endpoint. |
| 1.6 | Officer verifies documents | PARTIAL | Documents have verified flag | No dedicated verification endpoint | No verification UI | Document model has `status` and `verified` fields but no workflow endpoint to update them. |
| 1.7 | Decision: accept/reject/waitlist | COMPLETE | Seeder creates decisions | POST accept/reject/waitlist + bulk actions | Admin review page with buttons | Dispatches notification jobs. Bulk actions supported. |
| 1.8 | Student confirms enrollment | PARTIAL | EnrollmentConversionSeeder does this | POST enroll endpoint (admin-only) | No student confirmation page | No two-step flow. Admin enrolls, student has no confirmation step or deadline. |
| 1.9 | Application converts to enrolled student | PARTIAL | Seeder handles conversion | Enroll endpoint changes app status | -- | Enroll endpoint does NOT update student's enrollment_status or major_program_id. Seeder does this separately. Logic split between endpoint and seeder. |
| 1.10 | Student assigned to program | PARTIAL | Seeder assigns major_program_id | No explicit endpoint | -- | Program assignment happens in seeder, not in the enroll API flow. Should be automatic when application is accepted/enrolled. |
| 1.11 | Financial aid packages offered | COMPLETE | FinancialAidSeeder creates packages, scholarships, awards, disbursements | GET my package, scholarships, stats | `/student/financial-aid` | 6 scholarship types, per-student packages with need/merit calculations. |

**Key question:** Can a person go from zero to "enrolled student with a program" entirely through the system?

**Answer:** No. Three blockers: (1) no self-registration, (2) no student enrollment confirmation step, (3) enroll endpoint doesn't complete the student record conversion (relies on seeder logic).

### Stage 1 Action Items

1. **CRITICAL** -- Add public registration endpoint (POST /api/v1/auth/register) + signup page
2. **HIGH** -- Update enroll endpoint to also set student's enrollment_status and major_program_id
3. **MEDIUM** -- Add student enrollment confirmation step (student accepts, not just admin)
4. **MEDIUM** -- Add document verification workflow endpoint
5. **LOW** -- Add student self-service enrollment confirmation deadline

---

## Stage 2: Pre-Semester Setup (Admin + Faculty)

Before a semester starts, the term needs to be built out.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 2.1 | Create course sections for term | COMPLETE | Seeder creates sections with scheduling | Full CRUD + CSV | `/admin/sections` | Assigns course, instructor, room, schedule days/times, capacity. |
| 2.2 | Generate class sessions from schedules | COMPLETE | -- | POST generate for section or entire term | Faculty can view sessions | ClassSessionService handles generation logic. |
| 2.3 | Faculty uploads syllabus and materials | COMPLETE | -- | Full CRUD + publish/unpublish/reorder | `/faculty/materials` | Types: syllabus, lecture notes, readings, etc. |
| 2.4 | Faculty creates assignments | COMPLETE | ComprehensiveDataSeeder | Full CRUD + publish/unpublish/duplicate | `/faculty/assignments` | Types: homework, quiz, exam, project, discussion, peer_review. Late penalty config. |
| 2.5 | Set enrollment capacity per section | COMPLETE | Capacity set in seeder | capacity field on section CRUD | Included in section form | EnrollmentService checks capacity during enrollment. |
| 2.6 | Set registration dates / add-drop period | COMPLETE | Terms have add_drop_deadline | add_drop_deadline on term CRUD | Included in term form | Term::isWithinAddDropPeriod() enforced in EnrollmentService. |
| 2.7 | Create announcements about registration | COMPLETE | -- | Full CRUD + publish/pin | `/admin/announcements` + `/faculty/announcements` | University-wide, department, or section-level. Priority levels. |

**Key question:** Can admin and faculty fully prepare a term before students register?

**Answer:** Yes. All pre-semester setup capabilities are complete.

---

## Stage 3: Registration (Student)

The enrolled student builds their schedule.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 3.1 | Browse course catalog | COMPLETE | Courses and sections seeded | GET course-catalog + sections with filters | `/student/registration` (1500+ line wizard) | Filter by department, credits, level, search. |
| 3.2 | Prerequisite validation | COMPLETE | Course prerequisites seeded | EnrollmentService::checkPrerequisites() | Prerequisite check step in wizard | Validates passed prereqs, checks grades, throws PrerequisiteNotMetException. |
| 3.3 | Enroll in sections | COMPLETE | Enrollments seeded | POST enrollments with full validation | Shopping cart + schedule builder in wizard | Capacity check, schedule conflict check, duplicate check. |
| 3.4 | Automatic waitlist when full | COMPLETE | Seeder creates waitlisted enrollments | EnrollmentService::determineEnrollmentStatus() | Handled transparently | Returns 'waitlisted' status when capacity = 0. |
| 3.5 | Waitlist promotion on drop | COMPLETE | -- | EnrollmentService::promoteFromWaitlist() | -- | FIFO ordering by created_at. ProcessWaitlistPromotion job. Triggers on withdraw. |
| 3.6 | View schedule | COMPLETE | -- | GET enrollments/me + class-sessions/me | `/student/enrollments` + `/student/schedule` | Course details, instructor, times, credits, status. |
| 3.7 | Drop/add during period | COMPLETE | -- | POST withdraw + POST enroll | `/student/drop-add` | Term::isWithinAddDropPeriod() enforced on both add and drop. |
| 3.8 | Enrollment generates invoice | COMPLETE | BillingSeeder creates invoices | BillingService::generateInvoiceForTerm() | -- | Per-credit tuition + fees. Domestic/international rates. |
| 3.9 | View billing, make payment | COMPLETE | Sample payments seeded | GET invoices + POST payments | `/student/billing` + `/student/payment` | 7 payment methods. Partial payments. Balance tracking. |
| 3.10 | Holds block registration | PARTIAL | HoldsAndActionItemsSeeder creates holds | Hold model has prevents_registration flag | `/student/holds` | **BUG: EnrollmentService does NOT check holds before enrollment.** Student::hasRegistrationHold() exists but is never called during enrollment. |

**Key question:** Can a student go from browsing courses to a finalized schedule with billing?

**Answer:** Yes, with one critical bug: registration holds are not enforced during enrollment.

### Stage 3 Action Items

1. **CRITICAL** -- Add hold validation to EnrollmentService::enrollStudent() to block students with prevents_registration holds

---

## Stage 4: Active Semester (Student + Faculty)

Day-to-day academic life.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 4.1 | Faculty takes attendance | COMPLETE | AttendanceSeeder | Full CRUD + bulk + CSV + statistics | `/faculty/attendance` | Statuses: present, absent, late, excused. Bulk recording. |
| 4.2 | Faculty posts materials and announcements | COMPLETE | Seeded | Full CRUD + publish/unpublish/pin | `/faculty/materials` + `/faculty/announcements` | Section-level and department-level. |
| 4.3 | Faculty creates/publishes assignments | COMPLETE | Seeded | Full CRUD + publish/unpublish/duplicate | `/faculty/assignments` | Weight, max points, late penalty config, availability dates. |
| 4.4 | Students submit assignments | COMPLETE | -- | POST submit/draft + resubmit | `/student/assignments` | Draft support. Late detection. Revision handling. |
| 4.5 | Faculty grades submissions | COMPLETE | -- | POST grade + batch-grade | `/faculty/grades` | Per-submission and batch grading. Return for revision. |
| 4.6 | Students check gradebook | COMPLETE | -- | GET gradebook/me + categories + needed score | `/student/grades` | Running grades, category breakdown, "what do I need" calculator. |
| 4.7 | Students view attendance | COMPLETE | -- | GET attendance/student-report | Student dashboard | Date range filtering. |
| 4.8 | Advising appointments | COMPLETE | -- | Full CRUD + confirm/complete/cancel/no-show | `/faculty/appointments` + `/student/advisor` | Types: advising, registration, probation, graduation_check, financial_aid_review. |
| 4.9 | Messaging | COMPLETE | MessageSeeder | Full conversation system + search users | `/messages` | One-on-one and group. Read tracking. Archive. |
| 4.10 | Campus calendar events | COMPLETE | EventSeeder | Full CRUD + RSVP + upcoming | `/student/calendar` | Types: lecture, seminar, workshop, career_fair, etc. |
| 4.11 | Holds placed on students | COMPLETE | Seeded | Full CRUD + resolve + admin summary | `/student/holds` | Types: library_fine, missing_documents, tuition_balance, etc. Severities. |
| 4.12 | Action items for students | COMPLETE | Seeded | Full CRUD + complete/dismiss + dashboard | Dashboard integration | Types: complete_registration, resolve_hold, submit_document, etc. Priorities. |

**Key question:** Does every daily interaction work for both students and faculty?

**Answer:** Yes. All 12 items are complete with API, frontend, and seeder coverage.

---

## Stage 5: End of Semester (Faculty + Admin)

Wrapping up the term.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 5.1 | Faculty finalizes grades | COMPLETE | GradeSeeder | POST gradebook/finalize | `/faculty/grades` | Prevents further modifications after finalization. |
| 5.2 | Grade change requests | COMPLETE | GradeChangeSeeder | POST create + approve/deny | -- | Multi-step approval. Justification required. Audit trail. |
| 5.3 | Admin reviews grade distributions | COMPLETE | -- | GET grade-distribution | `/admin/grades` | Histogram, percentages, mean/median/std dev. |
| 5.4 | Calculate term + cumulative GPA | COMPLETE | StudentAcademicUpdateSeeder | StudentService::calculateGPA() | Student grades page | Credit-weighted. Proper A+=4.3 scale. Excludes W/I/P/NP. |
| 5.5 | Update credits earned | COMPLETE | Seeder calculates | StudentService::getTotalCompletedCredits() | Degree audit page | Only completed enrollments, excludes F/W. |
| 5.6 | Update academic standing | COMPLETE | Seeder sets standing | StudentService::getAcademicStanding() | Student dashboard | good_standing, probation, deans_list, honors. |
| 5.7 | Academic records for term | COMPLETE | AcademicRecordSeeder | Full CRUD | `/student/academic-records` | Institution, qualification, GPA, dates, verification. |
| 5.8 | Financial aid disbursements | COMPLETE | FinancialAidSeeder creates disbursements | GET financial-aid/me | `/student/financial-aid` | Per-term disbursement scheduling and status tracking. |
| 5.9 | View unofficial transcripts | COMPLETE | -- | GET academic-records + enrollments with grades | `/student/transcripts` | Term-by-term breakdown. |

**Key question:** Does the system correctly close out a term and update all student records?

**Answer:** Yes. All end-of-semester operations are implemented.

---

## Stage 6: Progression / Graduation

Between semesters and at completion.

| # | Item | Status | Data | API | Frontend | Notes |
|---|------|--------|:----:|:---:|:--------:|-------|
| 6.1 | Check degree requirements vs completed courses | COMPLETE | -- | StudentService::checkDegreeProgress() | -- | Validates courses against program requirements. Calculates remaining. |
| 6.2 | Degree audit display | COMPLETE | -- | Uses StudentService | `/student/degree-audit` | Visual progress, category breakdown, remaining courses. |
| 6.3 | Repeat registration each semester | COMPLETE | -- | Same enrollment endpoints | `/student/registration` | Full registration wizard reusable each term. |
| 6.4 | Graduation eligibility | COMPLETE | -- | Part of checkDegreeProgress() | Degree audit page | Checks: credits met, requirements met, GPA met, no blocking holds. |

**Key question:** Can the system track a student from first enrollment through degree completion?

**Answer:** Yes, with the caveat that degree requirements (Stage 0.4) need to actually be populated for checkDegreeProgress() to validate against real data.

---

## Critical Issues Summary

Ordered by severity:

| # | Issue | Stage | Severity | Description |
|---|-------|-------|----------|-------------|
| 1 | No student self-registration | 1.1 | CRITICAL | No public registration endpoint or signup page. Prospective students cannot create accounts. |
| 2 | Holds not checked during enrollment | 3.10 | CRITICAL | EnrollmentService::enrollStudent() never calls Student::hasRegistrationHold(). Students with financial/academic holds can register freely. |
| 3 | Enroll endpoint incomplete | 1.9 | HIGH | POST enroll only changes application status. Does not update student enrollment_status or major_program_id. Relies on seeder logic. |
| 4 | Degree requirements not manageable | 0.4 | HIGH | Model exists but no API, no UI, no seeder. Degree audit has nothing to validate against. |
| 5 | Tuition rates not manageable | 0.7 | MEDIUM | No API or UI. Rates exist only via seeder. Cannot be adjusted without database access. |
| 6 | No student enrollment confirmation | 1.8 | MEDIUM | Admin enrolls students directly. No student-facing confirmation step or acceptance deadline. |
| 7 | Document verification workflow missing | 1.6 | MEDIUM | Document has verified flag but no API endpoint to update it in a verification workflow. |
| 8 | Role/permission UI missing | 0.9 | LOW | API fully works but no frontend page. Manageable but requires API calls. |

---

## Overall Completion

| Stage | Items | Complete | Partial | Missing | Score |
|-------|-------|----------|---------|---------|-------|
| 0: Institutional Setup | 10 | 7 | 2 | 1 | 80% |
| 1: Admissions Pipeline | 11 | 5 | 4 | 2 | 64% |
| 2: Pre-Semester Setup | 7 | 7 | 0 | 0 | 100% |
| 3: Registration | 10 | 9 | 1 | 0 | 95% |
| 4: Active Semester | 12 | 12 | 0 | 0 | 100% |
| 5: End of Semester | 9 | 9 | 0 | 0 | 100% |
| 6: Progression/Graduation | 4 | 4 | 0 | 0 | 100% |
| **Total** | **63** | **53** | **7** | **3** | **90%** |

The system is 90% complete. Stages 2-6 (the core academic lifecycle) are essentially done. The gaps are concentrated in Stage 0 (admin setup tooling) and Stage 1 (admissions onboarding flow).

---

## Recommended Fix Order

1. **Add hold check to enrollment flow** (Stage 3.10) -- small fix, critical bug
2. **Fix enroll endpoint to complete student conversion** (Stage 1.9) -- medium fix, breaks the lifecycle chain
3. **Add student self-registration** (Stage 1.1) -- new feature, required for the lifecycle to start
4. **Build degree requirements API + seeder** (Stage 0.4) -- needed for degree audit to work against real data
5. **Build tuition rate admin API** (Stage 0.7) -- quality of life for admins
6. **Add document verification endpoint** (Stage 1.6) -- completes admissions workflow
7. **Add student enrollment confirmation** (Stage 1.8) -- improves realism of admissions flow
8. **Build role/permission admin UI** (Stage 0.9) -- nice to have

---

## Demo Personas for Testing

| Persona | Email | Role | Use For |
|---------|-------|------|---------|
| Dr. Elizabeth Harper | admin@demo.com | Admin | Stages 0, 2, 5 |
| Maria Rodriguez | maria@demo.com | Prospective Student | Stage 1 |
| David Park | david@demo.com | Enrolled Student | Stages 3, 4, 6 |
| Sophie Turner | sophie@demo.com | Waitlisted Student | Stage 1 (waitlist), Stage 3 |

Password for all: `password`
