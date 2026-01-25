'use client'

import { CalendarTab } from '@/components/student/calendar-tab'

export default function StudentCalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">
          View important dates, deadlines, and events for your courses and the university
        </p>
      </div>
      <CalendarTab />
    </div>
  )
}
