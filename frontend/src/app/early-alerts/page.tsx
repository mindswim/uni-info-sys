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
  AlertCircle, TrendingDown, Users, Clock, CheckCircle,
  XCircle, MessageSquare, Phone, Mail, Flag, Plus,
  Filter, Download, Calendar, BookOpen, Target,
  AlertTriangle, Activity, Eye, Send, DollarSign
} from 'lucide-react'

export default function EarlyAlertsPage() {
  const [showNewAlert, setShowNewAlert] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const alerts = [
    {
      id: 1,
      student: 'David Park',
      studentId: 'S00123456',
      type: 'Academic Performance',
      severity: 'high',
      status: 'active',
      issue: 'GPA dropped below 2.0',
      details: 'Current GPA: 1.8, Failed 2 courses last semester',
      dateRaised: '2024-12-20',
      raisedBy: 'System (Automatic)',
      lastContact: '2024-12-22',
      interventions: 3,
      notes: 'Student acknowledged issues, agreed to weekly check-ins'
    },
    {
      id: 2,
      student: 'Jennifer Lee',
      studentId: 'S00123789',
      type: 'Attendance',
      severity: 'medium',
      status: 'active',
      issue: 'Excessive absences in multiple courses',
      details: 'Missing 30% of CS 350 and 25% of MATH 310',
      dateRaised: '2024-12-18',
      raisedBy: 'Prof. Johnson',
      lastContact: '2024-12-19',
      interventions: 2,
      notes: 'Personal issues affecting attendance, referred to counseling'
    },
    {
      id: 3,
      student: 'Amanda Taylor',
      studentId: 'S00125678',
      type: 'Financial',
      severity: 'high',
      status: 'active',
      issue: 'At risk of losing merit scholarship',
      details: 'GPA: 2.1, Scholarship requires 2.5 minimum',
      dateRaised: '2024-12-15',
      raisedBy: 'Financial Aid Office',
      lastContact: '2024-12-16',
      interventions: 4,
      notes: 'Enrolled in tutoring, considering course withdrawal'
    },
    {
      id: 4,
      student: 'Robert Martinez',
      studentId: 'S00124567',
      type: 'Course Performance',
      severity: 'low',
      status: 'monitoring',
      issue: 'Struggling with prerequisite knowledge',
      details: 'D+ in midterm exam for CS 250',
      dateRaised: '2024-12-25',
      raisedBy: 'Prof. Smith',
      lastContact: 'Not contacted',
      interventions: 0,
      notes: 'Professor recommends tutoring center'
    },
    {
      id: 5,
      student: 'Michael Brown',
      studentId: 'S00126543',
      type: 'Mental Health',
      severity: 'high',
      status: 'resolved',
      issue: 'Depression affecting academic performance',
      details: 'Self-reported mental health concerns',
      dateRaised: '2024-11-15',
      raisedBy: 'Self-Referral',
      lastContact: '2024-12-10',
      interventions: 6,
      notes: 'Successfully connected with counseling services, showing improvement'
    }
  ]

  const alertTypes = [
    { value: 'academic', label: 'Academic Performance', icon: TrendingDown },
    { value: 'attendance', label: 'Attendance Issues', icon: Calendar },
    { value: 'financial', label: 'Financial Concerns', icon: DollarSign },
    { value: 'mental-health', label: 'Mental Health', icon: Activity },
    { value: 'course', label: 'Course-Specific', icon: BookOpen },
    { value: 'behavioral', label: 'Behavioral Concerns', icon: AlertTriangle }
  ]

  const interventionOptions = [
    'Schedule advising appointment',
    'Refer to tutoring center',
    'Refer to counseling services',
    'Contact financial aid',
    'Academic success workshop',
    'Study skills assessment',
    'Time management coaching',
    'Peer mentoring',
    'Faculty meeting',
    'Parent/guardian contact'
  ]

  const stats = {
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    highSeverity: alerts.filter(a => a.severity === 'high').length,
    resolvedThisMonth: 8,
    avgResponseTime: '1.2 days',
    successRate: '73%'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-800'
      case 'monitoring': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard', href: '/advisor-dashboard' },
    { label: 'Early Alerts' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              Early Alert System
            </h1>
            <p className="text-muted-foreground">
              Identify and support at-risk students
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showNewAlert} onOpenChange={setShowNewAlert}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Early Alert</DialogTitle>
                  <DialogDescription>
                    Flag a student who needs additional support
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Alert Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {alertTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Monitor</SelectItem>
                          <SelectItem value="medium">Medium - Intervention Needed</SelectItem>
                          <SelectItem value="high">High - Urgent Action Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="course">Related Course (Optional)</Label>
                      <Input id="course" placeholder="e.g., CS 350" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="issue">Issue Summary</Label>
                    <Input id="issue" placeholder="Brief description of the concern" />
                  </div>
                  <div>
                    <Label htmlFor="details">Detailed Description</Label>
                    <Textarea
                      id="details"
                      placeholder="Provide specific details about the student's situation..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Recommended Interventions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {interventionOptions.slice(0, 6).map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <input type="checkbox" id={option} className="rounded" />
                          <Label htmlFor={option} className="text-sm font-normal">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify" className="rounded" />
                    <Label htmlFor="notify">Notify student immediately via email</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowNewAlert(false)}>
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Critical Alert */}
        {stats.highSeverity > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{stats.highSeverity} high-severity alerts</strong> require immediate attention.
              These students are at significant risk of academic failure or withdrawal.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Requiring action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highSeverity}</div>
              <p className="text-xs text-muted-foreground">Urgent cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedThisMonth}</div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">To first contact</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successRate}</div>
              <p className="text-xs text-muted-foreground">Positive outcomes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search by student name or ID..." />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {alerts.length} alerts
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {alert.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{alert.student}</p>
                          <span className="text-sm text-muted-foreground">({alert.studentId})</span>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity} severity
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{alert.issue}</p>
                          <p className="text-sm text-muted-foreground">{alert.details}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {alert.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Raised: {alert.dateRaised}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            By: {alert.raisedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {alert.interventions} interventions
                          </span>
                        </div>
                        {alert.notes && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">
                              <strong>Latest Note:</strong> {alert.notes}
                            </p>
                            {alert.lastContact !== 'Not contacted' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last contact: {alert.lastContact}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Add Note
                      </Button>
                      <Button size="sm">
                        <Send className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}