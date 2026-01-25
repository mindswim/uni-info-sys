"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Loader2, RefreshCw, Users, GraduationCap,
  Mail, AlertTriangle, TrendingUp, TrendingDown, Minus,
  BookOpen, ChevronRight
} from "lucide-react"
import { ApiClient } from "@/lib/api-client"

interface StudentEnrollment {
  id: number
  course_code: string
  course_title: string
  section_number: string
  status: string
  grade: string | null
}

interface Student {
  id: number
  student_number: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  gpa: number | null
  semester_gpa: number | null
  class_standing: string | null
  academic_status: string | null
  enrollment_status: string | null
  total_credits_earned: number | null
  credits_in_progress: number | null
  major: string | null
  financial_hold: boolean
  enrollments: StudentEnrollment[]
}

export function MyStudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('academic_status', statusFilter)

      const response = await ApiClient.get<{ data: Student[], meta: { total: number } }>(
        `/staff/me/students${params.toString() ? `?${params.toString()}` : ''}`
      )
      setStudents(response.data || [])
    } catch (err: any) {
      console.error('Failed to fetch students:', err)
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchStudents])

  const getGpaColor = (gpa: number | null) => {
    if (gpa === null) return "text-muted-foreground"
    if (gpa >= 3.5) return "text-green-600"
    if (gpa >= 3.0) return "text-blue-600"
    if (gpa >= 2.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getGpaTrend = (gpa: number | null, semesterGpa: number | null) => {
    if (gpa === null || semesterGpa === null) return null
    if (semesterGpa > gpa + 0.1) return "up"
    if (semesterGpa < gpa - 0.1) return "down"
    return "stable"
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'good_standing': 'default',
      'academic_warning': 'secondary',
      'academic_probation': 'destructive',
      'dean_list': 'default',
    }
    const labels: Record<string, string> = {
      'good_standing': 'Good Standing',
      'academic_warning': 'Warning',
      'academic_probation': 'Probation',
      'dean_list': "Dean's List",
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getClassStandingLabel = (standing: string | null) => {
    if (!standing) return '-'
    const labels: Record<string, string> = {
      'freshman': 'Freshman',
      'sophomore': 'Sophomore',
      'junior': 'Junior',
      'senior': 'Senior',
    }
    return labels[standing] || standing
  }

  // Calculate summary stats
  const stats = {
    total: students.length,
    avgGpa: students.filter(s => s.gpa).length > 0
      ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.filter(s => s.gpa).length).toFixed(2)
      : '-',
    atRisk: students.filter(s => s.academic_status === 'academic_probation' || s.academic_status === 'academic_warning').length,
    withHolds: students.filter(s => s.financial_hold).length,
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchStudents} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgGpa}</p>
                <p className="text-xs text-muted-foreground">Average GPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withHolds}</p>
                <p className="text-xs text-muted-foreground">Financial Holds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Academic Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="good_standing">Good Standing</SelectItem>
            <SelectItem value="academic_warning">Academic Warning</SelectItem>
            <SelectItem value="academic_probation">Academic Probation</SelectItem>
            <SelectItem value="dean_list">Dean's List</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchStudents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
              <p className="text-sm mt-1">Students enrolled in your courses will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-center">GPA</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const trend = getGpaTrend(student.gpa, student.semester_gpa)
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.first_name[0]}{student.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                            {student.financial_hold && (
                              <Badge variant="destructive" className="text-xs">Hold</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{student.student_number}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`font-semibold ${getGpaColor(student.gpa)}`}>
                              {student.gpa?.toFixed(2) || '-'}
                            </span>
                            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                            {trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span>{student.total_credits_earned || 0}</span>
                          {student.credits_in_progress ? (
                            <span className="text-muted-foreground text-xs"> (+{student.credits_in_progress})</span>
                          ) : null}
                        </TableCell>
                        <TableCell>{getClassStandingLabel(student.class_standing)}</TableCell>
                        <TableCell>{getStatusBadge(student.academic_status)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{student.enrollments.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                      {student.first_name[0]}{student.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span>{student.full_name}</span>
                                    <p className="text-sm font-normal text-muted-foreground">
                                      {student.student_number}
                                    </p>
                                  </div>
                                </DialogTitle>
                                <DialogDescription>
                                  {student.major || 'Undeclared Major'}
                                </DialogDescription>
                              </DialogHeader>

                              <Tabs defaultValue="overview" className="mt-4">
                                <TabsList>
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="courses">Your Courses</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium">{student.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Class Standing</p>
                                      <p className="font-medium">{getClassStandingLabel(student.class_standing)}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                                      <p className={`font-medium ${getGpaColor(student.gpa)}`}>
                                        {student.gpa?.toFixed(2) || '-'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Semester GPA</p>
                                      <p className={`font-medium ${getGpaColor(student.semester_gpa)}`}>
                                        {student.semester_gpa?.toFixed(2) || '-'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Credits Earned</p>
                                      <p className="font-medium">{student.total_credits_earned || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Credits In Progress</p>
                                      <p className="font-medium">{student.credits_in_progress || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Academic Status</p>
                                      {getStatusBadge(student.academic_status)}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Financial Hold</p>
                                      <p className="font-medium">
                                        {student.financial_hold ? (
                                          <Badge variant="destructive">Yes</Badge>
                                        ) : (
                                          <Badge variant="outline">None</Badge>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-4">
                                    <Button variant="outline" className="w-full" asChild>
                                      <a href={`mailto:${student.email}`}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Email
                                      </a>
                                    </Button>
                                  </div>
                                </TabsContent>

                                <TabsContent value="courses" className="mt-4">
                                  <div className="space-y-3">
                                    {student.enrollments.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-4">
                                        No enrollments in your courses
                                      </p>
                                    ) : (
                                      student.enrollments.map((enrollment) => (
                                        <div
                                          key={enrollment.id}
                                          className="flex items-center justify-between p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded">
                                              <BookOpen className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                              <p className="font-medium">
                                                {enrollment.course_code} - {enrollment.section_number}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {enrollment.course_title}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <Badge variant={
                                              enrollment.status === 'enrolled' ? 'default' :
                                              enrollment.status === 'completed' ? 'secondary' :
                                              'outline'
                                            }>
                                              {enrollment.status}
                                            </Badge>
                                            {enrollment.grade && (
                                              <p className="text-sm font-semibold mt-1">
                                                Grade: {enrollment.grade}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
