'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users, Calendar, Target, AlertCircle, TrendingUp,
  Clock, CheckCircle, UserCheck, MessageSquare,
  GraduationCap, BookOpen, ChevronRight, Mail,
  Phone, Video, FileText, Flag
} from 'lucide-react'

export default function AdvisorDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  const stats = {
    totalStudents: 87,
    appointmentsToday: 6,
    alertsActive: 12,
    graduatingSoon: 23,
    avgGPA: 3.24,
    retentionRate: 92
  }

  const todayAppointments = [
    {
      id: 1,
      time: '9:00 AM',
      student: 'Sarah Johnson',
      type: 'Academic Planning',
      status: 'completed',
      duration: '30 min',
      notes: 'Discussed course selection for next semester'
    },
    {
      id: 2,
      time: '10:30 AM',
      student: 'Michael Chen',
      type: 'Degree Audit',
      status: 'completed',
      duration: '45 min',
      notes: 'Reviewed graduation requirements'
    },
    {
      id: 3,
      time: '2:00 PM',
      student: 'Emily Rodriguez',
      type: 'Career Counseling',
      status: 'in-progress',
      duration: '30 min',
      notes: 'Discussing internship opportunities'
    },
    {
      id: 4,
      time: '3:00 PM',
      student: 'James Wilson',
      type: 'Academic Support',
      status: 'scheduled',
      duration: '30 min',
      notes: 'Follow-up on academic warning'
    },
    {
      id: 5,
      time: '4:00 PM',
      student: 'Lisa Anderson',
      type: 'Registration',
      status: 'scheduled',
      duration: '30 min',
      notes: 'Help with course registration'
    }
  ]

  const activeAlerts = [
    {
      id: 1,
      student: 'David Park',
      studentId: 'S00123456',
      type: 'Academic Warning',
      severity: 'high',
      gpa: 1.8,
      issue: 'GPA below 2.0',
      dateRaised: '2024-12-20',
      lastContact: '2024-12-22'
    },
    {
      id: 2,
      student: 'Jennifer Lee',
      studentId: 'S00123789',
      type: 'Attendance Issue',
      severity: 'medium',
      issue: 'Missing 30% of classes',
      dateRaised: '2024-12-18',
      lastContact: '2024-12-19'
    },
    {
      id: 3,
      student: 'Robert Martinez',
      studentId: 'S00124567',
      type: 'Registration Hold',
      severity: 'low',
      issue: 'Missing prerequisite approval',
      dateRaised: '2024-12-25',
      lastContact: 'Not contacted'
    },
    {
      id: 4,
      student: 'Amanda Taylor',
      studentId: 'S00125678',
      type: 'Financial Aid',
      severity: 'high',
      issue: 'At risk of losing scholarship',
      dateRaised: '2024-12-15',
      lastContact: '2024-12-16'
    }
  ]

  const recentStudents = [
    {
      id: 1,
      name: 'Sarah Johnson',
      studentId: 'S00123450',
      major: 'Computer Science',
      year: 'Junior',
      gpa: 3.67,
      credits: 78,
      status: 'on-track',
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      studentId: 'S00123451',
      major: 'Business Administration',
      year: 'Senior',
      gpa: 3.42,
      credits: 112,
      status: 'graduating',
      lastMeeting: '2024-12-26',
      nextMeeting: null
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      studentId: 'S00123452',
      major: 'Biology',
      year: 'Sophomore',
      gpa: 3.89,
      credits: 45,
      status: 'on-track',
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-02-01'
    },
    {
      id: 4,
      name: 'David Park',
      studentId: 'S00123456',
      major: 'Engineering',
      year: 'Junior',
      gpa: 1.8,
      credits: 68,
      status: 'at-risk',
      lastMeeting: '2024-12-22',
      nextMeeting: '2025-01-08'
    }
  ]

  const upcomingDeadlines = [
    { date: '2025-01-05', event: 'Spring Registration Opens', type: 'registration' },
    { date: '2025-01-10', event: 'Add/Drop Period Ends', type: 'academic' },
    { date: '2025-01-15', event: 'Financial Aid Appeals Due', type: 'financial' },
    { date: '2025-02-01', event: 'Graduation Applications Due', type: 'graduation' },
    { date: '2025-02-15', event: 'Mid-term Progress Reports', type: 'academic' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800'
      case 'at-risk': return 'bg-red-100 text-red-800'
      case 'graduating': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCheck className="h-8 w-8" />
              Advisor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, Dr. Sarah Mitchell
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Quick Actions Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have <strong>12 active alerts</strong> requiring attention and{' '}
            <strong>3 appointments</strong> scheduled for today.
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">In your caseload</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
              <p className="text-xs text-muted-foreground">2 remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.alertsActive}</div>
              <p className="text-xs text-muted-foreground">4 high priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Graduating Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.graduatingSoon}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgGPA}</div>
              <p className="text-xs text-muted-foreground">+0.08 from last term</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.retentionRate}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Today's Schedule</TabsTrigger>
            <TabsTrigger value="alerts">
              Active Alerts
              {stats.alertsActive > 0 && (
                <Badge className="ml-2 bg-orange-600">{stats.alertsActive}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="students">Recent Students</TabsTrigger>
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>
                      Thursday, December 26, 2024
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{appointment.time}</p>
                          <p className="text-xs text-muted-foreground">{appointment.duration}</p>
                        </div>
                        <div className="h-12 w-[1px] bg-border" />
                        <div>
                          <p className="font-medium">{appointment.student}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button size="sm" variant="outline">
                              <Video className="h-3 w-3 mr-1" />
                              Join
                            </Button>
                            <Button size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Notes
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Student Alerts</CardTitle>
                    <CardDescription>
                      Students requiring immediate attention
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    View All Alerts
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date Raised</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.student}</p>
                            <p className="text-xs text-muted-foreground">{alert.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm">{alert.issue}</p>
                          {alert.gpa && (
                            <p className="text-xs text-muted-foreground">GPA: {alert.gpa}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.dateRaised}</TableCell>
                        <TableCell>
                          <p className="text-sm">{alert.lastContact}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Student Interactions</CardTitle>
                    <CardDescription>
                      Students you've met with recently
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    View All Students
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Meeting</TableHead>
                      <TableHead>Next Meeting</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>
                          <span className={student.gpa < 2.0 ? 'text-red-600 font-medium' : ''}>
                            {student.gpa}
                          </span>
                        </TableCell>
                        <TableCell>{student.credits}</TableCell>
                        <TableCell>
                          <Badge className={getStudentStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.lastMeeting}</TableCell>
                        <TableCell>
                          {student.nextMeeting || <span className="text-muted-foreground">Not scheduled</span>}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>
                  Important dates for you and your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-2xl font-bold">{new Date(deadline.date).getDate()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(deadline.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{deadline.event}</p>
                          <Badge variant="secondary" className="mt-1">
                            {deadline.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Remind Students
                      </Button>
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