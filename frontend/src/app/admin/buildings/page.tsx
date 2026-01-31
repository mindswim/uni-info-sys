"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { BuildingsTab } from '@/components/admin/buildings-tab'

export default function BuildingsManagementPage() {
  return (
    <AppShell>
      <PageShell title="Buildings & Rooms" description="Manage campus infrastructure and facilities">
        <BuildingsTab />
      </PageShell>
    </AppShell>
  )
}
