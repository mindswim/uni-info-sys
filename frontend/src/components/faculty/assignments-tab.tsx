"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, FileText, Users, Clock, CheckCircle2, Pencil, Trash2, Eye, EyeOff, BarChart2 } from "lucide-react"
import { format, formatDistanceToNow, isPast } from "date-fns"

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
  description?: string
  type: string
  max_points: number
  weight?: number
  due_at: string
  available_from?: string
  late_due_at?: string
  late_penalty_percent?: number
  allow_late_submissions: boolean
  max_attempts?: number
  is_published: boolean
  submission_count?: number
  graded_count?: number
  average_score?: number
  created_at: string
}

const ASSIGNMENT_TYPES = [
  { value: 'homework', label: 'Homework' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'essay', label: 'Essay' },
  { value: 'lab', label: 'Lab' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'other', label: 'Other' },
]

export function AssignmentsTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'homework',
    max_points: 100,
    weight: 0,
    due_at: '',
    available_from: '',
    late_due_at: '',
    late_penalty_percent: 10,
    allow_late_submissions: false,
    max_attempts: 1,
    is_published: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchAssignments(selectedSection)
    }
  }, [selectedSection])

  const fetchSections = async () => {
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
    }
  }

  const fetchAssignments = async (sectionId: string) => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/assignments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch assignments')
      const data = await response.json()
      setAssignments(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const url = editingAssignment
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${editingAssignment.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${selectedSection}/assignments`

      const response = await fetch(url, {
        method: editingAssignment ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save assignment')

      toast({
        title: editingAssignment ? "Assignment Updated" : "Assignment Created",
        description: `"${formData.title}" has been ${editingAssignment ? 'updated' : 'created'}.`,
      })

      setDialogOpen(false)
      resetForm()
      fetchAssignments(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save assignment",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (assignment: Assignment) => {
    if (!confirm(`Delete "${assignment.title}"? This cannot be undone.`)) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${assignment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to delete assignment')

      toast({
        title: "Assignment Deleted",
        description: `"${assignment.title}" has been deleted.`,
      })

      fetchAssignments(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  const togglePublish = async (assignment: Assignment) => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const action = assignment.is_published ? 'unpublish' : 'publish'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${assignment.id}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error(`Failed to ${action} assignment`)

      toast({
        title: assignment.is_published ? "Unpublished" : "Published",
        description: `"${assignment.title}" is now ${assignment.is_published ? 'hidden from' : 'visible to'} students.`,
      })

      fetchAssignments(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'homework',
      max_points: 100,
      weight: 0,
      due_at: '',
      available_from: '',
      late_due_at: '',
      late_penalty_percent: 10,
      allow_late_submissions: false,
      max_attempts: 1,
      is_published: false,
    })
    setEditingAssignment(null)
  }

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      type: assignment.type,
      max_points: assignment.max_points,
      weight: assignment.weight || 0,
      due_at: assignment.due_at ? assignment.due_at.slice(0, 16) : '',
      available_from: assignment.available_from ? assignment.available_from.slice(0, 16) : '',
      late_due_at: assignment.late_due_at ? assignment.late_due_at.slice(0, 16) : '',
      late_penalty_percent: assignment.late_penalty_percent || 10,
      allow_late_submissions: assignment.allow_late_submissions,
      max_attempts: assignment.max_attempts || 1,
      is_published: assignment.is_published,
    })
    setDialogOpen(true)
  }

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.due_at)
    const now = new Date()

    if (!assignment.is_published) {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (isPast(dueDate)) {
      return <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
    }
    if (assignment.available_from && new Date(assignment.available_from) > now) {
      return <Badge variant="secondary">Scheduled</Badge>
    }
    return <Badge className="bg-green-500">Active</Badge>
  }

  const stats = {
    total: assignments.length,
    published: assignments.filter(a => a.is_published).length,
    active: assignments.filter(a => a.is_published && !isPast(new Date(a.due_at))).length,
    totalSubmissions: assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0),
  }

  return (
    <div className="space-y-6">
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
                  {section.course.course_code} - {section.course.title} (Sec {section.section_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSection && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Manage assignments for this course section</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Assignment title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Instructions and details..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
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
                        <Label htmlFor="max_points">Max Points</Label>
                        <Input
                          id="max_points"
                          type="number"
                          value={formData.max_points}
                          onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) || 0 })}
                        />
                      </div>
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
                        <Label htmlFor="due_at">Due Date</Label>
                        <Input
                          id="due_at"
                          type="datetime-local"
                          value={formData.due_at}
                          onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow_late"
                        checked={formData.allow_late_submissions}
                        onCheckedChange={(checked) => setFormData({ ...formData, allow_late_submissions: checked })}
                      />
                      <Label htmlFor="allow_late">Allow late submissions</Label>
                    </div>
                    {formData.allow_late_submissions && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div className="grid gap-2">
                          <Label htmlFor="late_due_at">Late Deadline</Label>
                          <Input
                            id="late_due_at"
                            type="datetime-local"
                            value={formData.late_due_at}
                            onChange={(e) => setFormData({ ...formData, late_due_at: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="late_penalty">Penalty (%)</Label>
                          <Input
                            id="late_penalty"
                            type="number"
                            value={formData.late_penalty_percent}
                            onChange={(e) => setFormData({ ...formData, late_penalty_percent: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                      <Label htmlFor="is_published">Publish immediately</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingAssignment ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first assignment to get started</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Assignment</TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead className="w-24">Points</TableHead>
                        <TableHead className="w-32">Due Date</TableHead>
                        <TableHead className="w-32">Submissions</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="font-medium">{assignment.title}</div>
                            {assignment.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {assignment.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {assignment.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {assignment.max_points}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(assignment.due_at), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(assignment.due_at), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{assignment.submission_count || 0}</span>
                              {assignment.graded_count !== undefined && (
                                <span className="text-muted-foreground">
                                  ({assignment.graded_count} graded)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(assignment)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePublish(assignment)}
                                title={assignment.is_published ? "Unpublish" : "Publish"}
                              >
                                {assignment.is_published ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(assignment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(assignment)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                Select a course section above to manage assignments
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
