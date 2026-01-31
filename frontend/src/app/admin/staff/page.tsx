"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { StaffTab } from '@/components/admin/staff-tab'

export default function StaffManagementPage() {
  return (
    <AppShell>
      <PageShell title="Staff Management" description="Manage staff members and their roles">
        <StaffTab />
      </PageShell>
    </AppShell>
  )
}
