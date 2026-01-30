'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  GraduationCap,
  Calendar,
  Building2,
  ArrowRight,
  Loader2,
  ListOrdered
} from 'lucide-react'

interface ProgramChoice {
  id: number
  preference_order: number
  status: string
  program: {
    id: number
    name: string
    department?: {
      id: number
      name: string
    }
  }
}

interface Application {
  id: number
  student_id: number
  term_id: number
  status: string
  application_date: string
  decision_date: string | null
  decision_status: string | null
  comments: string | null
  term: {
    id: number
    name: string
  }
  program_choices: ProgramChoice[]
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  submitted: { label: 'Submitted', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  under_review: { label: 'Under Review', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  waitlisted: { label: 'Waitlisted', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  enrolled: { label: 'Enrolled', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-100' },
}

const STATUS_ORDER = ['draft', 'submitted', 'under_review', 'accepted', 'enrolled']

export function AdmissionsStatusTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')

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
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmEnrollment = async (applicationId: number) => {
    setConfirmingId(applicationId)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${applicationId}/confirm-enrollment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to confirm enrollment')
      }

      toast({
        title: "Enrollment Confirmed",
        description: "Congratulations! You are now enrolled. Welcome to the university.",
      })

      fetchApplications()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm enrollment",
        variant: "destructive",
      })
    } finally {
      setConfirmingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
    const Icon = config.icon

    return (
      <Badge className={`${config.bgColor} ${config.color} gap-1 border-0`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getCurrentStep = (status: string): number => {
    const index = STATUS_ORDER.indexOf(status)
    if (status === 'rejected') return 3
    if (status === 'waitlisted') return 3
    return index >= 0 ? index : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
            <p className="max-w-md mx-auto mb-6">
              You haven't submitted any admission applications yet. Start your application to begin the enrollment process.
            </p>
            <Button asChild>
              <a href="/student/apply">
                Start Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {applications.map((application) => {
        const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.draft
        const StatusIcon = statusConfig.icon
        const currentStep = getCurrentStep(application.status)
        const isTerminal = ['accepted', 'rejected', 'waitlisted', 'enrolled'].includes(application.status)

        return (
          <Card key={application.id} className="overflow-hidden">
            {/* Status Banner */}
            <div className={`${statusConfig.bgColor} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-white/80`}>
                    <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${statusConfig.color}`}>
                      Application {statusConfig.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {application.term.name}
                    </p>
                  </div>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </div>

            <CardContent className="pt-6">
              {/* Timeline Progress */}
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-4">Application Progress</h4>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted">
                    <div
                      className={`h-full ${statusConfig.bgColor}`}
                      style={{ width: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_ORDER.map((step, index) => {
                      const stepConfig = STATUS_CONFIG[step]
                      const StepIcon = stepConfig.icon
                      const isActive = index <= currentStep
                      const isCurrent = index === currentStep

                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isActive
                                ? `${statusConfig.bgColor} ${statusConfig.color} border-current`
                                : 'bg-background border-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-offset-2 ring-current' : ''}`}
                          >
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <span className={`mt-2 text-xs font-medium ${isActive ? statusConfig.color : 'text-muted-foreground'}`}>
                            {stepConfig.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Application Details */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Dates */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Key Dates
                  </h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Application Submitted</dt>
                      <dd className="font-medium">{formatDate(application.application_date)}</dd>
                    </div>
                    {application.decision_date && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Decision Date</dt>
                        <dd className="font-medium">{formatDate(application.decision_date)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Program Choices */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ListOrdered className="h-4 w-4" />
                    Program Choices
                  </h4>
                  {application.program_choices.length > 0 ? (
                    <div className="space-y-2">
                      {application.program_choices
                        .sort((a, b) => a.preference_order - b.preference_order)
                        .map((choice) => (
                          <div
                            key={choice.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {choice.preference_order}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{choice.program.name}</p>
                                {choice.program.department && (
                                  <p className="text-xs text-muted-foreground">
                                    {choice.program.department.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(choice.status)}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No program choices selected</p>
                  )}
                </div>
              </div>

              {/* Decision Details */}
              {application.decision_status && (
                <>
                  <Separator className="my-6" />
                  <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
                    <h4 className={`text-sm font-medium mb-2 ${statusConfig.color}`}>
                      Decision Details
                    </h4>
                    <p className="text-sm">{application.decision_status}</p>
                  </div>
                </>
              )}

              {/* Comments */}
              {application.comments && (
                <>
                  <Separator className="my-6" />
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Additional Information</h4>
                    <p className="text-sm text-muted-foreground">{application.comments}</p>
                  </div>
                </>
              )}

              {/* Actions based on status */}
              {application.status === 'draft' && (
                <>
                  <Separator className="my-6" />
                  <div className="flex gap-3">
                    <Button asChild>
                      <a href={`/student/apply?continue=${application.id}`}>
                        Continue Application
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </>
              )}

              {application.status === 'accepted' && (
                <>
                  <Separator className="my-6" />
                  <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                      Congratulations on your acceptance!
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your enrollment by confirming your offer below. This will finalize your admission and assign your program.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={confirmingId === application.id}
                        onClick={() => handleConfirmEnrollment(application.id)}
                      >
                        {confirmingId === application.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          'Confirm Enrollment'
                        )}
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/student/financial-aid">View Financial Aid</a>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {application.status === 'waitlisted' && (
                <>
                  <Separator className="my-6" />
                  <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                      You're on the Waitlist
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We'll notify you by email if a spot becomes available. In the meantime, you may want to explore other options or confirm your interest in remaining on the waitlist.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
