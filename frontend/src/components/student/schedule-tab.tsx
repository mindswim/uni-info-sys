"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layouts"
import { Calendar, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { studentService } from "@/services"
import type { Enrollment } from "@/types/api-types"

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

interface ScheduleEvent {
  courseCode: string
  courseTitle: string
  section: string
  startTime: string
  endTime: string
  days: string[]
}

export function ScheduleTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const student = await studentService.getCurrentProfile()

        const scheduleEvents: ScheduleEvent[] = (student.enrollments || [])
          .filter(e => e.status === 'enrolled' && e.course_section)
          .map(e => ({
            courseCode: e.course_section!.course?.course_code || '',
            courseTitle: e.course_section!.course?.title || '',
            section: e.course_section!.section_number || '',
            startTime: e.course_section!.start_time || '',
            endTime: e.course_section!.end_time || '',
            days: e.course_section!.schedule_days || []
          }))

        setEvents(scheduleEvents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="No classes scheduled"
            description="Your schedule will appear here once courses are enrolled"
          />
        </CardContent>
      </Card>
    )
  }

  const getEventForDayAndTime = (day: string, timeSlot: string) => {
    return events.find(event => {
      if (!event.days.includes(day)) return false
      const eventStart = event.startTime.substring(0, 5)
      return eventStart === timeSlot
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {events.length} class{events.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="text-sm font-medium text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="space-y-1">
                {TIME_SLOTS.map(timeSlot => (
                  <div key={timeSlot} className="grid grid-cols-6 gap-2">
                    <div className="text-xs text-muted-foreground py-2">
                      {timeSlot}
                    </div>
                    {DAYS.map(day => {
                      const event = getEventForDayAndTime(day, timeSlot)
                      return (
                        <div key={day} className="min-h-[60px]">
                          {event ? (
                            <div className="bg-primary/10 border-l-2 border-primary rounded p-2 h-full">
                              <div className="text-xs font-medium">{event.courseCode}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {event.courseTitle}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Sec {event.section}
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed border-muted rounded h-full" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{event.courseCode}</span>
                  </div>
                  <div>
                    <div className="font-medium">{event.courseTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      Section {event.section}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{event.days.join(', ')}</div>
                  <div className="text-muted-foreground">
                    {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
