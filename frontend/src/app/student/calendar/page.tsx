'use client'

import { AppShell } from '@/components/layout/app-shell'
import { CalendarTab } from '@/components/student/calendar-tab'

export default function StudentCalendarPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">
            View important dates, deadlines, and events for your courses and the university
          </p>
        </div>
        <CalendarTab />
      </div>
    </AppShell>
  )
}
