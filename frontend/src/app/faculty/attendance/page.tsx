'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AttendanceTab } from '@/components/faculty/attendance-tab'

export default function FacultyAttendancePage() {
  return (
    <AppShell>
      <PageShell title="Attendance Tracking" description="Record and manage student attendance for your courses">
        <AttendanceTab />
      </PageShell>
    </AppShell>
  )
}
