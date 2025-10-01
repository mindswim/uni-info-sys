# University Websites Structure Analysis

This document analyzes the information architecture of various university websites to inform the development of a realistic university frontend that complements our admissions system.

## 1. City College of New York (CCNY)
**URL**: https://www.ccny.cuny.edu/
**Type**: Traditional, functional university website
**Target Audience**: Balanced - serves current students, prospective students, faculty/staff

### Navigation Structure
```
├── About
│   ├── Mission & Vision
│   ├── Leadership
│   ├── History & Facts
│   └── Strategic Plan 2025-2030
│
├── Academics
│   ├── Schools & Divisions (7 total)
│   │   ├── Spitzer School of Architecture
│   │   ├── Colin Powell School
│   │   ├── School of Education
│   │   ├── Grove School of Engineering
│   │   ├── Division of Interdisciplinary Studies
│   │   ├── Division of Humanities & Arts
│   │   └── Division of Science
│   ├── Degree Programs
│   │   ├── Undergraduate (BA, BFA, BS, BE)
│   │   ├── Graduate (MA, MFA, MS, MPA, MSW)
│   │   └── Doctoral Programs
│   ├── Special Programs
│   │   ├── Accelerated Degrees (BA/MA, BS/MD)
│   │   ├── Honors Programs
│   │   └── Certificate Programs
│   └── Academic Resources
│       ├── Library
│       ├── Registrar
│       ├── Academic Support & Tutoring
│       └── Course Catalogs
│
├── Admissions
│   ├── Undergraduate
│   │   ├── Freshman
│   │   ├── Transfer
│   │   ├── International
│   │   └── Returning Students
│   ├── Graduate
│   ├── Special Programs (SEEK, ACE)
│   ├── Financial Aid & Scholarships
│   └── Visit Campus (Tours & Info Sessions)
│
├── Research
│   ├── Research Centers
│   ├── Faculty Research
│   └── Student Research
│
├── Student Affairs
│   ├── Campus Life
│   ├── Student Services
│   └── Student Resources
│
└── Support CCNY
    ├── Alumni
    └── Giving
```

### Key Features
- **Multi-tier Academic Structure**: University → Schools/Divisions → Departments → Programs
- **Multiple Admission Paths**: Freshman, Transfer, International, Special Programs
- **User Segmentation**: Clear sections for different user types
- **Functional Focus**: Prioritizes information access and utility over marketing

### Homepage Elements
- Welcome message
- Schools and Divisions grid
- Fast Facts section
- News & Events
- Calendar
- Social Media integration

### Observations
- Very functional, tool-like approach
- Clear information hierarchy
- Serves current students well (not just prospective)
- Traditional higher ed website structure

---

## 2. Harvard University
**URL**: https://www.harvard.edu/
**Type**: Modern, marketing-focused landing page
**Target Audience**: Heavily weighted toward prospective students, donors, and public image

### Navigation Structure
[To be analyzed]

### Key Features
[To be analyzed]

### Homepage Elements
[To be analyzed]

### Observations
- More marketing/brand focused
- Modern design aesthetic
- May prioritize prospective students over current students
- Current students likely use internal portals more

---

## Common Patterns Across Universities

### Standard Top-Level Categories
1. **About/Overview**
   - Mission, Vision, Values
   - Leadership/Administration
   - History & Traditions
   - Facts & Statistics

2. **Academics**
   - Schools/Colleges/Faculties
   - Departments
   - Degree Programs
   - Academic Resources

3. **Admissions**
   - Undergraduate
   - Graduate
   - International
   - Financial Aid

4. **Research**
   - Centers & Institutes
   - Faculty Research
   - Publications

5. **Campus Life/Student Affairs**
   - Housing & Dining
   - Activities & Organizations
   - Support Services

6. **Alumni/Giving**
   - Alumni Services
   - Donations
   - Events

### User Journey Paths
1. **Prospective Students**: Homepage → Admissions → Programs → Apply
2. **Current Students**: Homepage → Quick Links → Student Portal
3. **Faculty/Staff**: Homepage → Resources → Internal Systems
4. **Alumni**: Homepage → Alumni → Services/Giving

### Content Types
- Academic catalogs
- News & events
- Faculty/staff directories
- Research highlights
- Student success stories
- Campus maps & virtual tours
- Academic calendars
- Policy documents

---

## Recommendations for Our University Website

### Approach Decision
**Recommendation**: Follow CCNY's functional approach rather than Harvard's marketing approach

**Rationale**:
1. Better demonstrates understanding of actual university operations
2. Serves multiple user types equally
3. More realistic for a comprehensive university system
4. Provides clear pathways to our backend admissions/management system
5. Shows portfolio depth (not just pretty marketing site)

### Proposed Structure
```
Home
├── About
│   ├── Mission & History
│   ├── Leadership
│   ├── Facts & Figures
│   └── Campus Map
├── Academics
│   ├── Faculties [Pull from backend]
│   ├── Departments [Pull from backend]
│   ├── Programs [Pull from backend]
│   ├── Course Catalog
│   └── Academic Calendar
├── Admissions
│   ├── How to Apply → [Links to admission system]
│   ├── Requirements
│   ├── Deadlines
│   ├── Financial Aid
│   └── Visit Campus
├── Campus Life
│   ├── Housing & Dining
│   ├── Student Organizations
│   ├── Athletics
│   └── Campus Facilities [Pull from backend buildings]
├── Research
│   ├── Research Centers
│   └── Faculty Research
├── Resources
│   ├── For Students → [Portal login]
│   ├── For Faculty/Staff → [Portal login]
│   ├── For Alumni
│   └── For Parents
└── Portal
    ├── Student Login → [Existing app]
    ├── Staff Login → [Existing app]
    └── Apply Now → [Application system]
```

### Integration Points with Backend
- Academic structure (faculties, departments, programs)
- Course listings
- Faculty profiles
- Building/facilities data
- Term/semester information
- News/events (if we add this model)

### Gaps Identified in Our Current System
Based on university website analysis:
1. Research centers/institutes (not in current models)
2. Alumni tracking system
3. Special programs (Honors, certificates)
4. News/events system
5. Faculty research profiles
6. Student organizations
7. Campus services (health, counseling, etc.)