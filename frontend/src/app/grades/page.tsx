"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, TrendingUp, Calendar, BookOpen, AlertCircle } from "lucide-react"

interface StudentData {
  id: number
  student_number: string
  first_name: string
  last_name: string
  email: string
  gpa: number
  status: string
}

interface Enrollment {
  id: number
  student_id: number
  student_name: string
  course_code: string
  course_title: string
  section: string
  status: string
  enrollment_date: string
  grade?: string
  waitlist_position?: number
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Academic", href: "/academic" },
  { label: "My Grades" }
]

export default function GradesPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStudentGrades()
  }, [])

  const loadStudentGrades = async () => {
    try {
      setLoading(true)
      setError(null)

      // Sophie Turner is student ID 3
      const studentId = 3

      // Get student info
      const studentsResponse = await fetch('http://localhost:8001/api/demo/students')
      const studentsData = await studentsResponse.json()
      const sophie = studentsData.data.find((s: StudentData) => s.id === studentId)

      // Get enrollments
      const enrollmentsResponse = await fetch('http://localhost:8001/api/demo/enrollments')
      const enrollmentsData = await enrollmentsResponse.json()
      const sophieEnrollments = enrollmentsData.data.filter((e: Enrollment) => e.student_id === studentId)

      setStudentData(sophie)
      setEnrollments(sophieEnrollments)
    } catch (err) {
      console.error('Failed to load student grades:', err)
      setError(err instanceof Error ? err.message : 'Failed to load grades')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      enrolled: { variant: "default", color: "bg-green-100 text-green-800" },
      waitlisted: { variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      completed: { variant: "outline", color: "bg-blue-100 text-blue-800" },
      dropped: { variant: "destructive", color: "bg-red-100 text-red-800" }
    } as const

    const config = variants[status as keyof typeof variants] || variants.enrolled

    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.7) return "text-green-600"
    if (gpa >= 3.0) return "text-blue-600"
    if (gpa >= 2.5) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              My Academic Record
            </h1>
            <p className="text-muted-foreground">
              {studentData?.first_name} {studentData?.last_name} • {studentData?.student_number}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                  <p className={`text-2xl font-bold ${getGradeColor(studentData?.gpa || 0)}`}>
                    {studentData?.gpa?.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrolled</p>
                  <p className="text-2xl font-bold text-green-600">
                    {enrollments.filter(e => e.status === 'enrolled').length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waitlisted</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {enrollments.filter(e => e.status === 'waitlisted').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
            <TabsTrigger value="progress">Degree Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Current Enrollments</CardTitle>
                <CardDescription>
                  Fall 2024 • {enrollments.length} courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{enrollment.course_code}</div>
                            <div className="text-sm text-muted-foreground">
                              {enrollment.course_title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.section}</TableCell>
                        <TableCell>
                          {getStatusBadge(enrollment.status)}
                          {enrollment.status === 'waitlisted' && enrollment.waitlist_position && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Position #{enrollment.waitlist_position}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {enrollment.grade ? (
                            <span className="font-medium">{enrollment.grade}</span>
                          ) : (
                            <span className="text-muted-foreground">In Progress</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Academic Transcript</CardTitle>
                <CardDescription>
                  Complete academic history with grades and credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Full Transcript View</h3>
                  <p>Complete transcript with GPA calculation coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Degree Progress</CardTitle>
                <CardDescription>
                  Track progress toward degree completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Core Requirements</span>
                      <span>75% Complete</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Major Requirements</span>
                      <span>60% Complete</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Electives</span>
                      <span>40% Complete</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>58% Complete</span>
                    </div>
                    <Progress value={58} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}