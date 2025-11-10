'use client'

import { AttendanceTab } from '@/components/faculty/attendance-tab'

export default function FacultyAttendancePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
        <p className="text-muted-foreground">
          Record and manage student attendance for your courses
        </p>
      </div>
      <AttendanceTab />
    </div>
  )
}
