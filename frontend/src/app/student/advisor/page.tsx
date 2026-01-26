"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
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
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function AdvisorPage() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'virtual'>('in-person')
  const [topic, setTopic] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const { toast } = useToast()

  // Mock advisor data
  const advisor: Advisor = {
    id: 1,
    name: 'Dr. Sarah Chen',
    title: 'Associate Professor & Academic Advisor',
    email: 'schen@university.edu',
    phone: '(555) 123-4567',
    office: 'Science Building, Room 312',
    department: 'Computer Science',
    officeHours: 'Mon/Wed 2:00-4:00 PM, Fri 10:00 AM-12:00 PM',
    specializations: ['Undergraduate Advising', 'Pre-Graduate Planning', 'Internship Guidance'],
  }

  // Mock upcoming appointments
  const appointments: Appointment[] = [
    {
      id: 1,
      date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      time: '2:30 PM',
      type: 'in-person',
      topic: 'Course selection for next semester',
      status: 'scheduled',
    },
  ]

  // Mock past appointments
  const pastAppointments: Appointment[] = [
    {
      id: 2,
      date: format(addDays(new Date(), -14), 'yyyy-MM-dd'),
      time: '3:00 PM',
      type: 'virtual',
      topic: 'Degree progress review',
      status: 'completed',
    },
    {
      id: 3,
      date: format(addDays(new Date(), -45), 'yyyy-MM-dd'),
      time: '10:30 AM',
      type: 'in-person',
      topic: 'Major declaration',
      status: 'completed',
    },
  ]

  // Available time slots (mock)
  const availableSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'
  ]

  const handleScheduleAppointment = async () => {
    setScheduling(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setScheduling(false)
    setShowScheduleDialog(false)
    toast({ title: 'Appointment scheduled successfully' })
    // Reset form
    setSelectedDate('')
    setSelectedTime('')
    setTopic('')
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
                  Book a meeting with {advisor.name}
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
                      {availableSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
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
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Cancel</Button>
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
