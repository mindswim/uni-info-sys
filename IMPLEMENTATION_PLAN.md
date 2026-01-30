# Implementation Plan: Stages 0 & 1 Gaps

Detailed architecture and implementation guide for the 8 issues identified in the audit framework. Each fix is ordered by dependency -- earlier items unblock later ones.

---

## Status State Machine Reference

Before building, understand the valid status transitions that the system should enforce:

```
APPLICATION STATUS:
  draft → submitted → under_review → accepted → enrolled
                                   → rejected
                                   → waitlisted → accepted → enrolled

STUDENT ENROLLMENT STATUS:
  prospective → full_time (or part_time)
             → withdrawn
             → graduated
             → suspended

PROGRAM CHOICE STATUS:
  pending → accepted
         → rejected

DOCUMENT STATUS:
  pending → verified → (used in admissions decision)
         → rejected → (student re-uploads, new version created)
```

---

## Fix 1: Hold Check During Enrollment

**What:** EnrollmentService::enrollStudent() never calls Student::hasRegistrationHold(). Students with active holds (financial, academic, immunization) can register freely.

**Why it matters:** Holds are the university's primary enforcement mechanism. Without this check, the entire hold system is cosmetic.

### Architecture

**Files to modify:**
- `app/Services/EnrollmentService.php` -- add hold validation call

**Files to create:**
- `app/Exceptions/RegistrationHoldException.php` -- new exception class

**How it connects:**
- Student model already has `hasRegistrationHold()` method that queries `holds` where `prevents_registration = true` and `resolved_at IS NULL`
- EnrollmentService already has a validation chain: `validateStudentActive()` → `validateCourseSectionAvailable()` → `validateNoDuplicateEnrollment()` → `checkPrerequisites()` → `checkScheduleConflicts()`
- Add hold check as the FIRST validation (before anything else), since a held student shouldn't even get to prerequisite checking

### Service Logic

Add to `enrollStudent()` immediately after the transaction opens, before `validateStudentActive()`:

```
1. Load student with activeHolds relationship
2. Call student->hasRegistrationHold()
3. If true, throw RegistrationHoldException with hold details
4. Include hold types and descriptions in exception message so the student knows WHY they're blocked
```

The exception should follow the existing pattern (see `PrerequisiteNotMetException`, `DuplicateEnrollmentException`). Return 422 with a JSON body listing the active holds.

### Edge Cases

- Student has multiple holds -- list all of them, not just the first
- Hold resolved between page load and enrollment attempt -- the check is at enrollment time, so this is handled correctly
- Admin override -- do NOT add override capability in this fix. Holds should be resolved through the hold system, not bypassed during enrollment.

### Test Plan

Create `tests/Feature/V1/EnrollmentHoldTest.php`:

| Test | Setup | Expected |
|------|-------|----------|
| Student with financial hold cannot enroll | Create student, create hold with `prevents_registration=true` | 422 with hold details |
| Student with resolved hold CAN enroll | Create student, create hold with `resolved_at` set | 201 enrolled |
| Student with non-registration hold CAN enroll | Create hold with `prevents_registration=false` (e.g., transcript hold) | 201 enrolled |
| Student with multiple holds gets all listed | Create 2 active registration holds | 422 listing both holds |
| Hold check runs before prerequisite check | Create student with hold AND missing prereqs | 422 with hold error, NOT prereq error |

---

## Fix 2: Complete the Enroll Endpoint

**What:** `AdmissionApplicationController::enroll()` only updates the application status to "enrolled". It does NOT update the student's `enrollment_status`, `major_program_id`, `admission_date`, `class_standing`, or `academic_status`. This logic exists only in the `EnrollmentConversionSeeder`.

**Why it matters:** The admissions-to-enrollment pipeline is broken. An admin clicks "Enroll" and the application status changes, but the student record doesn't actually become an enrolled student. The seeder workaround means this only works during initial data setup, not during live operation.

### Architecture

**Files to modify:**
- `app/Http/Controllers/Api/V1/AdmissionApplicationController.php` -- update `enroll()` method
- `app/Services/AdmissionService.php` -- add `matriculateStudent()` method

**Why put logic in AdmissionService:** The controller should stay thin. Matriculation is business logic (choosing the right program, setting standing, etc.) that belongs in the service layer. This also makes it testable independent of HTTP.

### Service Logic: `AdmissionService::matriculateStudent()`

```
Input: AdmissionApplication (must have status = 'accepted')

Steps:
1. Validate application status is 'accepted' (guard clause)
2. Load student, programChoices (eager load)
3. Find the accepted program choice (preference_order = 1, or first with status = 'accepted')
4. Update student record:
   - enrollment_status = 'full_time' (default, could be configurable)
   - major_program_id = accepted program choice's program_id
   - admission_date = now()
   - class_standing = 'freshman' (0 credits earned)
   - academic_status = 'good_standing'
5. Update application status to 'enrolled'
6. Update accepted program choice status to 'accepted' (if not already)
7. Reject remaining program choices (set status = 'rejected')
8. Dispatch SendApplicationStatusNotification job
9. Return updated application with student

All wrapped in DB::transaction()
```

### Controller Changes

The `enroll()` method becomes:

```
1. Authorize
2. Validate application status is 'accepted' (return 400 if not)
3. Call AdmissionService::matriculateStudent($application)
4. Return updated application with student data
```

### Edge Cases

- Application has no program choices -- return 400 with message "No program choice found"
- Application has no accepted program choice -- use first choice by preference_order
- Student already has enrollment_status != 'prospective' -- return 400 "Student is already enrolled"
- Concurrent enrollment attempts -- DB::transaction() with row locking prevents duplicates

### Test Plan

Create `tests/Feature/V1/AdmissionEnrollmentTest.php`:

| Test | Setup | Expected |
|------|-------|----------|
| Enroll sets student enrollment_status | Accepted app, prospective student | Student becomes full_time |
| Enroll sets major_program_id | App with 3 program choices, 1st accepted | Student gets 1st choice program |
| Enroll sets admission_date | Accepted app | admission_date = today |
| Enroll rejects other program choices | App with 3 choices | Non-accepted choices become 'rejected' |
| Cannot enroll non-accepted app | App with status 'submitted' | 400 error |
| Cannot enroll already-enrolled student | Student with enrollment_status 'full_time' | 400 error |
| Enroll dispatches notification | Accepted app | Job dispatched (use Queue::fake()) |
| Unauthenticated user cannot enroll | No auth token | 401 |
| Student role cannot enroll others | Auth as student | 403 |

---

## Fix 3: Degree Requirements CRUD + Seeder

**What:** The `DegreeRequirement` model and migration exist but there's no controller, no routes, no seeder, and no admin UI. The degree audit feature (Stage 6) calls `StudentService::checkDegreeProgress()` but has no data to validate against.

**Why it matters:** Without degree requirements, the degree audit page is empty and graduation eligibility can't be determined. This is one of the most visible features for a student-facing portfolio piece.

### Architecture

**Files to create:**
- `app/Http/Controllers/Api/V1/DegreeRequirementController.php`
- `app/Http/Requests/StoreDegreeRequirementRequest.php`
- `app/Http/Requests/UpdateDegreeRequirementRequest.php`
- `app/Http/Resources/DegreeRequirementResource.php`
- `app/Policies/DegreeRequirementPolicy.php`
- `database/seeders/DegreeRequirementSeeder.php`

**Files to modify:**
- `routes/api.php` -- add routes
- `database/seeders/DatabaseSeeder.php` -- call new seeder
- `app/Providers/AuthServiceProvider.php` -- register policy (if not auto-discovered)

**Pattern to follow:** Use `FacultyController` as the template. Same CRUD structure, authorization, pagination, resource responses.

### API Design

```
GET    /api/v1/programs/{program}/degree-requirements     -- List requirements for a program
POST   /api/v1/programs/{program}/degree-requirements     -- Create requirement (admin)
GET    /api/v1/degree-requirements/{degreeRequirement}    -- Show single requirement
PUT    /api/v1/degree-requirements/{degreeRequirement}    -- Update requirement (admin)
DELETE /api/v1/degree-requirements/{degreeRequirement}    -- Delete requirement (admin)
```

Nested under programs because requirements always belong to a program. This matches the existing pattern of `students/{student}/documents`.

### Request Validation

**StoreDegreeRequirementRequest:**
```
category:              required|string|in:core,elective,general_education,major,minor,concentration,capstone
name:                  required|string|max:255
description:           nullable|string
required_credit_hours: required|integer|min:1
min_courses:           nullable|integer|min:1
max_courses:           nullable|integer|min:1
min_gpa:               nullable|numeric|min:0|max:4.3
allowed_courses:       nullable|array      (array of course IDs)
allowed_courses.*:     exists:courses,id
excluded_courses:      nullable|array
excluded_courses.*:    exists:courses,id
is_required:           required|boolean
sort_order:            nullable|integer
```

### Authorization

- **View:** Any authenticated user (students need to see their own program's requirements)
- **Create/Update/Delete:** Admin only

### Seeder Design

Create realistic degree requirements for each of the 5 programs. Example for BS Computer Science:

```
Category: core
  - "Computer Science Core" -- 36 credits, min 12 courses
    allowed_courses: [CS101, CS201, CS301, CS401, ...]

Category: general_education
  - "Mathematics" -- 12 credits, min 4 courses
    allowed_courses: [MATH101, MATH201, MATH301, MATH401]
  - "English Composition" -- 6 credits, min 2 courses
    allowed_courses: [ENG101, ENG201]
  - "Natural Sciences" -- 6 credits, min 2 courses
  - "Humanities" -- 6 credits, min 2 courses

Category: elective
  - "Free Electives" -- 18 credits, is_required: true
    (no allowed_courses constraint -- any course counts)

Category: capstone
  - "Senior Project" -- 6 credits, min 1 course, min_gpa: 2.5
    allowed_courses: [CS490, CS491]

Total: 120 credits required (matches Program.credits_required)
```

Each of the 5 programs should have 5-8 requirement categories summing to their total credit requirement.

The seeder should reference actual courses from the `RealisticCourseCatalogSeeder` by looking up course IDs dynamically (not hardcoded).

### Frontend

Admin page at `/admin/programs` -- extend the existing programs tab to show a nested "Degree Requirements" section when viewing a program. Similar pattern to how course sections show under courses.

Student page at `/student/degree-audit` already exists -- it just needs data. Once requirements are seeded, the existing `StudentService::checkDegreeProgress()` should populate it.

### Test Plan

Create `tests/Feature/V1/DegreeRequirementTest.php`:

| Test | Expected |
|------|----------|
| Admin can list requirements for a program | 200 with array of requirements |
| Student can view requirements for their program | 200 |
| Admin can create requirement with allowed_courses | 201, courses validated as existing |
| Cannot create requirement with non-existent course IDs | 422 validation error |
| Admin can update requirement | 200 |
| Admin can delete requirement | 204 |
| Student cannot create/update/delete | 403 |
| Requirements sum matches program credits_required | Seeder validation |

---

## Fix 4: Tuition Rate CRUD

**What:** TuitionRate model, migration, and seeder exist (60 rate records created), but no controller, routes, or admin UI. Rates can only be changed via direct database access.

**Why it matters:** Tuition rates change every year. Admin needs to manage them without touching the database.

### Architecture

**Files to create:**
- `app/Http/Controllers/Api/V1/TuitionRateController.php`
- `app/Http/Requests/StoreTuitionRateRequest.php`
- `app/Http/Requests/UpdateTuitionRateRequest.php`
- `app/Http/Resources/TuitionRateResource.php`
- `app/Policies/TuitionRatePolicy.php`

**Files to modify:**
- `routes/api.php` -- add routes

**Pattern to follow:** Same CRUD pattern as `TermController`. Simple resource with filtering.

### API Design

```
GET    /api/v1/tuition-rates                    -- List all (with filters)
POST   /api/v1/tuition-rates                    -- Create rate (admin)
GET    /api/v1/tuition-rates/{tuitionRate}      -- Show single rate
PUT    /api/v1/tuition-rates/{tuitionRate}      -- Update rate (admin)
DELETE /api/v1/tuition-rates/{tuitionRate}       -- Delete rate (admin)
```

### Filters

```
?program_id=1              -- Filter by program
?term_id=2                 -- Filter by term
?student_type=domestic     -- Filter by student type
?enrollment_status=full_time -- Filter by enrollment status
?is_active=true            -- Only active rates
```

### Request Validation

**StoreTuitionRateRequest:**
```
program_id:         required|exists:programs,id
term_id:            required|exists:terms,id
student_type:       required|string|in:domestic,international
enrollment_status:  required|string|in:full_time,part_time
tuition_per_credit: required|numeric|min:0
base_fee:           required|numeric|min:0
technology_fee:     nullable|numeric|min:0
activity_fee:       nullable|numeric|min:0
health_fee:         nullable|numeric|min:0
effective_date:     required|date
end_date:           nullable|date|after:effective_date
is_active:          required|boolean
notes:              nullable|string
```

### Authorization

- **View:** Admin, staff (need to reference rates for billing questions)
- **Create/Update/Delete:** Admin only

### Frontend

Add a "Tuition Rates" section under the admin financials sidebar group. Table view with filters for program, term, student type. Inline editing for fee amounts.

### Test Plan

| Test | Expected |
|------|----------|
| Admin can list tuition rates | 200 with paginated results |
| Filter by program_id works | Only matching rates returned |
| Admin can create rate | 201 |
| Cannot create duplicate (same program/term/type/status) | 422 or handle via unique constraint |
| Admin can update rate amounts | 200 |
| Non-admin cannot create/update/delete | 403 |

---

## Fix 5: Document Verification Endpoint

**What:** Document model has `verified` boolean and `verified_at` timestamp, plus a `status` field (pending/approved/rejected). But the DocumentController has no endpoint to update verification status. Admissions officers cannot mark documents as verified.

**Why it matters:** Document verification is a core part of admissions review. Without it, officers can see documents but can't record whether they've been verified.

### Architecture

**Files to modify:**
- `app/Http/Controllers/Api/V1/DocumentController.php` -- add `verify()` and `reject()` methods
- `routes/api.php` -- add verification routes

### API Design

```
POST /api/v1/students/{student}/documents/{document}/verify   -- Mark as verified
POST /api/v1/students/{student}/documents/{document}/reject   -- Mark as rejected
```

Following the existing pattern of `admission-applications/{id}/accept` and `admission-applications/{id}/reject`.

### Service Logic

**verify():**
```
1. Authorize (admin, staff, admissions-officer)
2. Validate document exists and belongs to student
3. Update document:
   - status = 'approved'
   - verified = true
   - verified_at = now()
4. Return updated document
```

**reject():**
```
1. Authorize (same roles)
2. Accept optional 'reason' in request body
3. Update document:
   - status = 'rejected'
   - verified = false
   - verified_at = null
4. Return updated document
```

### Edge Cases

- Document already verified -- allow re-verification (idempotent)
- Document soft-deleted -- return 404
- Verify triggers re-check of application completeness? -- Out of scope for this fix, but note as future enhancement

### Test Plan

| Test | Expected |
|------|----------|
| Staff can verify a pending document | 200, verified=true, verified_at set |
| Staff can reject a document | 200, status='rejected' |
| Student cannot verify documents | 403 |
| Verifying already-verified document succeeds | 200 (idempotent) |
| Cannot verify soft-deleted document | 404 |

---

## Fix 6: Student Self-Registration

**What:** No public registration endpoint exists. The AuthController only has login, logout, and user info. Students must have accounts created by admins before they can apply.

**Why it matters:** This is the entry point to the entire system. A prospective student visits the university website, wants to apply, and needs to create an account first.

### Architecture

**Files to modify:**
- `app/Http/Controllers/Api/V1/Auth/AuthController.php` -- add `register()` method
- `routes/api.php` -- add public registration route

**Files to create:**
- `app/Http/Requests/RegisterRequest.php`
- `frontend/src/app/auth/register/page.tsx` -- registration page

### API Design

```
POST /api/v1/auth/register    -- Public endpoint (no auth required)
```

This must be OUTSIDE the `auth:sanctum` middleware group in `routes/api.php`.

### Request Validation

**RegisterRequest:**
```
name:                   required|string|max:255
email:                  required|email|unique:users,email
password:               required|string|min:8|confirmed
password_confirmation:  required
```

### Service Logic

```
1. Validate input (RegisterRequest)
2. DB::transaction:
   a. Create User record (name, email, hashed password)
   b. Create Student record (user_id, enrollment_status = 'prospective')
   c. Assign 'student' role to user
3. Create Sanctum token
4. Return token + user data (same format as login response)
```

The student is created with `enrollment_status = 'prospective'`. They become `full_time` only after their application is accepted and they're enrolled (Fix 2).

### Response Format

Match the existing login response:
```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "roles": [{ "id": 5, "name": "student", "permissions": [...] }],
    "student_id": 101,
    "staff_id": null
  }
}
```

### Frontend: Registration Page

**Route:** `/auth/register`

**UX Flow:**
1. User sees registration form: name, email, password, confirm password
2. Submits form
3. On success: auto-login (token stored), redirect to `/student/apply`
4. On error: show validation messages inline

**Design:** Match the existing login page style. Add a "Don't have an account? Register" link on the login page, and a "Already have an account? Login" link on the register page.

### Security Considerations

- Rate limit the registration endpoint (prevent account spam)
- Email validation (format only -- no email verification flow in scope, but note as future enhancement)
- Password minimum 8 characters
- No CAPTCHA in scope for now

### Edge Cases

- Email already exists -- return 422 with "email already taken"
- Registration while already authenticated -- should still work (or redirect)
- Student record creation fails after user created -- transaction rollback handles this

### Test Plan

Create `tests/Feature/V1/RegistrationTest.php`:

| Test | Expected |
|------|----------|
| Can register with valid data | 201, token returned, user created |
| Registration creates student record | Student exists with enrollment_status='prospective' |
| Registration assigns student role | User has 'student' role |
| Cannot register with existing email | 422 validation error |
| Cannot register without password confirmation | 422 |
| Cannot register with short password (<8 chars) | 422 |
| Registration returns same format as login | Token + user object with roles |
| Can login immediately after registration | 200 with token |

---

## Fix 7: Student Enrollment Confirmation

**What:** Currently, an admin clicks "Enroll" and the student is immediately enrolled. There's no step where the student confirms they want to attend. In real universities, students receive an acceptance and must confirm (often with a deposit).

**Why it matters:** Adds realism to the admissions flow and gives the student agency in the process.

### Architecture

**Files to modify:**
- `app/Http/Controllers/Api/V1/AdmissionApplicationController.php` -- add `confirmEnrollment()` method
- `app/Services/AdmissionService.php` -- add confirmation logic
- `routes/api.php` -- add confirmation route

**Files to create:**
- `frontend/src/app/student/admissions/confirm/page.tsx` -- confirmation page (or integrate into existing admissions page)

### New Status: `offered`

The application status flow becomes:

```
accepted → offered → enrolled
```

Where:
- `accepted` = admissions decision made
- `offered` = student has been formally offered enrollment (admin action, what the current "enroll" does)
- `enrolled` = student has confirmed they want to attend (student action)

Alternatively, to minimize changes, keep the current flow but add a student-facing confirmation:

```
accepted → enrolled (admin initiates) → student confirms (separate flag or status)
```

**Simpler approach (recommended):** Don't add a new status. Instead:

1. Admin clicks "Accept" (status → `accepted`)
2. Student sees "Accepted" on their admissions page with a "Confirm Enrollment" button
3. Student clicks confirm → calls `AdmissionService::matriculateStudent()` (from Fix 2)
4. Application status → `enrolled`, student record updated

This reuses Fix 2's logic and requires minimal new code.

### API Design

```
POST /api/v1/admission-applications/{application}/confirm-enrollment   -- Student confirms
```

### Authorization

- Only the student who owns the application can confirm
- Application must have status = `accepted`

### Service Logic

```
1. Validate caller is the application's student
2. Validate application status is 'accepted'
3. Call AdmissionService::matriculateStudent() (from Fix 2)
4. Return updated application
```

### Frontend

On the student admissions page (`/student/admissions`), when an application has status `accepted`:
- Show a prominent "Confirm Enrollment" button
- On click, call the confirm endpoint
- On success, show "Enrolled" status with a success message
- Redirect to student dashboard

### Test Plan

| Test | Expected |
|------|----------|
| Student can confirm their own accepted application | 200, status → enrolled |
| Student cannot confirm another student's application | 403 |
| Cannot confirm non-accepted application | 400 |
| Confirmation updates student enrollment_status | Student becomes full_time |
| Confirmation assigns major_program_id | Program set from accepted choice |
| Admin cannot use student confirmation endpoint | 403 (or separate admin endpoint) |

---

## Fix 8: Role/Permission Admin UI

**What:** The roles and permissions API is fully functional (CRUD for roles, permission sync, user role assignment) but there's no frontend page. Admins must use the API directly.

**Why it matters:** Lowest priority but improves the admin experience. Good for portfolio completeness.

### Architecture

**Files to create:**
- `frontend/src/app/admin/roles/page.tsx` -- roles management page

**Files to modify:**
- `frontend/src/components/layout/app-sidebar.tsx` -- add nav item under admin

### Frontend Design

**Route:** `/admin/roles` (add under admin "System" nav group, or create new "Security" group)

**Page layout:**
- Left panel: List of roles (7 roles) with edit/delete buttons
- Right panel: When a role is selected, show:
  - Role name and description (editable)
  - Checklist of all permissions (toggle on/off)
  - Save button syncs permissions via `POST /api/v1/roles/{role}/permissions`

**Users tab (optional):**
- List users with their assigned roles
- Click user to change their role assignment
- Uses `GET /api/v1/users` (already loads roles)

### API Endpoints Already Available

```
GET    /api/v1/roles                        -- List all roles
POST   /api/v1/roles                        -- Create role
PUT    /api/v1/roles/{role}                 -- Update role
DELETE /api/v1/roles/{role}                  -- Delete role
POST   /api/v1/roles/{role}/permissions     -- Sync permissions
GET    /api/v1/permissions                  -- List all permissions
GET    /api/v1/users                        -- List users with roles
GET    /api/v1/users/{user}/roles          -- Get user's roles
```

No backend changes needed. This is a frontend-only task.

### Sidebar Addition

Add to the admin navigation under a "System" or "Security" group:
```
{ title: "Roles & Permissions", url: "/admin/roles", icon: Shield }
```

### Test Plan

Frontend testing (manual or Playwright):

| Test | Expected |
|------|----------|
| Roles page loads with all 7 roles | Roles displayed in list |
| Selecting a role shows its permissions | Checkboxes match current permissions |
| Toggling a permission and saving works | API called, permission updated |
| Creating a new role works | Role appears in list |
| Non-admin cannot access page | Redirect or 403 |

---

## Build Order and Dependencies

```
Fix 1 (Hold check) ──────────────── standalone, no dependencies
Fix 2 (Enroll endpoint) ─────────── standalone, no dependencies
Fix 3 (Degree requirements) ──────── standalone, no dependencies
Fix 4 (Tuition rates) ───────────── standalone, follows same pattern as Fix 3
Fix 5 (Doc verification) ─────────── standalone, no dependencies
Fix 6 (Registration) ────────────── standalone, no dependencies
Fix 7 (Enrollment confirmation) ──── DEPENDS ON Fix 2 (uses matriculateStudent)
Fix 8 (Role/permission UI) ──────── standalone, frontend only
```

Fixes 1-6 can all be built in parallel. Fix 7 depends on Fix 2 being complete. Fix 8 is independent.

**Suggested execution order for serial work:**
1. Fix 1 -- smallest change, biggest impact (10 min)
2. Fix 2 -- medium change, unblocks Fix 7 (30 min)
3. Fix 5 -- small addition to existing controller (15 min)
4. Fix 6 -- new feature, high visibility (45 min)
5. Fix 7 -- builds on Fix 2 (20 min)
6. Fix 3 -- new CRUD + seeder, most code (60 min)
7. Fix 4 -- follows Fix 3 pattern (30 min)
8. Fix 8 -- frontend only, lowest priority (45 min)

---

## Authorization Matrix

Who can do what across all new/modified endpoints:

| Endpoint | Student | Faculty | Staff | Admin | Admissions Officer |
|----------|:-------:|:-------:|:-----:|:-----:|:-----------------:|
| Enroll (with hold check) | -- | -- | -- | x | -- |
| Confirm enrollment (own) | x | -- | -- | -- | -- |
| Register (public) | public | public | public | public | public |
| Degree requirements: view | x (own program) | x | x | x | -- |
| Degree requirements: create/edit/delete | -- | -- | -- | x | -- |
| Tuition rates: view | -- | -- | x | x | -- |
| Tuition rates: create/edit/delete | -- | -- | -- | x | -- |
| Document verify/reject | -- | -- | x | x | x |
| Roles/permissions: manage | -- | -- | -- | x | -- |

---

## Frontend Route Map

New pages and where they fit in the existing sidebar navigation:

### Student Sidebar
```
Registration (existing group)
  └── (no changes)

My Info (existing group)
  └── Admissions Status  /student/admissions   (existing -- add "Confirm Enrollment" button)

(no new nav items for student)
```

### Admin Sidebar
```
Academics (existing group)
  ├── Programs           /admin/programs       (existing -- add degree requirements sub-panel)
  └── Tuition Rates      /admin/tuition-rates  (NEW)

System (existing group or new)
  └── Roles & Permissions /admin/roles         (NEW)
```

### Auth Pages (no sidebar)
```
/auth/login      (existing)
/auth/register   (NEW -- link from login page)
```
