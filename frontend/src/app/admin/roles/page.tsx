"use client"

import { AppShell } from '@/components/layout/app-shell'
import { RolesTab } from '@/components/admin/roles-tab'

export default function AdminRolesPage() {
  return (
    <AppShell>
      <RolesTab />
    </AppShell>
  )
}
