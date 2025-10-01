'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { enrollmentService } from '@/services'
import type { ScheduleResponse } from '@/types/api-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Calendar, Clock, MapPin, Users, BookOpen,
  ChevronLeft, ChevronRight, Download, Printer,
  Bell, Video, Monitor, FileText
} from 'lucide-react'

interface ClassSchedule {
  id: number
  course_code: string
  course_name: string
  section: string
  instructor: string
  days: string[]
  start_time: string
  end_time: string
  location: string
  room: string
  type: 'lecture' | 'lab' | 'seminar' | 'tutorial'
  color: string
}

interface Event {
  id: number
  title: string
  type: 'exam' | 'assignment' | 'quiz' | 'presentation' | 'holiday'
  date: string
  time: string
  course?: string
  location?: string
  description?: string
}

interface OfficeHours {
  instructor: string
  course: string
  day: string
  time: string
  location: string
  type: 'in-person' | 'virtual'
}

// Transform API schedule data to page format
const transformScheduleData = (scheduleResponse: ScheduleResponse) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-orange-100 text-orange-800 border-orange-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-cyan-100 text-cyan-800 border-cyan-300'
  ]

  const classes: ClassSchedule[] = scheduleResponse.enrollments.map((enrollment, idx) => {
    const section = enrollment.course_section
    const meetingDays = section.meeting_days?.split(',').map((d: string) => {
      const dayMap: Record<string, string> = {
        'M': 'Monday', 'T': 'Tuesday', 'W': 'Wednesday',
        'R': 'Thursday', 'F': 'Friday', 'S': 'Saturday', 'U': 'Sunday'
      }
      return dayMap[d.trim()] || d
    }) || []

    return {
      id: enrollment.id,
      course_code: section.course.code,
      course_name: section.course.name,
      section: section.section_number,
      instructor: section.instructor ?
        `${section.instructor.first_name} ${section.instructor.last_name}` :
        'TBA',
      days: meetingDays,
      start_time: section.start_time || '00:00',
      end_time: section.end_time || '00:00',
      location: section.room?.building.name || 'TBA',
      room: section.room ? `${section.room.building.code} ${section.room.room_number}` : 'TBA',
      type: (section.section_type || 'lecture') as 'lecture' | 'lab' | 'seminar' | 'tutorial',
      color: colors[idx % colors.length]
    }
  })

  // For now, return empty arrays for events and office hours
  // These would come from additional API endpoints
  const events: Event[] = []
  const officeHours: OfficeHours[] = []

  return { classes, events, officeHours }
}

export default function SchedulePage() {
  const [data, setData] = useState<ReturnType<typeof transformScheduleData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = current week
  const [viewType, setViewType] = useState<'week' | 'day' | 'month'>('week')

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8 // Start at 8 AM
    return `${hour.toString().padStart(2, '0')}:00`
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const scheduleResponse = await enrollmentService.getCurrentSchedule()
        const transformedData = transformScheduleData(scheduleResponse)
        setData(transformedData)
      } catch (err) {
        console.error('Failed to fetch schedule:', err)
        setError(err instanceof Error ? err.message : 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AppShell breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedule' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedule' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Schedule</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  if (!data || data.classes.length === 0) {
    return (
      <AppShell breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedule' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Classes Scheduled</CardTitle>
              <CardDescription>You don't have any classes scheduled for the current term</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppShell>
    )
  }

  const { classes, events, officeHours } = data

  // Helper function to check if a class occurs at a specific time
  const getClassAtTime = (day: string, time: string) => {
    return classes.find(cls => {
      if (!cls.days.includes(day)) return false
      const timeNum = parseInt(time.split(':')[0])
      const startNum = parseInt(cls.start_time.split(':')[0])
      const endNum = parseInt(cls.end_time.split(':')[0])
      return timeNum >= startNum && timeNum < endNum
    })
  }

  // Get week label
  const getWeekLabel = () => {
    if (currentWeek === 0) return 'Current Week'
    if (currentWeek > 0) return `${currentWeek} week${currentWeek > 1 ? 's' : ''} ahead`
    return `${Math.abs(currentWeek)} week${Math.abs(currentWeek) > 1 ? 's' : ''} ago`
  }

  // Get upcoming events
  const upcomingEvents = events.slice(0, 5)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Schedule' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Class Schedule
            </h1>
            <p className="text-muted-foreground">Fall 2024 Semester</p>
          </div>
        <div className="flex items-center gap-2">
          <Select value={viewType} onValueChange={(v: any) => setViewType(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">Classes this term</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">Hours per week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{officeHours.length}</p>
                <p className="text-xs text-muted-foreground">Office hours available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Week View</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(currentWeek - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm font-medium">{getWeekLabel()}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(currentWeek + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {currentWeek !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(0)}
                      className="ml-2"
                    >
                      Today
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Days header */}
                  <div className="grid grid-cols-6 gap-1 mb-1">
                    <div className="p-2 text-center text-sm font-medium text-muted-foreground">Time</div>
                    {weekDays.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-6 gap-1 mb-1">
                      <div className="p-2 text-right text-sm text-muted-foreground">
                        {time}
                      </div>
                      {weekDays.map(day => {
                        const classAtTime = getClassAtTime(day, time)
                        const isFirstSlot = classAtTime && time === classAtTime.start_time.split(':')[0] + ':00'

                        if (classAtTime && isFirstSlot) {
                          const duration = parseInt(classAtTime.end_time.split(':')[0]) - parseInt(classAtTime.start_time.split(':')[0])
                          return (
                            <div
                              key={`${day}-${time}`}
                              className={`p-2 rounded-md border ${classAtTime.color}`}
                              style={{
                                gridRow: `span ${duration}`,
                                minHeight: `${duration * 60}px`
                              }}
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{classAtTime.course_code}</p>
                                <p className="text-xs">{classAtTime.course_name}</p>
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  <MapPin className="h-3 w-3" />
                                  {classAtTime.room}
                                </div>
                                <p className="text-xs opacity-75">{classAtTime.instructor}</p>
                              </div>
                            </div>
                          )
                        } else if (classAtTime && !isFirstSlot) {
                          // Skip rendering for continuation slots
                          return <div key={`${day}-${time}`} className="hidden"></div>
                        } else {
                          return (
                            <div key={`${day}-${time}`} className="p-2 border rounded-md bg-gray-50/50">
                              {/* Empty slot */}
                            </div>
                          )
                        }
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Classes</CardTitle>
              <CardDescription>{classes.length} classes this semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {classes.map(cls => (
                  <Card key={cls.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{cls.course_code} - {cls.course_name}</CardTitle>
                          <CardDescription>Section {cls.section}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {cls.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cls.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{cls.days.join(', ')} • {cls.start_time} - {cls.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{cls.location}, Room {cls.room}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Exams, assignments, and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {event.type === 'exam' && <FileText className="h-6 w-6 text-primary" />}
                        {event.type === 'assignment' && <BookOpen className="h-6 w-6 text-primary" />}
                        {event.type === 'quiz' && <Monitor className="h-6 w-6 text-primary" />}
                        {event.type === 'presentation' && <Users className="h-6 w-6 text-primary" />}
                        {event.type === 'holiday' && <Calendar className="h-6 w-6 text-primary" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant={event.type === 'exam' ? 'destructive' : 'secondary'}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.course && (
                        <Badge variant="outline" className="mt-2">
                          {event.course}
                        </Badge>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Office Hours Tab */}
        <TabsContent value="office-hours">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Office Hours</CardTitle>
              <CardDescription>Available times to meet with your instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {officeHours.map((hours, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">{hours.instructor}</p>
                      <p className="text-sm text-muted-foreground">{hours.course}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {hours.day}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {hours.time}
                        </span>
                        <span className="flex items-center gap-1">
                          {hours.type === 'virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {hours.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant={hours.type === 'virtual' ? 'secondary' : 'default'}>
                      {hours.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppShell>
  )
}