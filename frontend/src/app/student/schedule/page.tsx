"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { ScheduleTab } from '@/components/student/schedule-tab'

export default function SchedulePage() {
  return (
    <AppShell>
      <PageShell>
        <ScheduleTab />
      </PageShell>
    </AppShell>
  )
}
