"use client"

import { AppShell } from '@/components/layout/app-shell'
import { ReportsTab } from '@/components/admin/reports-tab'

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view system reports
          </p>
        </div>
        <ReportsTab />
      </div>
    </AppShell>
  )
}
