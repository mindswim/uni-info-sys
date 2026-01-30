"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Download, Save, CheckCircle2, Clock, Search, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCcw, ChevronDown, AlertCircle, FileEdit
} from "lucide-react"
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

type SortField = 'name' | 'student_id' | 'grade'
type SortDirection = 'asc' | 'desc'

export function GradesTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progress, setProgress] = useState<GradingProgress | null>(null)
  const [distribution, setDistribution] = useState<GradeDistribution | null>(null)
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [originalGrades, setOriginalGrades] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showQuickGrades, setShowQuickGrades] = useState<number | null>(null)
  const { toast } = useToast()

  // Grade change request state
  const [gradeChangeDialogOpen, setGradeChangeDialogOpen] = useState(false)
  const [gradeChangeEnrollment, setGradeChangeEnrollment] = useState<Enrollment | null>(null)
  const [gradeChangeData, setGradeChangeData] = useState({ requested_grade: '', reason: '' })
  const [submittingGradeChange, setSubmittingGradeChange] = useState(false)
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Track if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return Object.entries(grades).some(([id, grade]) => {
      const original = originalGrades[parseInt(id)] || ''
      return grade !== original
    })
  }, [grades, originalGrades])

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
      const token = sessionStorage.getItem('auth_token')
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
      const token = sessionStorage.getItem('auth_token')
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
      setOriginalGrades(initialGrades)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGradingProgress = async (sectionId: string) => {
    try {
      const token = sessionStorage.getItem('auth_token')
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
      const token = sessionStorage.getItem('auth_token')
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
      const token = sessionStorage.getItem('auth_token')
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

  // Filter and sort enrollments
  const filteredEnrollments = useMemo(() => {
    let result = [...enrollments]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.student.user.name.toLowerCase().includes(query) ||
        e.student.student_id.toLowerCase().includes(query) ||
        e.student.user.email.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.student.user.name.localeCompare(b.student.user.name)
          break
        case 'student_id':
          comparison = a.student.student_id.localeCompare(b.student.student_id)
          break
        case 'grade':
          const gradeA = grades[a.id] || a.grade || 'ZZ'
          const gradeB = grades[b.id] || b.grade || 'ZZ'
          comparison = gradeA.localeCompare(gradeB)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [enrollments, searchQuery, sortField, sortDirection, grades])

  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentId: number, index: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const nextIndex = index + 1
      if (nextIndex < filteredEnrollments.length) {
        const nextId = filteredEnrollments[nextIndex].id
        inputRefs.current[nextId]?.focus()
        inputRefs.current[nextId]?.select()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = index + 1
      if (nextIndex < filteredEnrollments.length) {
        const nextId = filteredEnrollments[nextIndex].id
        inputRefs.current[nextId]?.focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = index - 1
      if (prevIndex >= 0) {
        const prevId = filteredEnrollments[prevIndex].id
        inputRefs.current[prevId]?.focus()
      }
    }
  }

  // Quick grade selection
  const applyQuickGrade = (enrollmentId: number, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: grade
    }))
    setShowQuickGrades(null)
  }

  // Reset all grades to original
  const handleResetGrades = () => {
    setGrades(originalGrades)
  }

  const handleRequestGradeChange = async () => {
    if (!gradeChangeEnrollment || !gradeChangeData.requested_grade || !gradeChangeData.reason) {
      toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }
    setSubmittingGradeChange(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/grade-change-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: gradeChangeEnrollment.id,
          requested_grade: gradeChangeData.requested_grade,
          reason: gradeChangeData.reason,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to submit grade change request')
      }
      toast({ title: "Request Submitted", description: "Grade change request sent for admin review" })
      setGradeChangeDialogOpen(false)
      setGradeChangeEnrollment(null)
      setGradeChangeData({ requested_grade: '', reason: '' })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmittingGradeChange(false)
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground" />
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold tabular-nums">{progress?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-bold tabular-nums">{progress?.graded || 0}/{progress?.total || 0}</div>
                  {progress?.is_complete ? (
                    <Badge className="bg-green-500 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {progress?.pending || 0} left
                    </Badge>
                  )}
                </div>
                <Progress value={progress?.percentage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Grading Progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold tabular-nums">
                  {distribution?.average_gpa ? distribution.average_gpa.toFixed(2) : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Class Average GPA</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-lg font-medium text-amber-600">Unsaved</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-medium text-green-600">Saved</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Changes Status</p>
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Grades</CardTitle>
                  <CardDescription>
                    {filteredEnrollments.length} students
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-amber-600">
                        (unsaved changes)
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetGrades}
                      className="text-muted-foreground"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No students enrolled</div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No matching students</div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead
                          className="w-32 cursor-pointer select-none"
                          onClick={() => toggleSort('student_id')}
                        >
                          <span className="flex items-center">
                            Student ID
                            {getSortIcon('student_id')}
                          </span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => toggleSort('name')}
                        >
                          <span className="flex items-center">
                            Name
                            {getSortIcon('name')}
                          </span>
                        </TableHead>
                        <TableHead
                          className="w-32 cursor-pointer select-none"
                          onClick={() => toggleSort('grade')}
                        >
                          <span className="flex items-center">
                            Grade
                            {getSortIcon('grade')}
                          </span>
                        </TableHead>
                        <TableHead className="w-24 text-center">Status</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnrollments.map((enrollment, index) => {
                        const currentGrade = grades[enrollment.id] || ''
                        const originalGrade = originalGrades[enrollment.id] || ''
                        const isChanged = currentGrade !== originalGrade
                        const isInvalid = currentGrade && !VALID_GRADES.includes(currentGrade.toUpperCase())

                        return (
                          <TableRow
                            key={enrollment.id}
                            className={`hover:bg-muted/30 transition-colors ${isChanged ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                          >
                            <TableCell className="font-mono text-sm">
                              {enrollment.student.student_id}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                {enrollment.student.user.name}
                                <p className="text-xs text-muted-foreground font-normal">
                                  {enrollment.student.user.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Popover
                                  open={showQuickGrades === enrollment.id}
                                  onOpenChange={(open) => setShowQuickGrades(open ? enrollment.id : null)}
                                >
                                  <PopoverTrigger asChild>
                                    <div className="relative flex-1">
                                      <Input
                                        ref={(el) => { inputRefs.current[enrollment.id] = el }}
                                        value={currentGrade}
                                        onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, enrollment.id, index)}
                                        placeholder="--"
                                        className={`w-20 uppercase font-mono text-center ${
                                          isInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''
                                        } ${currentGrade ? '' : 'text-muted-foreground'}`}
                                        style={currentGrade && GRADE_COLORS[currentGrade.toUpperCase()] ? {
                                          color: GRADE_COLORS[currentGrade.toUpperCase()],
                                          fontWeight: 600,
                                        } : undefined}
                                        maxLength={3}
                                      />
                                      {isInvalid && (
                                        <AlertCircle className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />
                                      )}
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2" align="start">
                                    <div className="grid grid-cols-5 gap-1">
                                      {VALID_GRADES.map(grade => (
                                        <Button
                                          key={grade}
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-10 font-mono text-sm"
                                          style={{ color: GRADE_COLORS[grade] }}
                                          onClick={() => applyQuickGrade(enrollment.id, grade)}
                                        >
                                          {grade}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                {isChanged && (
                                  <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                    changed
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {enrollment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {enrollment.grade && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Request Grade Change"
                                  onClick={() => {
                                    setGradeChangeEnrollment(enrollment)
                                    setGradeChangeData({ requested_grade: '', reason: '' })
                                    setGradeChangeDialogOpen(true)
                                  }}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Keyboard hints */}
              {filteredEnrollments.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Tip: Use Enter or Tab to move to the next student. Click on a grade field to see quick grade options.
                </p>
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

      {/* Grade Change Request Dialog */}
      <Dialog open={gradeChangeDialogOpen} onOpenChange={setGradeChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Grade Change</DialogTitle>
            <DialogDescription>
              {gradeChangeEnrollment && (
                <>Request a grade change for {gradeChangeEnrollment.student.user.name} (current grade: {gradeChangeEnrollment.grade})</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Grade *</Label>
              <Select value={gradeChangeData.requested_grade} onValueChange={(v) => setGradeChangeData({...gradeChangeData, requested_grade: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new grade" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Explain the reason for this grade change..."
                value={gradeChangeData.reason}
                onChange={(e) => setGradeChangeData({...gradeChangeData, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeChangeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestGradeChange} disabled={submittingGradeChange}>
              {submittingGradeChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
