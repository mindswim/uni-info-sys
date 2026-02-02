"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { StatCard } from "@/components/layouts"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  Plus
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Application {
  id: number
  status: string
  application_date: string
  decision_date: string | null
  decision_status: string | null
  comments: string | null
  student: {
    id: number
    student_id: string
    user: {
      name: string
      email: string
    }
  }
  term: {
    id: number
    name: string
    academic_year: string
  }
  program_choices: Array<{
    id: number
    preference_order: number
    program: {
      name: string
      code: string
      degree_level: string
    }
  }>
}

export function AdmissionsTab() {
  const { toast } = useToast()
  const { token } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editComments, setEditComments] = useState("")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (token) {
      fetchApplications()
    }
  }, [token])

  const fetchApplications = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view applications",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (application: Application, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setReviewAction(action)
    setReviewNotes("")
    setReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!selectedApplication || !reviewAction) return

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const endpoint = reviewAction === 'approve' ? 'accept' : 'reject'

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${selectedApplication.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            decision_status: reviewNotes || undefined,
            comments: reviewNotes || undefined
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to update application')

      // Auto-matriculate on acceptance so the student can register for classes
      if (reviewAction === 'approve') {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${selectedApplication.id}/enroll`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            }
          )
        } catch {
          // Acceptance still succeeded even if matriculation fails
        }
      }

      toast({
        title: "Success",
        description: `Application ${reviewAction === 'approve' ? 'accepted and enrolled' : 'rejected'} successfully`,
      })

      setReviewDialogOpen(false)
      fetchApplications()
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (application: Application) => {
    setEditingApplication(application)
    setEditStatus(application.status)
    setEditComments(application.comments || "")
    setEditDialogOpen(true)
  }

  const submitEdit = async () => {
    if (!editingApplication) return

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${editingApplication.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            status: editStatus,
            comments: editComments || undefined
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to update application')

      toast({
        title: "Success",
        description: `Application updated successfully`,
      })

      setEditDialogOpen(false)
      fetchApplications()
    } catch (error) {
      console.error('Failed to update application:', error)
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (application: Application) => {
    setDeletingApplication(application)
    setDeleteDialogOpen(true)
  }

  const submitDelete = async () => {
    if (!deletingApplication) return

    setDeleting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${deletingApplication.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to delete application')

      toast({
        title: "Success",
        description: `Application deleted successfully`,
      })

      setDeleteDialogOpen(false)
      setDeletingApplication(null)
      fetchApplications()
    } catch (error) {
      console.error('Failed to delete application:', error)
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      draft: { variant: "outline", icon: FileText },
      submitted: { variant: "secondary", icon: Clock },
      under_review: { variant: "default", icon: Eye },
      accepted: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      waitlisted: { variant: "secondary", icon: Clock },
      enrolled: { variant: "default", icon: CheckCircle },
    }

    const config = variants[status] || variants.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
  }

  const acceptanceRate = stats.total > 0
    ? Math.round((stats.accepted / stats.total) * 100)
    : 0

  // Filter applications
  const filteredApplications = applications.filter(app =>
    app.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Categorize applications
  const pendingApplications = filteredApplications.filter(a =>
    a.status === 'submitted' || a.status === 'under_review'
  )
  const reviewedApplications = filteredApplications.filter(a =>
    a.status === 'accepted' || a.status === 'rejected'
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Applications"
          value={stats.total.toString()}
          description="This cycle"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Pending Review"
          value={stats.pending.toString()}
          description="Awaiting decision"
          icon={<Clock className="h-4 w-4" />}
          variant={stats.pending > 0 ? "warning" : undefined}
        />
        <StatCard
          title="Accepted"
          value={stats.accepted.toString()}
          description={`${acceptanceRate}% acceptance rate`}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected.toString()}
          description={`${Math.round((stats.rejected / stats.total) * 100) || 0}% rejection rate`}
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Enrolled"
          value={stats.enrolled.toString()}
          description={`${Math.round((stats.enrolled / stats.accepted) * 100) || 0}% yield rate`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Search and Refresh */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or student ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Applications ({filteredApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ApplicationsTable
            applications={pendingApplications}
            onReview={handleReview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="reviewed">
          <ApplicationsTable
            applications={reviewedApplications}
            onReview={handleReview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="all">
          <ApplicationsTable
            applications={filteredApplications}
            onReview={handleReview}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
            showActions={true}
          />
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  Student: {selectedApplication.student.user.name} ({selectedApplication.student.student_id})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              {/* Application Details */}
              <div className="space-y-2">
                <Label>Program Choices</Label>
                <div className="space-y-1">
                  {selectedApplication.program_choices
                    .sort((a, b) => a.preference_order - b.preference_order)
                    .map((choice) => (
                      <div key={choice.id} className="text-sm flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Choice #{choice.preference_order}
                        </Badge>
                        <span>{choice.program.name} ({choice.program.code})</span>
                      </div>
                    ))}
                </div>
              </div>

              {selectedApplication.comments && (
                <div className="space-y-2">
                  <Label>Personal Statement</Label>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    {selectedApplication.comments}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="review-notes">
                  Decision Notes {reviewAction === 'reject' ? '(Required)' : '(Optional)'}
                </Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter notes about this decision..."
                  className="min-h-24"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={submitting || (reviewAction === 'reject' && !reviewNotes)}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : reviewAction === 'approve' ? (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve Application
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              {editingApplication && (
                <>
                  Student: {editingApplication.student.user.name} ({editingApplication.student.student_id})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {editingApplication && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-comments">Comments</Label>
                <Textarea
                  id="edit-comments"
                  value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                  placeholder="Add any notes or comments..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Application Information</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                  <div><span className="font-medium">Term:</span> {editingApplication.term.name} ({editingApplication.term.academic_year})</div>
                  <div><span className="font-medium">Applied:</span> {new Date(editingApplication.application_date).toLocaleDateString()}</div>
                  <div><span className="font-medium">Programs:</span> {editingApplication.program_choices.length} choice(s)</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Application'
              )}
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
              {deletingApplication && (
                <>
                  This will permanently delete the application from{' '}
                  <strong>{deletingApplication.student.user.name}</strong> ({deletingApplication.student.student_id}).
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Application'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ApplicationsTable({
  applications,
  onReview,
  onEdit,
  onDelete,
  getStatusBadge,
  showActions
}: {
  applications: Application[]
  onReview: (app: Application, action: 'approve' | 'reject') => void
  onEdit: (app: Application) => void
  onDelete: (app: Application) => void
  getStatusBadge: (status: string) => JSX.Element
  showActions: boolean
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          <p className="text-muted-foreground">
            Applications will appear here when submitted
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Program(s)</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.student.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.student.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {application.student.student_id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{application.term.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {application.term.academic_year}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {application.program_choices
                        .sort((a, b) => a.preference_order - b.preference_order)
                        .slice(0, 2)
                        .map((choice) => (
                          <div key={choice.id} className="text-sm">
                            {choice.program.code}
                          </div>
                        ))}
                      {application.program_choices.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{application.program_choices.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(application.application_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(application.status === 'submitted' || application.status === 'under_review') && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReview(application, 'approve')}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReview(application, 'reject')}
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(application)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(application)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
