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
  GraduationCap, Users, Building, DollarSign, TrendingUp,
  Award, Target, Shield, BarChart3, FileText,
  BookOpen, Calendar, AlertCircle, CheckCircle,
  Clock, Activity, Download, Settings, TrendingDown, Minus
} from 'lucide-react'

export default function DeanDashboardPage() {
  const college = {
    name: 'College of Engineering & Sciences',
    dean: 'Dr. Margaret Anderson',
    departments: 8,
    faculty: 312,
    students: 4500,
    programs: 45,
    budget: 28000000,
    researchFunding: 12500000
  }

  const departments = [
    {
      name: 'Computer Science',
      chair: 'Dr. Robert Thompson',
      faculty: 42,
      students: 1250,
      budget: 3500000,
      performance: 'excellent',
      researchGrants: 8,
      publications: 47
    },
    {
      name: 'Engineering',
      chair: 'Dr. Lisa Chen',
      faculty: 38,
      students: 980,
      budget: 4200000,
      performance: 'good',
      researchGrants: 12,
      publications: 52
    },
    {
      name: 'Mathematics',
      chair: 'Prof. John Williams',
      faculty: 28,
      students: 620,
      budget: 2100000,
      performance: 'good',
      researchGrants: 4,
      publications: 31
    },
    {
      name: 'Physics',
      chair: 'Dr. Sarah Martinez',
      faculty: 35,
      students: 450,
      budget: 3800000,
      performance: 'excellent',
      researchGrants: 15,
      publications: 68
    },
    {
      name: 'Chemistry',
      chair: 'Dr. Michael Brown',
      faculty: 32,
      students: 520,
      budget: 3200000,
      performance: 'satisfactory',
      researchGrants: 9,
      publications: 41
    }
  ]

  const facultyMetrics = {
    tenured: 156,
    tenureTrack: 89,
    nonTenure: 67,
    avgTeachingLoad: 3.2,
    researchActive: 234,
    sabbatical: 8,
    retiring: 12
  }

  const strategicInitiatives = [
    {
      name: 'AI Research Center',
      status: 'in-progress',
      progress: 65,
      budget: 2500000,
      deadline: '2025-06-30',
      lead: 'Computer Science',
      impact: 'High'
    },
    {
      name: 'Sustainability Program',
      status: 'planning',
      progress: 25,
      budget: 1800000,
      deadline: '2025-12-31',
      lead: 'Engineering',
      impact: 'High'
    },
    {
      name: 'Industry Partnership Expansion',
      status: 'in-progress',
      progress: 80,
      budget: 500000,
      deadline: '2025-03-31',
      lead: 'Dean\'s Office',
      impact: 'Medium'
    },
    {
      name: 'Graduate Program Redesign',
      status: 'in-progress',
      progress: 45,
      budget: 750000,
      deadline: '2025-09-01',
      lead: 'All Departments',
      impact: 'High'
    }
  ]

  const accreditation = [
    {
      program: 'Engineering (ABET)',
      status: 'current',
      expires: '2026-06-30',
      lastReview: '2020-06-15',
      nextReview: '2025-10-15'
    },
    {
      program: 'Computer Science (ABET)',
      status: 'current',
      expires: '2025-12-31',
      lastReview: '2019-12-10',
      nextReview: '2025-03-15'
    },
    {
      program: 'Chemistry (ACS)',
      status: 'current',
      expires: '2027-03-31',
      lastReview: '2021-03-20',
      nextReview: '2026-09-20'
    }
  ]

  const keyMetrics = [
    { label: 'Student-Faculty Ratio', value: '14:1', trend: 'stable' },
    { label: 'Research Output', value: '+23%', trend: 'up' },
    { label: '4-Year Graduation Rate', value: '82%', trend: 'up' },
    { label: 'Job Placement Rate', value: '94%', trend: 'up' },
    { label: 'Alumni Giving Rate', value: '31%', trend: 'down' },
    { label: 'Grant Success Rate', value: '42%', trend: 'up' }
  ]

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800'
      case 'needs-improvement': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on-hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const breadcrumbs = [
    { label: 'Dean Dashboard' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              {college.name}
            </h1>
            <p className="text-muted-foreground">
              Dean: {college.dean}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Annual Report
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Strategic Plan
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Accreditation Alert */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Accreditation Notice:</strong> Computer Science ABET review scheduled for March 15, 2025.
            Self-study report due January 31, 2025.
          </AlertDescription>
        </Alert>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{college.departments}</div>
              <p className="text-xs text-muted-foreground">Academic units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{college.faculty}</div>
              <p className="text-xs text-muted-foreground">
                {facultyMetrics.tenured} tenured
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{college.students.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Research Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(college.researchFunding / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">Active grants</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="initiatives">Strategic Initiatives</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Overview</TabsTrigger>
            <TabsTrigger value="accreditation">Accreditation</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>
                      Academic year 2024-2025 metrics
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Detailed Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Chair</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Research</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.chair}</TableCell>
                        <TableCell>{dept.faculty}</TableCell>
                        <TableCell>{dept.students.toLocaleString()}</TableCell>
                        <TableCell>${(dept.budget / 1000000).toFixed(1)}M</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{dept.researchGrants} grants</p>
                            <p className="text-xs text-muted-foreground">
                              {dept.publications} publications
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPerformanceColor(dept.performance)}>
                            {dept.performance}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Initiatives</CardTitle>
                <CardDescription>
                  College-wide transformation projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategicInitiatives.map((initiative, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{initiative.name}</p>
                          <Badge className={getStatusColor(initiative.status)}>
                            {initiative.status}
                          </Badge>
                          <Badge variant="outline">
                            Impact: {initiative.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lead: {initiative.lead} • Budget: ${(initiative.budget / 1000000).toFixed(1)}M •
                          Due: {new Date(initiative.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{initiative.progress}%</span>
                      </div>
                      <Progress value={initiative.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tenured</span>
                    <span className="font-medium">{facultyMetrics.tenured}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tenure-Track</span>
                    <span className="font-medium">{facultyMetrics.tenureTrack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Non-Tenure</span>
                    <span className="font-medium">{facultyMetrics.nonTenure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On Sabbatical</span>
                    <span className="font-medium">{facultyMetrics.sabbatical}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span className="text-sm">Retiring This Year</span>
                    <span className="font-medium">{facultyMetrics.retiring}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teaching & Research</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Teaching Load</span>
                    <span className="font-medium">{facultyMetrics.avgTeachingLoad} courses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Research Active</span>
                    <span className="font-medium">{facultyMetrics.researchActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Publications (YTD)</span>
                    <span className="font-medium">289</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Patents Filed</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Awards Received</span>
                    <span className="font-medium">27</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tenure Decisions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>8 tenure reviews</strong> pending for Spring 2025
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Computer Science</span>
                      <span>3 cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engineering</span>
                      <span>2 cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physics</span>
                      <span>2 cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chemistry</span>
                      <span>1 case</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accreditation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accreditation Status</CardTitle>
                <CardDescription>
                  Program accreditation tracking and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Last Review</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accreditation.map((program, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{program.program}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{program.expires}</TableCell>
                        <TableCell>{program.lastReview}</TableCell>
                        <TableCell className="font-medium">{program.nextReview}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Prepare
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}