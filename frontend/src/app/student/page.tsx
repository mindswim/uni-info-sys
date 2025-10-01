"use client"

import { AppShell } from '@/components/layout/app-shell'
import { DashboardLayout } from '@/components/layouts'
import { GraduationCap, Calendar, BookOpen, FileText, CreditCard, Home, Briefcase, ClipboardList, Award, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AcademicRecordsTab } from '@/components/student/academic-records-tab'
import { ScheduleTab } from '@/components/student/schedule-tab'
import { EnrollmentsTab } from '@/components/student/enrollments-tab'
import { RegistrationTab } from '@/components/student/registration-tab'
import { AssignmentsTab } from '@/components/student/assignments-tab'
import { GradesTab } from '@/components/student/grades-tab'
import { TranscriptsTab } from '@/components/student/transcripts-tab'
import { PaymentsTab } from '@/components/student/payments-tab'
import { MealPlansTab } from '@/components/student/meal-plans-tab'
import { HousingTab } from '@/components/student/housing-tab'
import { CareerTab } from '@/components/student/career-tab'

export default function StudentDashboardPage() {
  const tabs = [
    {
      value: 'academic-records',
      label: 'Academic Records',
      icon: <Award className="h-4 w-4" />,
      content: <AcademicRecordsTab />
    },
    {
      value: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      content: <ScheduleTab />
    },
    {
      value: 'enrollments',
      label: 'Enrollments',
      icon: <BookOpen className="h-4 w-4" />,
      content: <EnrollmentsTab />
    },
    {
      value: 'registration',
      label: 'Registration',
      icon: <ClipboardList className="h-4 w-4" />,
      content: <RegistrationTab />
    },
    {
      value: 'assignments',
      label: 'Assignments',
      icon: <Clock className="h-4 w-4" />,
      content: <AssignmentsTab />
    },
    {
      value: 'grades',
      label: 'Grades',
      icon: <Award className="h-4 w-4" />,
      content: <GradesTab />
    },
    {
      value: 'transcripts',
      label: 'Transcripts',
      icon: <FileText className="h-4 w-4" />,
      content: <TranscriptsTab />
    },
    {
      value: 'payments',
      label: 'Payments',
      icon: <CreditCard className="h-4 w-4" />,
      content: <PaymentsTab />
    },
    {
      value: 'meal-plans',
      label: 'Meal Plans',
      icon: <GraduationCap className="h-4 w-4" />,
      content: <MealPlansTab />
    },
    {
      value: 'housing',
      label: 'Housing',
      icon: <Home className="h-4 w-4" />,
      content: <HousingTab />
    },
    {
      value: 'career',
      label: 'Career Services',
      icon: <Briefcase className="h-4 w-4" />,
      content: <CareerTab />
    }
  ]

  return (
    <AppShell>
      <DashboardLayout
        title="Student Dashboard"
        description="Manage your academic information and services"
        tabs={tabs}
        defaultTab="academic-records"
        action={
          <Button>
            Request Support
          </Button>
        }
      />
    </AppShell>
  )
}
