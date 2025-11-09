"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, Save, CheckCircle2, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CourseSection {
  id: number
  course: {
    course_code: string
    course_name: string
  }
  section_number: string
  term: {
    name: string
  }
}

interface Enrollment {
  id: number
  student: {
    id: number
    user: {
      name: string
      email: string
    }
    student_id: string
  }
  grade: string | null
  status: string
}

interface GradingProgress {
  total: number
  graded: number
  pending: number
  percentage: number
  is_complete: boolean
}

interface GradeDistribution {
  distribution: Record<string, { count: number; percentage: number }>
  total_students: number
  average_gpa: number
  graded_count: number
  pending_count: number
}

const VALID_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']

const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e', 'A': '#22c55e', 'A-': '#22c55e',
  'B+': '#3b82f6', 'B': '#3b82f6', 'B-': '#3b82f6',
  'C+': '#eab308', 'C': '#eab308', 'C-': '#eab308',
  'D+': '#f97316', 'D': '#f97316', 'D-': '#f97316',
  'F': '#ef4444'
}

export function GradesTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progress, setProgress] = useState<GradingProgress | null>(null)
  const [distribution, setDistribution] = useState<GradeDistribution | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchEnrollments(selectedSection)
      fetchGradingProgress(selectedSection)
      fetchGradeDistribution(selectedSection)
    }
  }, [selectedSection])

  const fetchSections = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff/me/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch sections')

      const data = await response.json()
      setSections(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async (sectionId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/enrollments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch enrollments')

      const data = await response.json()
      const enrollmentData = data.data || []
      setEnrollments(enrollmentData)

      const initialGrades: Record<number, string> = {}
      enrollmentData.forEach((enrollment: Enrollment) => {
        if (enrollment.grade) {
          initialGrades[enrollment.id] = enrollment.grade
        }
      })
      setGrades(initialGrades)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGradingProgress = async (sectionId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/grading-progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch progress')

      const data = await response.json()
      setProgress(data.data)
    } catch (err) {
      console.error('Failed to fetch grading progress:', err)
    }
  }

  const fetchGradeDistribution = async (sectionId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/grade-distribution`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch distribution')

      const data = await response.json()
      setDistribution(data.data)
    } catch (err) {
      console.error('Failed to fetch grade distribution:', err)
    }
  }

  const handleGradeChange = (enrollmentId: number, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: grade.toUpperCase()
    }))
  }

  const handleSaveGrades = async () => {
    const invalidGrades = Object.entries(grades).filter(([_, grade]) =>
      grade && !VALID_GRADES.includes(grade.toUpperCase())
    )
    if (invalidGrades.length > 0) {
      toast({
        title: "Invalid Grades",
        description: "Please use valid letter grades (A, B+, C, etc.)",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const gradesToSubmit = Object.fromEntries(
        Object.entries(grades).filter(([_, grade]) => grade && grade.trim() !== '')
      )

      if (Object.keys(gradesToSubmit).length === 0) {
        toast({
          title: "No Grades to Save",
          description: "Please enter at least one grade",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${selectedSection}/grades/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ grades: gradesToSubmit }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save grades')
      }

      toast({
        title: "Grades Saved",
        description: `Successfully saved ${data.data.successful} grades`,
      })

      await fetchEnrollments(selectedSection)
      await fetchGradingProgress(selectedSection)
      await fetchGradeDistribution(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save grades",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportGrades = () => {
    if (!selectedSection || enrollments.length === 0) return

    const headers = ['Student ID', 'Name', 'Email', 'Grade', 'Status']
    const rows = enrollments.map(enrollment => [
      enrollment.student.student_id,
      enrollment.student.user.name,
      enrollment.student.user.email,
      grades[enrollment.id] || enrollment.grade || '',
      enrollment.status,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades-section-${selectedSection}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Grades exported to CSV",
    })
  }

  const selectedSectionData = sections.find(s => s.id.toString() === selectedSection)

  // Prepare chart data
  const chartData = distribution ?
    ['A', 'B', 'C', 'D', 'F'].map(grade => ({
      grade,
      count: (distribution.distribution[`${grade}+`]?.count || 0) +
             (distribution.distribution[grade]?.count || 0) +
             (distribution.distribution[`${grade}-`]?.count || 0)
    })).filter(d => d.count > 0) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gradebook</h2>
          <p className="text-muted-foreground">Manage student grades and track progress</p>
        </div>
        {selectedSection && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportGrades} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleSaveGrades} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        )}
      </div>

      {/* Section Selector */}
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a course section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.course.course_code} - {section.course.course_name} (Sec {section.section_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSection && (
        <>
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Grading Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">{progress?.graded || 0}/{progress?.total || 0}</div>
                  {progress?.is_complete ? (
                    <Badge className="bg-green-500 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {progress?.pending || 0} pending
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {distribution?.average_gpa ? distribution.average_gpa.toFixed(2) : '—'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gradebook Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No students enrolled</div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-32">Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-32">Current</TableHead>
                        <TableHead className="w-32">New Grade</TableHead>
                        <TableHead className="w-24 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-sm">
                            {enrollment.student.student_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {enrollment.student.user.name}
                          </TableCell>
                          <TableCell>
                            {enrollment.grade ? (
                              <Badge
                                variant="outline"
                                className="font-mono"
                                style={{
                                  borderColor: GRADE_COLORS[enrollment.grade],
                                  color: GRADE_COLORS[enrollment.grade]
                                }}
                              >
                                {enrollment.grade}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={grades[enrollment.id] || ''}
                              onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                              placeholder="A, B+..."
                              className="w-24 uppercase font-mono"
                              maxLength={3}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {enrollment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSection && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course section above to manage grades
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
