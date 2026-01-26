"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Calendar, Clock, Video, MapPin, User, CheckCircle,
  XCircle, MessageSquare, ChevronLeft, ChevronRight, Users
} from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Appointment {
  id: number
  student_name: string
  student_email: string
  student_id: string
  date: string
  time: string
  duration: number // minutes
  type: 'in-person' | 'virtual'
  topic: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
}

export default function AppointmentsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  // Mock appointments
  const appointments: Appointment[] = [
    {
      id: 1,
      student_name: 'Maria Rodriguez',
      student_email: 'mrodriguez@university.edu',
      student_id: 'STU001',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '10:00 AM',
      duration: 30,
      type: 'in-person',
      topic: 'Course selection for next semester',
      status: 'scheduled',
    },
    {
      id: 2,
      student_name: 'Sophie Turner',
      student_email: 'sturner@university.edu',
      student_id: 'STU003',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '2:30 PM',
      duration: 45,
      type: 'virtual',
      topic: 'Academic recovery plan discussion',
      status: 'scheduled',
    },
    {
      id: 3,
      student_name: 'David Park',
      student_email: 'dpark@university.edu',
      student_id: 'STU002',
      date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      time: '11:00 AM',
      duration: 30,
      type: 'in-person',
      topic: 'Graduation requirements review',
      status: 'scheduled',
    },
    {
      id: 4,
      student_name: 'Emma Johnson',
      student_email: 'ejohnson@university.edu',
      student_id: 'STU005',
      date: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
      time: '3:00 PM',
      duration: 30,
      type: 'virtual',
      topic: 'First-year advising check-in',
      status: 'completed',
      notes: 'Student is doing well. Discussed research opportunities for summer.',
    },
    {
      id: 5,
      student_name: 'James Wilson',
      student_email: 'jwilson@university.edu',
      student_id: 'STU004',
      date: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
      time: '10:30 AM',
      duration: 30,
      type: 'in-person',
      topic: 'Academic warning discussion',
      status: 'no-show',
    },
  ]

  // Get week days
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i))

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt =>
      apt.date === format(date, 'yyyy-MM-dd') && apt.status === 'scheduled'
    )
  }

  // Stats
  const upcomingCount = appointments.filter(a => a.status === 'scheduled').length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const noShowCount = appointments.filter(a => a.status === 'no-show').length

  const handleComplete = () => {
    if (!selectedAppointment) return
    toast({ title: 'Appointment marked as complete' })
    setShowCompleteDialog(false)
    setSelectedAppointment(null)
    setNotes('')
  }

  const handleCancel = () => {
    if (!selectedAppointment) return
    toast({ title: 'Appointment cancelled' })
    setShowDetailDialog(false)
    setSelectedAppointment(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-sm text-muted-foreground">
              Manage advising appointments with students
            </p>
          </div>
          <Button asChild>
            <Link href="/faculty/advisees">
              <Users className="h-4 w-4 mr-2" />
              View Advisees
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingCount}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{noShowCount}</p>
                  <p className="text-xs text-muted-foreground">No-Shows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Weekly Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[180px] text-center">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 4), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                >
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[200px] rounded-lg border p-3 ${
                      isToday ? 'bg-primary/5 border-primary' : ''
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">{format(day, 'EEEE')}</p>
                      <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {dayAppointments.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No appointments
                        </p>
                      ) : (
                        dayAppointments.map((apt) => (
                          <button
                            key={apt.id}
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setShowDetailDialog(true)
                            }}
                            className="w-full text-left p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            <p className="text-xs font-medium">{apt.time}</p>
                            <p className="text-xs truncate">{apt.student_name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {apt.type === 'virtual' ? (
                                <Video className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {apt.duration}min
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* All Appointments List */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="Students can schedule appointments through the advising portal."
                variant="card"
              />
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {appointments
                      .filter(a => a.status === 'scheduled')
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setShowDetailDialog(true)
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {apt.student_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{apt.student_name}</p>
                              <p className="text-sm text-muted-foreground">{apt.topic}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {format(new Date(apt.date), 'EEE, MMM d')}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {apt.time}
                              {apt.type === 'virtual' && <Video className="h-3 w-3 ml-2" />}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {appointments
                    .filter(a => a.status !== 'scheduled')
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {apt.student_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{apt.student_name}</p>
                            <p className="text-sm text-muted-foreground">{apt.topic}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.date), 'MMM d, yyyy')}
                          </p>
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Appointment Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedAppointment.student_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">{selectedAppointment.student_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.student_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.date), 'EEEE, MMMM d')}
                    </p>
                    <p className="text-sm">{selectedAppointment.time} ({selectedAppointment.duration} min)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <div className="flex items-center gap-2">
                      {selectedAppointment.type === 'virtual' ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span>Virtual Meeting</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>In-Person</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Topic</p>
                  <p>{selectedAppointment.topic}</p>
                </div>

                <div className="flex gap-2">
                  {selectedAppointment.type === 'virtual' ? (
                    <Button className="flex-1">
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Call
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setShowDetailDialog(false)
                        setShowCompleteDialog(true)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="ghost" className="text-red-600" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Complete Appointment Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Appointment</DialogTitle>
              <DialogDescription>
                Add notes about the meeting for your records.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meeting Notes</Label>
                <Textarea
                  placeholder="What was discussed? Any action items?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
