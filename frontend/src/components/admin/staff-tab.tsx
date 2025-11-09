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
import { Users, UserPlus, Search, Briefcase, Building, Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CsvImportExport } from "@/components/admin/csv-import-export"
import { adminService } from "@/services"
import type { Staff, User, Department } from "@/types/api-types"

export function StaffTab() {
  const { toast } = useToast()
  const [staff, setStaff] = useState<Staff[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    staff_number: '',
    job_title: '',
    department_id: '',
    hire_date: '',
    office_location: ''
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [editFormData, setEditFormData] = useState({
    user_id: '',
    staff_number: '',
    job_title: '',
    department_id: '',
    hire_date: '',
    office_location: ''
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      // Fetch staff, users, and departments in parallel
      const [staffData, usersData, departmentsData] = await Promise.all([
        adminService.getAllStaff(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }).then(res => res.json()),
        adminService.getAllDepartments()
      ])

      setStaff(staffData.data || [])
      setUsers(usersData.data || [])
      setDepartments(departmentsData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleCreateStaff = async () => {
    // Validation
    if (!formData.user_id || !formData.staff_number || !formData.job_title || !formData.department_id || !formData.hire_date) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(formData.user_id),
            staff_number: formData.staff_number,
            job_title: formData.job_title,
            department_id: parseInt(formData.department_id),
            hire_date: formData.hire_date,
            office_location: formData.office_location || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create staff member')
      }

      toast({
        title: "Staff Member Created",
        description: "The staff member has been created successfully",
      })

      setCreateDialogOpen(false)
      setFormData({
        user_id: '',
        staff_number: '',
        job_title: '',
        department_id: '',
        hire_date: '',
        office_location: ''
      })
      fetchStaff()
    } catch (error: any) {
      console.error('Create staff error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditStaffClick = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setEditFormData({
      user_id: staffMember.user_id?.toString() || '',
      staff_number: staffMember.staff_number || '',
      job_title: staffMember.job_title || '',
      department_id: staffMember.department_id?.toString() || '',
      hire_date: staffMember.hire_date || '',
      office_location: staffMember.office_location || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateStaff = async () => {
    if (!editingStaff) return

    // Validation
    if (!editFormData.user_id || !editFormData.staff_number || !editFormData.job_title || !editFormData.department_id || !editFormData.hire_date) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff/${editingStaff.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(editFormData.user_id),
            staff_number: editFormData.staff_number,
            job_title: editFormData.job_title,
            department_id: parseInt(editFormData.department_id),
            hire_date: editFormData.hire_date,
            office_location: editFormData.office_location || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update staff member')
      }

      toast({
        title: "Staff Member Updated",
        description: "The staff member has been updated successfully",
      })

      setEditDialogOpen(false)
      setEditingStaff(null)
      setEditFormData({
        user_id: '',
        staff_number: '',
        job_title: '',
        department_id: '',
        hire_date: '',
        office_location: ''
      })
      fetchStaff()
    } catch (error: any) {
      console.error('Update staff error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (staffMember: Staff) => {
    setDeletingStaff(staffMember)
    setDeleteDialogOpen(true)
  }

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return

    setDeleting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff/${deletingStaff.id}`,
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
        throw new Error(error.message || 'Failed to delete staff member')
      }

      toast({
        title: "Staff Member Deleted",
        description: "The staff member has been deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingStaff(null)
      fetchStaff()
    } catch (error: any) {
      console.error('Delete staff error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete staff member. Please try again.",
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
  const totalStaff = staff.length
  const uniqueDepartments = new Set(staff.map(s => s.department_id).filter(Boolean)).size
  const withOffice = staff.filter(s => s.office_location).length

  // Get unique job titles
  const jobTitles = new Set(staff.map(s => s.job_title).filter(Boolean)).size

  // Filter staff by search term
  const filteredStaff = staff.filter(s =>
    s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staff_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CsvImportExport
          entityName="staff"
          entityDisplayName="Staff"
          importEndpoint="/api/v1/staff/csv/import"
          exportEndpoint="/api/v1/staff/csv/export"
          templateEndpoint="/api/v1/staff/csv/template"
          onImportComplete={fetchStaff}
        />
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={totalStaff.toString()}
          description="All staff members"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Departments"
          value={uniqueDepartments.toString()}
          description="Unique departments"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Job Titles"
          value={jobTitles.toString()}
          description="Unique positions"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="With Office"
          value={withOffice.toString()}
          description="Assigned offices"
          icon={<Building className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No staff members found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredStaff.slice(0, 20).map((staffMember) => (
                <div key={staffMember.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{staffMember.user?.name || 'Unknown'}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>ID: {staffMember.staff_number}</span>
                      {staffMember.job_title && <span>{staffMember.job_title}</span>}
                      {staffMember.department && <span>{staffMember.department.name}</span>}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {staffMember.user?.email && <span>{staffMember.user.email}</span>}
                      {staffMember.office_location && <span>Office: {staffMember.office_location}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {staffMember.hire_date && (
                      <Badge variant="outline">
                        Hired: {new Date(staffMember.hire_date).getFullYear()}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStaffClick(staffMember)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(staffMember)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Staff Member</DialogTitle>
            <DialogDescription>
              Add a new staff member to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* User Account */}
            <div className="space-y-2">
              <Label htmlFor="user_id">User Account *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
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

            {/* Staff Number and Job Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff_number">Staff Number *</Label>
                <Input
                  id="staff_number"
                  placeholder="e.g., STF-2024-001"
                  value={formData.staff_number}
                  onChange={(e) => setFormData({ ...formData, staff_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  placeholder="e.g., Professor"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>
            </div>

            {/* Department and Hire Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department_id">Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
            </div>

            {/* Office Location */}
            <div className="space-y-2">
              <Label htmlFor="office_location">Office Location (Optional)</Label>
              <Input
                id="office_location"
                placeholder="e.g., Building A, Room 301"
                value={formData.office_location}
                onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
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
              onClick={handleCreateStaff}
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
                  Create Staff
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information
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

            {/* Staff Number and Job Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_staff_number">Staff Number *</Label>
                <Input
                  id="edit_staff_number"
                  placeholder="e.g., STF-2024-001"
                  value={editFormData.staff_number}
                  onChange={(e) => setEditFormData({ ...editFormData, staff_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_job_title">Job Title *</Label>
                <Input
                  id="edit_job_title"
                  placeholder="e.g., Professor"
                  value={editFormData.job_title}
                  onChange={(e) => setEditFormData({ ...editFormData, job_title: e.target.value })}
                />
              </div>
            </div>

            {/* Department and Hire Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_department_id">Department *</Label>
                <Select
                  value={editFormData.department_id}
                  onValueChange={(value) => setEditFormData({ ...editFormData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_hire_date">Hire Date *</Label>
                <Input
                  id="edit_hire_date"
                  type="date"
                  value={editFormData.hire_date}
                  onChange={(e) => setEditFormData({ ...editFormData, hire_date: e.target.value })}
                />
              </div>
            </div>

            {/* Office Location */}
            <div className="space-y-2">
              <Label htmlFor="edit_office_location">Office Location (Optional)</Label>
              <Input
                id="edit_office_location"
                placeholder="e.g., Building A, Room 301"
                value={editFormData.office_location}
                onChange={(e) => setEditFormData({ ...editFormData, office_location: e.target.value })}
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
              onClick={handleUpdateStaff}
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
                  Update Staff
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
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingStaff && (
                <>
                  Are you sure you want to delete <strong>{deletingStaff.user?.name}</strong> ({deletingStaff.staff_number})?
                  <br /><br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Staff Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
