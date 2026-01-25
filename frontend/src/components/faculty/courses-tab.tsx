"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText, Upload, Plus, Loader2, RefreshCw,
  MoreVertical, Pencil, Trash2, Eye, EyeOff,
  Clock, CheckCircle2, AlertCircle, Calendar,
  ClipboardList, BookOpen, GraduationCap
} from "lucide-react"
import { ApiClient } from "@/lib/api-client"
import { format, parseISO, isPast, formatDistanceToNow } from "date-fns"

interface CourseSection {
  id: number
  course: {
    course_code: string
    title: string
  }
  section_number: string
  term: {
    name: string
  }
}

interface Assignment {
  id: number
  course_section_id: number
  title: string
  description: string | null
  type: string
  due_date: string
  available_from: string | null
  max_points: number
  weight: number | null
  is_published: boolean
  allows_late: boolean
  late_penalty_per_day: number
  max_late_days: number | null
  submission_count?: number
  graded_count?: number
  course_section?: {
    course: {
      course_code: string
      title: string
    }
  }
}

const ASSIGNMENT_TYPES = [
  { value: 'homework', label: 'Homework', icon: ClipboardList },
  { value: 'quiz', label: 'Quiz', icon: BookOpen },
  { value: 'exam', label: 'Exam', icon: GraduationCap },
  { value: 'midterm', label: 'Midterm', icon: GraduationCap },
  { value: 'final', label: 'Final Exam', icon: GraduationCap },
  { value: 'project', label: 'Project', icon: FileText },
  { value: 'lab', label: 'Lab', icon: ClipboardList },
  { value: 'essay', label: 'Essay', icon: FileText },
]

export function CoursesTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "homework",
    due_date: "",
    available_from: "",
    max_points: "100",
    weight: "",
    is_published: false,
    allows_late: true,
    late_penalty_per_day: "10",
    max_late_days: "3",
  })

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      const response = await ApiClient.get<{ data: CourseSection[] }>('/staff/me/sections')
      setSections(response.data || [])
      if (response.data?.length > 0) {
        setSelectedSection(response.data[0].id.toString())
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    if (!selectedSection) return

    try {
      setLoadingAssignments(true)
      const response = await ApiClient.get<{ data: Assignment[] }>(
        `/course-sections/${selectedSection}/assignments`
      )
      setAssignments(response.data || [])
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoadingAssignments(false)
    }
  }, [selectedSection])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  useEffect(() => {
    if (selectedSection) {
      fetchAssignments()
    }
  }, [selectedSection, fetchAssignments])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "homework",
      due_date: "",
      available_from: "",
      max_points: "100",
      weight: "",
      is_published: false,
      allows_late: true,
      late_penalty_per_day: "10",
      max_late_days: "3",
    })
    setEditingAssignment(null)
  }

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      type: assignment.type,
      due_date: assignment.due_date ? format(parseISO(assignment.due_date), "yyyy-MM-dd'T'HH:mm") : "",
      available_from: assignment.available_from ? format(parseISO(assignment.available_from), "yyyy-MM-dd'T'HH:mm") : "",
      max_points: assignment.max_points.toString(),
      weight: assignment.weight?.toString() || "",
      is_published: assignment.is_published,
      allows_late: assignment.allows_late,
      late_penalty_per_day: assignment.late_penalty_per_day.toString(),
      max_late_days: assignment.max_late_days?.toString() || "",
    })
    setShowCreateDialog(true)
  }

  const handleSubmit = async () => {
    if (!selectedSection) return

    try {
      setSubmitting(true)

      const payload = {
        course_section_id: parseInt(selectedSection),
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        due_date: formData.due_date,
        available_from: formData.available_from || null,
        max_points: parseFloat(formData.max_points),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        is_published: formData.is_published,
        allows_late: formData.allows_late,
        late_penalty_per_day: parseFloat(formData.late_penalty_per_day),
        max_late_days: formData.max_late_days ? parseInt(formData.max_late_days) : null,
      }

      if (editingAssignment) {
        await ApiClient.put(`/assignments/${editingAssignment.id}`, payload)
      } else {
        await ApiClient.post('/assignments', payload)
      }

      setShowCreateDialog(false)
      resetForm()
      fetchAssignments()
    } catch (err) {
      console.error('Failed to save assignment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const togglePublish = async (assignment: Assignment) => {
    try {
      if (assignment.is_published) {
        await ApiClient.post(`/assignments/${assignment.id}/unpublish`)
      } else {
        await ApiClient.post(`/assignments/${assignment.id}/publish`)
      }
      fetchAssignments()
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  const deleteAssignment = async (assignment: Assignment) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      await ApiClient.delete(`/assignments/${assignment.id}`)
      fetchAssignments()
    } catch (err) {
      console.error('Failed to delete assignment:', err)
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = ASSIGNMENT_TYPES.find(t => t.value === type)
    const Icon = typeConfig?.icon || ClipboardList
    return <Icon className="h-4 w-4" />
  }

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = parseISO(assignment.due_date)
    const now = new Date()

    if (!assignment.is_published) {
      return <Badge variant="secondary">Draft</Badge>
    }

    if (isPast(dueDate)) {
      return <Badge variant="outline">Closed</Badge>
    }

    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursUntilDue < 24) {
      return <Badge variant="destructive">Due Soon</Badge>
    }

    return <Badge variant="default">Active</Badge>
  }

  const selectedSectionData = sections.find(s => s.id.toString() === selectedSection)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No course sections assigned</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a course section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.course.course_code} - {section.section_number} ({section.term.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={fetchAssignments} disabled={loadingAssignments}>
            <RefreshCw className={`h-4 w-4 ${loadingAssignments ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSectionData && (
                    <>For {selectedSectionData.course.course_code} - {selectedSectionData.course.title}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Assignment title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="max_points">Max Points *</Label>
                    <Input
                      id="max_points"
                      type="number"
                      value={formData.max_points}
                      onChange={(e) => setFormData({ ...formData, max_points: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Assignment description and instructions"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="available_from">Available From</Label>
                    <Input
                      id="available_from"
                      type="datetime-local"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (% of grade)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 10 for 10%"
                  />
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Late Submissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Students can submit after the due date
                      </p>
                    </div>
                    <Switch
                      checked={formData.allows_late}
                      onCheckedChange={(checked) => setFormData({ ...formData, allows_late: checked })}
                    />
                  </div>

                  {formData.allows_late && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="grid gap-2">
                        <Label>Penalty Per Day (%)</Label>
                        <Input
                          type="number"
                          value={formData.late_penalty_per_day}
                          onChange={(e) => setFormData({ ...formData, late_penalty_per_day: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Max Late Days</Label>
                        <Input
                          type="number"
                          value={formData.max_late_days}
                          onChange={(e) => setFormData({ ...formData, max_late_days: e.target.value })}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Publish Immediately</Label>
                    <p className="text-sm text-muted-foreground">
                      Make visible to students right away
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !formData.title || !formData.due_date}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Course Info Card */}
      {selectedSectionData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedSectionData.course.course_code} - {selectedSectionData.section_number}</CardTitle>
                <CardDescription>{selectedSectionData.course.title}</CardDescription>
              </div>
              <Badge variant="outline">{selectedSectionData.term.name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span>{assignments.length} Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{assignments.filter(a => a.is_published).length} Published</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>{assignments.filter(a => !a.is_published).length} Drafts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAssignments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments yet</p>
              <p className="text-sm mt-1">Create your first assignment to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const submissionPercent = assignment.submission_count
                      ? Math.round((assignment.graded_count || 0) / assignment.submission_count * 100)
                      : 0

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            {assignment.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {assignment.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(assignment.type)}
                            <span className="capitalize">{assignment.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {format(parseISO(assignment.due_date), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(assignment.due_date), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {assignment.max_points}
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{assignment.graded_count || 0}/{assignment.submission_count || 0}</span>
                              <span>{submissionPercent}%</span>
                            </div>
                            <Progress value={submissionPercent} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(assignment)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(assignment)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => togglePublish(assignment)}>
                                {assignment.is_published ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteAssignment(assignment)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
