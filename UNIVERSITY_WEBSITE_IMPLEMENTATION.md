# University Website Implementation Plan

## Executive Summary
This document provides a comprehensive implementation plan for creating a realistic university website that aligns with our existing database structure and incorporates best practices from leading universities (MIT, UCLA, City College, Waterloo).

---

## Part 1: Database Analysis & Content Mapping

### Available Database Tables
Our system has 32 tables providing comprehensive academic management:

#### Core Academic Structure
- **faculties** → Schools/Colleges (6 divisions)
- **departments** → Academic departments within faculties
- **programs** → Degree programs (undergraduate, graduate, doctoral)
- **courses** → Course catalog with codes, titles, descriptions, credits
- **course_sections** → Actual offerings per term with capacity, schedule
- **course_prerequisites** → Prerequisite chains

#### Infrastructure
- **buildings** → Campus buildings
- **rooms** → Classrooms, labs, offices
- **terms** → Academic semesters/quarters

#### People & Access
- **users** → Authentication base
- **students** → Student profiles
- **staff** → Faculty and administrative staff
- **roles/permissions** → RBAC system

#### Academic Operations
- **enrollments** → Course registrations with status (enrolled, waitlisted, withdrawn)
- **admission_applications** → Application tracking
- **academic_records** → Transcripts and GPA
- **documents** → Supporting documents

### Data Gaps Identified
After reviewing major university websites, we're missing:

1. **Content Management**
   - News/announcements system
   - Events calendar
   - Faculty research interests/publications
   - Alumni tracking

2. **Academic Details**
   - Degree requirements (total credits, gen ed, major requirements)
   - Course learning outcomes
   - Academic policies
   - Accreditation information

3. **Campus Life**
   - Student organizations
   - Athletics/recreation programs
   - Dining locations/menus
   - Health/counseling services

4. **Marketing Content**
   - Rankings/statistics
   - Testimonials
   - Virtual tours
   - Social media integration

---

## Part 2: Information Architecture

### Primary Navigation Structure (Based on Research)

```
Mindswim College
├── About
│   ├── Overview & Mission
│   ├── Leadership
│   ├── History (Founded 1991)
│   ├── Facts & Rankings
│   ├── Campus Map
│   └── News & Events
│
├── Academics
│   ├── Schools & Faculties [DB: faculties]
│   ├── Departments [DB: departments]
│   ├── Programs [DB: programs]
│   ├── Course Catalog [DB: courses]
│   ├── Academic Calendar [DB: terms]
│   ├── Registration
│   └── Academic Policies
│
├── Admissions
│   ├── How to Apply [DB: admission_applications]
│   ├── Requirements
│   ├── Deadlines [DB: terms]
│   ├── Financial Aid
│   ├── Visit Campus
│   └── International Students
│
├── Campus Life
│   ├── Housing [DB: buildings]
│   ├── Dining
│   ├── Student Organizations
│   ├── Athletics & Recreation
│   ├── Health & Wellness
│   └── Campus Safety
│
├── Research
│   ├── Research Centers
│   ├── Faculty Research [DB: staff]
│   ├── Student Opportunities
│   └── Publications
│
└── Portals
    ├── Student Portal [DB: students, enrollments]
    ├── Faculty/Staff [DB: staff]
    └── Apply Now [DB: admission_applications]
```

---

## Part 3: Design Patterns from Research

### Common Header Patterns (All Universities)

```html
<!-- Info Bar (UCLA/Michigan style) -->
<div class="info-bar">
  Future Students | Current Students | Faculty & Staff | Alumni | Give
</div>

<!-- Main Navigation (MIT/UCLA style) -->
<nav class="main-nav">
  <logo />
  <menu items with mega-dropdowns />
  <search />
  <quick-links>Apply | Visit | Portal</quick-links>
</nav>
```

### Homepage Section Order (Composite Best Practices)

1. **Hero Section** (All)
   - Large image/video background
   - Primary CTAs: Apply, Visit, Explore
   - Current term indicator

2. **Quick Stats Bar** (UCLA/Waterloo)
   - Student enrollment
   - Programs offered
   - Faculty count
   - Rankings/achievements

3. **Academic Highlights** (MIT)
   - Featured programs
   - Research breakthroughs
   - Student achievements

4. **News/Events Grid** (All)
   - Latest 3-6 stories
   - Upcoming events
   - Academic deadlines

5. **Program Explorer** (UCLA)
   - Interactive program finder
   - Quick links by school

6. **Campus Life Preview** (Michigan/UCLA)
   - Student testimonials
   - Campus photos
   - Virtual tour CTA

---

## Part 4: Component Implementation Plan

### Phase 1: Foundation Components (Week 1)

#### 1.1 Design System Setup
```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary: '#003366',    // Institutional blue
    secondary: '#FFB81C',  // Gold accent
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      muted: '#ADB5BD'
    }
  },
  typography: {
    heading: 'Merriweather, Georgia, serif',
    body: 'Inter, -apple-system, sans-serif'
  },
  spacing: {
    section: '5rem',
    container: '1280px'
  }
}
```

#### 1.2 Layout Components
```typescript
// components/layout/InfoBar.tsx
- Future/Current/Alumni quick links
- Login button
- Search toggle

// components/layout/MegaMenu.tsx
- Multi-column dropdowns
- Featured links
- Visual previews

// components/layout/Breadcrumbs.tsx
- Hierarchical navigation
- Current page indicator
```

### Phase 2: Academic Components (Week 2)

#### 2.1 Program Display
```typescript
// components/academic/ProgramCard.tsx
interface ProgramProps {
  program: {
    id: number
    name: string
    degree_level: string
    department: Department
    duration: string
    credits: number
  }
  enrollmentStatus: 'open' | 'waitlist' | 'closed'
  availableSeats: number
}
```

#### 2.2 Course Catalog
```typescript
// components/academic/CourseList.tsx
interface CourseProps {
  course: {
    course_code: string  // "CSC 101"
    title: string
    credits: number
    description: string
    prerequisites: Course[]
  }
  sections: CourseSection[]
  currentTerm: Term
}

// Display format:
"CSC 101 - Introduction to Computer Science (3 cr.)"
"Prerequisites: MATH 201"
"Available sections: 3 (15 seats remaining)"
```

#### 2.3 Academic Calendar Widget
```typescript
// components/academic/TermSelector.tsx
- Current term highlight
- Registration deadlines
- Add/drop dates
- Term switcher
```

### Phase 3: Data Integration (Week 3)

#### 3.1 Static Data Files
```json
// data/academic-requirements.json
{
  "programs": {
    "bs-computer-science": {
      "total_credits": 120,
      "general_education": 45,
      "major_requirements": 60,
      "electives": 15,
      "course_sequence": {
        "year_1": ["CSC 101", "MATH 201", "ENG 101"],
        "year_2": ["CSC 201", "CSC 202", "MATH 301"],
        "year_3": ["CSC 301", "CSC 302", "CSC 401"],
        "year_4": ["CSC 490", "CSC 491", "Electives"]
      }
    }
  }
}
```

#### 3.2 Department Pages
```typescript
// app/academics/departments/[slug]/page.tsx
- Department overview
- Faculty grid [DB: staff where department_id]
- Programs offered [DB: programs]
- Course listings [DB: courses]
- News/announcements
- Contact information
```

### Phase 4: Interactive Features (Week 4)

#### 4.1 Course Search & Filter
```typescript
// components/search/CourseSearch.tsx
- Search by code, title, instructor
- Filter by:
  - Department [DB: departments]
  - Credits
  - Term offered [DB: terms]
  - Availability status
  - Prerequisites met
```

#### 4.2 Enrollment Status Indicators
```typescript
// components/status/EnrollmentBadge.tsx
function getStatus(section: CourseSection) {
  const enrolled = section.enrollments.filter(e => e.status === 'enrolled').length
  const remaining = section.capacity - enrolled

  if (remaining === 0) return { status: 'closed', text: 'Section Full', color: 'red' }
  if (remaining < 5) return { status: 'limited', text: `${remaining} seats left`, color: 'yellow' }
  return { status: 'open', text: 'Open', color: 'green' }
}
```

#### 4.3 Building/Room Integration
```typescript
// components/campus/BuildingInfo.tsx
- Building hours
- Room types (lecture, lab, seminar)
- Accessibility info
- Interactive campus map markers
```

---

## Part 5: Micro-Interactions & Polish

### Navigation Enhancements (MIT/UCLA patterns)
```typescript
// Sticky header that shrinks on scroll
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100)
  }
  window.addEventListener('scroll', handleScroll)
}, [])

// Smooth mega-menu transitions
.mega-menu {
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: top;
}
```

### Academic Formatting Standards
```typescript
// utils/formatters.ts
export const formatCourseCode = (code: string) => {
  // "csc101" → "CSC 101"
  return code.toUpperCase().replace(/(\D+)(\d+)/, '$1 $2')
}

export const formatSchedule = (days: string[], start: string, end: string) => {
  // ["M", "W", "F"], "10:00", "11:15" → "MWF 10:00-11:15am"
  const dayStr = days.join('')
  const timeStr = `${format12Hour(start)}-${format12Hour(end)}`
  return `${dayStr} ${timeStr}`
}

export const formatCredits = (credits: number) => {
  // 3 → "3 cr."
  return `${credits} cr.`
}
```

### Status Indicators (Real University Patterns)
```typescript
// Application status badges
const statusColors = {
  submitted: 'blue',
  under_review: 'yellow',
  accepted: 'green',
  waitlisted: 'orange',
  declined: 'red'
}

// Course section status
const sectionStatus = {
  open: { icon: '✓', color: 'green', text: 'Open for enrollment' },
  waitlist: { icon: '⏰', color: 'yellow', text: 'Waitlist available' },
  closed: { icon: '✗', color: 'red', text: 'Section closed' }
}
```

---

## Part 6: Content Strategy

### Academic Content Templates

#### School/Faculty Page Template
```markdown
# [School Name]
Founded: [Year] | Dean: [Name] | Students: [Count]

## About
[2-3 paragraph description]

## Departments
[Grid of department cards]

## Programs Offered
- Undergraduate: [List]
- Graduate: [List]
- Certificates: [List]

## Faculty Spotlight
[Featured faculty with research]

## News & Events
[Latest 3 items]

## Contact
Building: [Name] Room [Number]
Phone: [Number]
Email: [Email]
```

#### Program Page Template
```markdown
# [Program Name]
Degree: [Type] | Duration: [Years] | Credits: [Number]

## Overview
[Program description]

## Admission Requirements
- GPA: [Minimum]
- Prerequisites: [Courses]
- Application deadline: [Date]

## Degree Requirements
Total Credits: [120]
- General Education: [45]
- Major Requirements: [60]
- Electives: [15]

## Course Sequence
[Year-by-year breakdown]

## Career Outcomes
- Job placement rate: [%]
- Average starting salary: [$]
- Top employers: [List]

## Apply Now
[CTA to application]
```

---

## Part 7: Implementation Timeline

### Week 1: Foundation
- [ ] Set up design system with tokens
- [ ] Create layout components (header, footer, navigation)
- [ ] Implement info bar and mega menus
- [ ] Add breadcrumb navigation

### Week 2: Academic Structure
- [ ] Build faculty/school pages
- [ ] Create department templates
- [ ] Implement program displays
- [ ] Add course catalog components

### Week 3: Data Integration
- [ ] Create static data files for requirements
- [ ] Build course search/filter
- [ ] Add enrollment status indicators
- [ ] Implement term selector

### Week 4: Interactive Features
- [ ] Add sticky navigation
- [ ] Implement smooth transitions
- [ ] Create campus map integration
- [ ] Add print-friendly versions

### Week 5: Content Population
- [ ] Generate realistic course data
- [ ] Create faculty profiles
- [ ] Write program descriptions
- [ ] Add news/events content

### Week 6: Polish & Testing
- [ ] Responsive design testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## Part 8: Technical Specifications

### Database Queries for Dynamic Content

```typescript
// Get courses with sections for current term
const getCoursesWithAvailability = async (termId: number, departmentId?: number) => {
  return await db.courses.findMany({
    where: {
      department_id: departmentId,
      sections: {
        some: { term_id: termId }
      }
    },
    include: {
      sections: {
        where: { term_id: termId },
        include: {
          enrollments: true,
          room: {
            include: { building: true }
          },
          instructor: true
        }
      },
      prerequisites: true,
      department: {
        include: { faculty: true }
      }
    }
  })
}

// Calculate available seats
const getAvailableSeats = (section: CourseSection) => {
  const enrolled = section.enrollments.filter(e =>
    e.status === 'enrolled'
  ).length
  return section.capacity - enrolled
}
```

### SEO & Metadata

```typescript
// app/academics/programs/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const program = await getProgram(params.slug)

  return {
    title: `${program.name} | Mindswim College`,
    description: `Learn about the ${program.degree_level} in ${program.name} at Mindswim College. ${program.credits} credits, ${program.duration} duration.`,
    openGraph: {
      title: program.name,
      description: program.description,
      type: 'website',
      url: `/academics/programs/${params.slug}`
    }
  }
}
```

---

## Part 9: Realistic Content Examples

### Course Display Example
```
CSC 301 - Data Structures & Algorithms (3 cr.)
Prerequisites: CSC 201, MATH 201
Fall 2024 | 3 sections available

Section 001 | MWF 10:00-11:15am | NAC 4/201 | Dr. Chen
⚠️ 3 seats remaining | Enrolled: 27/30

Section 002 | TTh 2:00-3:30pm | NAC 5/110 | Dr. Smith
✓ Open | Enrolled: 18/30

Section 003 | Online Asynchronous | Dr. Johnson
✗ Section Full - Waitlist Available | Waitlist: 5
```

### Department Page Example
```
Computer Science Department
Part of: Chen School of Engineering & Technology

450 Students | 25 Faculty | 15 Research Labs

The Computer Science Department at Mindswim College offers cutting-edge
programs in software engineering, artificial intelligence, cybersecurity,
and data science. Our graduates are highly sought after by top tech companies
and research institutions.

Programs Offered:
• BS Computer Science (120 credits)
• MS Computer Science (30 credits)
• PhD Computer Science (60 credits)
• Certificate in Cybersecurity (15 credits)

Recent News:
📰 Prof. Chen receives NSF grant for AI research
📰 Students win national hackathon competition
📰 New quantum computing lab opens Spring 2025
```

---

## Part 10: Accessibility & Best Practices

### WCAG 2.1 AA Compliance
```typescript
// Semantic HTML structure
<nav role="navigation" aria-label="Main">
<main role="main" aria-labelledby="page-title">
<section aria-label="Course listings">

// Skip navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu()
  if (e.key === 'Tab') trapFocus(e)
}

// Screen reader announcements
<span className="sr-only" aria-live="polite">
  {enrollmentStatus} - {availableSeats} seats available
</span>
```

### Performance Optimization
```typescript
// Static generation for public pages
export async function generateStaticParams() {
  const departments = await getAllDepartments()
  return departments.map(dept => ({
    slug: dept.slug
  }))
}

// Image optimization
import Image from 'next/image'
<Image
  src="/campus/building.jpg"
  alt="Engineering Building"
  width={800}
  height={450}
  loading="lazy"
  placeholder="blur"
/>

// Code splitting
const CourseSearch = dynamic(() => import('./CourseSearch'), {
  loading: () => <SearchSkeleton />
})
```

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a realistic university website that:

1. **Leverages existing database structure** while identifying gaps
2. **Incorporates best practices** from leading universities
3. **Maintains consistency** through design systems and templates
4. **Provides clear implementation steps** with timeline
5. **Ensures accessibility and performance** standards

The key to realism is in the details:
- Proper academic formatting (CSC 101, 3 cr., MWF 10:00-11:15am)
- Status indicators that match database state
- Hierarchical navigation matching faculty→department→program structure
- Term-based content switching
- Enrollment capacity displays

By following this plan, the website will feel authentic and professional while seamlessly integrating with the existing backend systems.