"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, BookOpen, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_ABBREVS: Record<string, string> = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'R': 'Thursday',
  'F': 'Friday',
  'Monday': 'Monday',
  'Tuesday': 'Tuesday',
  'Wednesday': 'Wednesday',
  'Thursday': 'Thursday',
  'Friday': 'Friday',
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

interface ScheduleEvent {
  id: number
  courseCode: string
  courseTitle: string
  section: string
  startTime: string
  endTime: string
  days: string[]
  instructor?: string
  location?: string
  credits: number
}

// Color palette for courses
const COURSE_COLORS = [
  'bg-blue-100 border-blue-500 text-blue-900',
  'bg-green-100 border-green-500 text-green-900',
  'bg-purple-100 border-purple-500 text-purple-900',
  'bg-amber-100 border-amber-500 text-amber-900',
  'bg-pink-100 border-pink-500 text-pink-900',
  'bg-cyan-100 border-cyan-500 text-cyan-900',
  'bg-orange-100 border-orange-500 text-orange-900',
]

export function ScheduleTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = sessionStorage.getItem('auth_token')

      // Fetch enrollments directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me/enrollments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to load schedule')

      const data = await response.json()
      const enrollments = data.data || []

      const scheduleEvents: ScheduleEvent[] = enrollments
        .filter((e: any) => e.status === 'enrolled' && e.course_section)
        .map((e: any) => {
          const section = e.course_section
          const course = section?.course || {}

          // Parse schedule days from various formats
          let scheduleDays: string[] = []
          if (Array.isArray(section.schedule_days)) {
            scheduleDays = section.schedule_days
          } else if (typeof section.schedule_days === 'string') {
            // Handle formats like "Mon,Wed,Fri" or "MWF"
            scheduleDays = section.schedule_days.split(/[,\s]+/)
          }

          // Normalize day names
          scheduleDays = scheduleDays
            .map((d: string) => DAY_ABBREVS[d.trim()] || d.trim())
            .filter((d: string) => DAYS.includes(d))

          return {
            id: e.id,
            courseCode: course.course_code || '',
            courseTitle: course.title || course.course_name || '',
            section: section.section_number || '',
            startTime: section.start_time || section.schedule_time?.split('-')[0]?.trim() || '',
            endTime: section.end_time || section.schedule_time?.split('-')[1]?.trim() || '',
            days: scheduleDays,
            instructor: section.instructor?.user?.name || section.instructor?.name,
            location: section.room
              ? `${section.room.building?.code || section.room.building?.name || ''} ${section.room.room_number}`
              : section.location,
            credits: course.credits || 3,
          }
        })
        .filter((e: ScheduleEvent) => e.courseCode && e.days.length > 0)

      setEvents(scheduleEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

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
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSchedule} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
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
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No classes scheduled</h3>
            <p className="text-muted-foreground">
              Your schedule will appear here once you enroll in courses
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Create color map for courses
  const courseColorMap = new Map<string, string>()
  events.forEach((event, idx) => {
    if (!courseColorMap.has(event.courseCode)) {
      courseColorMap.set(event.courseCode, COURSE_COLORS[idx % COURSE_COLORS.length])
    }
  })

  const getEventForDayAndTime = (day: string, timeSlot: string) => {
    return events.find(event => {
      if (!event.days.includes(day)) return false
      const eventStart = event.startTime.substring(0, 5)
      return eventStart === timeSlot
    })
  }

  const totalCredits = events.reduce((sum, e) => sum + e.credits, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + e.days.length, 0)}/week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchSchedule}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="text-sm font-medium text-center py-2 bg-muted rounded">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="space-y-1">
                {TIME_SLOTS.map(timeSlot => (
                  <div key={timeSlot} className="grid grid-cols-6 gap-2">
                    <div className="text-xs text-muted-foreground py-2 font-mono">
                      {timeSlot}
                    </div>
                    {DAYS.map(day => {
                      const event = getEventForDayAndTime(day, timeSlot)
                      return (
                        <div key={day} className="min-h-[70px]">
                          {event ? (
                            <div className={`border-l-4 rounded p-2 h-full ${courseColorMap.get(event.courseCode)}`}>
                              <div className="text-xs font-bold">{event.courseCode}</div>
                              <div className="text-xs truncate opacity-90">
                                {event.courseTitle}
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                              </div>
                              {event.location && (
                                <div className="text-xs opacity-75 truncate">
                                  {event.location}
                                </div>
                              )}
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

      {/* Course Details List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border-l-4 rounded-lg bg-muted/30 ${courseColorMap.get(event.courseCode)?.replace('bg-', 'border-').split(' ')[1] || 'border-primary'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{event.courseCode}</span>
                      <Badge variant="outline">Section {event.section}</Badge>
                      <Badge variant="secondary">{event.credits} credits</Badge>
                    </div>
                    <div className="text-muted-foreground">{event.courseTitle}</div>
                  </div>
                </div>

                <div className="grid gap-3 mt-4 md:grid-cols-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{event.days.join(', ')}</span>
                      <span className="text-muted-foreground ml-2">
                        {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  {event.instructor && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{event.instructor}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
