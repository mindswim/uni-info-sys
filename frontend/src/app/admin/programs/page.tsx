"use client"

import { AppShell } from '@/components/layout/app-shell'
import { ProgramsTab } from '@/components/admin/programs-tab'

export default function AdminProgramsPage() {
  return (
    <AppShell>
      <ProgramsTab />
    </AppShell>
  )
}
