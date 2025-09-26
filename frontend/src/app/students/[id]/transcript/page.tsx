'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { API_CONFIG, apiRequest } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, FileText, School, Calendar, Award, TrendingUp } from 'lucide-react'

interface TranscriptCourse {
  id: number
  course_code: string
  course_name: string
  credits: number
  grade: string
  grade_points: number
  term: string
  year: number
  instructor: string
  status: 'completed' | 'in_progress' | 'withdrawn'
}

interface AcademicTerm {
  term: string
  year: number
  courses: TranscriptCourse[]
  term_gpa: number
  term_credits: number
  term_quality_points: number
}

interface StudentTranscript {
  student: {
    id: number
    student_number: string
    first_name: string
    last_name: string
    email: string
    date_of_birth: string
    enrollment_date: string
    graduation_date?: string
    academic_standing: string
  }
  program: {
    name: string
    degree_type: string
    department: string
    faculty: string
  }
  academic_summary: {
    total_credits_earned: number
    total_credits_attempted: number
    total_quality_points: number
    cumulative_gpa: number
    major_gpa: number
    credits_required: number
    in_progress_credits: number
  }
  academic_terms: AcademicTerm[]
  honors_awards: Array<{
    title: string
    date: string
    description: string
  }>
}

// Grade point mapping
const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0, 'W': 0.0, 'I': 0.0
}

// Mock data generator for demo
const generateMockTranscript = (studentId: string): StudentTranscript => {
  const courses: TranscriptCourse[] = [
    // Fall 2023
    { id: 1, course_code: 'CS 101', course_name: 'Introduction to Computer Science', credits: 4, grade: 'A', grade_points: 4.0, term: 'Fall', year: 2023, instructor: 'Dr. Smith', status: 'completed' },
    { id: 2, course_code: 'MATH 201', course_name: 'Calculus I', credits: 4, grade: 'B+', grade_points: 3.3, term: 'Fall', year: 2023, instructor: 'Prof. Johnson', status: 'completed' },
    { id: 3, course_code: 'ENG 110', course_name: 'Composition I', credits: 3, grade: 'A-', grade_points: 3.7, term: 'Fall', year: 2023, instructor: 'Dr. Brown', status: 'completed' },
    { id: 4, course_code: 'HIST 101', course_name: 'World History', credits: 3, grade: 'B', grade_points: 3.0, term: 'Fall', year: 2023, instructor: 'Prof. Davis', status: 'completed' },

    // Spring 2024
    { id: 5, course_code: 'CS 201', course_name: 'Data Structures', credits: 4, grade: 'A-', grade_points: 3.7, term: 'Spring', year: 2024, instructor: 'Dr. Wilson', status: 'completed' },
    { id: 6, course_code: 'MATH 202', course_name: 'Calculus II', credits: 4, grade: 'B', grade_points: 3.0, term: 'Spring', year: 2024, instructor: 'Prof. Johnson', status: 'completed' },
    { id: 7, course_code: 'PHYS 201', course_name: 'Physics I', credits: 4, grade: 'B+', grade_points: 3.3, term: 'Spring', year: 2024, instructor: 'Dr. Lee', status: 'completed' },
    { id: 8, course_code: 'ENG 111', course_name: 'Composition II', credits: 3, grade: 'A', grade_points: 4.0, term: 'Spring', year: 2024, instructor: 'Dr. Brown', status: 'completed' },

    // Fall 2024 (current)
    { id: 9, course_code: 'CS 301', course_name: 'Algorithms', credits: 4, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, instructor: 'Dr. Smith', status: 'in_progress' },
    { id: 10, course_code: 'CS 320', course_name: 'Database Systems', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, instructor: 'Prof. Miller', status: 'in_progress' },
    { id: 11, course_code: 'MATH 301', course_name: 'Linear Algebra', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, instructor: 'Dr. Taylor', status: 'in_progress' },
    { id: 12, course_code: 'CS 350', course_name: 'Software Engineering', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, instructor: 'Prof. Anderson', status: 'in_progress' },
  ]

  // Group courses by term
  const termsMap = new Map<string, AcademicTerm>()
  courses.forEach(course => {
    const termKey = `${course.term} ${course.year}`
    if (!termsMap.has(termKey)) {
      termsMap.set(termKey, {
        term: course.term,
        year: course.year,
        courses: [],
        term_gpa: 0,
        term_credits: 0,
        term_quality_points: 0
      })
    }
    termsMap.get(termKey)!.courses.push(course)
  })

  // Calculate term GPAs
  const academicTerms = Array.from(termsMap.values()).map(term => {
    const completedCourses = term.courses.filter(c => c.status === 'completed')
    const termCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0)
    const termQualityPoints = completedCourses.reduce((sum, c) => sum + (c.credits * c.grade_points), 0)
    const termGPA = termCredits > 0 ? termQualityPoints / termCredits : 0

    return {
      ...term,
      term_gpa: Math.round(termGPA * 100) / 100,
      term_credits: termCredits,
      term_quality_points: termQualityPoints
    }
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.term === 'Spring' ? 1 : -1
  })

  // Calculate overall GPA
  const completedCourses = courses.filter(c => c.status === 'completed')
  const totalCreditsEarned = completedCourses.reduce((sum, c) => sum + c.credits, 0)
  const totalQualityPoints = completedCourses.reduce((sum, c) => sum + (c.credits * c.grade_points), 0)
  const cumulativeGPA = totalCreditsEarned > 0 ? totalQualityPoints / totalCreditsEarned : 0
  const inProgressCredits = courses.filter(c => c.status === 'in_progress').reduce((sum, c) => sum + c.credits, 0)

  return {
    student: {
      id: parseInt(studentId),
      student_number: `S00${studentId.padStart(4, '0')}`,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@university.edu',
      date_of_birth: '2005-03-15',
      enrollment_date: '2023-09-01',
      academic_standing: cumulativeGPA >= 3.5 ? 'Dean\'s List' : cumulativeGPA >= 2.0 ? 'Good Standing' : 'Academic Probation'
    },
    program: {
      name: 'Computer Science',
      degree_type: 'Bachelor of Science',
      department: 'Computer Science',
      faculty: 'Faculty of Science'
    },
    academic_summary: {
      total_credits_earned: totalCreditsEarned,
      total_credits_attempted: totalCreditsEarned + inProgressCredits,
      total_quality_points: totalQualityPoints,
      cumulative_gpa: Math.round(cumulativeGPA * 100) / 100,
      major_gpa: Math.round(cumulativeGPA * 100) / 100, // Simplified for demo
      credits_required: 120,
      in_progress_credits: inProgressCredits
    },
    academic_terms: academicTerms,
    honors_awards: cumulativeGPA >= 3.5 ? [
      { title: 'Dean\'s List', date: 'Fall 2023', description: 'Academic excellence with GPA 3.5 or higher' },
      { title: 'Dean\'s List', date: 'Spring 2024', description: 'Academic excellence with GPA 3.5 or higher' }
    ] : []
  }
}

export default function TranscriptPage() {
  const params = useParams()
  const studentId = params.id as string
  const [transcript, setTranscript] = useState<StudentTranscript | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        // Try authenticated endpoint first
        const response = await apiRequest(`${API_CONFIG.V1.STUDENTS}/${studentId}/transcript`)
        if (response.ok) {
          const data = await response.json()
          setTranscript(data)
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data for demo
        setTranscript(generateMockTranscript(studentId))
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [studentId])

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 font-semibold'
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    if (grade === 'F') return 'text-red-600'
    if (grade === 'IP') return 'text-gray-500'
    return 'text-gray-600'
  }

  const getStandingColor = (standing: string) => {
    if (standing.includes('Dean')) return 'bg-green-100 text-green-800'
    if (standing.includes('Good')) return 'bg-blue-100 text-blue-800'
    if (standing.includes('Probation')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading transcript...</div>
  }

  if (!transcript) {
    return <div className="flex items-center justify-center min-h-screen">Transcript not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <School className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Official Academic Transcript</CardTitle>
                <CardDescription>University of Excellence</CardDescription>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Student Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{transcript.student.first_name} {transcript.student.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student ID:</span>
              <span className="font-medium">{transcript.student.student_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{transcript.student.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span className="font-medium">{new Date(transcript.student.date_of_birth).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enrollment Date:</span>
              <span className="font-medium">{new Date(transcript.student.enrollment_date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Program:</span>
              <span className="font-medium">{transcript.program.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Degree:</span>
              <span className="font-medium">{transcript.program.degree_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{transcript.program.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faculty:</span>
              <span className="font-medium">{transcript.program.faculty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Academic Standing:</span>
              <Badge className={getStandingColor(transcript.student.academic_standing)}>
                {transcript.student.academic_standing}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Academic Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
              <p className="text-2xl font-bold">{transcript.academic_summary.cumulative_gpa.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Earned</p>
              <p className="text-2xl font-bold">{transcript.academic_summary.total_credits_earned}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Required</p>
              <p className="text-2xl font-bold">{transcript.academic_summary.credits_required}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{transcript.academic_summary.in_progress_credits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Honors and Awards */}
      {transcript.honors_awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Honors & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transcript.honors_awards.map((award, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{award.title}</p>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
                  </div>
                  <Badge variant="secondary">{award.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course History by Term */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Record by Term
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {transcript.academic_terms.map((term, termIndex) => (
            <div key={termIndex} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{term.term} {term.year}</h3>
                {term.term_gpa > 0 && (
                  <div className="flex items-center gap-4 text-sm">
                    <span>Term GPA: <strong>{term.term_gpa.toFixed(2)}</strong></span>
                    <span>Credits: <strong>{term.term_credits}</strong></span>
                  </div>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Instructor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {term.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.course_code}</TableCell>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className={`text-center font-medium ${getGradeColor(course.grade)}`}>
                        {course.grade}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.status === 'completed' ? (course.credits * course.grade_points).toFixed(1) : '-'}
                      </TableCell>
                      <TableCell>{course.instructor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {termIndex < transcript.academic_terms.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>This is an official transcript from University of Excellence</span>
            </div>
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}