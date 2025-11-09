"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatCard } from "@/components/layouts"
import { Calendar, Plus, Search, Loader2, Edit, Trash2, Users, BookOpen, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Course {
  id: number
  course_code: string
  title: string
}

interface Term {
  id: number
  name: string
  academic_year: number
}

interface Staff {
  id: number
  first_name: string
  last_name: string
}

interface Room {
  id: number
  room_number: string
  building: { name: string }
}

interface CourseSection {
  id: number
  course_id: number
  term_id: number
  instructor_id: number | null
  room_id: number | null
  section_number: string
  capacity: number
  schedule_days: string[]
  start_time: string
  end_time: string
  status: string
  course?: Course
  term?: Term
  instructor?: Staff
  room?: Room
  enrollments_count?: number
}

const DAYS_OF_WEEK = [
  { value: 'Monday', label: 'Mon' },
  { value: 'Tuesday', label: 'Tue' },
  { value: 'Wednesday', label: 'Wed' },
  { value: 'Thursday', label: 'Thu' },
  { value: 'Friday', label: 'Fri' },
]

export function CourseSectionsTab() {
  const { toast } = useToast()
  const { token } = useAuth()
  const [sections, setSections] = useState<CourseSection[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [instructors, setInstructors] = useState<Staff[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerm, setSelectedTerm] = useState<string>("all")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    course_id: '',
    term_id: '',
    instructor_id: '',
    room_id: '',
    section_number: '',
    capacity: '30',
    schedule_days: [] as string[],
    start_time: '09:00',
    end_time: '10:30',
    status: 'Active'
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null)
  const [editFormData, setEditFormData] = useState({
    course_id: '',
    term_id: '',
    instructor_id: '',
    room_id: '',
    section_number: '',
    capacity: '30',
    schedule_days: [] as string[],
    start_time: '09:00',
    end_time: '10:30',
    status: 'Active'
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSection, setDeletingSection] = useState<CourseSection | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [sectionsRes, coursesRes, termsRes, staffRes, roomsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/buildings`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ])

      if (sectionsRes.ok) {
        const data = await sectionsRes.json()
        setSections(data.data || [])
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data.data || [])
      }

      if (termsRes.ok) {
        const data = await termsRes.json()
        setTerms(data.data || [])
      }

      if (staffRes.ok) {
        const data = await staffRes.json()
        setInstructors(data.data || [])
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json()
        const allRooms: Room[] = []
        if (data.data) {
          data.data.forEach((building: any) => {
            if (building.rooms) {
              building.rooms.forEach((room: any) => {
                allRooms.push({
                  ...room,
                  building: { name: building.name }
                })
              })
            }
          })
        }
        setRooms(allRooms)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to load data',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const handleCreateSection = async () => {
    if (!formData.course_id || !formData.term_id || !formData.section_number || formData.schedule_days.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one day",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          instructor_id: formData.instructor_id || null,
          room_id: formData.room_id || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create section')
      }

      toast({
        title: "Success",
        description: "Course section created successfully",
      })

      setCreateDialogOpen(false)
      setFormData({
        course_id: '',
        term_id: '',
        instructor_id: '',
        room_id: '',
        section_number: '',
        capacity: '30',
        schedule_days: [],
        start_time: '09:00',
        end_time: '10:30',
        status: 'Active'
      })
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create section',
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSection = async () => {
    if (!editFormData.course_id || !editFormData.term_id || !editFormData.section_number || !editingSection) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${editingSection.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          capacity: parseInt(editFormData.capacity),
          instructor_id: editFormData.instructor_id || null,
          room_id: editFormData.room_id || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update section')

      toast({
        title: "Success",
        description: "Section updated successfully",
      })

      setEditDialogOpen(false)
      setEditingSection(null)
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update section',
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSection = async () => {
    if (!deletingSection) return

    try {
      setDeleting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${deletingSection.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to delete section')

      toast({
        title: "Success",
        description: "Section deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingSection(null)
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete section',
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const toggleDay = (day: string, formType: 'create' | 'edit') => {
    const data = formType === 'create' ? formData : editFormData
    const setData = formType === 'create' ? setFormData : setEditFormData

    const newDays = data.schedule_days.includes(day)
      ? data.schedule_days.filter(d => d !== day)
      : [...data.schedule_days, day]

    setData({ ...data, schedule_days: newDays })
  }

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.course?.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.section_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTerm = selectedTerm === "all" || section.term_id.toString() === selectedTerm
    return matchesSearch && matchesTerm
  })

  const hasRequiredData = courses.length > 0 && terms.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Sections</h2>
          <p className="text-muted-foreground">Manage class sections, schedules, and instructors</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} disabled={!hasRequiredData}>
          <Plus className="mr-2 h-4 w-4" />
          Create Section
        </Button>
      </div>

      {/* Warning if missing data */}
      {!hasRequiredData && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-warning">
              <Calendar className="h-5 w-5" />
              <p className="font-medium">
                Please create courses and terms before adding sections.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Sections"
          value={sections.length.toString()}
          description="Class offerings"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Active"
          value={sections.filter(s => s.status === 'Active').length.toString()}
          description="Currently active"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Total Capacity"
          value={sections.reduce((sum, s) => sum + s.capacity, 0).toString()}
          description="Available seats"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Enrolled"
          value={sections.reduce((sum, s) => sum + (s.enrollments_count || 0), 0).toString()}
          description="Students enrolled"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-48">
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
      </div>

      {/* Sections List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-96" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No sections found</h3>
              <p className="text-muted-foreground">
                {!hasRequiredData
                  ? "Create courses and terms first"
                  : "Get started by creating your first section"}
              </p>
              {hasRequiredData && (
                <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Section
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {section.course?.course_code} - {section.course?.title}
                      </h3>
                      <Badge variant="outline">Section {section.section_number}</Badge>
                      <Badge variant={section.status === 'Active' ? 'default' : 'secondary'}>
                        {section.status}
                      </Badge>
                      {section.enrollments_count !== undefined && (
                        <Badge variant="secondary">
                          {section.enrollments_count}/{section.capacity} enrolled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {section.term?.name}
                      </span>
                      {section.schedule_days && section.schedule_days.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {section.schedule_days.map(d => d.substring(0, 3)).join(', ')} {section.start_time}-{section.end_time}
                        </span>
                      )}
                      {section.instructor && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {section.instructor.first_name} {section.instructor.last_name}
                        </span>
                      )}
                      {section.room && (
                        <span>
                          {section.room.building.name} {section.room.room_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingSection(section)
                        setEditFormData({
                          course_id: section.course_id.toString(),
                          term_id: section.term_id.toString(),
                          instructor_id: section.instructor_id?.toString() || '',
                          room_id: section.room_id?.toString() || '',
                          section_number: section.section_number,
                          capacity: section.capacity.toString(),
                          schedule_days: section.schedule_days || [],
                          start_time: section.start_time,
                          end_time: section.end_time,
                          status: section.status
                        })
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setDeletingSection(section)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course Section</DialogTitle>
            <DialogDescription>
              Schedule a new section for a course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term *</Label>
                <Select value={formData.term_id} onValueChange={(value) => setFormData({...formData, term_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_number">Section Number *</Label>
                <Input
                  id="section_number"
                  placeholder="e.g., A, 001"
                  value={formData.section_number}
                  onChange={(e) => setFormData({...formData, section_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Select value={formData.instructor_id} onValueChange={(value) => setFormData({...formData, instructor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {instructors.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Select value={formData.room_id} onValueChange={(value) => setFormData({...formData, room_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.building.name} - {room.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule Days *</Label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.schedule_days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value, 'create')}
                    />
                    <label htmlFor={`day-${day.value}`} className="text-sm">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar structure */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Section</DialogTitle>
            <DialogDescription>
              Update section information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course *</Label>
                <Select value={editFormData.course_id} onValueChange={(value) => setEditFormData({...editFormData, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term *</Label>
                <Select value={editFormData.term_id} onValueChange={(value) => setEditFormData({...editFormData, term_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section Number *</Label>
                <Input
                  placeholder="e.g., A, 001"
                  value={editFormData.section_number}
                  onChange={(e) => setEditFormData({...editFormData, section_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({...editFormData, capacity: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select value={editFormData.instructor_id} onValueChange={(value) => setEditFormData({...editFormData, instructor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {instructors.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={editFormData.room_id} onValueChange={(value) => setEditFormData({...editFormData, room_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.building.name} - {room.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule Days *</Label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day.value}`}
                      checked={editFormData.schedule_days.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value, 'edit')}
                    />
                    <label htmlFor={`edit-day-${day.value}`} className="text-sm">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={editFormData.start_time}
                  onChange={(e) => setEditFormData({...editFormData, start_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={editFormData.end_time}
                  onChange={(e) => setEditFormData({...editFormData, end_time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSection} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete section "{deletingSection?.section_number}" of {deletingSection?.course?.course_code}.
              All enrollments will be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
