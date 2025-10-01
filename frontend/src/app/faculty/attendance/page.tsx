"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AttendanceTab } from '@/components/faculty/attendance-tab'

export default function AttendancePage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage student attendance
          </p>
        </div>
        <AttendanceTab />
      </div>
    </AppShell>
  )
}
