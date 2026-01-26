"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  FileText, CheckCircle, XCircle, Clock, User, GraduationCap,
  MapPin, Calendar, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { AdmissionAPI } from '@/lib/api-client'
import Link from 'next/link'

interface Application {
  id: number
  student_id?: number
  student?: {
    id: number
    first_name: string
    last_name: string
    date_of_birth?: string
    nationality?: string
    user?: { email: string }
  }
  term_id?: number
  term?: { name: string }
  program_choices?: Array<{
    id: number
    program?: { name: string; code: string }
    preference_order: number
  }>
  status: string
  submitted_at?: string
  created_at: string
  updated_at: string
  reviewer_notes?: string
  documents?: Array<{
    id: number
    document_type: string
    file_name?: string
    status: string
  }>
  academic_records?: Array<{
    id: number
    institution_name?: string
    gpa?: number
  }>
}

// Helper functions for displaying application data
function getApplicantName(app: Application): string {
  if (app.student) {
    return `${app.student.first_name} ${app.student.last_name}`
  }
  return `Applicant #${app.id}`
}

function getApplicantEmail(app: Application): string {
  return app.student?.user?.email || ''
}

function getApplicantInitials(app: Application): string {
  if (app.student) {
    return `${app.student.first_name[0] || ''}${app.student.last_name[0] || ''}`
  }
  return `A${app.id}`
}

function getDateOfBirth(app: Application): string {
  return app.student?.date_of_birth || ''
}

function getNationality(app: Application): string {
  return app.student?.nationality || ''
}

function getIntendedMajor(app: Application): string {
  if (app.program_choices && app.program_choices.length > 0) {
    const firstChoice = app.program_choices.find(pc => pc.preference_order === 1) || app.program_choices[0]
    return firstChoice.program?.name || firstChoice.program?.code || ''
  }
  return ''
}

function getTermName(app: Application): string {
  return app.term?.name || ''
}

function getGPA(app: Application): number | null {
  if (app.academic_records && app.academic_records.length > 0) {
    return app.academic_records[0].gpa || null
  }
  return null
}

function getSubmittedDate(app: Application): string {
  return app.submitted_at || app.created_at
}

function getDocuments(app: Application): Array<{ name: string; status: 'verified' | 'pending' }> {
  if (app.documents && app.documents.length > 0) {
    return app.documents.map(doc => ({
      name: doc.document_type || doc.file_name || 'Document',
      status: doc.status === 'approved' || doc.status === 'verified' ? 'verified' : 'pending'
    }))
  }
  return []
}

export default function ReviewQueuePage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDecisionDialog, setShowDecisionDialog] = useState(false)
  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch applications that are pending review (submitted or under_review)
      const response = await AdmissionAPI.getApplications({
        status: 'submitted',
      })
      setApplications(response.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast({ title: 'Failed to load applications', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const currentApp = applications[currentIndex]

  const handleDecision = async () => {
    if (!currentApp || !decision) return

    setProcessing(true)
    try {
      if (decision === 'accept') {
        await AdmissionAPI.accept(currentApp.id, { notes: notes || undefined })
      } else {
        await AdmissionAPI.reject(currentApp.id, { notes: notes || undefined })
      }

      toast({
        title: decision === 'accept'
          ? `Accepted ${getApplicantName(currentApp)}`
          : `Rejected ${getApplicantName(currentApp)}`,
      })

      // Remove from queue and move to next
      const newApps = applications.filter((_, i) => i !== currentIndex)
      setApplications(newApps)
      if (currentIndex >= newApps.length) {
        setCurrentIndex(Math.max(0, newApps.length - 1))
      }
      setShowDecisionDialog(false)
      setDecision(null)
      setNotes('')
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to ${decision} application`
      toast({ title: message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const goToNext = () => {
    if (currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="detail" />
      </AppShell>
    )
  }

  if (applications.length === 0) {
    return (
      <AppShell>
        <div className="p-6">
          <EmptyState
            icon={CheckCircle}
            title="Review queue empty"
            description="All applications have been reviewed. Great work!"
            action={{ label: 'View All Applications', href: '/admin/admissions' }}
            variant="card"
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Application Review</h1>
            <p className="text-sm text-muted-foreground">
              Review and make decisions on applications
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {applications.length} remaining
            </span>
            <Progress
              value={((applications.length - currentIndex) / applications.length) * 100}
              className="w-24 h-2"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                setDecision('reject')
                setShowDecisionDialog(true)
              }}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setDecision('accept')
                setShowDecisionDialog(true)
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={goToNext}
            disabled={currentIndex === applications.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Application Detail */}
        {currentApp && (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Applicant Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {getApplicantInitials(currentApp)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{getApplicantName(currentApp)}</CardTitle>
                    <CardDescription>{getApplicantEmail(currentApp)}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      {getIntendedMajor(currentApp) && (
                        <Badge>{getIntendedMajor(currentApp)}</Badge>
                      )}
                      {getTermName(currentApp) && (
                        <Badge variant="outline">{getTermName(currentApp)}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {getDateOfBirth(currentApp) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Born {format(new Date(getDateOfBirth(currentApp)), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {getNationality(currentApp) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{getNationality(currentApp)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Info */}
                {getGPA(currentApp) !== null && (
                  <div>
                    <h3 className="font-medium mb-3">Academic Profile</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <p className="text-3xl font-bold">{getGPA(currentApp)?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">GPA</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <h3 className="font-medium mb-3">Documents</h3>
                  <div className="space-y-2">
                    {getDocuments(currentApp).length > 0 ? (
                      getDocuments(currentApp).map((doc, index) => (
                        <div
                          key={`${doc.name}-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.name}</span>
                          </div>
                          {doc.status === 'verified' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Quick Stats & Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Submitted</span>
                    <span>{format(new Date(getSubmittedDate(currentApp)), 'MMM d, yyyy')}</span>
                  </div>
                  {getIntendedMajor(currentApp) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Major</span>
                      <span>{getIntendedMajor(currentApp)}</span>
                    </div>
                  )}
                  {getTermName(currentApp) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Term</span>
                      <span>{getTermName(currentApp)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents</span>
                    <span>
                      {getDocuments(currentApp).filter(d => d.status === 'verified').length}/
                      {getDocuments(currentApp).length} verified
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  {(getGPA(currentApp) || 0) >= 3.5 ? (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Strong Candidate</p>
                        <p className="text-sm text-green-700">
                          Meets academic requirements for admission.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Review Carefully</p>
                        <p className="text-sm text-amber-700">
                          Consider holistic factors in decision.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/admissions/${currentApp.id}`}>
                      View Full Application
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {decision === 'accept' ? 'Accept Application' : 'Reject Application'}
              </DialogTitle>
              <DialogDescription>
                You are about to {decision} {currentApp ? getApplicantName(currentApp) : ''}'s application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Decision Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes for your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDecisionDialog(false)} disabled={processing}>
                Cancel
              </Button>
              <Button
                onClick={handleDecision}
                disabled={processing}
                className={decision === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {processing ? 'Processing...' : decision === 'accept' ? 'Confirm Accept' : 'Confirm Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
