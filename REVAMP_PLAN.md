# University Admissions System - UI/UX Revamp Plan

> Objective: Transform the current functional demo into a polished, realistic Student Information System that matches the UX quality of Workday Student, Ellucian Banner 9, and modern enterprise SaaS applications.

---

## Part 1: Navigation & Information Architecture

### Current Issues
- Navigation is organized by data type rather than user tasks
- Missing critical SIS features (holds, to-do, degree audit)
- Some redundant items (Academic Records vs Grades, Calendar vs Schedule)
- "Other" category feels like a catch-all

### Proposed Student Navigation

```
HOME
└── Dashboard (task-focused, not just stats)

REGISTRATION
├── Register for Classes (browse catalog, add to cart, submit)
├── My Schedule (visual weekly view)
├── Drop/Add Classes
└── Waitlist Status

ACADEMICS
├── Grades (current + history)
├── Degree Audit (progress toward graduation)
├── Transcripts (view unofficial, request official)
└── Academic Standing

FINANCIAL
├── Account Summary (balance, due date, recent activity)
├── Make a Payment
├── Financial Aid (checklist-based, award status)
├── Payment Plans
└── 1098-T Tax Form

MY INFO
├── Holds & To-Do Items (critical - often hidden)
├── Advisor (contact info, schedule appointment)
├── Personal Information
└── Emergency Contacts

RESOURCES
├── Messages
├── Announcements
└── Academic Calendar
```

### Proposed Faculty Navigation

```
HOME
└── Teaching Dashboard

MY CLASSES
├── Current Sections (quick switch between classes)
├── Rosters
├── Attendance
└── Gradebook

COURSE CONTENT
├── Assignments
├── Materials
└── Announcements

ADVISING (if applicable)
├── My Advisees
└── Appointment Schedule

RESOURCES
├── Messages
└── Profile
```

### Proposed Admin Navigation

```
DASHBOARD
├── Overview (KPIs, alerts, quick actions)
├── Analytics & Reports
└── System Health

PEOPLE
├── Students (search, create, manage)
├── Faculty & Staff
└── User Accounts & Roles

ACADEMICS
├── Programs & Degrees
├── Courses & Sections
├── Terms & Calendar
└── Grading Policies

ENROLLMENT
├── Registration Management
├── Enrollment Reports
├── Waitlist Management
└── Holds Management

ADMISSIONS
├── Applications
├── Review Queue
├── Decision Letters
└── Admissions Reports

FINANCIALS
├── Billing & Invoices
├── Payment Processing
├── Financial Aid Admin
└── Tuition & Fees Setup

FACILITIES
├── Buildings & Rooms
└── Room Scheduling

COMMUNICATIONS
├── Announcements
├── Email Templates
└── Notification Settings

SYSTEM
├── Configuration
├── Audit Logs
└── Integrations
```

---

## Part 2: Dashboard Redesign

### Current Dashboard Issues
- Shows stats but doesn't drive action
- No urgency indicators
- No personalized tasks
- Generic welcome message

### New Dashboard Components

#### 1. Alert Banner (Top)
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  You have 2 holds preventing registration. View holds → │
└─────────────────────────────────────────────────────────────┘
```
- Only shows if holds exist
- Red/amber based on severity
- Direct link to resolve

#### 2. To-Do Checklist (Primary Focus)
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Action Items                                    View All │
├─────────────────────────────────────────────────────────────┤
│ ○ Accept Financial Aid Award          Due: Jan 15    →     │
│ ○ Complete Course Evaluation (CS301)  Due: Jan 20    →     │
│ ● Submit FAFSA for 2025-26           Completed ✓           │
│ ○ Register for Spring 2025           Opens: Jan 22         │
└─────────────────────────────────────────────────────────────┘
```
- Sorted by deadline
- Shows completion status
- Links directly to action

#### 3. Quick Stats Row
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ GPA          │ │ Credits      │ │ Balance Due  │ │ Next Class   │
│ 3.67         │ │ 89/120       │ │ $2,450.00    │ │ CS301 @ 10am │
│ Cum. GPA     │ │ 74% complete │ │ Due Feb 1    │ │ Room 204     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### 4. Current Classes (Term)
```
┌─────────────────────────────────────────────────────────────┐
│ 📚 Spring 2025 Classes                                      │
├─────────────────────────────────────────────────────────────┤
│ CS 301 - Algorithms           MWF 10:00-10:50    A-        │
│ MATH 240 - Linear Algebra     TR 2:00-3:15       B+        │
│ ENG 102 - Composition II      MWF 1:00-1:50      --        │
└─────────────────────────────────────────────────────────────┘
```

#### 5. Upcoming Deadlines
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Coming Up                                                │
├─────────────────────────────────────────────────────────────┤
│ TODAY        Assignment: CS301 Problem Set 4                │
│ Jan 15       Financial Aid acceptance deadline              │
│ Jan 22       Spring registration opens                      │
│ Feb 1        Tuition payment due                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 3: UI/UX Polish

### Design System Refinements

#### Typography
- [ ] Reduce heading sizes slightly for density
- [ ] Increase body text line-height for readability
- [ ] Use tabular numbers for data (grades, credits, money)

#### Spacing
- [ ] Tighten card internal padding (py-6 → py-4)
- [ ] Reduce gap between sections (gap-6 → gap-4)
- [ ] More compact table rows

#### Color & Visual Hierarchy
- [ ] Define semantic status colors:
  - Success: Green (completed, active, approved)
  - Warning: Amber (pending, due soon, attention needed)
  - Error: Red (overdue, hold, rejected)
  - Info: Blue (informational, in progress)
- [ ] Use color sparingly - mostly grayscale with color accents
- [ ] Reduce visual noise (fewer borders, subtler separators)

#### Cards & Containers
- [ ] Remove unnecessary card wrappers
- [ ] Use subtle hover states for interactive cards
- [ ] Consider "flat" design with just borders (no shadows)

#### Data Tables
- [ ] Sticky headers on scroll
- [ ] Row hover highlighting
- [ ] Inline actions (not just action column)
- [ ] Better empty states with illustration
- [ ] Loading skeletons that match content shape

#### Forms
- [ ] Inline validation with helpful messages
- [ ] Clear required vs optional indicators
- [ ] Group related fields visually
- [ ] Smart defaults where possible

### Micro-interactions

- [ ] Subtle button press feedback (already have scale)
- [ ] Smooth page transitions (fade)
- [ ] Toast notifications for actions
- [ ] Skeleton loading for all data fetches
- [ ] Optimistic UI updates where possible

### Responsive Design

- [ ] Mobile-first approach for all new components
- [ ] Collapsible sidebar on tablet
- [ ] Bottom navigation on mobile (native app feel)
- [ ] Touch-friendly tap targets (44px minimum)

---

## Part 4: Key Feature Additions

### Priority 1: Holds & To-Do System
Backend:
- [ ] Create `holds` table (type, reason, placed_by, placed_at, resolved_at)
- [ ] Create `action_items` table (student_id, type, title, due_date, status, link)
- [ ] Add hold check to registration flow

Frontend:
- [ ] Holds banner component
- [ ] To-Do checklist widget
- [ ] Holds detail page

### Priority 2: Degree Audit
Backend:
- [ ] Define program requirements structure
- [ ] Calculate completed vs remaining requirements
- [ ] Support "what-if" analysis

Frontend:
- [ ] Visual progress rings/bars
- [ ] Requirements checklist by category
- [ ] Course substitution requests

### Priority 3: Financial Aid Workflow
- [ ] Checklist-based status page
- [ ] Document upload for verification
- [ ] Award acceptance interface
- [ ] Disbursement timeline

### Priority 4: Registration Improvements
- [ ] Shopping cart model (add, review, submit)
- [ ] Schedule conflict detection (visual)
- [ ] Waitlist position and notifications
- [ ] Prerequisite checking with clear messaging

---

## Part 5: Page-by-Page Improvements

### Student Dashboard
| Current | Proposed |
|---------|----------|
| Welcome message | Alert banner (if holds) |
| 4 stat cards | To-Do checklist (primary) |
| Assignments list | Quick stats row |
| Announcements | Current classes with grades |
| Quick links | Upcoming deadlines |

### Registration Page
| Current | Proposed |
|---------|----------|
| Single bulk add flow | Shopping cart with review step |
| Basic error messages | Visual conflict indicator |
| No prerequisites shown | Clear prereq display with status |

### Grades Page
| Current | Proposed |
|---------|----------|
| Term selector + table | Term tabs with quick GPA summary |
| Basic grade display | Grade trend visualization |
| No export | Export/print transcript option |

### Financial Aid Page
| Current | Proposed |
|---------|----------|
| Award summary only | Checklist workflow |
| No action items | Clear next steps with deadlines |
| Static display | Accept/decline interface |

---

## Part 6: Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Restructure navigation (all three roles)
- [ ] Create holds & to-do backend infrastructure
- [ ] Update dashboard with new layout
- [ ] Implement alert banner component

### Phase 2: Student Experience (Week 2)
- [ ] Build to-do checklist system
- [ ] Redesign registration flow (shopping cart)
- [ ] Create degree audit page (basic version)
- [ ] Improve financial aid page

### Phase 3: Polish & Details (Week 3)
- [ ] Refine all micro-interactions
- [ ] Improve empty states
- [ ] Add loading skeletons everywhere
- [ ] Mobile responsive pass

### Phase 4: Admin & Faculty (Week 4)
- [ ] Admin dashboard KPIs
- [ ] Holds management interface
- [ ] Faculty gradebook improvements
- [ ] Bulk action improvements

---

## Reference: Real SIS Platforms

### Workday Student
- Task-based interface
- Single unified UX across all modules
- Mobile-native design
- AI assistant for help

### Ellucian Banner 9
- Modern responsive redesign
- Role-based dashboards
- Mobile-first new modules
- AI-powered degree planning

### Key Takeaways
1. **Task-driven, not data-driven** - Help users accomplish goals
2. **Surface urgency** - Holds and deadlines should be unmissable
3. **Reduce clicks** - Common actions should be 1-2 clicks away
4. **Progressive disclosure** - Show summary first, details on demand
5. **Consistent patterns** - Same interactions everywhere

---

## Success Metrics

- [ ] Student can see their to-do items immediately on login
- [ ] Holds are visible and actionable
- [ ] Registration can be completed in < 5 clicks
- [ ] Financial aid status is clear without clicking around
- [ ] Mobile experience is fully functional
- [ ] Page loads feel instant (< 200ms perceived)

---

*Last updated: January 2025*
