"use client"

import { AppShell } from '@/components/layout/app-shell'
import { ScheduleTab } from '@/components/student/schedule-tab'

export default function SchedulePage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage your class schedule
          </p>
        </div>
        <ScheduleTab />
      </div>
    </AppShell>
  )
}
