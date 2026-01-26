"use client"

import { useState, useEffect } from 'react'
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
import Link from 'next/link'

interface Application {
  id: number
  applicant_name: string
  email: string
  phone: string
  date_of_birth: string
  nationality: string
  address: string
  intended_major: string
  term: string
  gpa: number
  test_scores: { sat?: number; act?: number }
  submitted_at: string
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected'
  reviewer_notes?: string
  documents: { name: string; status: 'verified' | 'pending' }[]
}

export default function ReviewQueuePage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDecisionDialog, setShowDecisionDialog] = useState(false)
  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  // Mock applications for review
  const mockApplications: Application[] = [
    {
      id: 1,
      applicant_name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '(555) 234-5678',
      date_of_birth: '2005-03-15',
      nationality: 'United States',
      address: '123 Main St, Springfield, IL 62701',
      intended_major: 'Computer Science',
      term: 'Fall 2025',
      gpa: 3.85,
      test_scores: { sat: 1420 },
      submitted_at: '2025-01-05T10:30:00Z',
      status: 'under_review',
      documents: [
        { name: 'Transcript', status: 'verified' },
        { name: 'Recommendation Letter', status: 'verified' },
        { name: 'Personal Statement', status: 'verified' },
      ],
    },
    {
      id: 2,
      applicant_name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '(555) 345-6789',
      date_of_birth: '2004-11-22',
      nationality: 'Canada',
      address: '456 Oak Ave, Toronto, ON M5V 2H1',
      intended_major: 'Biology',
      term: 'Fall 2025',
      gpa: 3.92,
      test_scores: { act: 32 },
      submitted_at: '2025-01-03T14:15:00Z',
      status: 'under_review',
      documents: [
        { name: 'Transcript', status: 'verified' },
        { name: 'Recommendation Letter', status: 'pending' },
        { name: 'Personal Statement', status: 'verified' },
      ],
    },
    {
      id: 3,
      applicant_name: 'Michael Rodriguez',
      email: 'michael.r@email.com',
      phone: '(555) 456-7890',
      date_of_birth: '2005-07-08',
      nationality: 'Mexico',
      address: '789 Elm St, Austin, TX 78701',
      intended_major: 'Engineering',
      term: 'Fall 2025',
      gpa: 3.45,
      test_scores: { sat: 1280 },
      submitted_at: '2025-01-02T09:00:00Z',
      status: 'under_review',
      documents: [
        { name: 'Transcript', status: 'verified' },
        { name: 'Recommendation Letter', status: 'verified' },
        { name: 'Personal Statement', status: 'verified' },
      ],
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setApplications(mockApplications)
      setLoading(false)
    }, 500)
  }, [])

  const currentApp = applications[currentIndex]

  const handleDecision = () => {
    if (!currentApp || !decision) return

    toast({
      title: decision === 'accept'
        ? `Accepted ${currentApp.applicant_name}`
        : `Rejected ${currentApp.applicant_name}`,
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
                      {currentApp.applicant_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{currentApp.applicant_name}</CardTitle>
                    <CardDescription>{currentApp.email}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge>{currentApp.intended_major}</Badge>
                      <Badge variant="outline">{currentApp.term}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Born {format(new Date(currentApp.date_of_birth), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{currentApp.nationality}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {currentApp.address}
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <h3 className="font-medium mb-3">Academic Profile</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold">{currentApp.gpa.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">GPA</p>
                      </CardContent>
                    </Card>
                    {currentApp.test_scores.sat && (
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <p className="text-3xl font-bold">{currentApp.test_scores.sat}</p>
                          <p className="text-xs text-muted-foreground">SAT</p>
                        </CardContent>
                      </Card>
                    )}
                    {currentApp.test_scores.act && (
                      <Card>
                        <CardContent className="pt-4 text-center">
                          <p className="text-3xl font-bold">{currentApp.test_scores.act}</p>
                          <p className="text-xs text-muted-foreground">ACT</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-medium mb-3">Documents</h3>
                  <div className="space-y-2">
                    {currentApp.documents.map((doc) => (
                      <div
                        key={doc.name}
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
                    ))}
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
                    <span>{format(new Date(currentApp.submitted_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Major</span>
                    <span>{currentApp.intended_major}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Term</span>
                    <span>{currentApp.term}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents</span>
                    <span>
                      {currentApp.documents.filter(d => d.status === 'verified').length}/
                      {currentApp.documents.length} verified
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentApp.gpa >= 3.5 && (currentApp.test_scores.sat || 0) >= 1300 ? (
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
                You are about to {decision} {currentApp?.applicant_name}'s application.
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
              <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDecision}
                className={decision === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {decision === 'accept' ? 'Confirm Accept' : 'Confirm Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
