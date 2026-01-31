"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { EnrollmentsTab } from '@/components/student/enrollments-tab'

export default function EnrollmentsPage() {
  return (
    <AppShell>
      <PageShell title="Enrollments" description="View and manage your course enrollments">
        <EnrollmentsTab />
      </PageShell>
    </AppShell>
  )
}
