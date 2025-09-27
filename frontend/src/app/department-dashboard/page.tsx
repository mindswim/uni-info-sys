'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building, Users, BookOpen, DollarSign, TrendingUp,
  Calendar, Award, Clock, AlertCircle, Target,
  BarChart3, GraduationCap, Briefcase, FileText,
  Settings, ChevronRight, Mail, Plus
} from 'lucide-react'

export default function DepartmentDashboardPage() {
  const department = {
    name: 'Computer Science Department',
    code: 'CS',
    chair: 'Dr. Robert Thompson',
    faculty: 42,
    students: 1250,
    programs: 8,
    courses: 145,
    budget: 3500000,
    budgetUsed: 2100000
  }

  const stats = {
    enrollmentGrowth: '+12%',
    avgClassSize: 28,
    facultyStudentRatio: '1:30',
    researchGrants: 8,
    publicationsThisYear: 47,
    graduationRate: '87%'
  }

  const faculty = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      title: 'Professor',
      specialization: 'AI & Machine Learning',
      courseLoad: 3,
      researchActive: true,
      tenure: 'Tenured',
      office: 'CS-301',
      email: 'smitchell@university.edu'
    },
    {
      id: 2,
      name: 'Dr. James Chen',
      title: 'Associate Professor',
      specialization: 'Database Systems',
      courseLoad: 4,
      researchActive: true,
      tenure: 'Tenure-Track',
      office: 'CS-215',
      email: 'jchen@university.edu'
    },
    {
      id: 3,
      name: 'Prof. Emily Rodriguez',
      title: 'Assistant Professor',
      specialization: 'Cybersecurity',
      courseLoad: 3,
      researchActive: true,
      tenure: 'Tenure-Track',
      office: 'CS-108',
      email: 'erodriguez@university.edu'
    },
    {
      id: 4,
      name: 'Dr. Michael Park',
      title: 'Lecturer',
      specialization: 'Software Engineering',
      courseLoad: 5,
      researchActive: false,
      tenure: 'Non-Tenure',
      office: 'CS-405',
      email: 'mpark@university.edu'
    }
  ]

  const courses = [
    {
      code: 'CS 101',
      name: 'Introduction to Computer Science',
      sections: 8,
      enrollment: 320,
      capacity: 320,
      instructor: 'Multiple',
      term: 'Spring 2025'
    },
    {
      code: 'CS 250',
      name: 'Data Structures',
      sections: 6,
      enrollment: 178,
      capacity: 180,
      instructor: 'Dr. Chen',
      term: 'Spring 2025'
    },
    {
      code: 'CS 350',
      name: 'Software Engineering',
      sections: 4,
      enrollment: 112,
      capacity: 120,
      instructor: 'Prof. Park',
      term: 'Spring 2025'
    },
    {
      code: 'CS 420',
      name: 'Artificial Intelligence',
      sections: 2,
      enrollment: 58,
      capacity: 60,
      instructor: 'Dr. Mitchell',
      term: 'Spring 2025'
    },
    {
      code: 'CS 490',
      name: 'Senior Capstone',
      sections: 3,
      enrollment: 72,
      capacity: 75,
      instructor: 'Dr. Thompson',
      term: 'Spring 2025'
    }
  ]

  const programs = [
    { name: 'BS Computer Science', students: 850, type: 'Undergraduate' },
    { name: 'BA Computer Science', students: 120, type: 'Undergraduate' },
    { name: 'BS Software Engineering', students: 180, type: 'Undergraduate' },
    { name: 'MS Computer Science', students: 75, type: 'Graduate' },
    { name: 'MS Data Science', students: 45, type: 'Graduate' },
    { name: 'PhD Computer Science', students: 25, type: 'Doctoral' }
  ]

  const upcomingEvents = [
    { date: '2025-01-15', event: 'Faculty Meeting', type: 'meeting' },
    { date: '2025-01-20', event: 'Spring Semester Begins', type: 'academic' },
    { date: '2025-02-01', event: 'Research Grant Deadline', type: 'deadline' },
    { date: '2025-02-15', event: 'Curriculum Committee', type: 'meeting' },
    { date: '2025-03-01', event: 'Annual Review Submissions', type: 'deadline' }
  ]

  const getUtilization = (enrollment: number, capacity: number) => {
    return Math.round((enrollment / capacity) * 100)
  }

  const getTenureColor = (tenure: string) => {
    switch (tenure) {
      case 'Tenured': return 'bg-green-100 text-green-800'
      case 'Tenure-Track': return 'bg-blue-100 text-blue-800'
      case 'Non-Tenure': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Department Dashboard' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" />
              {department.name}
            </h1>
            <p className="text-muted-foreground">
              Department Chair: {department.chair}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* Budget Alert */}
        <Alert>
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>Budget Status:</strong> ${(department.budgetUsed / 1000000).toFixed(1)}M of ${(department.budget / 1000000).toFixed(1)}M used ({Math.round((department.budgetUsed / department.budget) * 100)}%)
              </span>
              <Button size="sm" variant="outline">View Budget Details</Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department.faculty}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department.students.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.enrollmentGrowth} YoY</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department.programs}</div>
              <p className="text-xs text-muted-foreground">Degree programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department.courses}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Research Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.researchGrants}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.graduationRate}</div>
              <p className="text-xs text-muted-foreground">4-year</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="faculty" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Faculty Members</CardTitle>
                    <CardDescription>
                      Department faculty and teaching assignments
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty Member</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Course Load</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.title}</TableCell>
                        <TableCell>{member.specialization}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{member.courseLoad} courses</span>
                            {member.courseLoad > 4 && (
                              <Badge variant="secondary" className="text-xs">High</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getTenureColor(member.tenure)} variant="outline">
                              {member.tenure}
                            </Badge>
                            {member.researchActive && (
                              <Badge variant="secondary" className="text-xs">
                                Research Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{member.office}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Mail className="h-3 w-3" />
                            </Button>
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

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Offerings</CardTitle>
                    <CardDescription>
                      Spring 2025 semester courses
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Builder
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{course.code}</p>
                            <p className="text-sm text-muted-foreground">{course.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{course.sections} sections</TableCell>
                        <TableCell>
                          <span className={course.enrollment === course.capacity ? 'text-red-600 font-medium' : ''}>
                            {course.enrollment} / {course.capacity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress
                              value={getUtilization(course.enrollment, course.capacity)}
                              className="h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {getUtilization(course.enrollment, course.capacity)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.term}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Programs</CardTitle>
                <CardDescription>
                  Degree programs offered by the department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {programs.map((program, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{program.name}</CardTitle>
                          <Badge variant="outline">{program.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-2xl font-bold">{program.students}</span>
                            <span className="text-sm text-muted-foreground">students</span>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Schedule</CardTitle>
                <CardDescription>
                  Upcoming events and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {new Date(event.date).getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{event.event}</p>
                          <Badge variant="secondary" className="mt-1">{event.type}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
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