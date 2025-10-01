"use client"

import { AppShell } from '@/components/layout/app-shell'
import { DashboardLayout } from '@/components/layouts'
import { Users, BookOpen, ClipboardCheck, Award, Calendar, BarChart, MessageSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OverviewTab } from '@/components/faculty/overview-tab'
import { MyStudentsTab } from '@/components/faculty/my-students-tab'
import { SectionsTab } from '@/components/faculty/sections-tab'
import { CoursesTab } from '@/components/faculty/courses-tab'
import { AttendanceTab } from '@/components/faculty/attendance-tab'
import { GradesTab } from '@/components/faculty/grades-tab'
import { AdvisingTab } from '@/components/faculty/advising-tab'
import { AppointmentsTab } from '@/components/faculty/appointments-tab'

export default function FacultyDashboardPage() {
  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      icon: <BarChart className="h-4 w-4" />,
      content: <OverviewTab />
    },
    {
      value: 'students',
      label: 'My Students',
      icon: <Users className="h-4 w-4" />,
      content: <MyStudentsTab />
    },
    {
      value: 'sections',
      label: 'Sections',
      icon: <BookOpen className="h-4 w-4" />,
      content: <SectionsTab />
    },
    {
      value: 'courses',
      label: 'Course Management',
      icon: <Settings className="h-4 w-4" />,
      content: <CoursesTab />
    },
    {
      value: 'attendance',
      label: 'Attendance',
      icon: <ClipboardCheck className="h-4 w-4" />,
      content: <AttendanceTab />
    },
    {
      value: 'grades',
      label: 'Grades',
      icon: <Award className="h-4 w-4" />,
      content: <GradesTab />
    },
    {
      value: 'advising',
      label: 'Advising',
      icon: <MessageSquare className="h-4 w-4" />,
      content: <AdvisingTab />
    },
    {
      value: 'appointments',
      label: 'Appointments',
      icon: <Calendar className="h-4 w-4" />,
      content: <AppointmentsTab />
    }
  ]

  return (
    <AppShell>
      <DashboardLayout
        title="Faculty Dashboard"
        description="Manage your courses, students, and academic responsibilities"
        tabs={tabs}
        defaultTab="overview"
        action={
          <Button>
            Create Announcement
          </Button>
        }
      />
    </AppShell>
  )
}
