"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService, type Student, type ApiResponse } from "@/services/api"
import {
  Users,
  GraduationCap,
  TrendingUp,
  Search,
  Filter,
  BookOpen,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  User,
  Heart,
  Loader2
} from "lucide-react"

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Enhanced Student Explorer" }
]

// Use Student interface from API service
interface StudentStats {
  total: number
  by_class_standing: Record<string, number>
  by_academic_status: Record<string, number>
  by_enrollment_status: Record<string, number>
  avg_gpa: number
  financial_aid_recipients: number
  with_test_scores: number
}

const getClassStandingColor = (standing: string) => {
  switch (standing) {
    case 'freshman': return 'bg-green-100 text-green-800'
    case 'sophomore': return 'bg-blue-100 text-blue-800'
    case 'junior': return 'bg-purple-100 text-purple-800'
    case 'senior': return 'bg-orange-100 text-orange-800'
    case 'graduate': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getAcademicStatusColor = (status: string) => {
  switch (status) {
    case 'good_standing': return 'bg-green-100 text-green-800'
    case 'academic_warning': return 'bg-yellow-100 text-yellow-800'
    case 'academic_probation': return 'bg-orange-100 text-orange-800'
    case 'academic_suspension': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getGPAColor = (gpa: number) => {
  if (gpa >= 3.7) return 'text-green-600'
  if (gpa >= 3.0) return 'text-blue-600'
  if (gpa >= 2.5) return 'text-yellow-600'
  return 'text-red-600'
}

export default function EnhancedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 20

  useEffect(() => {
    loadEnhancedStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, classFilter, statusFilter])

  const loadEnhancedStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load students using the API service
      const response = await apiService.getStudents({
        per_page: 1000 // Get all students for analytics
      })

      setStudents(response.data)
      calculateStats(response.data)

    } catch (error) {
      console.error('Failed to load enhanced students:', error)
      setError('Failed to load student data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (studentData: Student[]) => {
    const total = studentData.length

    const by_class_standing = studentData.reduce((acc, student) => {
      if (student.class_standing) {
        acc[student.class_standing] = (acc[student.class_standing] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const by_academic_status = studentData.reduce((acc, student) => {
      if (student.academic_status) {
        acc[student.academic_status] = (acc[student.academic_status] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const by_enrollment_status = studentData.reduce((acc, student) => {
      if (student.enrollment_status) {
        acc[student.enrollment_status] = (acc[student.enrollment_status] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const studentsWithGPA = studentData.filter(s => s.gpa && s.gpa > 0)
    const avg_gpa = studentsWithGPA.length > 0
      ? studentsWithGPA.reduce((sum, student) => sum + (student.gpa || 0), 0) / studentsWithGPA.length
      : 0
    const financial_aid_recipients = studentData.filter(s => s.receives_financial_aid).length
    const with_test_scores = studentData.filter(s => s.sat_score || s.act_score).length

    setStats({
      total,
      by_class_standing,
      by_academic_status,
      by_enrollment_status,
      avg_gpa,
      financial_aid_recipients,
      with_test_scores
    })
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.preferred_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class_standing === classFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.academic_status === statusFilter)
    }

    setFilteredStudents(filtered)
    setCurrentPage(1)
  }

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  )

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
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
              <Users className="h-8 w-8" />
              Enhanced Student Explorer
            </h1>
            <p className="text-muted-foreground">
              Enterprise-scale student management with complete academic profiles
            </p>
          </div>
          <Button onClick={loadEnhancedStudents}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Complete profiles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getGPAColor(stats.avg_gpa)}`}>
                  {stats.avg_gpa.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">4.0 scale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Financial Aid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((stats.financial_aid_recipients / stats.total) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.financial_aid_recipients} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Test Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((stats.with_test_scores / stats.total) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Have SAT/ACT</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Good Standing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((stats.by_academic_status.good_standing || 0) / stats.total) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Academic status</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Student Overview</TabsTrigger>
            <TabsTrigger value="analytics">Academic Analytics</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, student number, or preferred name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Class Levels</SelectItem>
                      <SelectItem value="freshman">Freshman</SelectItem>
                      <SelectItem value="sophomore">Sophomore</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Academic Status</SelectItem>
                      <SelectItem value="good_standing">Good Standing</SelectItem>
                      <SelectItem value="academic_warning">Academic Warning</SelectItem>
                      <SelectItem value="academic_probation">Academic Probation</SelectItem>
                      <SelectItem value="academic_suspension">Academic Suspension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

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
                    onClick={loadEnhancedStudents}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading enhanced student data...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Students Table */}
            {!loading && !error && (
              <Card>
              <CardHeader>
                <CardTitle>
                  Student Profiles ({filteredStudents.length.toLocaleString()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Academic Standing</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Financial</TableHead>
                      <TableHead>Background</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {student.preferred_name ? (
                                <>
                                  {student.preferred_name} "{student.first_name}" {student.last_name}
                                </>
                              ) : (
                                `${student.first_name} ${student.last_name}`
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.student_number}
                            </div>
                            {student.pronouns && (
                              <div className="text-xs text-muted-foreground">
                                {student.pronouns}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.class_standing && (
                              <Badge className={getClassStandingColor(student.class_standing)}>
                                {student.class_standing}
                              </Badge>
                            )}
                            {student.academic_status && (
                              <Badge className={getAcademicStatusColor(student.academic_status)} variant="outline">
                                {student.academic_status?.split('_').join(' ')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className={`font-medium ${getGPAColor(student.gpa)}`}>
                              {student.gpa.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Current: {student.semester_gpa.toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <strong>{student.total_credits_earned}</strong> earned
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.credits_in_progress} in progress
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.receives_financial_aid && (
                              <Badge variant="outline" className="bg-green-50">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Financial Aid
                              </Badge>
                            )}
                            {student.financial_hold && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Hold
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{student.high_school}</div>
                            <div className="text-sm text-muted-foreground">
                              Class of {student.high_school_graduation_year}
                            </div>
                            {(student.sat_score || student.act_score) && (
                              <div className="text-sm text-muted-foreground">
                                {student.sat_score && `SAT: ${student.sat_score}`}
                                {student.act_score && `ACT: ${student.act_score}`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Class Standing Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && Object.entries(stats.by_class_standing).map(([standing, count]) => {
                    const percentage = (count / stats.total) * 100
                    return (
                      <div key={standing} className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{standing}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && Object.entries(stats.by_academic_status).map(([status, count]) => {
                    const percentage = (count / stats.total) * 100
                    return (
                      <div key={status} className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{status.split('_').join(' ')}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics">
            <Alert>
              <Heart className="h-4 w-4" />
              <AlertDescription>
                This system supports modern demographic tracking including preferred names, pronouns,
                and diverse student backgrounds - reflecting real university diversity and inclusion practices.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Students with Preferred Names</span>
                    <Badge>{students.filter(s => s.preferred_name).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pronouns Recorded</span>
                    <Badge>{students.filter(s => s.pronouns).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>International Students</span>
                    <Badge>{students.filter(s => s.nationality !== 'American').length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Receiving Financial Aid</span>
                    <Badge className="bg-green-100">{students.filter(s => s.receives_financial_aid).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Financial Holds</span>
                    <Badge variant="destructive">{students.filter(s => s.financial_hold).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Full-Time Students</span>
                    <Badge>{students.filter(s => s.enrollment_status === 'full_time').length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Preparation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>With SAT Scores</span>
                    <Badge>{students.filter(s => s.sat_score).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>With ACT Scores</span>
                    <Badge>{students.filter(s => s.act_score).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average SAT</span>
                    <Badge>
                      {Math.round(students.filter(s => s.sat_score).reduce((sum, s) => sum + (s.sat_score || 0), 0) / students.filter(s => s.sat_score).length)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}