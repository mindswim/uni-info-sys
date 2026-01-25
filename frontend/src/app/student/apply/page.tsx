'use client'

import { AppShell } from '@/components/layout/app-shell'
import { ApplyTab } from '@/components/student/apply-tab'

export default function StudentApplyPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Submit and track your program applications
          </p>
        </div>
        <ApplyTab />
      </div>
    </AppShell>
  )
}
