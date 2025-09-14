"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users2, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  XCircle,
  RefreshCw,
  DollarSign,
  GraduationCap,
  UserCog
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import UniversityAPI, { Staff, ApiResponse, Department } from "@/lib/university-api"
import authService from "@/lib/auth"
import { format } from "date-fns"

const staffFormSchema = z.object({
  user: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address")
  }),
  staff_number: z.string().min(1, "Staff number is required"),
  department_id: z.number().min(1, "Please select a department"),
  position: z.string().min(2, "Position is required"),
  hire_date: z.string().min(1, "Hire date is required"),
  salary: z.number().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  office_location: z.string().optional(),
  office_hours: z.string().optional(),
  specialization: z.string().optional()
})

type StaffFormData = z.infer<typeof staffFormSchema>

const positionTypes = [
  'Professor',
  'Associate Professor', 
  'Assistant Professor',
  'Lecturer',
  'Senior Lecturer',
  'Department Head',
  'Dean',
  'Administrative Assistant',
  'Lab Coordinator',
  'Research Fellow',
  'Visiting Professor',
  'Adjunct Professor'
]

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStaff, setTotalStaff] = useState(0)
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      user: {
        name: '',
        email: ''
      },
      staff_number: '',
      department_id: 0,
      position: '',
      hire_date: '',
      phone: '',
      office_location: '',
      office_hours: '',
      specialization: ''
    }
  })

  // Check authentication and load data
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setError('Please log in to access staff management')
      setLoading(false)
      return
    }

    if (!authService.hasAnyRole(['admin', 'staff'])) {
      setError('You do not have permission to access staff management')
      setLoading(false)
      return
    }

    Promise.all([loadStaff(), loadDepartments()])
  }, [currentPage, departmentFilter, positionFilter, searchTerm])

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        per_page: 20
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (departmentFilter && departmentFilter !== 'all') {
        params.department_id = parseInt(departmentFilter)
      }

      if (positionFilter && positionFilter !== 'all') {
        params.position = positionFilter
      }

      const response = await UniversityAPI.getStaff(params)

      setStaff(response.data)
      setTotalPages(response.meta?.last_page || 1)
      setTotalStaff(response.meta?.total || 0)
      
    } catch (err) {
      console.error('Failed to load staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const response = await UniversityAPI.getDepartments()
      setDepartments(response.data)
    } catch (err) {
      console.error('Failed to load departments:', err)
    }
  }

  const handleCreateStaff = async (data: StaffFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Create staff via API (will be implemented when backend endpoints are ready)
      console.log('Creating staff:', data)
      
      // For now, simulate success
      setTimeout(() => {
        setShowCreateDialog(false)
        form.reset()
        loadStaff() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to create staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to create staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStaff = async (data: StaffFormData) => {
    if (!selectedStaff) return

    try {
      setSubmitting(true)
      setError(null)

      // Update staff via API (will be implemented when backend endpoints are ready)
      console.log('Updating staff:', selectedStaff.id, data)
      
      // For now, simulate success
      setTimeout(() => {
        setShowEditDialog(false)
        setSelectedStaff(null)
        form.reset()
        loadStaff() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to update staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to update staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return

    try {
      setSubmitting(true)
      setError(null)

      // Delete staff via API (will be implemented when backend endpoints are ready)
      console.log('Deleting staff:', selectedStaff.id)
      
      // For now, simulate success
      setTimeout(() => {
        setShowDeleteDialog(false)
        setSelectedStaff(null)
        loadStaff() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to delete staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete staff')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    form.reset({
      user: {
        name: staffMember.user.name,
        email: staffMember.user.email
      },
      staff_number: staffMember.staff_number,
      department_id: staffMember.department_id,
      position: staffMember.position,
      hire_date: staffMember.hire_date,
      salary: staffMember.salary,
      phone: staffMember.phone,
      office_location: staffMember.office_location || '',
      office_hours: staffMember.office_hours || '',
      specialization: staffMember.specialization || ''
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !authService.isAuthenticated()) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to log in to access the staff management system.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !authService.hasAnyRole(['admin', 'staff'])) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You do not have permission to access staff management. 
              Admin or staff access required.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users2 className="h-8 w-8" />
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage faculty and staff members, their roles, and department assignments
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name, email, or staff number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[200px]">
                <UserCog className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positionTypes.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadStaff}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({totalStaff})</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <Users2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No staff members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || departmentFilter !== 'all' || positionFilter !== 'all'
                  ? 'Try adjusting your search filters'
                  : 'Get started by adding your first staff member'
                }
              </p>
              {!searchTerm && departmentFilter === 'all' && positionFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Position & Department</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((staffMember) => {
                    return (
                      <TableRow key={staffMember.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{staffMember.user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {staffMember.staff_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {staffMember.user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {staffMember.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{staffMember.position}</div>
                            <div className="text-sm text-muted-foreground">
                              {staffMember.department.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(staffMember.hire_date), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {staffMember.course_sections?.length || 0} sections
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(staffMember)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(staffMember)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalStaff)} of {totalStaff} staff members
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff member record with personal information and department assignment.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="user.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.smith@university.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="staff_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Number</FormLabel>
                      <FormControl>
                        <Input placeholder="STF001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionTypes.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hire Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="office_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Building A, Room 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="office_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Hours (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Mon-Wed 10am-12pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Machine Learning, Data Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Staff Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information and department assignment.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateStaff)} className="space-y-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="user.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.smith@university.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionTypes.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Update Staff Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStaff?.user.name}? This action cannot be undone.
              All related course assignments will also be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff} disabled={submitting}>
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Delete Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}