'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { CalendarTab } from '@/components/student/calendar-tab'

export default function StudentCalendarPage() {
  return (
    <AppShell>
      <PageShell>
        <CalendarTab />
      </PageShell>
    </AppShell>
  )
}
