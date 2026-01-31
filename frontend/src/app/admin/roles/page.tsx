"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { RolesTab } from '@/components/admin/roles-tab'

export default function AdminRolesPage() {
  return (
    <AppShell>
      <PageShell>
        <RolesTab />
      </PageShell>
    </AppShell>
  )
}
