"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText, Download, Printer, GraduationCap, Award,
  Calendar, BookOpen, TrendingUp, CheckCircle, AlertCircle,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"

interface Student {
  id: number
  student_number: string
  first_name: string
  last_name: string
  gpa: number | null
  total_credits_earned: number
  enrollment_status: string
  class_standing: string | null
  major_program: {
    name: string
    code: string
    credits_required: number
  } | null
  user: {
    email: string
  }
}

interface Enrollment {
  id: number
  status: string
  grade: string | null
  course_section: {
    section_number: string
    term: {
      id: number
      name: string
      academic_year: string
      start_date: string
    }
    course: {
      course_code: string
      title: string
      credits: number
    }
  }
}

interface TermGroup {
  term_id: number
  term_name: string
  academic_year: string
  enrollments: Enrollment[]
  term_gpa: number
  term_credits: number
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
}

export function TranscriptsTab() {
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTranscriptData()
  }, [])

  const fetchTranscriptData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = sessionStorage.getItem('auth_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }

      const [studentRes, enrollmentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, { headers }),
      ])

      if (!studentRes.ok) throw new Error('Failed to load student profile')
      if (!enrollmentsRes.ok) throw new Error('Failed to load enrollments')

      const studentData = await studentRes.json()
      const enrollmentsData = await enrollmentsRes.json()

      setStudent(studentData.data)
      setEnrollments(enrollmentsData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transcript data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = () => {
    // In a real app, this would generate a PDF via the backend
    alert('PDF export would be implemented with a server-side PDF generator')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchTranscriptData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Student profile not found
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group enrollments by term
  const termGroups: TermGroup[] = []
  const termMap = new Map<number, TermGroup>()

  enrollments.forEach(enrollment => {
    if (!enrollment.course_section?.term) return

    const termId = enrollment.course_section.term.id

    if (!termMap.has(termId)) {
      termMap.set(termId, {
        term_id: termId,
        term_name: enrollment.course_section.term.name,
        academic_year: enrollment.course_section.term.academic_year,
        enrollments: [],
        term_gpa: 0,
        term_credits: 0,
      })
    }

    termMap.get(termId)!.enrollments.push(enrollment)
  })

  // Calculate term GPAs and sort by term date
  termMap.forEach(group => {
    let totalPoints = 0
    let totalCredits = 0

    group.enrollments.forEach(e => {
      if (e.grade && GRADE_POINTS[e.grade] !== undefined) {
        const credits = e.course_section.course.credits || 3
        totalPoints += GRADE_POINTS[e.grade] * credits
        totalCredits += credits
      }
    })

    group.term_gpa = totalCredits > 0 ? totalPoints / totalCredits : 0
    group.term_credits = totalCredits
    termGroups.push(group)
  })

  // Sort by term start date (most recent first)
  termGroups.sort((a, b) => {
    const aDate = a.enrollments[0]?.course_section?.term?.start_date || ''
    const bDate = b.enrollments[0]?.course_section?.term?.start_date || ''
    return bDate.localeCompare(aDate)
  })

  // Calculate cumulative stats
  const completedEnrollments = enrollments.filter(e => e.grade && e.status === 'completed')
  const totalCreditsEarned = student.total_credits_earned || completedEnrollments.reduce((sum, e) => {
    if (e.grade && GRADE_POINTS[e.grade] !== undefined && GRADE_POINTS[e.grade] > 0) {
      return sum + (e.course_section?.course?.credits || 3)
    }
    return sum
  }, 0)

  const requiredCredits = student.major_program?.credits_required || 120
  const progressPercentage = Math.round((totalCreditsEarned / requiredCredits) * 100)

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Academic Transcript</h2>
          <p className="text-muted-foreground">Unofficial transcript - For official copies, contact the registrar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTranscriptData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Student Info Header */}
      <Card className="print:border-2 print:border-black">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 print:gap-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center print:h-12 print:w-12">
              <GraduationCap className="h-8 w-8 text-primary print:h-6 print:w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl print:text-xl">
                {student.first_name} {student.last_name}
              </CardTitle>
              <CardDescription>
                Student ID: {student.student_number}
              </CardDescription>
            </div>
            <div className="ml-auto text-right">
              <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'} className="mb-1">
                {student.enrollment_status}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {student.class_standing && `${student.class_standing} Standing`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Program</p>
              <p className="font-medium">{student.major_program?.name || 'Undeclared'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
              <p className="text-2xl font-bold text-primary">
                {student.gpa?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Earned</p>
              <p className="font-medium">{totalCreditsEarned} / {requiredCredits}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript by Term */}
      {termGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Academic Record</h3>
              <p className="text-muted-foreground">
                Your transcript will appear here once you complete courses
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        termGroups.map((group) => (
          <Card key={group.term_id} className="print:break-inside-avoid">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{group.term_name}</CardTitle>
                    <CardDescription>Academic Year {group.academic_year}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Term GPA</div>
                  <div className="text-xl font-bold">
                    {group.term_gpa > 0 ? group.term_gpa.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {group.term_credits} credits
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead className="w-20 text-center">Credits</TableHead>
                    <TableHead className="w-20 text-center">Grade</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {enrollment.course_section?.course?.course_code}
                      </TableCell>
                      <TableCell>
                        {enrollment.course_section?.course?.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {enrollment.course_section?.course?.credits || 3}
                      </TableCell>
                      <TableCell className="text-center">
                        {enrollment.grade ? (
                          <Badge
                            variant="outline"
                            className="font-mono font-bold"
                          >
                            {enrollment.grade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            enrollment.status === 'completed' ? 'default' :
                            enrollment.status === 'enrolled' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Summary Stats */}
      {termGroups.length > 0 && (
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Academic Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Award className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-3xl font-bold text-primary">
                  {student.gpa?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Cumulative GPA</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-3xl font-bold">{totalCreditsEarned}</div>
                <div className="text-sm text-muted-foreground">Credits Earned</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-3xl font-bold">{termGroups.length}</div>
                <div className="text-sm text-muted-foreground">Terms Completed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-3xl font-bold">{completedEnrollments.length}</div>
                <div className="text-sm text-muted-foreground">Courses Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Footer */}
      <div className="hidden print:block text-center text-sm text-muted-foreground border-t pt-4 mt-8">
        <p>This is an unofficial transcript. For official transcripts, please contact the Office of the Registrar.</p>
        <p className="mt-1">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>
    </div>
  )
}
