"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ClipboardCheck, Plus, Search, Users, BookOpen, CheckCircle, XCircle, Loader2, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Enrollment, Student, CourseSection, Term } from "@/types/api-types"
import { CsvImportExport } from "@/components/admin/csv-import-export"

export function EnrollmentsTab() {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterTerm, setFilterTerm] = useState<string>("all")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    course_section_id: '',
    status: 'enrolled',
    enrollment_date: new Date().toISOString().split('T')[0],
    grade: ''
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [editFormData, setEditFormData] = useState({
    student_id: '',
    course_section_id: '',
    status: 'enrolled',
    enrollment_date: '',
    grade: ''
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEnrollment, setDeletingEnrollment] = useState<Enrollment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      const [enrollmentsResponse, studentsResponse, sectionsResponse, termsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ])

      const enrollmentsData = await enrollmentsResponse.json()
      const studentsData = await studentsResponse.json()
      const sectionsData = await sectionsResponse.json()
      const termsData = await termsResponse.json()

      setEnrollments(enrollmentsData.data || [])
      setStudents(studentsData.data || [])
      setCourseSections(sectionsData.data || [])
      setTerms(termsData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const handleCreateEnrollment = async () => {
    if (!formData.student_id || !formData.course_section_id) {
      toast({
        title: "Validation Error",
        description: "Please select a student and course section",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            student_id: parseInt(formData.student_id),
            course_section_id: parseInt(formData.course_section_id),
            status: formData.status,
            enrollment_date: formData.enrollment_date,
            grade: formData.grade || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create enrollment')
      }

      toast({
        title: "Enrollment Created",
        description: "The enrollment has been created successfully",
      })

      setCreateDialogOpen(false)
      setFormData({
        student_id: '',
        course_section_id: '',
        status: 'enrolled',
        enrollment_date: new Date().toISOString().split('T')[0],
        grade: ''
      })
      fetchEnrollments()
    } catch (error: any) {
      console.error('Create enrollment error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create enrollment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment)
    setEditFormData({
      student_id: enrollment.student_id?.toString() || '',
      course_section_id: enrollment.course_section_id?.toString() || '',
      status: enrollment.status || 'enrolled',
      enrollment_date: enrollment.enrollment_date || '',
      grade: enrollment.grade || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateEnrollment = async () => {
    if (!editingEnrollment) return

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/${editingEnrollment.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            student_id: parseInt(editFormData.student_id),
            course_section_id: parseInt(editFormData.course_section_id),
            status: editFormData.status,
            enrollment_date: editFormData.enrollment_date,
            grade: editFormData.grade || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update enrollment')
      }

      toast({
        title: "Enrollment Updated",
        description: "The enrollment has been updated successfully",
      })

      setEditDialogOpen(false)
      setEditingEnrollment(null)
      fetchEnrollments()
    } catch (error: any) {
      console.error('Update enrollment error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update enrollment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (enrollment: Enrollment) => {
    setDeletingEnrollment(enrollment)
    setDeleteDialogOpen(true)
  }

  const handleDeleteEnrollment = async () => {
    if (!deletingEnrollment) return

    setDeleting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/${deletingEnrollment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete enrollment')
      }

      toast({
        title: "Enrollment Deleted",
        description: "The enrollment has been deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingEnrollment(null)
      fetchEnrollments()
    } catch (error: any) {
      console.error('Delete enrollment error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete enrollment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalEnrollments = enrollments.length
  const enrolledCount = enrollments.filter(e => e.status === 'enrolled').length
  const completedCount = enrollments.filter(e => e.status === 'completed').length
  const droppedCount = enrollments.filter(e => e.status === 'dropped' || e.status === 'withdrawn').length

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch =
      e.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.student?.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.course_section?.course?.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.course_section?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || e.status === filterStatus
    const matchesTerm = filterTerm === 'all' || e.course_section?.term_id?.toString() === filterTerm

    return matchesSearch && matchesStatus && matchesTerm
  })

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enrolled':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'dropped':
      case 'withdrawn':
        return 'destructive'
      case 'waitlisted':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Enrollments"
          value={totalEnrollments.toString()}
          description="All enrollments"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Active"
          value={enrolledCount.toString()}
          description="Currently enrolled"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          description="Finished courses"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Dropped/Withdrawn"
          value={droppedCount.toString()}
          description="No longer enrolled"
          icon={<XCircle className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, or course..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTerm} onValueChange={setFilterTerm}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <CsvImportExport
          entityName="enrollments"
          entityDisplayName="Enrollments"
          importEndpoint="/api/v1/enrollments/csv/import"
          exportEndpoint="/api/v1/enrollments/csv/export"
          templateEndpoint="/api/v1/enrollments/csv/template"
          onImportComplete={fetchEnrollments}
        />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Enrollment
        </Button>
      </div>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments ({filteredEnrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No enrollments found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEnrollments.slice(0, 50).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {enrollment.student?.first_name} {enrollment.student?.last_name}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        ({enrollment.student?.student_number})
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        {enrollment.course_section?.course?.course_code} - {enrollment.course_section?.course?.title}
                      </span>
                      <span>Section: {enrollment.course_section?.section_number}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                      {enrollment.grade && <span>Grade: {enrollment.grade}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(enrollment)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(enrollment)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {filteredEnrollments.length > 50 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Showing 50 of {filteredEnrollments.length} enrollments
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Enrollment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Enrollment</DialogTitle>
            <DialogDescription>
              Enroll a student in a course section
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Student */}
            <div className="space-y-2">
              <Label htmlFor="student_id">Student *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.first_name} {student.last_name} ({student.student_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Section */}
            <div className="space-y-2">
              <Label htmlFor="course_section_id">Course Section *</Label>
              <Select
                value={formData.course_section_id}
                onValueChange={(value) => setFormData({ ...formData, course_section_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course section" />
                </SelectTrigger>
                <SelectContent>
                  {courseSections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.course?.course_code} - {section.course?.title} (Section {section.section_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_date">Enrollment Date *</Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                />
              </div>
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (Optional)</Label>
              <Input
                id="grade"
                placeholder="e.g., A, B+, C"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEnrollment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>
              Update enrollment information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Student */}
            <div className="space-y-2">
              <Label htmlFor="edit_student_id">Student *</Label>
              <Select
                value={editFormData.student_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.first_name} {student.last_name} ({student.student_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Section */}
            <div className="space-y-2">
              <Label htmlFor="edit_course_section_id">Course Section *</Label>
              <Select
                value={editFormData.course_section_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, course_section_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course section" />
                </SelectTrigger>
                <SelectContent>
                  {courseSections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.course?.course_code} - {section.course?.title} (Section {section.section_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_enrollment_date">Enrollment Date *</Label>
                <Input
                  id="edit_enrollment_date"
                  type="date"
                  value={editFormData.enrollment_date}
                  onChange={(e) => setEditFormData({ ...editFormData, enrollment_date: e.target.value })}
                />
              </div>
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="edit_grade">Grade (Optional)</Label>
              <Input
                id="edit_grade"
                placeholder="e.g., A, B+, C"
                value={editFormData.grade}
                onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEnrollment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingEnrollment && (
                <>
                  Are you sure you want to delete the enrollment for{' '}
                  <strong>
                    {deletingEnrollment.student?.first_name} {deletingEnrollment.student?.last_name}
                  </strong>{' '}
                  in{' '}
                  <strong>
                    {deletingEnrollment.course_section?.course?.course_code}
                  </strong>?
                  <br /><br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEnrollment}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Enrollment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
