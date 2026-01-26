"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { AppointmentAPI } from '@/lib/api-client'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  User, Mail, Phone, MapPin, Calendar, Clock, Video,
  MessageSquare, ExternalLink, CheckCircle, Building
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface Advisor {
  id: number
  name: string
  title: string
  email: string
  phone: string
  office: string
  department: string
  photo?: string
  officeHours: string
  specializations: string[]
}

interface Appointment {
  id: number
  date: string
  time: string
  type: 'in-person' | 'virtual'
  topic: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'no_show'
}

// Helper functions to transform API data
function getAdvisorName(advisor: any): string {
  return advisor?.user?.name || 'Unknown Advisor'
}

function getAdvisorEmail(advisor: any): string {
  return advisor?.user?.email || ''
}

function getAdvisorDepartment(advisor: any): string {
  return advisor?.department?.name || 'Department'
}

function formatAppointmentTime(scheduledAt: string): string {
  try {
    return format(new Date(scheduledAt), 'h:mm a')
  } catch {
    return ''
  }
}

function formatAppointmentDate(scheduledAt: string): string {
  try {
    return format(new Date(scheduledAt), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

function getAppointmentType(apt: any): 'in-person' | 'virtual' {
  return apt.meeting_link ? 'virtual' : 'in-person'
}

export default function AdvisorPage() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'virtual'>('in-person')
  const [topic, setTopic] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const { toast } = useToast()

  // Available time slots
  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00',
    '14:00', '14:30', '15:00', '15:30'
  ]

  // Fetch advisor info
  const fetchAdvisor = useCallback(async () => {
    try {
      const response = await AppointmentAPI.getMyAdvisor()
      const data = response.data
      if (data) {
        setAdvisor({
          id: data.id,
          name: getAdvisorName(data),
          title: data.job_title || 'Academic Advisor',
          email: getAdvisorEmail(data),
          phone: data.phone || '',
          office: data.office_location || '',
          department: getAdvisorDepartment(data),
          officeHours: data.office_hours || 'Contact for availability',
          specializations: data.specialization ? [data.specialization] : ['Academic Advising'],
        })
      }
    } catch (error: any) {
      // No advisor assigned is a valid state
      if (error?.response?.status !== 404) {
        console.error('Failed to fetch advisor:', error)
      }
    }
  }, [])

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const response = await AppointmentAPI.getMyAppointments()
      const allAppointments = response.data || []

      const upcoming: Appointment[] = []
      const past: Appointment[] = []

      allAppointments.forEach((apt: any) => {
        const appointment: Appointment = {
          id: apt.id,
          date: formatAppointmentDate(apt.scheduled_at),
          time: formatAppointmentTime(apt.scheduled_at),
          type: getAppointmentType(apt),
          topic: apt.student_notes || apt.type || 'Advising',
          status: apt.status,
        }

        if (['scheduled', 'confirmed'].includes(apt.status) && new Date(apt.scheduled_at) >= new Date()) {
          upcoming.push(appointment)
        } else {
          past.push(appointment)
        }
      })

      setAppointments(upcoming)
      setPastAppointments(past.slice(0, 5)) // Show last 5 past appointments
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAdvisor(), fetchAppointments()])
      setLoading(false)
    }
    loadData()
  }, [fetchAdvisor, fetchAppointments])

  const handleScheduleAppointment = async () => {
    if (!advisor) return

    setScheduling(true)
    try {
      // Combine date and time into ISO format
      const scheduledAt = `${selectedDate}T${selectedTime}:00`

      await AppointmentAPI.bookAppointment({
        advisor_id: advisor.id,
        scheduled_at: scheduledAt,
        type: 'advising',
        location: appointmentType === 'in-person' ? advisor.office : undefined,
        student_notes: topic,
      })

      toast({ title: 'Appointment scheduled successfully' })
      setShowScheduleDialog(false)
      setSelectedDate('')
      setSelectedTime('')
      setTopic('')

      // Refresh appointments
      fetchAppointments()
    } catch (error: any) {
      toast({
        title: 'Failed to schedule appointment',
        description: error?.response?.data?.message || 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await AppointmentAPI.cancelAppointment(appointmentId)
      toast({ title: 'Appointment cancelled' })
      fetchAppointments()
    } catch (error: any) {
      toast({
        title: 'Failed to cancel',
        description: error?.response?.data?.message || 'Cannot cancel this appointment',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="detail" />
      </AppShell>
    )
  }

  if (!advisor) {
    return (
      <AppShell>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">My Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Connect with your academic advisor for guidance and support
            </p>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">No Advisor Assigned</h3>
              <p className="text-muted-foreground mt-2">
                You don't have an academic advisor assigned yet. Please contact the registrar's office.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">My Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Connect with your academic advisor for guidance and support
            </p>
          </div>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>
                  Book a meeting with {advisor?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={appointmentType === 'in-person' ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setAppointmentType('in-person')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      In-Person
                    </Button>
                    <Button
                      variant={appointmentType === 'virtual' ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setAppointmentType('virtual')}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Virtual
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 12].map(days => {
                        const date = addDays(new Date(), days)
                        return (
                          <SelectItem key={days} value={format(date, 'yyyy-MM-dd')}>
                            {format(date, 'EEEE, MMMM d')}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => {
                        const [h, m] = slot.split(':')
                        const hour = parseInt(h)
                        const displayTime = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
                        return (
                          <SelectItem key={slot} value={slot}>{displayTime}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Reason for Visit</Label>
                  <Textarea
                    id="topic"
                    placeholder="What would you like to discuss?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleAppointment}
                  disabled={!selectedDate || !selectedTime || !topic || scheduling}
                >
                  {scheduling ? 'Scheduling...' : 'Schedule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Advisor Info */}
          <div className="space-y-4">
            {/* Advisor Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={advisor.photo} alt={advisor.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {advisor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{advisor.name}</h2>
                  <p className="text-sm text-muted-foreground">{advisor.title}</p>
                  <Badge variant="secondary" className="mt-2">
                    {advisor.department}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${advisor.email}`} className="text-primary hover:underline">
                      {advisor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{advisor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{advisor.office}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-muted-foreground">{advisor.officeHours}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-1">
                    {advisor.specializations.map(spec => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${advisor.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Appointments */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming appointments</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      Schedule one now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(apt => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {apt.type === 'virtual' ? (
                              <Video className="h-5 w-5 text-primary" />
                            ) : (
                              <MapPin className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{apt.topic}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.date), 'EEEE, MMMM d')} at {apt.time}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {apt.type === 'virtual' ? 'Virtual Meeting' : 'In-Person'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {pastAppointments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No past appointments
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pastAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{apt.topic}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.date), 'MMMM d, yyyy')} at {apt.time}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advising Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advising Resources</CardTitle>
                <CardDescription>Helpful links and documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { title: 'Degree Requirements', href: '/student/degree-audit' },
                    { title: 'Course Catalog', href: '/student/registration' },
                    { title: 'Academic Calendar', href: '/student/calendar' },
                    { title: 'Graduation Checklist', href: '#' },
                  ].map(link => (
                    <a
                      key={link.title}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
