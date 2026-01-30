"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AuditsTab } from '@/components/admin/audits-tab'

export default function AuditsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            View system-wide change history and audit trail
          </p>
        </div>
        <AuditsTab />
      </div>
    </AppShell>
  )
}
