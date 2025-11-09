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
import { Users, UserPlus, Search, UserCheck, UserX, GraduationCap, Loader2, Edit, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { studentService } from "@/services"
import type { Student, User } from "@/types/api-types"

export function StudentsTab() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    student_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    enrollment_status: 'active'
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editFormData, setEditFormData] = useState({
    user_id: '',
    student_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    enrollment_status: 'active'
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      const [studentsData, usersResponse] = await Promise.all([
        studentService.getAll(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ])

      setStudents(studentsData.data || [])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleCreateStudent = async () => {
    if (!formData.user_id || !formData.student_number || !formData.first_name || !formData.last_name ||
        !formData.date_of_birth || !formData.gender || !formData.nationality || !formData.address ||
        !formData.city || !formData.country || !formData.phone || !formData.emergency_contact_name ||
        !formData.emergency_contact_phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(formData.user_id),
            student_number: formData.student_number,
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            nationality: formData.nationality,
            address: formData.address,
            city: formData.city,
            state: formData.state || undefined,
            postal_code: formData.postal_code || undefined,
            country: formData.country,
            phone: formData.phone,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            enrollment_status: formData.enrollment_status,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create student')
      }

      toast({
        title: "Student Created",
        description: "The student has been created successfully",
      })

      setDialogOpen(false)
      setFormData({
        user_id: '',
        student_number: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        enrollment_status: 'active'
      })
      fetchStudents()
    } catch (error: any) {
      console.error('Create student error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Student handlers
  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student)
    setEditFormData({
      user_id: student.user_id?.toString() || '',
      student_number: student.student_number || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      nationality: student.nationality || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      postal_code: student.postal_code || '',
      country: student.country || '',
      phone: student.phone || '',
      emergency_contact_name: student.emergency_contact_name || '',
      emergency_contact_phone: student.emergency_contact_phone || '',
      enrollment_status: student.enrollment_status || 'active'
    })
    setEditDialogOpen(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    if (!editFormData.user_id || !editFormData.student_number || !editFormData.first_name || !editFormData.last_name ||
        !editFormData.date_of_birth || !editFormData.gender || !editFormData.nationality || !editFormData.address ||
        !editFormData.city || !editFormData.country || !editFormData.phone || !editFormData.emergency_contact_name ||
        !editFormData.emergency_contact_phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${editingStudent.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(editFormData.user_id),
            student_number: editFormData.student_number,
            first_name: editFormData.first_name,
            last_name: editFormData.last_name,
            date_of_birth: editFormData.date_of_birth,
            gender: editFormData.gender,
            nationality: editFormData.nationality,
            address: editFormData.address,
            city: editFormData.city,
            state: editFormData.state || undefined,
            postal_code: editFormData.postal_code || undefined,
            country: editFormData.country,
            phone: editFormData.phone,
            emergency_contact_name: editFormData.emergency_contact_name,
            emergency_contact_phone: editFormData.emergency_contact_phone,
            enrollment_status: editFormData.enrollment_status,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update student')
      }

      toast({
        title: "Student Updated",
        description: "The student has been updated successfully",
      })

      setEditDialogOpen(false)
      setEditingStudent(null)
      fetchStudents()
    } catch (error: any) {
      console.error('Update student error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return

    setDeleting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/${deletingStudent.id}`,
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
        throw new Error(error.message || 'Failed to delete student')
      }

      toast({
        title: "Student Deleted",
        description: "The student has been deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingStudent(null)
      fetchStudents()
    } catch (error: any) {
      console.error('Delete student error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete student. Please try again.",
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
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.enrollment_status === 'active').length
  const inactiveStudents = students.filter(s => s.enrollment_status === 'inactive' || s.enrollment_status === 'suspended').length
  const graduatedStudents = students.filter(s => s.enrollment_status === 'graduated').length

  // Filter students by search term
  const filteredStudents = students.filter(student =>
    student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toString()}
          description="All students"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active"
          value={activeStudents.toString()}
          description="Currently enrolled"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Inactive"
          value={inactiveStudents.toString()}
          description="On leave/suspended"
          icon={<UserX className="h-4 w-4" />}
        />
        <StatCard
          title="Graduated"
          value={graduatedStudents.toString()}
          description="Completed program"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredStudents.slice(0, 20).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{student.user?.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>ID: {student.student_number}</span>
                      <span>GPA: {student.gpa?.toFixed(2) || 'N/A'}</span>
                      <span>{student.user?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}>
                      {student.enrollment_status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStudentClick(student)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(student)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {filteredStudents.length > 20 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Showing 20 of {filteredStudents.length} students
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Student Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Student</DialogTitle>
            <DialogDescription>
              Add a new student to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User and Student Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">User Account *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_number">Student Number *</Label>
                <Input
                  id="student_number"
                  placeholder="e.g., S2024001"
                  value={formData.student_number}
                  onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                />
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="e.g., American"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                />
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="space-y-2">
              <Label htmlFor="enrollment_status">Enrollment Status</Label>
              <Select
                value={formData.enrollment_status}
                onValueChange={(value) => setFormData({ ...formData, enrollment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStudent}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* User Account */}
            <div className="space-y-2">
              <Label htmlFor="edit_user_id">User Account *</Label>
              <Select
                value={editFormData.user_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, user_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Number */}
            <div className="space-y-2">
              <Label htmlFor="edit_student_number">Student Number *</Label>
              <Input
                id="edit_student_number"
                placeholder="e.g., STU-2024-001"
                value={editFormData.student_number}
                onChange={(e) => setEditFormData({ ...editFormData, student_number: e.target.value })}
              />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    placeholder="First name"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    placeholder="Last name"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_date_of_birth">Date of Birth *</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={editFormData.date_of_birth}
                    onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_gender">Gender</Label>
                  <Select
                    value={editFormData.gender}
                    onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_nationality">Nationality</Label>
                  <Input
                    id="edit_nationality"
                    placeholder="e.g., American"
                    value={editFormData.nationality}
                    onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Address Information</h4>
              <div className="space-y-2">
                <Label htmlFor="edit_address">Street Address</Label>
                <Input
                  id="edit_address"
                  placeholder="Street address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_city">City</Label>
                  <Input
                    id="edit_city"
                    placeholder="City"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_state">State/Province</Label>
                  <Input
                    id="edit_state"
                    placeholder="State or province"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_postal_code">Postal Code</Label>
                  <Input
                    id="edit_postal_code"
                    placeholder="Postal code"
                    value={editFormData.postal_code}
                    onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_country">Country</Label>
                  <Input
                    id="edit_country"
                    placeholder="Country"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Contact Information</h4>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone Number</Label>
                <Input
                  id="edit_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="edit_emergency_contact_name"
                    placeholder="Emergency contact name"
                    value={editFormData.emergency_contact_name}
                    onChange={(e) => setEditFormData({ ...editFormData, emergency_contact_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="edit_emergency_contact_phone"
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={editFormData.emergency_contact_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, emergency_contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="space-y-2">
              <Label htmlFor="edit_enrollment_status">Enrollment Status *</Label>
              <Select
                value={editFormData.enrollment_status}
                onValueChange={(value) => setEditFormData({ ...editFormData, enrollment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enrollment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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
              onClick={handleUpdateStudent}
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
                  Update Student
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
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingStudent && (
                <>
                  Are you sure you want to delete <strong>{deletingStudent.first_name} {deletingStudent.last_name}</strong> ({deletingStudent.student_number})?
                  <br /><br />
                  This action cannot be undone. All associated academic records and enrollments may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
