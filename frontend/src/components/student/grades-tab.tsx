"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, TrendingUp, BookOpen, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface Enrollment {
  id: number
  grade: string | null
  status: string
  enrollment_date: string
  completion_date: string | null
  course_section: {
    id: number
    section_number: string
    term: {
      id: number
      name: string
      start_date: string
      end_date: string
    }
    course: {
      course_code: string
      course_name: string
      credits: number
    }
  }
}

interface AcademicRecord {
  id: number
  term: {
    name: string
  }
  gpa: number
  credits_attempted: number
  credits_earned: number
}

const getGradeColor = (grade: string): string => {
  const letterGrade = grade.replace('+', '').replace('-', '')
  switch (letterGrade) {
    case 'A': return 'bg-green-500 text-white'
    case 'B': return 'bg-blue-500 text-white'
    case 'C': return 'bg-yellow-500 text-white'
    case 'D': return 'bg-orange-500 text-white'
    case 'F': return 'bg-red-500 text-white'
    case 'P': return 'bg-green-500 text-white'
    case 'W': return 'bg-gray-500 text-white'
    case 'I': return 'bg-purple-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const getGradePoints = (grade: string): number | null => {
  const gradeMap: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  }
  return gradeMap[grade] ?? null
}

export function GradesTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('auth_token')

      // Fetch student's enrollments
      const enrollmentsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!enrollmentsResponse.ok) throw new Error('Failed to fetch enrollments')

      const enrollmentsData = await enrollmentsResponse.json()
      setEnrollments(enrollmentsData.data || [])

      // Fetch academic records
      const recordsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me/academic-records`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        setAcademicRecords(recordsData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Calculate overall statistics
  const completedEnrollments = enrollments.filter(e => e.status === 'completed' && e.grade !== null)
  const inProgressEnrollments = enrollments.filter(e => e.status === 'enrolled')

  const totalCreditsEarned = completedEnrollments.reduce((sum, e) => {
    const points = getGradePoints(e.grade!)
    return points !== null && points > 0 ? sum + e.course_section.course.credits : sum
  }, 0)

  const totalCreditsAttempted = completedEnrollments.reduce((sum, e) =>
    sum + e.course_section.course.credits, 0
  )

  // Calculate cumulative GPA
  let totalGradePoints = 0
  let totalCreditsForGPA = 0
  completedEnrollments.forEach(e => {
    const points = getGradePoints(e.grade!)
    if (points !== null) {
      totalGradePoints += points * e.course_section.course.credits
      totalCreditsForGPA += e.course_section.course.credits
    }
  })
  const cumulativeGPA = totalCreditsForGPA > 0 ? (totalGradePoints / totalCreditsForGPA).toFixed(2) : 'N/A'

  // Group enrollments by term
  const enrollmentsByTerm = enrollments.reduce((acc, enrollment) => {
    const termName = enrollment.course_section.term.name
    if (!acc[termName]) {
      acc[termName] = []
    }
    acc[termName].push(enrollment)
    return acc
  }, {} as Record<string, Enrollment[]>)

  // Sort terms by most recent first
  const sortedTerms = Object.keys(enrollmentsByTerm).sort((a, b) => {
    const termA = enrollments.find(e => e.course_section.term.name === a)?.course_section.term.start_date
    const termB = enrollments.find(e => e.course_section.term.name === b)?.course_section.term.start_date
    return (termB || '').localeCompare(termA || '')
  })

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cumulativeGPA}</div>
            <p className="text-xs text-muted-foreground">
              {totalCreditsForGPA} graded credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsEarned}</div>
            <p className="text-xs text-muted-foreground">
              of {totalCreditsAttempted} attempted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              With final grades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Term */}
      {sortedTerms.map((termName) => {
        const termEnrollments = enrollmentsByTerm[termName]
        const termCompleted = termEnrollments.filter(e => e.grade !== null)
        const termInProgress = termEnrollments.filter(e => e.grade === null && e.status === 'enrolled')

        // Calculate term GPA
        let termGradePoints = 0
        let termCredits = 0
        termCompleted.forEach(e => {
          const points = getGradePoints(e.grade!)
          if (points !== null) {
            termGradePoints += points * e.course_section.course.credits
            termCredits += e.course_section.course.credits
          }
        })
        const termGPA = termCredits > 0 ? (termGradePoints / termCredits).toFixed(2) : null

        const termCreditsTotal = termEnrollments.reduce((sum, e) => sum + e.course_section.course.credits, 0)
        const gradingProgress = termEnrollments.length > 0 ? (termCompleted.length / termEnrollments.length) * 100 : 0

        return (
          <Card key={termName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{termName}</CardTitle>
                  <CardDescription className="mt-1">
                    {termEnrollments.length} course{termEnrollments.length !== 1 ? 's' : ''} • {termCreditsTotal} credits
                    {termGPA && ` • Term GPA: ${termGPA}`}
                  </CardDescription>
                </div>
                {termInProgress.length > 0 && (
                  <Badge variant="secondary">
                    {termCompleted.length}/{termEnrollments.length} Graded
                  </Badge>
                )}
              </div>
              {termInProgress.length > 0 && (
                <Progress value={gradingProgress} className="h-1 mt-2" />
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {termEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-mono font-medium">
                          {enrollment.course_section.course.course_code}
                        </TableCell>
                        <TableCell>
                          {enrollment.course_section.course.course_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {enrollment.course_section.course.credits}
                        </TableCell>
                        <TableCell className="text-center">
                          {enrollment.grade ? (
                            <Badge className={getGradeColor(enrollment.grade)}>
                              {enrollment.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              enrollment.status === 'completed'
                                ? 'default'
                                : enrollment.status === 'enrolled'
                                ? 'secondary'
                                : enrollment.status === 'withdrawn'
                                ? 'outline'
                                : 'secondary'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {enrollments.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No course enrollments found. Enroll in courses to see your grades here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
