'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG, apiRequest } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Users, BookOpen, Clock, Calendar, TrendingUp,
  MessageSquare, FileText, Award, AlertCircle, ChevronRight,
  GraduationCap, Building, Mail, Phone
} from 'lucide-react'

interface CourseSection {
  id: number
  course_code: string
  course_name: string
  section_number: string
  enrolled_count: number
  capacity: number
  schedule: string
  room: string
  term: string
}

interface Student {
  id: number
  student_number: string
  name: string
  email: string
  program: string
  year: number
  gpa: number
  attendance_rate: number
}

interface Assignment {
  id: number
  course: string
  title: string
  due_date: string
  submissions_count: number
  total_students: number
  average_grade: number | null
}

interface FacultyDashboard {
  faculty: {
    id: number
    name: string
    email: string
    phone: string
    office: string
    department: string
    title: string
    office_hours: string
  }
  statistics: {
    total_students: number
    courses_teaching: number
    pending_grading: number
    office_hours_today: boolean
    upcoming_classes: number
    messages_unread: number
  }
  current_courses: CourseSection[]
  recent_students: Student[]
  upcoming_assignments: Assignment[]
  announcements: Array<{
    id: number
    title: string
    date: string
    type: 'info' | 'warning' | 'success'
  }>
}

// Mock data generator
const generateMockDashboard = (): FacultyDashboard => {
  return {
    faculty: {
      id: 1,
      name: 'Dr. Elizabeth Harper',
      email: 'elizabeth.harper@university.edu',
      phone: '(555) 123-4567',
      office: 'Science Building, Room 302',
      department: 'Computer Science',
      title: 'Associate Professor',
      office_hours: 'Mon/Wed 2:00 PM - 4:00 PM'
    },
    statistics: {
      total_students: 127,
      courses_teaching: 4,
      pending_grading: 23,
      office_hours_today: true,
      upcoming_classes: 2,
      messages_unread: 5
    },
    current_courses: [
      {
        id: 1,
        course_code: 'CS 301',
        course_name: 'Algorithms',
        section_number: '001',
        enrolled_count: 32,
        capacity: 35,
        schedule: 'MWF 10:00 AM - 11:00 AM',
        room: 'SB 101',
        term: 'Fall 2024'
      },
      {
        id: 2,
        course_code: 'CS 401',
        course_name: 'Machine Learning',
        section_number: '001',
        enrolled_count: 28,
        capacity: 30,
        schedule: 'TTh 2:00 PM - 3:30 PM',
        room: 'SB 203',
        term: 'Fall 2024'
      },
      {
        id: 3,
        course_code: 'CS 201',
        course_name: 'Data Structures',
        section_number: '002',
        enrolled_count: 35,
        capacity: 35,
        schedule: 'MWF 1:00 PM - 2:00 PM',
        room: 'SB 105',
        term: 'Fall 2024'
      },
      {
        id: 4,
        course_code: 'CS 499',
        course_name: 'Senior Capstone',
        section_number: '001',
        enrolled_count: 18,
        capacity: 20,
        schedule: 'F 3:00 PM - 6:00 PM',
        room: 'SB 301',
        term: 'Fall 2024'
      }
    ],
    recent_students: [
      { id: 1, student_number: 'S001234', name: 'John Doe', email: 'john.doe@university.edu', program: 'Computer Science', year: 3, gpa: 3.8, attendance_rate: 95 },
      { id: 2, student_number: 'S001235', name: 'Jane Smith', email: 'jane.smith@university.edu', program: 'Computer Science', year: 2, gpa: 3.5, attendance_rate: 88 },
      { id: 3, student_number: 'S001236', name: 'Mike Johnson', email: 'mike.j@university.edu', program: 'Software Engineering', year: 4, gpa: 3.9, attendance_rate: 92 },
      { id: 4, student_number: 'S001237', name: 'Sarah Wilson', email: 'sarah.w@university.edu', program: 'Computer Science', year: 3, gpa: 3.2, attendance_rate: 78 },
      { id: 5, student_number: 'S001238', name: 'David Park', email: 'david.park@university.edu', program: 'Data Science', year: 2, gpa: 3.7, attendance_rate: 90 }
    ],
    upcoming_assignments: [
      { id: 1, course: 'CS 301', title: 'Problem Set 5', due_date: '2024-11-25', submissions_count: 12, total_students: 32, average_grade: null },
      { id: 2, course: 'CS 401', title: 'Midterm Project', due_date: '2024-11-28', submissions_count: 5, total_students: 28, average_grade: null },
      { id: 3, course: 'CS 201', title: 'Lab Assignment 8', due_date: '2024-11-26', submissions_count: 30, total_students: 35, average_grade: 85 },
      { id: 4, course: 'CS 499', title: 'Project Milestone 3', due_date: '2024-12-01', submissions_count: 0, total_students: 18, average_grade: null }
    ],
    announcements: [
      { id: 1, title: 'Faculty meeting tomorrow at 3 PM', date: '2024-11-20', type: 'info' },
      { id: 2, title: 'Grade submission deadline: Dec 15', date: '2024-11-19', type: 'warning' },
      { id: 3, title: 'Research grant approved', date: '2024-11-18', type: 'success' }
    ]
  }
}

export default function FacultyDashboardPage() {
  const [dashboard, setDashboard] = useState<FacultyDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Try authenticated endpoint
        const response = await apiRequest(`${API_CONFIG.V1.BASE}/faculty/dashboard`)
        if (response.ok) {
          const data = await response.json()
          setDashboard(data)
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data
        setDashboard(generateMockDashboard())
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>
  }

  if (!dashboard) {
    return <div className="flex items-center justify-center min-h-screen">Dashboard not available</div>
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800'
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {dashboard.faculty.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="py-1 px-3">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Faculty Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{dashboard.faculty.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{dashboard.faculty.name}</h2>
                <p className="text-muted-foreground">{dashboard.faculty.title}, {dashboard.faculty.department}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {dashboard.faculty.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {dashboard.faculty.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {dashboard.faculty.office}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Office Hours</p>
              <p className="font-medium">{dashboard.faculty.office_hours}</p>
              {dashboard.statistics.office_hours_today && (
                <Badge className="mt-2 bg-green-100 text-green-800">Today</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.statistics.total_students}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Teaching</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.statistics.courses_teaching}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.statistics.pending_grading}</div>
            <p className="text-xs text-muted-foreground">Assignments to grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {dashboard.announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.announcements.map(announcement => (
              <div key={announcement.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  {announcement.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  {announcement.type === 'success' && <Award className="h-4 w-4 text-green-600" />}
                  {announcement.type === 'info' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                  <span className="font-medium">{announcement.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">{announcement.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Recent Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
              <CardDescription>Fall 2024 Semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.current_courses.map(course => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{course.course_code} - {course.course_name}</h3>
                        <p className="text-sm text-muted-foreground">Section {course.section_number} • {course.room}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Course
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Schedule</p>
                        <p className="text-sm font-medium">{course.schedule}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enrollment</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(course.enrolled_count / course.capacity) * 100} className="flex-1" />
                          <span className="text-sm font-medium">{course.enrolled_count}/{course.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Students you've interacted with recently</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.recent_students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.student_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>Year {student.year}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${getGPAColor(student.gpa)}`}>
                          {student.gpa.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAttendanceColor(student.attendance_rate)}>
                          {student.attendance_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Assignments due in the next 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.upcoming_assignments.map(assignment => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      </div>
                      <Badge variant={assignment.submissions_count === 0 ? 'destructive' : 'secondary'}>
                        Due {new Date(assignment.due_date).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Submissions: </span>
                        <span className="font-medium">
                          {assignment.submissions_count}/{assignment.total_students}
                        </span>
                      </div>
                      {assignment.average_grade !== null && (
                        <div>
                          <span className="text-muted-foreground">Average: </span>
                          <span className="font-medium">{assignment.average_grade}%</span>
                        </div>
                      )}
                    </div>
                    <Progress
                      value={(assignment.submissions_count / assignment.total_students) * 100}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <Clock className="h-5 w-5 mb-2" />
              <span className="text-sm">Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <FileText className="h-5 w-5 mb-2" />
              <span className="text-sm">Enter Grades</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <MessageSquare className="h-5 w-5 mb-2" />
              <span className="text-sm">Send Announcement</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <TrendingUp className="h-5 w-5 mb-2" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}