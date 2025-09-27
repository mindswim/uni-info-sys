'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  FileText, GraduationCap, CheckCircle, Clock, AlertCircle,
  TrendingUp, Calendar, Users, Shield, BookOpen,
  ClipboardCheck, Edit, Award, Building, Download,
  Mail, Phone, ChevronRight, Activity
} from 'lucide-react'

export default function RegistrarDashboardPage() {
  const stats = {
    transcriptRequests: 42,
    enrollmentVerifications: 18,
    gradeChanges: 7,
    graduationApplications: 156,
    diplomasOrdered: 89,
    ferpaHolds: 12
  }

  const pendingRequests = [
    {
      id: 1,
      type: 'Transcript',
      student: 'Sarah Johnson',
      studentId: 'S00123450',
      requestDate: '2024-12-26',
      urgency: 'standard',
      status: 'pending',
      details: 'Official transcript for graduate school'
    },
    {
      id: 2,
      type: 'Enrollment Verification',
      student: 'Michael Chen',
      studentId: 'S00123451',
      requestDate: '2024-12-25',
      urgency: 'rush',
      status: 'in-progress',
      details: 'Insurance verification needed'
    },
    {
      id: 3,
      type: 'Grade Change',
      student: 'David Park',
      studentId: 'S00123456',
      requestDate: '2024-12-24',
      urgency: 'standard',
      status: 'pending-approval',
      details: 'CS 250 - Instructor error correction'
    },
    {
      id: 4,
      type: 'Graduation Clearance',
      student: 'Emily Rodriguez',
      studentId: 'S00123452',
      requestDate: '2024-12-23',
      urgency: 'standard',
      status: 'under-review',
      details: 'May 2025 graduation audit'
    }
  ]

  const upcomingDeadlines = [
    {
      date: '2025-01-10',
      event: 'Grade Submission Deadline',
      type: 'grades',
      progress: 78,
      details: '567 of 725 sections submitted'
    },
    {
      date: '2025-01-15',
      event: 'Graduation Application Deadline',
      type: 'graduation',
      progress: 65,
      details: '156 applications received'
    },
    {
      date: '2025-01-20',
      event: 'Spring Registration Closes',
      type: 'registration',
      progress: 92,
      details: '8,234 students registered'
    },
    {
      date: '2025-02-01',
      event: 'Diploma Order Cutoff',
      type: 'graduation',
      progress: 45,
      details: '89 of 200 estimated orders'
    }
  ]

  const recentActivity = [
    {
      time: '10 min ago',
      action: 'Transcript processed',
      details: 'John Smith - Electronic delivery',
      icon: FileText
    },
    {
      time: '1 hour ago',
      action: 'Grade change approved',
      details: 'Math 201 - 3 students affected',
      icon: Edit
    },
    {
      time: '2 hours ago',
      action: 'FERPA hold placed',
      details: 'Security concern - Parent inquiry',
      icon: Shield
    },
    {
      time: '3 hours ago',
      action: 'Graduation clearance',
      details: '12 students cleared for May 2025',
      icon: GraduationCap
    },
    {
      time: '5 hours ago',
      action: 'Enrollment verified',
      details: 'Batch processing - 25 students',
      icon: CheckCircle
    }
  ]

  const academicTerms = [
    {
      term: 'Spring 2025',
      status: 'active',
      enrolled: 8234,
      capacity: 9000,
      startDate: '2025-01-20',
      endDate: '2025-05-15'
    },
    {
      term: 'Fall 2024',
      status: 'grading',
      enrolled: 8567,
      gradesSubmitted: 78,
      deadline: '2025-01-10'
    },
    {
      term: 'Summer 2025',
      status: 'planning',
      enrolled: 0,
      capacity: 3000,
      registrationOpens: '2025-03-01'
    }
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'rush': return 'bg-red-100 text-red-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending-approval': return 'bg-orange-100 text-orange-800'
      case 'under-review': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTermStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'grading': return 'bg-yellow-100 text-yellow-800'
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Registrar Dashboard' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-8 w-8" />
              Registrar Dashboard
            </h1>
            <p className="text-muted-foreground">
              Academic records and registration management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Academic Calendar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Process Requests
            </Button>
          </div>
        </div>

        {/* Urgent Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Grade Submission Deadline:</strong> January 10, 2025 - Currently 78% complete.
            Send reminder to faculty with outstanding grades.
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transcript Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.transcriptRequests}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enrollment Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrollmentVerifications}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Grade Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.gradeChanges}</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Graduation Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.graduationApplications}</div>
              <p className="text-xs text-muted-foreground">May 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Diplomas Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.diplomasOrdered}</div>
              <p className="text-xs text-muted-foreground">For May 2025</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">FERPA Holds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.ferpaHolds}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Pending Requests
              <Badge className="ml-2" variant="secondary">
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
            <TabsTrigger value="terms">Academic Terms</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                      Documents and verifications awaiting processing
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All Requests
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.type}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.student}</p>
                            <p className="text-xs text-muted-foreground">{request.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate">{request.details}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)} variant="outline">
                            {request.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">Process</Button>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="h-4 w-4" />
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

          <TabsContent value="deadlines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>
                  Critical dates for academic operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{deadline.event}</p>
                          <Badge variant="secondary">{deadline.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(deadline.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm">{deadline.details}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{deadline.progress}%</span>
                      </div>
                      <Progress value={deadline.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Terms</CardTitle>
                <CardDescription>
                  Current and upcoming term management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicTerms.map((term, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{term.term}</p>
                          <Badge className={getTermStatusColor(term.status)}>
                            {term.status}
                          </Badge>
                        </div>
                        {term.status === 'active' && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {term.enrolled.toLocaleString()} / {term.capacity.toLocaleString()} enrolled
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {term.startDate} to {term.endDate}
                            </span>
                          </div>
                        )}
                        {term.status === 'grading' && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {term.enrolled.toLocaleString()} students • Grades due {term.deadline}
                            </p>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Grade Submission</span>
                                <span>{term.gradesSubmitted}%</span>
                              </div>
                              <Progress value={term.gradesSubmitted} className="h-2" />
                            </div>
                          </div>
                        )}
                        {term.status === 'planning' && (
                          <p className="text-sm text-muted-foreground">
                            Registration opens {term.registrationOpens} • Capacity: {term.capacity.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Courses
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest registrar office actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <activity.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Process Transcript
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Enrollment
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Grade Change Form
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Graduation Audit
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  FERPA Training
                </span>
                <Badge className="bg-green-100 text-green-800">Current</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Veterans Certified
                </span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  State Authorization
                </span>
                <Badge className="bg-purple-100 text-purple-800">Valid</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  SIS Connection
                </span>
                <span className="text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Document Service
                </span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  Clearinghouse
                </span>
                <span className="text-yellow-600">Syncing</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p className="font-medium">Office Hours</p>
                <p className="text-muted-foreground">Mon-Fri: 8:00 AM - 5:00 PM</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  (555) 123-4567
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  registrar@university.edu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}