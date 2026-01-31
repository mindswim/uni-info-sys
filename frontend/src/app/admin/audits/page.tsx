"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AuditsTab } from '@/components/admin/audits-tab'

export default function AuditsPage() {
  return (
    <AppShell>
      <PageShell title="Audit Log" description="View system-wide change history and audit trail">
        <AuditsTab />
      </PageShell>
    </AppShell>
  )
}
