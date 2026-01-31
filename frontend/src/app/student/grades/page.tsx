"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { GradesTab } from '@/components/student/grades-tab'

export default function GradesPage() {
  return (
    <AppShell>
      <PageShell>
        <GradesTab />
      </PageShell>
    </AppShell>
  )
}
