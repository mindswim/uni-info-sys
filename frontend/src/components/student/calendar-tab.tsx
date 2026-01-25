'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  GraduationCap,
  AlertCircle,
  BookOpen,
  CalendarDays,
  Filter,
  List,
  LayoutGrid
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns'

interface CalendarEvent {
  id: number
  title: string
  description: string | null
  start: string
  end: string
  all_day: boolean
  location: string | null
  type: string
  type_label: string
  color: string
  visibility: string
  is_cancelled: boolean
  cancellation_reason: string | null
  creator: {
    id: number
    name: string
  } | null
  term: {
    id: number
    name: string
  } | null
  course_section: {
    id: number
    section_number: string
    course: {
      id: number
      code: string
      title: string
    }
  } | null
  department: {
    id: number
    name: string
  } | null
}

const TYPE_ICONS: Record<string, any> = {
  general: CalendarDays,
  academic: GraduationCap,
  deadline: AlertCircle,
  meeting: User,
  class: BookOpen,
  exam: AlertCircle,
  holiday: Calendar,
  orientation: User,
  registration: BookOpen,
}

export function CalendarTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const start = startOfMonth(subMonths(currentDate, 1)).toISOString()
      const end = endOfMonth(addMonths(currentDate, 1)).toISOString()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/me?start=${start}&end=${end}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events
    return events.filter(e => e.type === filterType)
  }, [events, filterType])

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = parseISO(event.start)
      const eventEnd = parseISO(event.end)
      return (
        isSameDay(eventStart, day) ||
        (eventStart <= day && eventEnd >= day)
      )
    })
  }

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(e => parseISO(e.start) >= new Date() && !e.is_cancelled)
      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
      .slice(0, 5)
  }, [filteredEvents])

  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type))
    return Array.from(types)
  }, [events])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('calendar')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Calendar/List View */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              {viewMode === 'calendar' ? (
                <div className="space-y-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(day => {
                      const dayEvents = getEventsForDay(day)
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isCurrentDay = isToday(day)

                      return (
                        <div
                          key={day.toISOString()}
                          className={`min-h-[100px] p-1 border rounded-lg transition-colors ${
                            !isCurrentMonth ? 'bg-muted/30' : 'bg-background'
                          } ${isCurrentDay ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            !isCurrentMonth ? 'text-muted-foreground' : ''
                          } ${isCurrentDay ? 'text-primary' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="w-full text-left text-xs px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: event.color + '20', color: event.color }}
                              >
                                {event.title}
                              </button>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No events found</p>
                    </div>
                  ) : (
                    filteredEvents
                      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
                      .map(event => {
                        const EventIcon = TYPE_ICONS[event.type] || CalendarDays
                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: event.color + '20' }}
                              >
                                <EventIcon className="h-4 w-4" style={{ color: event.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium truncate">{event.title}</h4>
                                  <Badge variant="outline" style={{ borderColor: event.color, color: event.color }}>
                                    {event.type_label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.all_day
                                    ? format(parseISO(event.start), 'MMM d, yyyy')
                                    : `${format(parseISO(event.start), 'MMM d, h:mm a')} - ${format(parseISO(event.end), 'h:mm a')}`
                                  }
                                </p>
                                {event.location && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Next 5 events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const EventIcon = TYPE_ICONS[event.type] || CalendarDays
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="p-1.5 rounded"
                            style={{ backgroundColor: event.color + '20' }}
                          >
                            <EventIcon className="h-3 w-3" style={{ color: event.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{event.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(event.start), 'MMM d')}
                              {!event.all_day && ` at ${format(parseISO(event.start), 'h:mm a')}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(TYPE_ICONS).map(([type, Icon]) => {
                  const event = events.find(e => e.type === type)
                  const color = event?.color || '#6B7280'
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="capitalize">{type}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: selectedEvent.color + '20' }}
                  >
                    {(() => {
                      const EventIcon = TYPE_ICONS[selectedEvent.type] || CalendarDays
                      return <EventIcon className="h-5 w-5" style={{ color: selectedEvent.color }} />
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                    <DialogDescription>
                      <Badge
                        variant="outline"
                        className="mt-1"
                        style={{ borderColor: selectedEvent.color, color: selectedEvent.color }}
                      >
                        {selectedEvent.type_label}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {selectedEvent.is_cancelled && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    This event has been cancelled.
                    {selectedEvent.cancellation_reason && (
                      <p className="mt-1 text-muted-foreground">
                        Reason: {selectedEvent.cancellation_reason}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      {selectedEvent.all_day ? (
                        <span>{format(parseISO(selectedEvent.start), 'EEEE, MMMM d, yyyy')}</span>
                      ) : (
                        <>
                          <div>{format(parseISO(selectedEvent.start), 'EEEE, MMMM d, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {format(parseISO(selectedEvent.start), 'h:mm a')} - {format(parseISO(selectedEvent.end), 'h:mm a')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.course_section && (
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedEvent.course_section.course.code}: {selectedEvent.course_section.course.title}
                      </span>
                    </div>
                  )}

                  {selectedEvent.department && (
                    <div className="flex items-center gap-3 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.department.name}</span>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.creator && (
                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    Created by {selectedEvent.creator.name}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
