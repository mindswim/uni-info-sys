"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AcademicRecordsTab } from '@/components/student/academic-records-tab'

export default function AcademicRecordsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Records</h1>
          <p className="text-muted-foreground">
            View your academic history and progress
          </p>
        </div>
        <AcademicRecordsTab />
      </div>
    </AppShell>
  )
}
