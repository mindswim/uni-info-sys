"use client"

import { AppShell } from '@/components/layout/app-shell'
import { SystemTab } from '@/components/admin/system-tab'

export default function AdminSystemPage() {
  return (
    <AppShell>
      <SystemTab />
    </AppShell>
  )
}
