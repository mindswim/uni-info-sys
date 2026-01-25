'use client'

import { AppShell } from '@/components/layout/app-shell'
import { AdmissionsStatusTab } from '@/components/student/admissions-status-tab'

export default function StudentAdmissionsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
          <p className="text-muted-foreground">
            Track your admission application progress and view decisions
          </p>
        </div>
        <AdmissionsStatusTab />
      </div>
    </AppShell>
  )
}
