"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, BookOpen, Award, Download, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from "@/hooks/use-toast"

interface Term {
  id: number
  term_name: string
  start_date: string
  end_date: string
}

interface EnrollmentTrend {
  term: string
  total: number
  active: number
  completed: number
}

interface ApplicationStats {
  status: string
  count: number
}

interface ProgramStats {
  program: string
  students: number
}

interface GradeDistribution {
  grade: string
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

export function AnalyticsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<string>("all")

  const [terms, setTerms] = useState<Term[]>([])
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([])
  const [applicationStats, setApplicationStats] = useState<ApplicationStats[]>([])
  const [programStats, setProgramStats] = useState<ProgramStats[]>([])
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([])

  const [totalStudents, setTotalStudents] = useState(0)
  const [totalEnrollments, setTotalEnrollments] = useState(0)
  const [totalApplications, setTotalApplications] = useState(0)
  const [avgGPA, setAvgGPA] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [selectedTerm])

  const fetchAllData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await Promise.all([
        fetchTerms(),
        fetchEnrollmentTrends(),
        fetchApplicationStats(),
        fetchProgramStats(),
        fetchGradeDistribution(),
        fetchSummaryStats()
      ])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTerms = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      setTerms(data.data || [])
    }
  }

  const fetchEnrollmentTrends = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      const enrollments = data.data || []

      // Group by term
      const termMap = new Map<string, { total: number, active: number, completed: number }>()
      enrollments.forEach((enrollment: any) => {
        const termName = enrollment.course_section?.term?.term_name || 'Unknown'
        const current = termMap.get(termName) || { total: 0, active: 0, completed: 0 }

        current.total++
        if (enrollment.status === 'active') current.active++
        if (enrollment.status === 'completed') current.completed++

        termMap.set(termName, current)
      })

      const trends = Array.from(termMap.entries()).map(([term, stats]) => ({
        term,
        ...stats
      }))

      setEnrollmentTrends(trends)
    }
  }

  const fetchApplicationStats = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      const applications = data.data || []

      // Group by status
      const statusMap = new Map<string, number>()
      applications.forEach((app: any) => {
        const status = app.status || 'unknown'
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
      })

      const stats = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }))

      setApplicationStats(stats)
    }
  }

  const fetchProgramStats = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      const students = data.data || []

      // Group by program
      const programMap = new Map<string, number>()
      students.forEach((student: any) => {
        const program = student.program?.program_name || 'No Program'
        programMap.set(program, (programMap.get(program) || 0) + 1)
      })

      const stats = Array.from(programMap.entries())
        .map(([program, students]) => ({ program, students }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 10) // Top 10 programs

      setProgramStats(stats)
    }
  }

  const fetchGradeDistribution = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      const enrollments = data.data || []

      // Group by grade
      const gradeMap = new Map<string, number>()
      enrollments.forEach((enrollment: any) => {
        if (enrollment.grade) {
          const grade = enrollment.grade.toUpperCase()
          gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1)
        }
      })

      // Order grades
      const gradeOrder = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
      const distribution = gradeOrder
        .filter(g => gradeMap.has(g))
        .map(grade => ({ grade, count: gradeMap.get(grade)! }))

      setGradeDistribution(distribution)
    }
  }

  const fetchSummaryStats = async () => {
    const token = localStorage.getItem('token')

    // Fetch students
    const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    if (studentsResponse.ok) {
      const data = await studentsResponse.json()
      setTotalStudents((data.data || []).length)
    }

    // Fetch enrollments
    const enrollmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    if (enrollmentsResponse.ok) {
      const data = await enrollmentsResponse.json()
      const enrollments = data.data || []
      setTotalEnrollments(enrollments.length)

      // Calculate average GPA
      const gradePoints: { [key: string]: number } = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
      }

      const gradedEnrollments = enrollments.filter((e: any) => e.grade && gradePoints[e.grade.toUpperCase()])
      if (gradedEnrollments.length > 0) {
        const totalPoints = gradedEnrollments.reduce((sum: number, e: any) =>
          sum + (gradePoints[e.grade.toUpperCase()] || 0), 0
        )
        setAvgGPA(totalPoints / gradedEnrollments.length)
      }
    }

    // Fetch applications
    const applicationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    if (applicationsResponse.ok) {
      const data = await applicationsResponse.json()
      setTotalApplications((data.data || []).length)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      })
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${filename}.csv has been downloaded`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and data visualization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {terms.map(term => (
                <SelectItem key={term.id} value={term.id.toString()}>
                  {term.term_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Course registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Admission applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Overall student performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Enrollment statistics by term</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(enrollmentTrends, 'enrollment-trends')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={enrollmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} name="Active" />
                  <Line type="monotone" dataKey="completed" stroke="#ffc658" strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Application Statistics</CardTitle>
                <CardDescription>Applications by status</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(applicationStats, 'application-stats')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Students by Program</CardTitle>
                <CardDescription>Top 10 programs by enrollment</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(programStats, 'program-stats')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={programStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ program, percent }) => `${program} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {programStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades across all courses</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(gradeDistribution, 'grade-distribution')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
