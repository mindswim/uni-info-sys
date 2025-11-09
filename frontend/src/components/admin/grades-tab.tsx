"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Award, TrendingUp, Users, BookOpen, Pencil, Download } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const VALID_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP', 'W', 'I', 'IP']

interface Student {
  id: number
  user_id: number
  student_id: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface Course {
  id: number
  course_code: string
  course_name: string
  credits: number
}

interface Term {
  id: number
  name: string
  type: string
  start_date: string
  end_date: string
}

interface CourseSection {
  id: number
  course_id: number
  term_id: number
  section_number: string
  course?: Course
  term?: Term
}

interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  status: string
  enrollment_date: string
  grade?: string
  grade_points?: number
  credits_earned?: number
  student?: Student
  course_section?: CourseSection
  created_at: string
  updated_at: string
}

interface GradeStats {
  total_enrollments: number
  graded: number
  pending: number
  average_gpa: number
  grade_distribution: Record<string, number>
}

export function GradesTab() {
  const { toast } = useToast()

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [termFilter, setTermFilter] = useState<string>('all')
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [editGrade, setEditGrade] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const [enrollmentsResponse, sectionsResponse, termsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ])

      if (!enrollmentsResponse.ok || !sectionsResponse.ok || !termsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const enrollmentsData = await enrollmentsResponse.json()
      const sectionsData = await sectionsResponse.json()
      const termsData = await termsResponse.json()

      setEnrollments(enrollmentsData.data || enrollmentsData)
      setCourseSections(sectionsData.data || sectionsData)
      setTerms(termsData.data || termsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch grade data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment)
    setEditGrade(enrollment.grade || '')
    setEditDialogOpen(true)
  }

  const handleUpdateGrade = async () => {
    if (!editingEnrollment) return

    if (editGrade && !VALID_GRADES.includes(editGrade.toUpperCase())) {
      toast({
        title: 'Invalid Grade',
        description: 'Please enter a valid letter grade (A, B+, C, etc.)',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/${editingEnrollment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grade: editGrade.toUpperCase() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update grade')
      }

      toast({
        title: 'Success',
        description: 'Grade updated successfully'
      })

      setEditDialogOpen(false)
      setEditingEnrollment(null)
      setEditGrade('')
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update grade',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = enrollment.student
    const section = enrollment.course_section
    const course = section?.course

    const matchesSearch =
      student?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.course_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTerm = termFilter === 'all' || section?.term_id.toString() === termFilter
    const matchesSection = sectionFilter === 'all' || section?.id.toString() === sectionFilter
    const matchesGrade = gradeFilter === 'all' ||
      (gradeFilter === 'graded' && enrollment.grade) ||
      (gradeFilter === 'pending' && !enrollment.grade)

    return matchesSearch && matchesTerm && matchesSection && matchesGrade
  })

  const getGradeBadgeVariant = (grade: string | undefined) => {
    if (!grade) return 'outline'
    if (grade.startsWith('A')) return 'default'
    if (grade.startsWith('B')) return 'secondary'
    if (grade.startsWith('C')) return 'outline'
    if (grade === 'F' || grade === 'NP') return 'destructive'
    return 'outline'
  }

  const calculateStats = (): GradeStats => {
    const totalEnrollments = enrollments.length
    const graded = enrollments.filter(e => e.grade).length
    const pending = totalEnrollments - graded

    const gradeDistribution: Record<string, number> = {}
    enrollments.forEach(e => {
      if (e.grade) {
        gradeDistribution[e.grade] = (gradeDistribution[e.grade] || 0) + 1
      }
    })

    const gradePoints = enrollments
      .filter(e => e.grade_points !== null && e.grade_points !== undefined)
      .map(e => e.grade_points!)
    const averageGpa = gradePoints.length > 0
      ? gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length
      : 0

    return {
      total_enrollments: totalEnrollments,
      graded,
      pending,
      average_gpa: averageGpa,
      grade_distribution: gradeDistribution
    }
  }

  const stats = calculateStats()
  const gradingPercentage = stats.total_enrollments > 0
    ? Math.round((stats.graded / stats.total_enrollments) * 100)
    : 0

  const handleExport = () => {
    const csvContent = [
      ['Student ID', 'Student Name', 'Course Code', 'Course Name', 'Section', 'Term', 'Grade', 'Grade Points', 'Status'],
      ...filteredEnrollments.map(e => [
        e.student?.student_id || '',
        e.student?.user?.name || '',
        e.course_section?.course?.course_code || '',
        e.course_section?.course?.course_name || '',
        e.course_section?.section_number || '',
        e.course_section?.term?.name || '',
        e.grade || 'Not Graded',
        e.grade_points?.toString() || '',
        e.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: 'Grades exported successfully'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grades Management</h1>
        <p className="text-muted-foreground">Manage student grades and academic records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_enrollments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graded}</div>
            <p className="text-xs text-muted-foreground">{gradingPercentage}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_gpa.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Grades</CardTitle>
              <CardDescription>View and manage all student grades</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id.toString()}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by grade status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-mono">
                          {enrollment.student?.student_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{enrollment.student?.user?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {enrollment.student?.user?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {enrollment.course_section?.course?.course_code}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {enrollment.course_section?.course?.course_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.course_section?.section_number}</TableCell>
                        <TableCell>{enrollment.course_section?.term?.name}</TableCell>
                        <TableCell>
                          {enrollment.grade ? (
                            <Badge variant={getGradeBadgeVariant(enrollment.grade)}>
                              {enrollment.grade}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Graded</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {enrollment.grade_points?.toFixed(2) || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === 'enrolled' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(enrollment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>
              Update grade for {editingEnrollment?.student?.user?.name} in{' '}
              {editingEnrollment?.course_section?.course?.course_code}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={editGrade} onValueChange={setEditGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Grade</SelectItem>
                  {VALID_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Valid grades: {VALID_GRADES.join(', ')}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Student Information</Label>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Student ID:</span> {editingEnrollment?.student?.student_id}</div>
                <div><span className="font-medium">Email:</span> {editingEnrollment?.student?.user?.email}</div>
                <div><span className="font-medium">Course:</span> {editingEnrollment?.course_section?.course?.course_name}</div>
                <div><span className="font-medium">Section:</span> {editingEnrollment?.course_section?.section_number}</div>
                <div><span className="font-medium">Term:</span> {editingEnrollment?.course_section?.term?.name}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGrade} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
