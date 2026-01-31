"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { GraduationTab } from '@/components/student/graduation-tab'

export default function StudentGraduationPage() {
  return (
    <AppShell>
      <PageShell title="Graduation" description="Apply for graduation and track your application status">
        <GraduationTab />
      </PageShell>
    </AppShell>
  )
}
