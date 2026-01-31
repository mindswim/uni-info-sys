"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { StudentAssignmentsTab } from '@/components/student/student-assignments-tab'

export default function StudentAssignmentsPage() {
  return (
    <AppShell>
      <PageShell title="Assignments" description="View and submit your course assignments">
        <StudentAssignmentsTab />
      </PageShell>
    </AppShell>
  )
}
