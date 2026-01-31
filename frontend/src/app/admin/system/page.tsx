"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { SystemTab } from '@/components/admin/system-tab'

export default function AdminSystemPage() {
  return (
    <AppShell>
      <PageShell>
        <SystemTab />
      </PageShell>
    </AppShell>
  )
}
