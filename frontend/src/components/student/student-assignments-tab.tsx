"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  FileText, Clock, CheckCircle2, AlertCircle, Upload,
  Calendar, Award, Send, Eye
} from "lucide-react"
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns"

interface Enrollment {
  id: number
  course_section: {
    id: number
    course: {
      course_code: string
      title: string
    }
    section_number: string
  }
}

interface Assignment {
  id: number
  course_section_id: number
  title: string
  description?: string
  type: string
  max_points: number
  due_date: string
  available_from?: string
  late_due_date?: string
  late_penalty_percent?: number
  allow_late_submissions: boolean
  is_published: boolean
  instructions?: string
}

interface Submission {
  id: number
  assignment_id: number
  content?: string
  submitted_at: string
  is_late: boolean
  attempt_number: number
  points_earned?: number
  final_score?: number
  feedback?: string
  status: string
  graded_at?: string
}

const getAssignmentStatus = (assignment: Assignment, submission?: Submission) => {
  const now = new Date()
  const dueDate = new Date(assignment.due_date)
  const lateDueDate = assignment.late_due_date ? new Date(assignment.late_due_date) : null

  if (submission?.status === 'graded') {
    return { label: 'Graded', variant: 'default' as const, icon: CheckCircle2 }
  }
  if (submission) {
    return { label: 'Submitted', variant: 'secondary' as const, icon: CheckCircle2 }
  }
  if (isPast(dueDate)) {
    if (lateDueDate && !isPast(lateDueDate)) {
      return { label: 'Late', variant: 'destructive' as const, icon: AlertCircle }
    }
    return { label: 'Missing', variant: 'destructive' as const, icon: AlertCircle }
  }
  if (assignment.available_from && isFuture(new Date(assignment.available_from))) {
    return { label: 'Upcoming', variant: 'outline' as const, icon: Calendar }
  }
  return { label: 'Open', variant: 'default' as const, icon: Clock }
}

export function StudentAssignmentsTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionContent, setSubmissionContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    if (selectedEnrollment) {
      const enrollment = enrollments.find(e => e.id.toString() === selectedEnrollment)
      if (enrollment) {
        fetchAssignments(enrollment.course_section.id.toString())
      }
    }
  }, [selectedEnrollment, enrollments])

  const fetchEnrollments = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch enrollments')
      const data = await response.json()
      const enrolled = (data.data || []).filter((e: any) => e.status === 'enrolled')
      setEnrollments(enrolled)
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
      const publishedAssignments = (data.data || []).filter((a: Assignment) => a.is_published)
      setAssignments(publishedAssignments)

      // Fetch submissions for each assignment
      const submissionMap: Record<number, Submission> = {}
      for (const assignment of publishedAssignments) {
        try {
          const subResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/assignments/${assignment.id}/my-submission`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            }
          )
          if (subResponse.ok) {
            const subData = await subResponse.json()
            if (subData.data) {
              submissionMap[assignment.id] = subData.data
            }
          }
        } catch {
          // Ignore individual submission fetch errors
        }
      }
      setSubmissions(submissionMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAssignment) return

    setSubmitting(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/submissions/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            assignment_id: selectedAssignment.id,
            content: submissionContent,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit')
      }

      toast({
        title: "Assignment Submitted",
        description: `Your submission for "${selectedAssignment.title}" has been received.`,
      })

      setViewDialogOpen(false)
      setSubmissionContent("")
      const enrollment = enrollments.find(e => e.id.toString() === selectedEnrollment)
      if (enrollment) {
        fetchAssignments(enrollment.course_section.id.toString())
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit assignment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    const existingSubmission = submissions[assignment.id]
    if (existingSubmission?.content) {
      setSubmissionContent(existingSubmission.content)
    } else {
      setSubmissionContent("")
    }
    setViewDialogOpen(true)
  }

  const upcomingAssignments = assignments.filter(a => !isPast(new Date(a.due_date)))
  const pastAssignments = assignments.filter(a => isPast(new Date(a.due_date)))

  const stats = {
    total: assignments.length,
    submitted: Object.keys(submissions).length,
    graded: Object.values(submissions).filter(s => s.status === 'graded').length,
    pending: upcomingAssignments.filter(a => !submissions[a.id]).length,
  }

  const renderAssignmentCard = (assignment: Assignment) => {
    const submission = submissions[assignment.id]
    const status = getAssignmentStatus(assignment, submission)
    const StatusIcon = status.icon
    const dueDate = new Date(assignment.due_date)
    const isOverdue = isPast(dueDate) && !submission

    return (
      <Card
        key={assignment.id}
        className={`cursor-pointer hover:border-primary/50 transition-colors ${isOverdue ? 'border-destructive/50' : ''}`}
        onClick={() => openAssignment(assignment)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base">{assignment.title}</CardTitle>
              <CardDescription className="mt-1">
                {assignment.description?.slice(0, 100)}
                {(assignment.description?.length || 0) > 100 && '...'}
              </CardDescription>
            </div>
            <Badge variant={status.variant} className="gap-1 flex-shrink-0">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {assignment.max_points} pts
              </span>
              <span className="capitalize">
                <Badge variant="outline">{assignment.type}</Badge>
              </span>
            </div>
            <div className="text-right">
              <div className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                {format(dueDate, 'MMM d, h:mm a')}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(dueDate, { addSuffix: true })}
              </div>
            </div>
          </div>
          {submission?.status === 'graded' && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Grade:</span>
                <span className="font-bold text-lg">
                  {submission.final_score}/{assignment.max_points}
                </span>
              </div>
              {submission.points_earned !== undefined && submission.points_earned !== submission.final_score && (
                <div className="text-xs text-muted-foreground mt-1">
                  (Late penalty applied)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedEnrollment} onValueChange={setSelectedEnrollment}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => (
                <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                  {enrollment.course_section.course.course_code} - {enrollment.course_section.course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEnrollment && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.submitted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.graded}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAssignments.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAssignments.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingAssignments.map(renderAssignmentCard)}
                </div>
                {upcomingAssignments.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        No upcoming assignments
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {pastAssignments.map(renderAssignmentCard)}
                </div>
                {pastAssignments.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        No past assignments
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {!selectedEnrollment && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course above to view assignments
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAssignment.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="capitalize">{selectedAssignment.type}</Badge>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {selectedAssignment.max_points} points
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Due {format(new Date(selectedAssignment.due_date), 'MMM d, h:mm a')}
                  </span>
                </div>

                {selectedAssignment.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedAssignment.description}
                    </p>
                  </div>
                )}

                {selectedAssignment.instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedAssignment.instructions}
                    </p>
                  </div>
                )}

                {submissions[selectedAssignment.id]?.status === 'graded' ? (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">Your Grade</h4>
                    <div className="text-3xl font-bold mb-2">
                      {submissions[selectedAssignment.id].final_score}/{selectedAssignment.max_points}
                    </div>
                    {submissions[selectedAssignment.id].feedback && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-1">Feedback</h5>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {submissions[selectedAssignment.id].feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ) : submissions[selectedAssignment.id] ? (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Submitted</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted {formatDistanceToNow(new Date(submissions[selectedAssignment.id].submitted_at), { addSuffix: true })}
                    </p>
                    {submissions[selectedAssignment.id].is_late && (
                      <Badge variant="destructive" className="mt-2">Late submission</Badge>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2">Your Submission</h4>
                    <Textarea
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="Enter your submission..."
                      rows={8}
                      disabled={isPast(new Date(selectedAssignment.due_date)) && !selectedAssignment.allow_late_submissions}
                    />
                    {isPast(new Date(selectedAssignment.due_date)) && selectedAssignment.allow_late_submissions && (
                      <p className="text-sm text-warning mt-2">
                        This submission will be marked as late ({selectedAssignment.late_penalty_percent}% penalty)
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                {!submissions[selectedAssignment.id] && (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !submissionContent.trim() || (isPast(new Date(selectedAssignment.due_date)) && !selectedAssignment.allow_late_submissions)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
