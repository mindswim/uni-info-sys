"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { OverviewTab } from '@/components/faculty/overview-tab'

export default function FacultyOverviewPage() {
  return (
    <AppShell>
      <PageShell>
        <OverviewTab />
      </PageShell>
    </AppShell>
  )
}
