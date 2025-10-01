# Your University Admissions System - Database Structure & User Workflows

## 🗄️ YOUR ACTUAL DATABASE TABLES

You have 18 models representing a complete university management system:

```
PEOPLE & AUTHENTICATION           ACADEMIC STRUCTURE              PHYSICAL INFRASTRUCTURE
├── User                         ├── Faculty                     ├── Building
├── Student                      ├── Department                  └── Room  
├── Staff                        ├── Program
├── Role                         ├── Course
└── Permission                   ├── CourseSection
                                 └── Term

ADMISSIONS PROCESS               ENROLLMENT & GRADES              SYSTEM DATA
├── AdmissionApplication         ├── Enrollment                  └── Document
├── ProgramChoice                └── AcademicRecord
└── Document (transcripts, etc)
```

---

## 🏗️ DATABASE RELATIONSHIPS (ASCII)

```
                          UNIVERSITY MANAGEMENT SYSTEM
                                 DATABASE STRUCTURE

    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                            AUTHENTICATION & PEOPLE                              │
    ├─────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                 │
    │  ┌──────────────┐     roles     ┌──────────────┐     permissions               │
    │  │    USER      │◄─────────────►│     ROLE     │◄─────────────────────────────┐ │
    │  ├──────────────┤  many-to-many ├──────────────┤                              │ │
    │  │• id          │               │• name        │                              │ │
    │  │  name        │               │  description │    ┌──────────────────────┐  │ │
    │  │  email       │               └──────────────┘    │    PERMISSION        │  │ │
    │  │  password    │                                   ├──────────────────────┤  │ │
    │  └──────────────┘                                   │• name                │◄─┘ │
    │         │                                           │  description         │    │
    │         │ 1:1 polymorphic                           └──────────────────────┘    │
    │         ├─────────────────────────────┐                                         │
    │         ▼                             ▼                                         │
    │  ┌──────────────┐              ┌──────────────┐                                │
    │  │   STUDENT    │              │    STAFF     │                                │
    │  ├──────────────┤              ├──────────────┤                                │
    │  │• id          │              │• id          │                                │
    │  │• user_id(FK) │              │• user_id(FK) │                                │
    │  │  student_num │              │• dept_id(FK) │                                │
    │  │  first_name  │              │  job_title   │                                │
    │  │  last_name   │              │  office_loc  │                                │
    │  │  nationality │              └──────────────┘                                │
    │  │  phone       │                     │                                        │
    │  │  address     │                     │ teaches courses                        │
    │  └──────────────┘                     ▼                                        │
    └─────────────────────────────────────────────────────────────────────────────────┘
                     │                                                                  
                     │ student activities                                               
                     ▼                                                                  
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                          ACADEMIC STRUCTURE                                     │
    ├─────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                 │
    │              ┌──────────────┐                                                  │
    │              │   FACULTY    │   (College of Engineering, etc.)                │
    │              ├──────────────┤                                                  │
    │              │• id          │                                                  │
    │              │  name        │                                                  │
    │              │  description │                                                  │
    │              └──────────────┘                                                  │
    │                     │ 1:many                                                   │
    │                     ▼                                                          │
    │              ┌──────────────┐                                                  │
    │              │ DEPARTMENT   │   (Computer Science, Mathematics)               │
    │              ├──────────────┤                                                  │
    │              │• id          │                                                  │
    │              │• faculty_id  │                                                  │
    │              │  name        │                                                  │
    │              │  code        │                                                  │
    │              └──────────────┘                                                  │
    │                     │ 1:many                                                   │
    │                     ├──────────────────┬─────────────────────────────────────┐│
    │                     ▼                  ▼                                     ││
    │              ┌──────────────┐   ┌──────────────┐                             ││
    │              │   PROGRAM    │   │    COURSE    │                             ││
    │              ├──────────────┤   ├──────────────┤                             ││
    │              │• id          │   │• id          │                             ││
    │              │• dept_id(FK) │   │• dept_id(FK) │                             ││
    │              │  name        │   │  course_code │  CS101, MATH201, etc.       ││
    │              │  degree_level│   │  title       │                             ││
    │              │  duration    │   │  credits     │                             ││
    │              └──────────────┘   │  description │                             ││
    │                     │          └──────────────┘                             ││
    │                     │                 │                                      ││
    │                     │                 │ offered in terms                     ││
    │         student      │                 ▼                                      ││
    │         applies to   │          ┌──────────────┐                             ││
    │         programs     │          │COURSE_SECTION│  Specific class instances   ││
    │                     │          ├──────────────┤                             ││
    │                     │          │• id          │  CS101-001 Fall 2025        ││
    │                     ▼          │• course_id   │  MWF 10:00-11:00            ││
    └─────────────────────────────────│• term_id(FK) │  Room: SCI-101              ││
                                      │• staff_id(FK)│  Capacity: 30               ││
                                      │• room_id(FK) │  Enrolled: 25               ││
                                      │  capacity    │  Status: open               ││
                                      │  schedule    │                             ││
                                      └──────────────┘                             ││
                                             │                                      ││
                                             │ students enroll                      ││
                                             ▼                                      ││
    ┌─────────────────────────────────────────────────────────────────────────────────┘│
    │                        STUDENT ENROLLMENT PROCESS                               │
    ├──────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                  │
    │  ┌──────────────────┐           ┌──────────────────┐                           │
    │  │   ENROLLMENT     │           │      TERM        │                           │
    │  ├──────────────────┤           ├──────────────────┤                           │
    │  │• id              │           │• id              │  Fall 2025               │
    │  │• student_id(FK)  │           │  name            │  Jan 15 - May 15        │
    │  │• section_id(FK)  │◄──────────│  start_date      │  Add/Drop: Jan 25       │
    │  │  status          │           │  end_date        │                          │
    │  │  enrollment_date │           │  add_drop_deadline│                         │
    │  │  grade           │           └──────────────────┘                          │
    │  └──────────────────┘                                                         │
    │                                                                                │
    │  Status Options:                                                               │
    │  • enrolled    ← Student is in the class                                      │
    │  • waitlisted  ← Class full, student waiting                                  │
    │  • completed   ← Class finished, grade assigned                               │
    │  • withdrawn   ← Student dropped the class                                    │
    │                                                                                │
    └────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ student applies first
                                             ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                           ADMISSIONS PROCESS                                    │
    ├─────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                 │
    │  ┌──────────────────────┐      ┌──────────────────────┐                       │
    │  │ ADMISSION_APPLICATION│      │   PROGRAM_CHOICE     │                       │
    │  ├──────────────────────┤      ├──────────────────────┤                       │
    │  │• id                  │◄─────│• application_id(FK)  │                       │
    │  │• student_id(FK)      │      │• program_id(FK)      │                       │
    │  │• term_id(FK)         │      │  preference_order    │  1st choice, 2nd     │
    │  │  status              │      │  status              │  choice, etc.        │
    │  │  application_date    │      └──────────────────────┘                       │
    │  │  decision_date       │                                                     │
    │  │  decision_status     │      ┌──────────────────────┐                       │
    │  └──────────────────────┘      │   ACADEMIC_RECORD    │                       │
    │                                ├──────────────────────┤                       │
    │  Status Flow:                  │• student_id(FK)      │  Previous education  │
    │  submitted → under_review      │  institution_name    │  High school GPA     │
    │            → accepted/rejected │  qualification_type  │  Test scores         │
    │                               │  gpa                 │                       │
    │                               │  verified            │                       │
    │  ┌─────────────────────────┐   └──────────────────────┘                       │
    │  │      DOCUMENT          │                                                   │
    │  ├─────────────────────────┤   Supporting materials:                         │
    │  │• student_id(FK)        │   • Transcripts                                  │
    │  │  document_type         │   • Letters of recommendation                    │
    │  │  file_path             │   • Personal statement                           │
    │  │  is_active            │   • Test scores                                  │
    │  │  version              │                                                   │
    │  └─────────────────────────┘                                                 │
    │                                                                               │
    └───────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                      PHYSICAL INFRASTRUCTURE                                    │
    ├─────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                 │
    │  ┌──────────────┐              ┌──────────────┐                               │
    │  │   BUILDING   │              │     ROOM     │                               │
    │  ├──────────────┤              ├──────────────┤                               │
    │  │• id          │◄─────────────│• id          │                               │
    │  │  name        │              │• building_id │   SCI-101, LIB-205, etc.     │
    │  │  address     │              │  room_number │   classroom, lab, office      │
    │  └──────────────┘              │  capacity    │                               │
    │                                │  type        │                               │
    │  Science Building              └──────────────┘                               │
    │  Library                              │                                        │
    │  Student Center                       │ assigned to                            │
    │  Dormitories                          ▼                                        │
    │                                Course Sections                                 │
    │                                (scheduling)                                    │
    └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 USER TYPES & THEIR WORKFLOWS

### 1. 🎓 STUDENT JOURNEY

```
STUDENT LIFECYCLE WORKFLOW

Phase 1: PROSPECTIVE STUDENT
┌─────────────────────────────────────────┐
│  1. CREATE ACCOUNT                      │  → User table
│     - name, email, password             │
│                                         │
│  2. COMPLETE PROFILE                    │  → Student table  
│     - student_number, address, phone    │
│                                         │
│  3. SUBMIT APPLICATION                  │  → AdmissionApplication
│     - choose programs (1st, 2nd choice)│  → ProgramChoice
│     - upload documents                  │  → Document
│     - provide academic records          │  → AcademicRecord
│                                         │
│  4. WAIT FOR DECISION                   │
│     - status: submitted → under_review  │
│                      → accepted/rejected│
└─────────────────────────────────────────┘
                    │
                    ▼ (if accepted)
Phase 2: ENROLLED STUDENT
┌─────────────────────────────────────────┐
│  5. BROWSE COURSE CATALOG               │  → Course, CourseSection
│     - see available classes             │
│     - check prerequisites               │
│     - view capacity/waitlists           │
│                                         │
│  6. REGISTER FOR CLASSES                │  → Enrollment
│     - enroll in course sections         │    status: enrolled
│     - get waitlisted if full            │    status: waitlisted
│                                         │
│  7. MANAGE SCHEDULE                     │
│     - view timetable                    │
│     - drop/add classes                  │
│     - check waitlist position           │
│                                         │
│  8. COMPLETE COURSES                    │  → Enrollment
│     - attend classes                    │    status: completed
│     - receive grades                    │    grade: A, B, C, etc.
└─────────────────────────────────────────┘

UI SCREENS STUDENT NEEDS:
• Login/Profile
• Application Form (multi-step)
• Document Upload
• Course Catalog Browser
• Schedule Planner
• Grade Viewer
```

### 2. 👨‍🏫 STAFF/PROFESSOR JOURNEY

```
STAFF WORKFLOW

┌─────────────────────────────────────────┐
│  PROFESSOR TASKS                        │
│                                         │
│  1. TEACH COURSES                       │  → CourseSection
│     - assigned to course sections       │    staff_id (instructor)
│     - manage classroom, schedule        │
│                                         │
│  2. MANAGE ENROLLMENT                   │  → Enrollment
│     - view student roster               │
│     - process waitlist                  │
│     - approve late adds/drops           │
│                                         │
│  3. GRADE STUDENTS                      │  → Enrollment
│     - enter individual grades           │    grade field
│     - bulk import from CSV              │
│     - calculate final grades            │
│                                         │
│  4. COURSE ADMINISTRATION               │  → Course
│     - update course descriptions        │
│     - set prerequisites                 │
│     - manage capacity                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ADMIN STAFF TASKS                      │
│                                         │
│  1. PROCESS APPLICATIONS                │  → AdmissionApplication
│     - review submitted applications     │    status updates
│     - verify documents                  │  → Document
│     - make admission decisions          │    decision_status
│                                         │
│  2. MANAGE ACADEMIC STRUCTURE           │  → Faculty, Department
│     - create programs                   │  → Program
│     - schedule courses                  │  → CourseSection
│     - assign rooms                      │  → Room
│                                         │
│  3. USER MANAGEMENT                     │  → User, Role
│     - create staff/student accounts     │  → Permission
│     - assign roles and permissions      │
│     - manage system access              │
│                                         │
│  4. REPORTING                           │
│     - enrollment statistics             │
│     - application metrics               │
│     - grade distributions               │
└─────────────────────────────────────────┘

UI SCREENS STAFF NEEDS:
• Application Review Dashboard
• Student Management
• Course/Section Management
• Room Scheduling
• Bulk Grade Import
• Reports & Analytics
```

---

## 🖥️ FUNDAMENTAL UI LAYOUTS YOU NEED

Based on these workflows, here are the core UI patterns:

### 1. **DASHBOARD LAYOUT** (All Users)
```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO] University System    [User: Maria R] [Notifications] [⚙]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 METRICS CARDS                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │Applications │ │ Enrollments │ │   Courses   │ │  Students   ││
│  │    156      │ │    2,341    │ │     89      │ │   1,247     ││
│  │  pending    │ │   active    │ │   active    │ │   active    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│  📈 RECENT ACTIVITY                                             │
│  • Maria Rodriguez submitted application                        │
│  • CS350 AI course reached capacity                            │
│  • Sophie Turner moved off waitlist                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. **DATA TABLE LAYOUT** (Lists/Management)
```
┌─────────────────────────────────────────────────────────────────┐
│  📝 Students Management                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [🔍 Search] [📊 Filter] [📥 Export] [➕ Add Student]          │
│                                                                 │
│  ┌─────┬─────────────────┬──────────────┬─────────┬─────────────┐│
│  │ ☐   │ Student         │ Email        │ Status  │ Actions     ││
│  ├─────┼─────────────────┼──────────────┼─────────┼─────────────┤│
│  │ ☐   │ Maria Rodriguez │ maria@...    │ Active  │ [Edit][View]││
│  │ ☐   │ David Park      │ david@...    │ Active  │ [Edit][View]││
│  │ ☐   │ Sophie Turner   │ sophie@...   │ Active  │ [Edit][View]││
│  └─────┴─────────────────┴──────────────┴─────────┴─────────────┘│
│                                                                 │
│  [← Previous] Page 1 of 42 [Next →]                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3. **FORM LAYOUT** (Application, Registration)
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Course Registration                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 COURSE SEARCH                                               │
│  [Search courses...] [Department ▼] [Term: Fall 2025 ▼]        │
│                                                                 │
│  📚 AVAILABLE COURSES                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ CS350 - Introduction to AI               [25/30] [ENROLL]   ││
│  │ Prof. Turing • MWF 10:00-11:30 • SCI-101                   ││
│  │ Prerequisites: CS201                                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ CS201 - Data Structures                  [FULL] [WAITLIST] ││
│  │ Prof. Turing • TTh 2:00-3:30 • SCI-102                     ││
│  │ 5 students on waitlist                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📅 YOUR SCHEDULE                                               │
│  [Visual calendar grid showing enrolled courses]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. **WORKFLOW LAYOUT** (Application Processing)
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Application Review: Maria Rodriguez                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STATUS: Submitted → Under Review → Decision                    │
│         ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░            │
│                                                                 │
│  👤 STUDENT INFO        │  📄 DOCUMENTS         │  ✅ CHECKLIST  │
│  Name: Maria Rodriguez  │  ☑ Transcript         │  ☐ Verify docs │
│  Email: maria@demo.com  │  ☑ Personal Statement │  ☐ Check GPA   │
│  GPA: 9.8/10 (Mexico)   │  ☑ Recommendation     │  ☐ Interview    │
│  Country: Mexico        │  ☐ Test Scores        │  ☐ Decision     │
│                        │                       │                │
│  🎯 PROGRAM CHOICES     │  📊 ACADEMIC RECORD    │                │
│  1st: Computer Science │  High School: 9.8 GPA  │                │
│  2nd: Mathematics      │  Instituto Tecnológico  │                │
│                        │  2020-2023             │                │
│                                                                 │
│  💬 COMMENTS: Strong background in programming competitions     │
│                                                                 │
│  [✅ ACCEPT] [❌ REJECT] [📝 REQUEST MORE INFO] [💾 SAVE DRAFT]   │
└─────────────────────────────────────────────────────────────────┘
```

**This is what you actually built - a sophisticated university management system!** 

Ready to design the UI now that you understand the data structure and workflows?