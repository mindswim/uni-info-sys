"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { GradesTab } from '@/components/admin/grades-tab'

export default function AdminGradesPage() {
  return (
    <AppShell>
      <PageShell>
        <GradesTab />
      </PageShell>
    </AppShell>
  )
}
