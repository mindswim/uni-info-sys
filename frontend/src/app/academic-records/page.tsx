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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  School,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Eye
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import UniversityAPI, { AcademicRecord, Student, ApiResponse } from "@/lib/university-api"
import authService from "@/lib/auth"
import { format } from "date-fns"

const academicRecordFormSchema = z.object({
  student_id: z.number().min(1, "Please select a student"),
  institution_name: z.string().min(2, "Institution name is required"),
  degree_type: z.enum(["high_school", "bachelor", "master", "doctorate", "certificate", "diploma"], {
    required_error: "Please select a degree type"
  }),
  field_of_study: z.string().min(2, "Field of study is required"),
  graduation_date: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  transcript_verified: z.boolean().default(false)
})

type AcademicRecordFormData = z.infer<typeof academicRecordFormSchema>

const degreeTypes = [
  { value: "high_school", label: "High School" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" }
]

const verificationStatus = {
  true: { label: "Verified", variant: "default" as const, icon: CheckCircle },
  false: { label: "Pending", variant: "secondary" as const, icon: Clock }
}

export default function AcademicRecordsPage() {
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [degreeFilter, setDegreeFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AcademicRecordFormData>({
    resolver: zodResolver(academicRecordFormSchema),
    defaultValues: {
      student_id: 0,
      institution_name: '',
      degree_type: 'bachelor',
      field_of_study: '',
      graduation_date: '',
      gpa: undefined,
      transcript_verified: false
    }
  })

  // Check authentication and load data
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setError('Please log in to access academic records')
      setLoading(false)
      return
    }

    if (!authService.hasAnyRole(['admin', 'staff'])) {
      setError('You do not have permission to access academic records')
      setLoading(false)
      return
    }

    Promise.all([loadRecords(), loadStudents()])
  }, [currentPage, degreeFilter, verificationFilter, searchTerm])

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      // Since we don't have a direct academic records endpoint in UniversityAPI yet,
      // we'll simulate the API call structure
      console.log('Loading academic records with params:', {
        page: currentPage,
        per_page: 20,
        search: searchTerm,
        degree_type: degreeFilter !== 'all' ? degreeFilter : undefined,
        verified: verificationFilter !== 'all' ? verificationFilter === 'true' : undefined
      })

      // For now, simulate loading with empty data
      // This will be replaced when the backend API endpoints are implemented
      setRecords([])
      setTotalPages(1)
      setTotalRecords(0)
      
    } catch (err) {
      console.error('Failed to load academic records:', err)
      setError(err instanceof Error ? err.message : 'Failed to load academic records')
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await UniversityAPI.getStudents({ per_page: 100 })
      setStudents(response.data)
    } catch (err) {
      console.error('Failed to load students:', err)
    }
  }

  const handleCreateRecord = async (data: AcademicRecordFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Create academic record via API (will be implemented when backend endpoints are ready)
      console.log('Creating academic record:', data)
      
      // For now, simulate success
      setTimeout(() => {
        setShowCreateDialog(false)
        form.reset()
        loadRecords() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to create academic record:', err)
      setError(err instanceof Error ? err.message : 'Failed to create academic record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRecord = async (data: AcademicRecordFormData) => {
    if (!selectedRecord) return

    try {
      setSubmitting(true)
      setError(null)

      // Update academic record via API (will be implemented when backend endpoints are ready)
      console.log('Updating academic record:', selectedRecord.id, data)
      
      // For now, simulate success
      setTimeout(() => {
        setShowEditDialog(false)
        setSelectedRecord(null)
        form.reset()
        loadRecords() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to update academic record:', err)
      setError(err instanceof Error ? err.message : 'Failed to update academic record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return

    try {
      setSubmitting(true)
      setError(null)

      // Delete academic record via API (will be implemented when backend endpoints are ready)
      console.log('Deleting academic record:', selectedRecord.id)
      
      // For now, simulate success
      setTimeout(() => {
        setShowDeleteDialog(false)
        setSelectedRecord(null)
        loadRecords() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to delete academic record:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete academic record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyRecord = async () => {
    if (!selectedRecord) return

    try {
      setSubmitting(true)
      setError(null)

      // Verify academic record via API (will be implemented when backend endpoints are ready)
      console.log('Verifying academic record:', selectedRecord.id)
      
      // For now, simulate success
      setTimeout(() => {
        setShowVerifyDialog(false)
        setSelectedRecord(null)
        loadRecords() // Refresh the list
      }, 1000)
      
    } catch (err) {
      console.error('Failed to verify academic record:', err)
      setError(err instanceof Error ? err.message : 'Failed to verify academic record')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (record: AcademicRecord) => {
    setSelectedRecord(record)
    form.reset({
      student_id: record.student_id,
      institution_name: record.institution_name,
      degree_type: record.degree_type as any,
      field_of_study: record.field_of_study,
      graduation_date: record.graduation_date || '',
      gpa: record.gpa,
      transcript_verified: record.transcript_verified
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (record: AcademicRecord) => {
    setSelectedRecord(record)
    setShowDeleteDialog(true)
  }

  const openVerifyDialog = (record: AcademicRecord) => {
    setSelectedRecord(record)
    setShowVerifyDialog(true)
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
              You need to log in to access academic records.
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
              You do not have permission to access academic records. 
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
            <GraduationCap className="h-8 w-8" />
            Academic Records Management
          </h1>
          <p className="text-muted-foreground">
            Manage student academic histories, transcripts, and degree verification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records">Academic Records</TabsTrigger>
          <TabsTrigger value="transcripts">Transcript Management</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, institution, or field of study..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={degreeFilter} onValueChange={setDegreeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Award className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Degrees</SelectItem>
                    {degreeTypes.map((degree) => (
                      <SelectItem key={degree.value} value={degree.value}>
                        {degree.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-[200px]">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Pending Verification</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={loadRecords}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Academic Records List */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Records ({totalRecords})</CardTitle>
              <CardDescription>
                Showing page {currentPage} of {totalPages}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No academic records found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || degreeFilter !== 'all' || verificationFilter !== 'all'
                      ? 'Try adjusting your search filters'
                      : 'Get started by adding the first academic record'
                    }
                  </p>
                  {!searchTerm && degreeFilter === 'all' && verificationFilter === 'all' && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Record
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Degree & Field</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => {
                        const statusInfo = verificationStatus[record.transcript_verified ? 'true' : 'false']
                        const StatusIcon = statusInfo.icon
                        
                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">Student Name</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {record.student_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{record.institution_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {record.graduation_date && format(new Date(record.graduation_date), 'MMM yyyy')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {degreeTypes.find(d => d.value === record.degree_type)?.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {record.field_of_study}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {record.gpa ? `${record.gpa}/4.0` : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(record)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                {!record.transcript_verified && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openVerifyDialog(record)}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(record)}
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
                        Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalRecords)} of {totalRecords} records
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
        </TabsContent>

        <TabsContent value="transcripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transcript Management</CardTitle>
              <CardDescription>
                Upload, verify, and manage student transcripts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Transcript Management</h3>
                <p className="text-muted-foreground mb-4">
                  This feature will allow bulk upload and processing of student transcripts
                </p>
                <Button variant="outline" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Queue</CardTitle>
              <CardDescription>
                Review and verify pending academic records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Verification Queue</h3>
                <p className="text-muted-foreground mb-4">
                  No records pending verification at this time
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalRecords}</div>
                <p className="text-muted-foreground">Academic records</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verified Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-muted-foreground">Verified transcripts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-muted-foreground">Awaiting verification</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Academic Record Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Academic Record</DialogTitle>
            <DialogDescription>
              Create a new academic record for a student's previous education.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateRecord)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.user.name} - {student.student_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="institution_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Harvard University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="degree_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {degreeTypes.map((degree) => (
                            <SelectItem key={degree.value} value={degree.value}>
                              {degree.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="field_of_study"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="graduation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPA (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="4" 
                          placeholder="3.75" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Record
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Other dialogs (Edit, Delete, Verify) would be implemented similarly */}
      
      {/* Verify Record Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Academic Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this academic record? This action will mark the record as officially verified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyRecord} disabled={submitting}>
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Verify Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Record Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Academic Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this academic record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRecord} disabled={submitting}>
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}