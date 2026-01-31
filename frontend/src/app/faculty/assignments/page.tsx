"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AssignmentsTab } from '@/components/faculty/assignments-tab'

export default function AssignmentsPage() {
  return (
    <AppShell>
      <PageShell title="Assignments" description="Create and manage course assignments">
        <AssignmentsTab />
      </PageShell>
    </AppShell>
  )
}
