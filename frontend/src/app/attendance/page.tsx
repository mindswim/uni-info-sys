"use client"

import { useState, useEffect } from "react"
import { DataPageTemplate } from "@/components/templates/data-page-template"
import { facultyService } from "@/services"
import type { CourseSection } from "@/types/api-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  QrCode,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  User,
  BookOpen,
  Eye,
  Edit,
  Loader2
} from "lucide-react"

interface AttendanceRecord {
  id: number
  student: {
    id: number
    name: string
    studentNumber: string
    avatar?: string
  }
  course: {
    id: number
    code: string
    name: string
    section: string
  }
  session: {
    id: number
    date: string
    startTime: string
    endTime: string
    location: string
    type: 'lecture' | 'lab' | 'seminar' | 'exam'
  }
  status: 'present' | 'absent' | 'late' | 'excused'
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  method: 'manual' | 'qr_code' | 'mobile_app' | 'card_swipe'
}

interface Course {
  id: number
  code: string
  name: string
  section: string
  term: string
  schedule: string
  enrolledStudents: number
  attendanceRate: number
  lastSession: string
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  useEffect(() => {
    loadAttendanceData()
  }, [])

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      const mySections = await facultyService.getMySections()
      setSections(mySections)
      setAttendanceRecords([]) // Attendance records would come from attendance API endpoint
    } catch (error) {
      console.error('Failed to load attendance data:', error)
      setError('Failed to load attendance data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data for development
  useEffect(() => {
    if (attendanceRecords.length === 0 && courses.length === 0 && !loading && !error) {
      const mockCourses: Course[] = [
        {
          id: 1,
          code: "CS350",
          name: "Introduction to Artificial Intelligence",
          section: "A",
          term: "Fall 2024",
          schedule: "MWF 10:00-11:00",
          enrolledStudents: 32,
          attendanceRate: 89,
          lastSession: "2024-12-12"
        },
        {
          id: 2,
          code: "CS250",
          name: "Data Structures and Algorithms",
          section: "B",
          term: "Fall 2024",
          schedule: "TTh 14:00-15:30",
          enrolledStudents: 28,
          attendanceRate: 92,
          lastSession: "2024-12-11"
        },
        {
          id: 3,
          code: "CS101",
          name: "Introduction to Programming",
          section: "C",
          term: "Fall 2024",
          schedule: "MWF 09:00-10:00",
          enrolledStudents: 45,
          attendanceRate: 85,
          lastSession: "2024-12-12"
        }
      ]

      const mockAttendance: AttendanceRecord[] = [
        {
          id: 1,
          student: { id: 1, name: "Alice Johnson", studentNumber: "STU001234" },
          course: { id: 1, code: "CS350", name: "Introduction to AI", section: "A" },
          session: {
            id: 1,
            date: "2024-12-12",
            startTime: "10:00",
            endTime: "11:00",
            location: "Room 201",
            type: "lecture"
          },
          status: "present",
          checkInTime: "09:58",
          checkOutTime: "11:03",
          method: "qr_code"
        },
        {
          id: 2,
          student: { id: 2, name: "Bob Smith", studentNumber: "STU001235" },
          course: { id: 1, code: "CS350", name: "Introduction to AI", section: "A" },
          session: {
            id: 1,
            date: "2024-12-12",
            startTime: "10:00",
            endTime: "11:00",
            location: "Room 201",
            type: "lecture"
          },
          status: "late",
          checkInTime: "10:15",
          checkOutTime: "11:00",
          method: "mobile_app",
          notes: "Traffic delay"
        },
        {
          id: 3,
          student: { id: 3, name: "Carol Davis", studentNumber: "STU001236" },
          course: { id: 2, code: "CS250", name: "Data Structures", section: "B" },
          session: {
            id: 2,
            date: "2024-12-11",
            startTime: "14:00",
            endTime: "15:30",
            location: "Lab 105",
            type: "lab"
          },
          status: "present",
          checkInTime: "13:55",
          checkOutTime: "15:32",
          method: "card_swipe"
        },
        {
          id: 4,
          student: { id: 4, name: "David Wilson", studentNumber: "STU001237" },
          course: { id: 1, code: "CS350", name: "Introduction to AI", section: "A" },
          session: {
            id: 1,
            date: "2024-12-12",
            startTime: "10:00",
            endTime: "11:00",
            location: "Room 201",
            type: "lecture"
          },
          status: "absent",
          method: "manual"
        },
        {
          id: 5,
          student: { id: 5, name: "Emma Brown", studentNumber: "STU001238" },
          course: { id: 3, code: "CS101", name: "Intro to Programming", section: "C" },
          session: {
            id: 3,
            date: "2024-12-12",
            startTime: "09:00",
            endTime: "10:00",
            location: "Room 301",
            type: "lecture"
          },
          status: "excused",
          method: "manual",
          notes: "Medical appointment"
        }
      ]

      setCourses(mockCourses)
      setAttendanceRecords(mockAttendance)
    }
  }, [attendanceRecords.length, courses.length, loading, error])

  const stats = [
    {
      label: "Today's Sessions",
      value: "8",
      description: "Classes scheduled today"
    },
    {
      label: "Overall Attendance",
      value: "89%",
      description: "This week's average"
    },
    {
      label: "Students Present",
      value: "247",
      description: "Currently in class"
    },
    {
      label: "Late Arrivals",
      value: "12",
      description: "Students checked in late"
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Attendance" }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />
      case 'excused': return <AlertCircle className="h-4 w-4 text-blue-500" />
      default: return <UserX className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'excused': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code': return <QrCode className="h-4 w-4" />
      case 'mobile_app': return <User className="h-4 w-4" />
      case 'card_swipe': return <BookOpen className="h-4 w-4" />
      default: return <Edit className="h-4 w-4" />
    }
  }

  const calculateAttendanceRate = (present: number, total: number) => {
    return Math.round((present / total) * 100)
  }

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesCourse = selectedCourse === "all" || record.course.id.toString() === selectedCourse
    const matchesSearch = record.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCourse && matchesSearch
  })

  const todaysSessionsData = [
    {
      id: 1,
      course: "CS350-A",
      time: "10:00-11:00",
      location: "Room 201",
      type: "lecture",
      enrolled: 32,
      present: 28,
      status: "completed"
    },
    {
      id: 2,
      course: "CS250-B",
      time: "14:00-15:30",
      location: "Lab 105",
      type: "lab",
      enrolled: 28,
      present: 26,
      status: "in_progress"
    },
    {
      id: 3,
      course: "CS101-C",
      time: "16:00-17:00",
      location: "Room 301",
      type: "lecture",
      enrolled: 45,
      present: 0,
      status: "upcoming"
    }
  ]

  // Loading state
  if (loading) {
    return (
      <DataPageTemplate
        title="Attendance Management"
        description="Track and manage student attendance across all your courses with real-time check-in capabilities"
        stats={stats}
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading attendance data...</span>
            </div>
          </CardContent>
        </Card>
      </DataPageTemplate>
    )
  }

  return (
    <DataPageTemplate
      title="Attendance Management"
      description="Track and manage student attendance across all your courses with real-time check-in capabilities"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today's Sessions</TabsTrigger>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code}-{course.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePickerWithRange />
            </div>

            <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Attendance QR Code</DialogTitle>
                  <DialogDescription>
                    Students can scan this QR code to check in to class
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center py-8">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    QR Code for CS350-A Lecture<br />
                    Room 201 • 10:00-11:00
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Download</Button>
                  <Button>Display on Screen</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {todaysSessionsData.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{session.course}</h3>
                        <Badge
                          variant={session.status === 'completed' ? 'default' :
                                  session.status === 'in_progress' ? 'secondary' : 'outline'}
                        >
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span className="capitalize">{session.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {session.present}/{session.enrolled}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {calculateAttendanceRate(session.present, session.enrolled)}% present
                        </div>
                        <Progress
                          value={calculateAttendanceRate(session.present, session.enrolled)}
                          className="w-20 mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {session.status === 'upcoming' && (
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Start Session
                          </Button>
                        )}
                        {session.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="outline">
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                            <Button size="sm">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Take Attendance
                            </Button>
                          </>
                        )}
                        {session.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {todaysSessionsData.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions scheduled</h3>
                  <p>No classes are scheduled for today</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          {/* Error State */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={loadAttendanceData}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.code}-{course.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Recent attendance data across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{record.student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.student.studentNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {record.course.code}-{record.course.section}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.course.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{record.session.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.session.startTime}-{record.session.endTime}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.session.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.checkInTime ? (
                          <div className="space-y-1">
                            <div className="text-sm">{record.checkInTime}</div>
                            {record.checkOutTime && (
                              <div className="text-xs text-muted-foreground">
                                Out: {record.checkOutTime}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMethodIcon(record.method)}
                          <span className="text-sm capitalize">
                            {record.method.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {record.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <UserX className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No records found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Attendance Trends
                </CardTitle>
                <CardDescription>Weekly attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{course.code}-{course.section}</span>
                        <span>{course.attendanceRate}%</span>
                      </div>
                      <Progress value={course.attendanceRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class Performance
                </CardTitle>
                <CardDescription>Attendance by course section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{course.code}-{course.section}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.enrolledStudents} students
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{course.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">avg attendance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Methods</CardTitle>
              <CardDescription>How students are checking in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-bold">52%</div>
                  <div className="text-sm text-muted-foreground">QR Code</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-bold">31%</div>
                  <div className="text-sm text-muted-foreground">Mobile App</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="font-bold">12%</div>
                  <div className="text-sm text-muted-foreground">Card Swipe</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Edit className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <div className="font-bold">5%</div>
                  <div className="text-sm text-muted-foreground">Manual</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
              <CardDescription>Configure attendance tracking preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Attendance settings and configuration options coming soon. This will include late arrival thresholds, automatic marking rules, and integration settings.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DataPageTemplate>
  )
}