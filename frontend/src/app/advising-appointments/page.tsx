'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Calendar, Clock, Video, MapPin, Users, Plus,
  CheckCircle, XCircle, AlertCircle, Info,
  MessageSquare, Phone, Mail, FileText, Edit,
  Trash2, ChevronLeft, ChevronRight, Filter
} from 'lucide-react'

export default function AdvisingAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState('2024-12-26')
  const [viewMode, setViewMode] = useState('week')
  const [showNewAppointment, setShowNewAppointment] = useState(false)

  const appointments = [
    {
      id: 1,
      date: '2024-12-26',
      time: '9:00 AM',
      endTime: '9:30 AM',
      student: 'Sarah Johnson',
      studentId: 'S00123450',
      type: 'Academic Planning',
      location: 'Office - Room 305',
      mode: 'in-person',
      status: 'completed',
      notes: 'Discussed spring course selection. Student interested in adding CS electives.',
      recurring: false
    },
    {
      id: 2,
      date: '2024-12-26',
      time: '10:30 AM',
      endTime: '11:15 AM',
      student: 'Michael Chen',
      studentId: 'S00123451',
      type: 'Degree Audit',
      location: 'Virtual',
      mode: 'virtual',
      status: 'completed',
      notes: 'Reviewed graduation requirements. On track for May graduation.',
      recurring: false
    },
    {
      id: 3,
      date: '2024-12-26',
      time: '2:00 PM',
      endTime: '2:30 PM',
      student: 'Emily Rodriguez',
      studentId: 'S00123452',
      type: 'Career Counseling',
      location: 'Office - Room 305',
      mode: 'in-person',
      status: 'confirmed',
      notes: '',
      recurring: false
    },
    {
      id: 4,
      date: '2024-12-26',
      time: '3:00 PM',
      endTime: '3:30 PM',
      student: 'James Wilson',
      studentId: 'S00123453',
      type: 'Academic Support',
      location: 'Virtual',
      mode: 'virtual',
      status: 'confirmed',
      notes: 'Follow-up on academic warning status',
      recurring: false
    },
    {
      id: 5,
      date: '2024-12-27',
      time: '10:00 AM',
      endTime: '10:30 AM',
      student: 'Lisa Anderson',
      studentId: 'S00123454',
      type: 'Registration Help',
      location: 'Office - Room 305',
      mode: 'in-person',
      status: 'confirmed',
      notes: '',
      recurring: false
    },
    {
      id: 6,
      date: '2024-12-27',
      time: '2:00 PM',
      endTime: '2:45 PM',
      student: 'David Park',
      studentId: 'S00123456',
      type: 'Academic Warning',
      location: 'Office - Room 305',
      mode: 'in-person',
      status: 'requested',
      notes: 'Urgent - GPA below 2.0',
      recurring: false
    }
  ]

  const appointmentTypes = [
    { value: 'academic-planning', label: 'Academic Planning', duration: 30 },
    { value: 'degree-audit', label: 'Degree Audit', duration: 45 },
    { value: 'career-counseling', label: 'Career Counseling', duration: 30 },
    { value: 'registration', label: 'Registration Help', duration: 30 },
    { value: 'academic-support', label: 'Academic Support', duration: 30 },
    { value: 'crisis-intervention', label: 'Crisis Intervention', duration: 60 },
    { value: 'general-advising', label: 'General Advising', duration: 30 }
  ]

  const availableSlots = [
    { date: '2024-12-27', time: '11:00 AM' },
    { date: '2024-12-27', time: '3:00 PM' },
    { date: '2024-12-27', time: '4:00 PM' },
    { date: '2024-12-30', time: '9:00 AM' },
    { date: '2024-12-30', time: '10:00 AM' },
    { date: '2024-12-30', time: '2:00 PM' }
  ]

  const stats = {
    todayTotal: 4,
    todayCompleted: 2,
    weekTotal: 12,
    monthTotal: 48,
    avgDuration: 35,
    noShowRate: 5
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'requested': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'virtual': return <Video className="h-4 w-4" />
      case 'in-person': return <MapPin className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      default: return null
    }
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard', href: '/advisor-dashboard' },
    { label: 'Appointments' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Advising Appointments
            </h1>
            <p className="text-muted-foreground">
              Manage your advising schedule
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Create a new advising appointment with a student
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student">Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                          <SelectItem value="michael">Michael Chen</SelectItem>
                          <SelectItem value="emily">Emily Rodriguez</SelectItem>
                          <SelectItem value="david">David Park</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Appointment Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} ({type.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input type="date" id="date" />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:00">9:00 AM</SelectItem>
                          <SelectItem value="9:30">9:30 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="10:30">10:30 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="2:00">2:00 PM</SelectItem>
                          <SelectItem value="2:30">2:30 PM</SelectItem>
                          <SelectItem value="3:00">3:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mode">Mode</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In-Person</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Office - Room 305" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes or agenda items for this appointment..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="recurring" className="rounded" />
                    <Label htmlFor="recurring">Make this a recurring appointment</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowNewAppointment(false)}>
                    Schedule Appointment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayTotal}</div>
              <p className="text-xs text-muted-foreground">{stats.todayCompleted} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weekTotal}</div>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthTotal}</div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration}</div>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.noShowRate}%</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableSlots.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="availability">My Availability</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              <Badge className="ml-2" variant="secondary">3</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Appointment Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-3">
                      Dec 23 - Dec 29, 2024
                    </span>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Select value={viewMode} onValueChange={setViewMode}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-8 bg-muted">
                    <div className="p-2 text-sm font-medium border-r">Time</div>
                    <div className="p-2 text-sm font-medium text-center">Mon 23</div>
                    <div className="p-2 text-sm font-medium text-center">Tue 24</div>
                    <div className="p-2 text-sm font-medium text-center">Wed 25</div>
                    <div className="p-2 text-sm font-medium text-center bg-primary/10">Thu 26</div>
                    <div className="p-2 text-sm font-medium text-center">Fri 27</div>
                    <div className="p-2 text-sm font-medium text-center">Sat 28</div>
                    <div className="p-2 text-sm font-medium text-center">Sun 29</div>
                  </div>

                  {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                    <div key={time} className="grid grid-cols-8 border-t">
                      <div className="p-2 text-sm text-muted-foreground border-r">{time}</div>
                      <div className="p-2 min-h-[60px] border-r"></div>
                      <div className="p-2 min-h-[60px] border-r"></div>
                      <div className="p-2 min-h-[60px] border-r"></div>
                      <div className="p-2 min-h-[60px] border-r bg-primary/5">
                        {time === '9:00 AM' && (
                          <div className="bg-blue-100 rounded p-1 text-xs">
                            <p className="font-medium">Sarah Johnson</p>
                            <p className="text-muted-foreground">Academic Planning</p>
                          </div>
                        )}
                        {time === '10:00 AM' && (
                          <div className="bg-blue-100 rounded p-1 text-xs">
                            <p className="font-medium">Michael Chen</p>
                            <p className="text-muted-foreground">Degree Audit</p>
                          </div>
                        )}
                        {time === '2:00 PM' && (
                          <div className="bg-yellow-100 rounded p-1 text-xs">
                            <p className="font-medium">Emily Rodriguez</p>
                            <p className="text-muted-foreground">Career Counseling</p>
                          </div>
                        )}
                        {time === '3:00 PM' && (
                          <div className="bg-yellow-100 rounded p-1 text-xs">
                            <p className="font-medium">James Wilson</p>
                            <p className="text-muted-foreground">Academic Support</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 min-h-[60px] border-r">
                        {time === '10:00 AM' && (
                          <div className="bg-yellow-100 rounded p-1 text-xs">
                            <p className="font-medium">Lisa Anderson</p>
                            <p className="text-muted-foreground">Registration</p>
                          </div>
                        )}
                        {time === '2:00 PM' && (
                          <div className="bg-orange-100 rounded p-1 text-xs">
                            <p className="font-medium">David Park</p>
                            <p className="text-muted-foreground">Academic Warning</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 min-h-[60px] border-r"></div>
                      <div className="p-2 min-h-[60px]"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>All scheduled advising sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {appointment.student.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{appointment.student}</p>
                            <span className="text-sm text-muted-foreground">({appointment.studentId})</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {appointment.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time} - {appointment.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              {getModeIcon(appointment.mode)}
                              {appointment.location}
                            </span>
                          </div>
                          <Badge variant="secondary">{appointment.type}</Badge>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        {appointment.mode === 'virtual' && appointment.status === 'confirmed' && (
                          <Button size="sm" variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>Configure your advising hours and booking preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Regular Office Hours</h4>
                  <div className="space-y-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{day}</span>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="9:00">
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8:00">8:00 AM</SelectItem>
                              <SelectItem value="9:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                            </SelectContent>
                          </Select>
                          <span>to</span>
                          <Select defaultValue="5:00">
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4:00">4:00 PM</SelectItem>
                              <SelectItem value="5:00">5:00 PM</SelectItem>
                              <SelectItem value="6:00">6:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Booking Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="buffer">Buffer time between appointments</Label>
                      <Select defaultValue="15">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advance">How far in advance can students book?</Label>
                      <Select defaultValue="2weeks">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1week">1 week</SelectItem>
                          <SelectItem value="2weeks">2 weeks</SelectItem>
                          <SelectItem value="1month">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max">Maximum appointments per student per month</Label>
                      <Select defaultValue="4">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Availability Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Requests</CardTitle>
                <CardDescription>Review and approve pending appointment requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      You have 3 pending appointment requests that need your review
                    </AlertDescription>
                  </Alert>

                  {[
                    {
                      student: 'David Park',
                      type: 'Academic Warning',
                      requestedDate: '2024-12-27',
                      requestedTime: '2:00 PM',
                      reason: 'GPA below 2.0, need immediate guidance',
                      priority: 'high'
                    },
                    {
                      student: 'Jennifer Martinez',
                      type: 'Course Selection',
                      requestedDate: '2024-12-30',
                      requestedTime: '10:00 AM',
                      reason: 'Need help choosing spring courses',
                      priority: 'medium'
                    },
                    {
                      student: 'Alex Thompson',
                      type: 'Career Planning',
                      requestedDate: '2024-12-31',
                      requestedTime: '3:00 PM',
                      reason: 'Discussing internship opportunities',
                      priority: 'low'
                    }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{request.student}</p>
                          {request.priority === 'high' && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.type} - {request.requestedDate} at {request.requestedTime}
                        </p>
                        <p className="text-sm mt-2">{request.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </div>
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