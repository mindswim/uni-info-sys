'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG, apiRequest } from '@/config/api'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookOpen, Users, Save, Upload, Download,
  AlertCircle, CheckCircle, Clock, TrendingUp,
  Calculator, FileText, Mail, Filter
} from 'lucide-react'

interface CourseSection {
  id: number
  course_code: string
  course_name: string
  section_number: string
  term: string
  enrolled_students: number
}

interface StudentGrade {
  id: number
  student_id: number
  student_number: string
  student_name: string
  email: string
  attendance_rate: number
  assignments: {
    assignment1: number | null
    assignment2: number | null
    midterm: number | null
    final: number | null
    project: number | null
  }
  current_grade: string
  final_grade: string | null
  grade_points: number
  status: 'active' | 'dropped' | 'incomplete'
}

interface GradeStatistics {
  average: number
  median: number
  highest: number
  lowest: number
  distribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
}

// Mock data generator
const generateMockData = () => {
  const courses: CourseSection[] = [
    { id: 1, course_code: 'CS 301', course_name: 'Algorithms', section_number: '001', term: 'Fall 2024', enrolled_students: 32 },
    { id: 2, course_code: 'CS 401', course_name: 'Machine Learning', section_number: '001', term: 'Fall 2024', enrolled_students: 28 },
    { id: 3, course_code: 'CS 201', course_name: 'Data Structures', section_number: '002', term: 'Fall 2024', enrolled_students: 35 }
  ]

  const generateStudents = (courseId: number, count: number): StudentGrade[] => {
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Park', 'Emma Brown', 'Chris Lee', 'Anna Taylor']
    return Array.from({ length: count }, (_, i) => {
      const assignments = {
        assignment1: Math.random() > 0.1 ? Math.floor(Math.random() * 30) + 70 : null,
        assignment2: Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 70 : null,
        midterm: Math.random() > 0.1 ? Math.floor(Math.random() * 35) + 65 : null,
        final: Math.random() > 0.5 ? Math.floor(Math.random() * 35) + 65 : null,
        project: Math.random() > 0.3 ? Math.floor(Math.random() * 25) + 75 : null
      }

      const validGrades = Object.values(assignments).filter(g => g !== null) as number[]
      const average = validGrades.length > 0
        ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
        : 0

      const letterGrade =
        average >= 90 ? 'A' :
        average >= 80 ? 'B' :
        average >= 70 ? 'C' :
        average >= 60 ? 'D' : 'F'

      return {
        id: i + 1,
        student_id: 1000 + i,
        student_number: `S00${1234 + i}`,
        student_name: names[i % names.length],
        email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@university.edu`,
        attendance_rate: Math.floor(Math.random() * 30) + 70,
        assignments,
        current_grade: letterGrade,
        final_grade: Math.random() > 0.7 ? letterGrade : null,
        grade_points:
          letterGrade === 'A' ? 4.0 :
          letterGrade === 'B' ? 3.0 :
          letterGrade === 'C' ? 2.0 :
          letterGrade === 'D' ? 1.0 : 0.0,
        status: Math.random() > 0.95 ? 'dropped' : 'active'
      }
    })
  }

  return { courses, students: generateStudents(1, 32) }
}

export default function GradesPage() {
  const [selectedCourse, setSelectedCourse] = useState<CourseSection | null>(null)
  const [students, setStudents] = useState<StudentGrade[]>([])
  const [courses, setCourses] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGrade, setEditingGrade] = useState<{ studentId: number, field: string } | null>(null)
  const [tempGrades, setTempGrades] = useState<Record<string, string>>({})
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try authenticated endpoint
        const response = await apiRequest(`${API_CONFIG.V1.BASE}/faculty/courses`)
        if (response.ok) {
          const data = await response.json()
          setCourses(data.courses)
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0])
            setStudents(data.students)
          }
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data
        const mockData = generateMockData()
        setCourses(mockData.courses)
        setSelectedCourse(mockData.courses[0])
        setStudents(mockData.students)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateStatistics = (): GradeStatistics => {
    const grades = students
      .filter(s => s.status === 'active')
      .map(s => {
        const validGrades = Object.values(s.assignments).filter(g => g !== null) as number[]
        return validGrades.length > 0 ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length : 0
      })
      .filter(g => g > 0)

    if (grades.length === 0) {
      return {
        average: 0,
        median: 0,
        highest: 0,
        lowest: 0,
        distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
      }
    }

    const sorted = grades.sort((a, b) => a - b)
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }

    grades.forEach(grade => {
      if (grade >= 90) distribution.A++
      else if (grade >= 80) distribution.B++
      else if (grade >= 70) distribution.C++
      else if (grade >= 60) distribution.D++
      else distribution.F++
    })

    return {
      average: Math.round(grades.reduce((a, b) => a + b, 0) / grades.length * 10) / 10,
      median: sorted[Math.floor(sorted.length / 2)],
      highest: Math.max(...grades),
      lowest: Math.min(...grades),
      distribution
    }
  }

  const handleGradeEdit = (studentId: number, field: string, value: string) => {
    setEditingGrade({ studentId, field })
    setTempGrades({ ...tempGrades, [`${studentId}-${field}`]: value })
  }

  const saveGradeChange = (studentId: number, field: string) => {
    const value = tempGrades[`${studentId}-${field}`]
    const numValue = value ? parseFloat(value) : null

    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedAssignments = { ...student.assignments, [field]: numValue }
        const validGrades = Object.values(updatedAssignments).filter(g => g !== null) as number[]
        const average = validGrades.length > 0
          ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
          : 0

        const letterGrade =
          average >= 90 ? 'A' :
          average >= 80 ? 'B' :
          average >= 70 ? 'C' :
          average >= 60 ? 'D' : 'F'

        return {
          ...student,
          assignments: updatedAssignments,
          current_grade: letterGrade,
          grade_points:
            letterGrade === 'A' ? 4.0 :
            letterGrade === 'B' ? 3.0 :
            letterGrade === 'C' ? 2.0 :
            letterGrade === 'D' ? 1.0 : 0.0
        }
      }
      return student
    }))

    setEditingGrade(null)
    setUnsavedChanges(true)
  }

  const saveAllGrades = async () => {
    try {
      // In real app, would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save grades:', error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_number.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && student.status === 'active'
    if (filter === 'dropped') return matchesSearch && student.status === 'dropped'
    if (filter === 'failing') return matchesSearch && student.current_grade === 'F'
    return matchesSearch
  })

  const stats = calculateStatistics()

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-600'
    if (grade === 'B') return 'text-blue-600'
    if (grade === 'C') return 'text-yellow-600'
    if (grade === 'D') return 'text-orange-600'
    if (grade === 'F') return 'text-red-600'
    return 'text-gray-600'
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800'
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading grades...</div>
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Grades' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grade Management</h1>
            <p className="text-muted-foreground">Manage and track student grades</p>
          </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Alert className="w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You have unsaved changes</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Grades
          </Button>
          <Button
            onClick={saveAllGrades}
            disabled={!unsavedChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map(course => (
              <div
                key={course.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCourse?.id === course.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedCourse(course)
                  const mockData = generateMockData()
                  setStudents(mockData.students)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{course.term}</Badge>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{course.course_code}</h3>
                <p className="text-sm text-muted-foreground">{course.course_name}</p>
                <p className="text-sm mt-2">Section {course.section_number}</p>
                <p className="text-sm font-medium">{course.enrolled_students} students</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average}%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Grade</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.highest)}%</div>
                <p className="text-xs text-muted-foreground">Top performer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lowest Grade</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.lowest)}%</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Assignment completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.distribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-4">
                    <span className={`font-semibold w-8 ${getGradeColor(grade)}`}>{grade}</span>
                    <Progress
                      value={(count / students.filter(s => s.status === 'active').length) * 100}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">{count} ({Math.round((count / students.filter(s => s.status === 'active').length) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Grades</CardTitle>
                  <CardDescription>{selectedCourse.course_code} - {selectedCourse.course_name}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="failing">Failing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-center">Assignment 1</TableHead>
                      <TableHead className="text-center">Assignment 2</TableHead>
                      <TableHead className="text-center">Midterm</TableHead>
                      <TableHead className="text-center">Final</TableHead>
                      <TableHead className="text-center">Project</TableHead>
                      <TableHead className="text-center">Current Grade</TableHead>
                      <TableHead className="text-center">Final Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(student => (
                      <TableRow key={student.id} className={student.status === 'dropped' ? 'opacity-50' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.student_name}</p>
                            <p className="text-sm text-muted-foreground">{student.student_number}</p>
                            {student.status === 'dropped' && (
                              <Badge variant="destructive" className="text-xs">Dropped</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAttendanceColor(student.attendance_rate)}>
                            {student.attendance_rate}%
                          </Badge>
                        </TableCell>
                        {['assignment1', 'assignment2', 'midterm', 'final', 'project'].map(field => (
                          <TableCell key={field} className="text-center">
                            {editingGrade?.studentId === student.id && editingGrade?.field === field ? (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={tempGrades[`${student.id}-${field}`] ?? student.assignments[field as keyof typeof student.assignments] ?? ''}
                                onChange={(e) => setTempGrades({ ...tempGrades, [`${student.id}-${field}`]: e.target.value })}
                                onBlur={() => saveGradeChange(student.id, field)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveGradeChange(student.id, field)
                                  if (e.key === 'Escape') setEditingGrade(null)
                                }}
                                className="w-16 h-8"
                                autoFocus
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                                onClick={() => handleGradeEdit(student.id, field, String(student.assignments[field as keyof typeof student.assignments] ?? ''))}
                              >
                                {student.assignments[field as keyof typeof student.assignments] ?? '-'}
                              </div>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <span className={`font-semibold ${getGradeColor(student.current_grade)}`}>
                            {student.current_grade}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.final_grade ? (
                            <span className={`font-semibold ${getGradeColor(student.final_grade)}`}>
                              {student.final_grade}
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStudents(prev => prev.map(s =>
                                  s.id === student.id
                                    ? { ...s, final_grade: s.current_grade }
                                    : s
                                ))
                                setUnsavedChanges(true)
                              }}
                            >
                              Finalize
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </AppShell>
  )
}