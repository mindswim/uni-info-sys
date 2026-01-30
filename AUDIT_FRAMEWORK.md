# University System Audit Framework

A lifecycle-based verification framework mapping the complete university experience from institutional setup through graduation. Every stage has actors (roles), processes, and data that flows into the next stage.

## The University Lifecycle

```
SETUP → ADMISSIONS → ONBOARDING → SEMESTER → ACADEMICS → COMPLETION → GRADUATION
  ↑                                              ↓
  └──── repeats each term ◄──────────────────────┘
```

---

## Stage 0: Institutional Setup (Admin, one-time)

Before anything else, the university itself needs to exist in the system.

- [ ] Create faculties (Arts & Sciences, Engineering, Business...)
- [ ] Create departments under faculties
- [ ] Create programs (BS Computer Science, BA English...)
- [ ] Define degree requirements per program
- [ ] Create buildings and rooms
- [ ] Create academic terms (Fall 2025, Spring 2026...)
- [ ] Set tuition rates per program
- [ ] Create staff accounts, assign to departments
- [ ] Assign roles and permissions
- [ ] Configure system settings

**Key question:** Is the foundational data correctly seeded and are all admin CRUD pages functional?

---

## Stage 1: Admissions Pipeline

A prospective student discovers the university and applies.

- [ ] Student creates account
- [ ] Submits application (personal info, chosen term)
- [ ] Ranks program choices (1st: CS, 2nd: Math, 3rd: Physics)
- [ ] Uploads documents (transcripts, essays, ID)
- [ ] Admissions officer reviews application
- [ ] Officer verifies documents
- [ ] Decision: accept / reject / waitlist
- [ ] Acceptance letter → student confirms enrollment
- [ ] Application converts to enrolled student record
- [ ] Student gets assigned to a program
- [ ] Financial aid packages get created/offered

**Key question:** Can a person go from zero to "enrolled student with a program" entirely through the system?

---

## Stage 2: Pre-Semester Setup (Admin + Faculty)

Before a semester starts, the term needs to be built out.

- [ ] Admin creates course sections for the term (assigns course + instructor + room + schedule)
- [ ] System generates class sessions from section schedules
- [ ] Faculty uploads syllabus and course materials
- [ ] Faculty creates assignments with due dates
- [ ] Admin sets enrollment capacity per section
- [ ] Admin posts registration dates (add/drop period)
- [ ] Admin creates announcements about registration

**Key question:** Can admin and faculty fully prepare a term before students register?

---

## Stage 3: Registration (Student)

The enrolled student builds their schedule.

- [ ] Student browses course catalog
- [ ] Checks prerequisites (system validates)
- [ ] Enrolls in sections (system checks capacity, schedule conflicts)
- [ ] If section full → automatic waitlist placement
- [ ] When someone drops → waitlist promotion
- [ ] Student views their schedule
- [ ] Student can drop/add during add/drop period
- [ ] Enrollment generates invoice (tuition charges)
- [ ] Student views billing, makes payment
- [ ] System checks for holds that block registration

**Key question:** Can a student go from browsing courses to a finalized schedule with billing?

---

## Stage 4: Active Semester (Student + Faculty)

Day-to-day academic life.

- [ ] Faculty takes attendance each session
- [ ] Faculty posts materials and announcements
- [ ] Faculty creates/publishes assignments
- [ ] Students submit assignments
- [ ] Faculty grades submissions
- [ ] Students check gradebook for running grades
- [ ] Students view attendance record
- [ ] Academic advising appointments happen
- [ ] Messaging between students and faculty/advisors
- [ ] Events on campus calendar
- [ ] Holds may be placed (library fines, missing documents, etc.)
- [ ] Action items assigned to students (submit form, meet advisor, etc.)

**Key question:** Does every daily interaction work for both students and faculty?

---

## Stage 5: End of Semester (Faculty + Admin)

Wrapping up the term.

- [ ] Faculty finalizes grades for each section
- [ ] Grade change requests if needed
- [ ] Admin reviews grade distributions
- [ ] System calculates term GPA and cumulative GPA
- [ ] System updates credits earned
- [ ] System updates academic standing (good standing / probation / etc.)
- [ ] Academic records created for the term
- [ ] Financial aid disbursements processed
- [ ] Students can view unofficial transcripts

**Key question:** Does the system correctly close out a term and update all student records?

---

## Stage 6: Progression / Graduation

Between semesters and at completion.

- [ ] System checks degree requirements against completed courses
- [ ] Degree audit shows progress toward graduation
- [ ] Student repeats Stages 3-5 each semester
- [ ] Eventually all requirements met → eligible for graduation

**Key question:** Can the system track a student from first enrollment through degree completion?

---

## Verification Matrix

For each checklist item above, evaluate three layers:

| Layer | Question |
|-------|----------|
| **Data** | Does the seeder create realistic data for this step? Are relationships intact? |
| **API** | Do the endpoints support this action for the correct roles? |
| **Frontend** | Is there a UI page where users actually perform this action? |

### Status Ratings

- **Working** -- data, API, and UI all function end-to-end
- **Partial** -- backend works but frontend is missing/broken, or data is incomplete
- **Missing** -- the feature doesn't exist yet
- **Broken** -- it exists but errors out

---

## Audit Execution Plan

### Step 1: Seed and Smoke Test
Run `migrate:fresh --seed`, log in as each demo persona, click through every page for that role. Note what works and what doesn't.

### Step 2: Walk the Lifecycle
Go stage by stage through the lifecycle above. For each checkbox, verify data + API + frontend.

### Step 3: Document Gaps
Fill in the status for each item. Categorize as working / partial / missing / broken.

### Step 4: Prioritize Fixes
Order by: broken (fix first) → partial (complete) → missing (build) → polish.

### Step 5: Write Tests
As each workflow is verified or fixed, write a PHPUnit feature test that walks through it as the appropriate role. This makes the audit repeatable.

---

## Demo Personas for Testing

| Persona | Email | Role | Use For |
|---------|-------|------|---------|
| Dr. Elizabeth Harper | admin@demo.com | Admin | Stages 0, 2, 5 |
| Maria Rodriguez | maria@demo.com | Prospective Student | Stage 1 |
| David Park | david@demo.com | Enrolled Student | Stages 3, 4, 6 |
| Sophie Turner | sophie@demo.com | Waitlisted Student | Stage 1 (waitlist), Stage 3 |

Password for all: `password`
