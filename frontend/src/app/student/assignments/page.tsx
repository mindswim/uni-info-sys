"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AssignmentsTab } from '@/components/student/assignments-tab'

export default function AssignmentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            View and submit course assignments
          </p>
        </div>
        <AssignmentsTab />
      </div>
    </AppShell>
  )
}
