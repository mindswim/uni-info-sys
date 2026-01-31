"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { GradesTab } from '@/components/faculty/grades-tab'

export default function GradesPage() {
  return (
    <AppShell>
      <PageShell title="Grades" description="Enter and manage student grades">
        <GradesTab />
      </PageShell>
    </AppShell>
  )
}
