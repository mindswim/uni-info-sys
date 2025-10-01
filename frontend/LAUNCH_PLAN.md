# University Admissions System - Launch-Ready Rebuild Plan
**Version**: 1.0  
**Created**: October 1, 2025  
**Goal**: Professional, maintainable, deployable app in 2 weeks  
**Principle**: Keep ALL functionality, fix the architecture

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Philosophy](#architecture-philosophy)
3. [Component Strategy](#component-strategy)
4. [Phase 1: Cleanup (Days 1-2)](#phase-1-cleanup-days-1-2)
5. [Phase 2: Consolidation (Days 3-6)](#phase-2-consolidation-days-3-6)
6. [Phase 3: Integration (Days 7-10)](#phase-3-integration-days-7-10)
7. [Phase 4: Deploy (Days 11-12)](#phase-4-deploy-days-11-12)
8. [Component Patterns Reference](#component-patterns-reference)
9. [Success Criteria](#success-criteria)

---

## Executive Summary

### Current State
- ✅ Backend: 134 working API endpoints
- ⚠️ Frontend: 77 pages, 58K lines of code
- 🚨 Integration: Only 14% complete
- ❌ Build: Has errors, cannot deploy

### Target State  
- ✅ Frontend: 15 focused pages, ~15K lines
- ✅ Integration: 100% complete
- ✅ Build: Zero errors, production ready
- ✅ UX: Professional dashboard experience

### No Functionality Lost
Every feature stays. We're reorganizing routes into professional component architecture.

---

## Architecture Philosophy

### Modern SaaS Pattern
```
Few Routes + Rich Components = Professional App

Examples:
- Vercel: 4 main routes, everything else is tabs/modals
- Linear: 3 main routes, feature-rich with tabs
- Stripe: 6 main routes, deep functionality via tabs/modals
```

### Our Approach
```
15 routes (industry standard for university SIS)
+ Shadcn components (tabs, modals, sheets)
+ Reusable patterns (DataTable, FormModal, DashboardLayout)
= Fast, maintainable, professional
```

### Key Principles
1. **Routes for pages, tabs for views** - Related data uses tabs, not routes
2. **Modals for actions** - CRUD operations in modals, not new pages
3. **Components over copy-paste** - Build once, reuse everywhere
4. **Shadcn where appropriate** - Use library components, extend when needed
5. **Backend-driven** - Every component connects to real API

---

## Component Strategy

### Shadcn Components We'll Use

#### Already Installed (Use Heavily)
- `<Tabs>` - Main pattern for consolidating pages
- `<Card>` - Content containers
- `<Table>` - Data display (already using DataTable)
- `<Dialog>` - CRUD modals
- `<Sheet>` - Side panels for details
- `<Form>` - All forms (with react-hook-form + zod)
- `<Button>`, `<Badge>`, `<Input>`, `<Select>` - Basics

#### Layout Components (Custom, Using Shadcn)
- `<AppShell>` ✅ Already exists - Keep using
- `<DashboardLayout>` - New, for tabbed dashboards
- `<PageHeader>` - New, consistent headers
- `<EmptyState>` - New, when no data

#### Data Components (Custom, Using Shadcn Table)
- `<DataTable>` ✅ Already exists - Enhance
- `<DataTableToolbar>` - New, filters/search
- `<DataTablePagination>` - New, pagination
- `<StatCard>` - New, metric cards

#### Domain Components (Custom)
- `<StudentDashboard>` - New, tabbed student view
- `<FacultyDashboard>` - New, tabbed faculty view
- `<AdminDashboard>` - New, admin overview
- `<EnrollmentWizard>` ✅ Already exists - Keep
- `<CourseRegistration>` ✅ Already exists - Keep

### Component Hierarchy
```
App
├── (auth)
│   └── layout.tsx (auth layout)
│       └── login/page.tsx
│
├── (dashboard)
│   └── layout.tsx (AppShell with sidebar)
│       ├── page.tsx (role-based dashboard)
│       ├── profile/page.tsx
│       └── messages/page.tsx
│
├── (student)
│   └── layout.tsx (student permissions)
│       └── [all student features in dashboard tabs]
│
├── (faculty)  
│   └── layout.tsx (faculty permissions)
│       └── dashboard/page.tsx (tabbed)
│
└── (admin)
    └── layout.tsx (admin permissions)
        ├── students/page.tsx
        ├── students/[id]/page.tsx
        ├── admissions/page.tsx
        ├── courses/page.tsx
        ├── sections/page.tsx
        ├── settings/page.tsx
        └── reports/page.tsx
```

---

## Phase 1: Cleanup (Days 1-2)
**Goal**: Remove bloat, fix errors, establish base

### Day 1 Morning: Delete Dev Pages

#### ❌ Pages to Delete (Zero User Impact)
```bash
# Development/testing pages
src/app/demo/
src/app/god-mode/
src/app/style-guide/
src/app/theme-test/
src/app/data-explorer/
src/app/system-overview/

# Duplicate/test components
src/components/demo/
```

**Checklist:**
- [ ] Delete `src/app/demo/`
- [ ] Delete `src/app/god-mode/`
- [ ] Delete `src/app/style-guide/`
- [ ] Delete `src/app/theme-test/`
- [ ] Delete `src/app/data-explorer/`
- [ ] Delete `src/app/system-overview/`
- [ ] Delete `src/components/demo/`
- [ ] Remove imports referencing deleted pages
- [ ] Test build: `npm run build`
- [ ] Commit: "Remove dev/test pages"

### Day 1 Afternoon: Fix Build Errors

#### Current Errors to Fix
1. `course-management/page.tsx` - undefined variables
2. Import errors with `authService`
3. Any other TypeScript errors

**Checklist:**
- [ ] Fix `course-management/page.tsx` undefined variables
- [ ] Fix `authService` import errors
- [ ] Run `npm run build` - must succeed
- [ ] Run `npm run lint` - fix critical issues
- [ ] Commit: "Fix build errors"

### Day 2: Establish Base Architecture

#### Create Shared Components

**1. DashboardLayout Component**
```typescript
// src/components/layouts/dashboard-layout.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface Tab {
  value: string
  label: string
  content: React.ReactNode
}

interface DashboardLayoutProps {
  title: string
  description?: string
  tabs: Tab[]
  defaultTab?: string
}

export function DashboardLayout({ title, description, tabs, defaultTab }: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      <Tabs defaultValue={defaultTab || tabs[0].value} className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

**2. PageHeader Component**
```typescript
// src/components/layouts/page-header.tsx
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**3. StatCard Component**
```typescript
// src/components/dashboard/stat-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

**4. EmptyState Component**
```typescript
// src/components/layouts/empty-state.tsx
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

**Checklist:**
- [ ] Create `src/components/layouts/dashboard-layout.tsx`
- [ ] Create `src/components/layouts/page-header.tsx`
- [ ] Create `src/components/dashboard/stat-card.tsx`
- [ ] Create `src/components/layouts/empty-state.tsx`
- [ ] Test each component renders
- [ ] Commit: "Add core layout components"

---

## Phase 2: Consolidation (Days 3-6)
**Goal**: Merge 77 pages into 15 professional routes

### Day 3: Student Dashboard Consolidation

#### Pages to Consolidate (12 → 1)
```
❌ DELETE these routes:
/academic-records
/schedule
/grades
/transcripts
/transcript-requests
/enrollment
/enrollments
/course-catalog (keep as separate page for browsing)
/registration
/financial-aid
/billing
/payment-plans

✅ CREATE this:
/dashboard (student view with tabs)
```

#### New Student Dashboard Structure
```typescript
// src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { StudentDashboard } from '@/components/dashboards/student-dashboard'
import { FacultyDashboard } from '@/components/dashboards/faculty-dashboard'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-96 w-full" /></div>
  }
  
  // Role-based dashboard rendering
  const role = user?.roles?.[0]
  
  if (role === 'student') return <StudentDashboard />
  if (role === 'staff' || role === 'faculty') return <FacultyDashboard />
  if (role === 'admin') return <AdminDashboard />
  
  return <div>Unknown role</div>
}
```

```typescript
// src/components/dashboards/student-dashboard.tsx
'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AcademicOverview } from './student/academic-overview'
import { AcademicRecordsTab } from './student/academic-records-tab'
import { ScheduleTab } from './student/schedule-tab'
import { GradesTab } from './student/grades-tab'
import { BillingTab } from './student/billing-tab'
import { FinancialAidTab } from './student/financial-aid-tab'

export function StudentDashboard() {
  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: <AcademicOverview />
    },
    {
      value: 'academic',
      label: 'Academic Records',
      content: <AcademicRecordsTab />
    },
    {
      value: 'schedule',
      label: 'Schedule',
      content: <ScheduleTab />
    },
    {
      value: 'grades',
      label: 'Grades',
      content: <GradesTab />
    },
    {
      value: 'billing',
      label: 'Billing',
      content: <BillingTab />
    },
    {
      value: 'financial-aid',
      label: 'Financial Aid',
      content: <FinancialAidTab />
    }
  ]
  
  return (
    <DashboardLayout
      title="My Dashboard"
      description="View your academic information and manage your studies"
      tabs={tabs}
      defaultTab="overview"
    />
  )
}
```

#### Extract Tab Components

**Academic Overview (Widget Cards)**
```typescript
// src/components/dashboards/student/academic-overview.tsx
'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { studentService } from '@/services'
import { GraduationCap, BookOpen, TrendingUp, Calendar } from 'lucide-react'

export function AcademicOverview() {
  const [stats, setStats] = useState({
    gpa: '0.00',
    credits: 0,
    coursesEnrolled: 0,
    upcomingClasses: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const profile = await studentService.getCurrentProfile()
        const enrollments = await studentService.getMyEnrollments()
        
        setStats({
          gpa: profile.gpa || '0.00',
          credits: profile.total_credits || 0,
          coursesEnrolled: enrollments.length,
          upcomingClasses: enrollments.filter(e => e.status === 'enrolled').length
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Current GPA"
        value={stats.gpa}
        icon={TrendingUp}
        description="Cumulative grade point average"
      />
      <StatCard
        title="Total Credits"
        value={stats.credits}
        icon={GraduationCap}
        description="Credits earned"
      />
      <StatCard
        title="Courses Enrolled"
        value={stats.coursesEnrolled}
        icon={BookOpen}
        description="This semester"
      />
      <StatCard
        title="Upcoming Classes"
        value={stats.upcomingClasses}
        icon={Calendar}
        description="This week"
      />
    </div>
  )
}
```

**Academic Records Tab (Reuse Existing)**
```typescript
// src/components/dashboards/student/academic-records-tab.tsx
'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { studentService } from '@/services'
import type { AcademicRecord } from '@/types/api-types'
import { columns } from './academic-records-columns'

export function AcademicRecordsTab() {
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRecords() {
      try {
        const data = await studentService.getMyAcademicRecords()
        setRecords(data)
      } catch (error) {
        console.error('Failed to fetch academic records:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecords()
  }, [])
  
  return (
    <DataTable
      columns={columns}
      data={records}
      loading={loading}
      searchKey="institution_name"
      searchPlaceholder="Search institutions..."
    />
  )
}

// src/components/dashboards/student/academic-records-columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { AcademicRecord } from '@/types/api-types'
import { Badge } from '@/components/ui/badge'

export const columns: ColumnDef<AcademicRecord>[] = [
  {
    accessorKey: 'institution_name',
    header: 'Institution',
  },
  {
    accessorKey: 'qualification_type',
    header: 'Qualification',
  },
  {
    accessorKey: 'gpa',
    header: 'GPA',
    cell: ({ row }) => {
      const gpa = parseFloat(row.getValue('gpa'))
      return <span className="font-medium">{gpa.toFixed(2)}</span>
    }
  },
  {
    accessorKey: 'verified',
    header: 'Status',
    cell: ({ row }) => {
      const verified = row.getValue('verified')
      return (
        <Badge variant={verified ? 'default' : 'secondary'}>
          {verified ? 'Verified' : 'Pending'}
        </Badge>
      )
    }
  }
]
```

**Schedule Tab**
```typescript
// src/components/dashboards/student/schedule-tab.tsx
'use client'

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { studentService } from '@/services'

export function ScheduleTab() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchSchedule() {
      try {
        const data = await studentService.getMyEnrollments()
        setEnrollments(data)
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSchedule()
  }, [])
  
  if (loading) {
    return <div>Loading schedule...</div>
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {enrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="p-4 border rounded-lg">
                <h4 className="font-semibold">{enrollment.course_section.course.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {enrollment.course_section.schedule_days?.join(', ')}
                  {' '}
                  {enrollment.course_section.start_time} - {enrollment.course_section.end_time}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" className="rounded-md border" />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Grades Tab**
```typescript
// src/components/dashboards/student/grades-tab.tsx
'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { studentService } from '@/services'
import { columns } from './grades-columns'

export function GradesTab() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchGrades() {
      try {
        const data = await studentService.getMyEnrollments()
        // Filter to only enrollments with grades
        const graded = data.filter((e: any) => e.grade)
        setEnrollments(graded)
      } catch (error) {
        console.error('Failed to fetch grades:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGrades()
  }, [])
  
  return (
    <DataTable
      columns={columns}
      data={enrollments}
      loading={loading}
      searchKey="course_section.course.title"
      searchPlaceholder="Search courses..."
    />
  )
}
```

**Billing Tab**
```typescript
// src/components/dashboards/student/billing-tab.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function BillingTab() {
  // TODO: Connect to billing API when available
  const mockBalance = {
    total: 12500.00,
    paid: 8000.00,
    remaining: 4500.00,
    dueDate: '2025-11-01'
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Charges</span>
            <span className="font-semibold">${mockBalance.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-semibold text-green-600">
              ${mockBalance.paid.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold text-red-600">
              ${mockBalance.remaining.toLocaleString()}
            </span>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <Badge variant="secondary">{mockBalance.dueDate}</Badge>
            </div>
          </div>
          <Button className="w-full">Make Payment</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No recent transactions
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Checklist - Student Dashboard:**
- [ ] Create `src/components/layouts/dashboard-layout.tsx`
- [ ] Create `src/components/dashboards/student-dashboard.tsx`
- [ ] Create `src/components/dashboards/student/academic-overview.tsx`
- [ ] Create `src/components/dashboards/student/academic-records-tab.tsx`
- [ ] Create `src/components/dashboards/student/schedule-tab.tsx`
- [ ] Create `src/components/dashboards/student/grades-tab.tsx`
- [ ] Create `src/components/dashboards/student/billing-tab.tsx`
- [ ] Create `src/components/dashboards/student/financial-aid-tab.tsx`
- [ ] Update `src/app/dashboard/page.tsx` with role-based rendering
- [ ] Delete old student route pages
- [ ] Test student dashboard with real API
- [ ] Commit: "Consolidate student pages into dashboard"

### Day 4: Faculty Dashboard Consolidation

#### Pages to Consolidate (8 → 1)
```
❌ DELETE these routes:
/faculty/dashboard (keep this route, but make it tabbed)
/gradebook
/grades (duplicate)
/attendance
/course-management
/my-students
/assignments
/student-notes

✅ CREATE this:
/faculty/dashboard (with tabs)
```

#### New Faculty Dashboard
```typescript
// src/components/dashboards/faculty-dashboard.tsx
'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FacultyOverview } from './faculty/overview'
import { MyCoursesTab } from './faculty/my-courses-tab'
import { GradebookTab } from './faculty/gradebook-tab'
import { AttendanceTab } from './faculty/attendance-tab'
import { RosterTab } from './faculty/roster-tab'

export function FacultyDashboard() {
  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: <FacultyOverview />
    },
    {
      value: 'courses',
      label: 'My Courses',
      content: <MyCoursesTab />
    },
    {
      value: 'gradebook',
      label: 'Gradebook',
      content: <GradebookTab />
    },
    {
      value: 'attendance',
      label: 'Attendance',
      content: <AttendanceTab />
    },
    {
      value: 'roster',
      label: 'Class Roster',
      content: <RosterTab />
    }
  ]
  
  return (
    <DashboardLayout
      title="Faculty Dashboard"
      description="Manage your courses and students"
      tabs={tabs}
      defaultTab="overview"
    />
  )
}
```

**Checklist - Faculty Dashboard:**
- [ ] Create `src/components/dashboards/faculty-dashboard.tsx`
- [ ] Create `src/components/dashboards/faculty/overview.tsx`
- [ ] Create `src/components/dashboards/faculty/my-courses-tab.tsx`
- [ ] Create `src/components/dashboards/faculty/gradebook-tab.tsx`
- [ ] Create `src/components/dashboards/faculty/attendance-tab.tsx`
- [ ] Create `src/components/dashboards/faculty/roster-tab.tsx`
- [ ] Update `src/app/faculty/dashboard/page.tsx`
- [ ] Delete old faculty route pages
- [ ] Test faculty dashboard with real API
- [ ] Commit: "Consolidate faculty pages into dashboard"

### Day 5-6: Admin Area Consolidation

#### Admin Pages Structure (Keep Separate Routes)
```
✅ KEEP these admin routes (CRUD operations):
/admin/students         - Student list/management
/admin/students/[id]    - Student detail
/admin/admissions       - Application pipeline
/admin/courses          - Course catalog management
/admin/sections         - Section scheduling
/admin/reports          - Analytics & reports

✅ CONSOLIDATE settings into:
/admin/settings         - Single page with sections for:
  - Departments
  - Programs
  - Faculties
  - Roles & Permissions
  - System Config
```

#### Settings Page Structure
```typescript
// src/app/admin/settings/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DepartmentsSettings } from '@/components/admin/settings/departments'
import { ProgramsSettings } from '@/components/admin/settings/programs'
import { FacultiesSettings } from '@/components/admin/settings/faculties'
import { RolesSettings } from '@/components/admin/settings/roles'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage departments, programs, and system configuration
        </p>
      </div>
      
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments">
          <DepartmentsSettings />
        </TabsContent>
        
        <TabsContent value="programs">
          <ProgramsSettings />
        </TabsContent>
        
        <TabsContent value="faculties">
          <FacultiesSettings />
        </TabsContent>
        
        <TabsContent value="roles">
          <RolesSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Checklist - Admin Consolidation:**
- [ ] Create `/admin/settings/page.tsx` with tabs
- [ ] Create settings tab components (departments, programs, faculties, roles)
- [ ] Delete old `/departments`, `/programs`, `/faculties`, `/roles` routes
- [ ] Keep `/admin/students`, `/admin/admissions`, `/admin/courses`, `/admin/sections`
- [ ] Ensure all admin pages use `<PageHeader>` component
- [ ] Test all admin functionality
- [ ] Commit: "Consolidate admin settings pages"

---

## Phase 3: Integration (Days 7-10)
**Goal**: Connect all components to backend API

### Day 7: Student Components Integration

**Priority Order:**
1. Academic Overview (stats API)
2. Academic Records Tab
3. Schedule Tab
4. Grades Tab
5. Enrollment flow
6. Billing Tab

**For Each Component:**
```typescript
// Pattern: Loading → Data Fetch → Display → Error Handling

export function ComponentName() {
  const [data, setData] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await service.method()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) return <Skeleton />
  if (error) return <Alert variant="destructive">{error}</Alert>
  
  return <ActualComponent data={data} />
}
```

**Checklist - Student Integration:**
- [ ] Connect Academic Overview to `/students/me` API
- [ ] Connect Academic Records to `/students/me/academic-records` API
- [ ] Connect Schedule to `/enrollments/me` API
- [ ] Connect Grades to `/enrollments/me` API
- [ ] Connect Billing to billing API (when available)
- [ ] Add loading states (Skeleton)
- [ ] Add error handling (Alert)
- [ ] Test with real backend
- [ ] Commit: "Integrate student dashboard with backend"

### Day 8: Faculty Components Integration

**Checklist - Faculty Integration:**
- [ ] Connect Faculty Overview to `/staff/me` API
- [ ] Connect My Courses to `/staff/me/sections` API
- [ ] Connect Gradebook to section enrollments API
- [ ] Connect Attendance to attendance API
- [ ] Connect Roster to section students API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real backend
- [ ] Commit: "Integrate faculty dashboard with backend"

### Day 9-10: Admin Pages Integration

**Checklist - Admin Integration:**
- [ ] Connect Students page to `/students` API (already done)
- [ ] Connect Admissions to `/admission-applications` API
- [ ] Connect Courses to `/courses` API
- [ ] Connect Sections to `/course-sections` API
- [ ] Connect Settings tabs to respective APIs
- [ ] Connect Reports to metrics API
- [ ] Add loading states everywhere
- [ ] Add error handling everywhere
- [ ] Test all CRUD operations
- [ ] Commit: "Integrate admin pages with backend"

---

## Phase 4: Deploy (Days 11-12)
**Goal**: Production ready

### Day 11: Polish & Testing

**Polish Checklist:**
- [ ] Add loading skeletons to all data-fetching components
- [ ] Add empty states with `<EmptyState>` component
- [ ] Add error boundaries for crash protection
- [ ] Add toast notifications for actions (success/error)
- [ ] Review all forms have validation
- [ ] Review all buttons have loading states
- [ ] Test all modals open/close correctly
- [ ] Test all tabs switch correctly

**Testing Checklist:**
- [ ] Test student flow: Login → Browse courses → Enroll → View schedule
- [ ] Test faculty flow: Login → View roster → Enter grades
- [ ] Test admin flow: Login → Manage students → Approve applications
- [ ] Test error cases: Network errors, validation errors
- [ ] Test with different roles (student, faculty, admin)
- [ ] Test responsive design (mobile, tablet, desktop)

### Day 12: Deploy

**Pre-Deploy Checklist:**
- [ ] Run `npm run build` - must succeed with zero errors
- [ ] Run `npm run lint` - fix all critical issues
- [ ] Test production build locally: `npm run start`
- [ ] Review environment variables for production
- [ ] Update `.env.production` with production API URL
- [ ] Remove any console.logs in production code

**Deploy Checklist:**
- [ ] Deploy backend to production (if not already)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Configure environment variables in hosting platform
- [ ] Test production URL with real accounts
- [ ] Create test accounts: student, faculty, admin
- [ ] Share with stakeholders for feedback

**Post-Deploy:**
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Create backlog for iteration 2
- [ ] Celebrate launch! 🎉

---

## Component Patterns Reference

### Pattern 1: Data Table Page
```typescript
// Use when: Displaying list of resources (students, courses, etc.)

export default function ResourcePage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Manage your resources"
        action={{
          label: "Add Resource",
          onClick: () => setIsCreateOpen(true),
          icon: <Plus className="mr-2 h-4 w-4" />
        }}
      />
      
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKey="name"
      />
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ResourceForm onSuccess={() => {
          setIsCreateOpen(false)
          fetchData() // Refresh
        }} />
      </Dialog>
    </div>
  )
}
```

### Pattern 2: Tabbed Dashboard
```typescript
// Use when: Multiple related views (student dashboard, faculty dashboard)

export function Dashboard() {
  const tabs = [
    { value: 'tab1', label: 'Tab 1', content: <Tab1Component /> },
    { value: 'tab2', label: 'Tab 2', content: <Tab2Component /> },
  ]
  
  return (
    <DashboardLayout
      title="Dashboard"
      tabs={tabs}
    />
  )
}
```

### Pattern 3: Form Modal
```typescript
// Use when: CRUD operations (create/edit/delete)

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: Resource
}

export function ResourceFormModal({ open, onOpenChange, onSuccess, initialData }: FormModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
  })
  
  async function onSubmit(data: FormData) {
    try {
      if (initialData) {
        await service.update(initialData.id, data)
      } else {
        await service.create(data)
      }
      toast({ title: "Success" })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} Resource</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
            <DialogFooter>
              <Button type="submit" loading={form.formState.isSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 4: Loading States
```typescript
// Use Skeleton for structure, Spinner for actions

// Page loading
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// Button loading
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

### Pattern 5: Error Handling
```typescript
// Use Alert for errors, Toast for feedback

if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

// For actions
try {
  await service.action()
  toast({
    title: "Success",
    description: "Action completed successfully"
  })
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  })
}
```

---

## Final Route Structure

### After Consolidation (15 routes)
```
/ (landing)
/auth/login
/dashboard (role-based: student/faculty/admin dashboard)
/profile
/messages
/documents

Admin only:
/admin/students
/admin/students/[id]
/admin/admissions
/admin/courses
/admin/sections
/admin/settings
/admin/reports

Shared:
/course-catalog (browsing, with enrollment modal)
```

---

## Success Criteria

### Week 1 Complete When:
- [ ] All dev/test pages deleted
- [ ] Build runs with zero errors
- [ ] Student dashboard created with all tabs
- [ ] Faculty dashboard created with all tabs
- [ ] Admin settings consolidated
- [ ] Shared components created

### Week 2 Complete When:
- [ ] All dashboards connected to backend
- [ ] All CRUD operations working
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Testing complete
- [ ] Deployed to production

### Launch Ready When:
- [ ] Zero build errors
- [ ] All pages < 300 lines
- [ ] All components reusable
- [ ] All features working with backend
- [ ] Professional UX (tabs, modals, loading states)
- [ ] Production URL accessible
- [ ] Test accounts created and shared

---

## Maintenance & Future

### Easy to Redesign Because:
- Shadcn components can be themed/restyled
- Components are isolated and reusable
- Change once, updates everywhere
- Can swap entire UI library if needed

### Easy to Add Features Because:
- Add tab to dashboard (not new route)
- Add section to settings (not new page)
- Reuse existing components
- Follow established patterns

### Easy to Maintain Because:
- DRY - no duplicated code
- Small, focused components
- Clear patterns to follow
- Professional architecture

---

## Notes

- Keep `AppShell`, `WidgetDashboard`, existing components - they're good
- Don't over-engineer - simple is better
- If a pattern works, reuse it
- Focus on user value, not page count
- Backend is solid - leverage it

**This is the right architecture for a professional university SIS.**
