"use client"

import { AppShell } from '@/components/layout/app-shell'
import { DepartmentsTab } from '@/components/admin/departments-tab'

export default function DepartmentsPage() {
  return (
    <AppShell>
      <DepartmentsTab />
    </AppShell>
  )
}
