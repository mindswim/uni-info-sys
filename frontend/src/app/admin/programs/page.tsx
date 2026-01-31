"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { ProgramsTab } from '@/components/admin/programs-tab'

export default function AdminProgramsPage() {
  return (
    <AppShell>
      <PageShell>
        <ProgramsTab />
      </PageShell>
    </AppShell>
  )
}
