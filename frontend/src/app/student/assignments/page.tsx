"use client"

import { AppShell } from '@/components/layout/app-shell'
import { StudentAssignmentsTab } from '@/components/student/student-assignments-tab'

export default function StudentAssignmentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            View and submit your course assignments
          </p>
        </div>
        <StudentAssignmentsTab />
      </div>
    </AppShell>
  )
}
