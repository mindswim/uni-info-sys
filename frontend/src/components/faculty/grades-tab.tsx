"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Download, Save, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

const VALID_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP', 'W', 'I']

export function GradesTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progress, setProgress] = useState<GradingProgress | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch faculty's course sections
  useEffect(() => {
    fetchSections()
  }, [])

  // Fetch enrollments when section is selected
  useEffect(() => {
    if (selectedSection) {
      fetchEnrollments(selectedSection)
      fetchGradingProgress(selectedSection)
    }
  }, [selectedSection])

  const fetchSections = async () => {
    setLoading(true)
    setError(null)
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
      setError('Failed to load course sections')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async (sectionId: string) => {
    setLoading(true)
    setError(null)
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

      // Initialize grades state with existing grades
      const initialGrades: Record<number, string> = {}
      enrollmentData.forEach((enrollment: Enrollment) => {
        if (enrollment.grade) {
          initialGrades[enrollment.id] = enrollment.grade
        }
      })
      setGrades(initialGrades)
    } catch (err) {
      setError('Failed to load students')
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

  const handleGradeChange = (enrollmentId: number, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: grade.toUpperCase()
    }))
  }

  const validateGrade = (grade: string): boolean => {
    return VALID_GRADES.includes(grade.toUpperCase())
  }

  const handleSaveGrades = async () => {
    // Validate all grades
    const invalidGrades = Object.entries(grades).filter(([_, grade]) => grade && !validateGrade(grade))
    if (invalidGrades.length > 0) {
      toast({
        title: "Invalid Grades",
        description: `Please enter valid grades (${VALID_GRADES.slice(0, 5).join(', ')}, etc.)`,
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')

      // Filter out empty grades
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
        title: "Success",
        description: data.message || `Successfully saved ${data.data.successful} grades`,
      })

      // Refresh enrollments and progress
      await fetchEnrollments(selectedSection)
      await fetchGradingProgress(selectedSection)

      // Show any errors
      if (data.data.failed && Object.keys(data.data.failed).length > 0) {
        const failedCount = Object.keys(data.data.failed).length
        toast({
          title: "Partial Success",
          description: `${failedCount} grade(s) failed to save. Check the console for details.`,
          variant: "destructive",
        })
        console.error('Failed grades:', data.data.failed)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save grades",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleExportGrades = () => {
    if (!selectedSection || enrollments.length === 0) {
      toast({
        title: "No Data",
        description: "Please select a section with students first",
        variant: "destructive",
      })
      return
    }

    // Create CSV
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

    // Download
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

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.course.course_code} - {section.course.course_name} (Section {section.section_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedSection && (
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleExportGrades}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Grading Progress */}
      {progress && selectedSection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Grading Progress</CardTitle>
                <CardDescription>
                  {progress.graded} of {progress.total} students graded
                </CardDescription>
              </div>
              {progress.is_complete ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progress.pending} grade{progress.pending !== 1 ? 's' : ''} remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gradebook */}
      {selectedSection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gradebook</CardTitle>
                {selectedSectionData && (
                  <CardDescription>
                    {selectedSectionData.course.course_code} - {selectedSectionData.term.name}
                  </CardDescription>
                )}
              </div>
              <Button onClick={handleSaveGrades} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Grades'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students enrolled in this section</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-64">Email</TableHead>
                      <TableHead className="w-32">Current Grade</TableHead>
                      <TableHead className="w-32">New Grade</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-mono text-sm">
                          {enrollment.student.student_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {enrollment.student.user.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {enrollment.student.user.email}
                        </TableCell>
                        <TableCell>
                          {enrollment.grade ? (
                            <Badge variant="secondary">{enrollment.grade}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={grades[enrollment.id] || ''}
                            onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                            placeholder="A, B+, etc."
                            className="w-24 uppercase"
                            maxLength={3}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              enrollment.status === 'completed'
                                ? 'default'
                                : enrollment.status === 'enrolled'
                                ? 'secondary'
                                : 'outline'
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
            )}

            {enrollments.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>Valid grades:</strong> {VALID_GRADES.join(', ')}
                </p>
                <p className="mt-1">
                  Enter grades in the "New Grade" column and click "Save Grades" to submit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedSection && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course section above to view and manage grades
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
