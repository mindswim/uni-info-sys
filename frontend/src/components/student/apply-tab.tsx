"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Loader2,
  Plus,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

interface Term {
  id: number
  name: string
  academic_year: number
  semester: string
  start_date: string
  end_date: string
}

interface Program {
  id: number
  name: string
  code: string
  description: string
  department: {
    id: number
    name: string
  }
}

interface Application {
  id: number
  status: string
  application_date: string
  decision_date: string | null
  decision_status: string | null
  comments: string | null
  term: Term
  program_choices: Array<{
    id: number
    program: Program
    preference_order: number
    status: string
  }>
}

interface ProgramChoice {
  program_id: number
  preference_order: number
}

export function ApplyTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [programs, setPrograms] = useState<Program[]>([])

  // Form state
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null)
  const [personalStatement, setPersonalStatement] = useState("")
  const [programChoices, setProgramChoices] = useState<ProgramChoice[]>([])

  // Detail dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      const [applicationsRes, termsRes, programsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ])

      if (!applicationsRes.ok || !termsRes.ok || !programsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [applicationsData, termsData, programsData] = await Promise.all([
        applicationsRes.json(),
        termsRes.json(),
        programsRes.json()
      ])

      setMyApplications(applicationsData.data || [])
      setTerms(termsData.data || [])
      setPrograms(programsData.data || [])
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addProgramChoice = () => {
    if (programChoices.length >= 3) {
      toast({
        title: "Maximum Reached",
        description: "You can select up to 3 program choices",
        variant: "destructive"
      })
      return
    }

    setProgramChoices([...programChoices, {
      program_id: 0,
      preference_order: programChoices.length + 1
    }])
  }

  const removeProgramChoice = (index: number) => {
    const updated = programChoices.filter((_, i) => i !== index)
    // Re-order preferences
    const reordered = updated.map((choice, i) => ({
      ...choice,
      preference_order: i + 1
    }))
    setProgramChoices(reordered)
  }

  const updateProgramChoice = (index: number, programId: number) => {
    const updated = [...programChoices]
    updated[index].program_id = programId
    setProgramChoices(updated)
  }

  const handleSubmitApplication = async () => {
    if (!selectedTerm) {
      toast({
        title: "Validation Error",
        description: "Please select a term",
        variant: "destructive"
      })
      return
    }

    if (programChoices.length === 0 || programChoices.some(c => c.program_id === 0)) {
      toast({
        title: "Validation Error",
        description: "Please select at least one program",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      const token = sessionStorage.getItem('auth_token')
      const user = JSON.parse(sessionStorage.getItem('user') || '{}')

      // First, create the application
      const appResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            student_id: user.student_id,
            term_id: selectedTerm,
            status: 'submitted',
            comments: personalStatement || undefined
          })
        }
      )

      if (!appResponse.ok) {
        throw new Error('Failed to create application')
      }

      const appData = await appResponse.json()
      const applicationId = appData.data.id

      // Then, create program choices
      for (const choice of programChoices) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${applicationId}/program-choices`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              program_id: choice.program_id,
              preference_order: choice.preference_order,
              status: 'pending'
            })
          }
        )
      }

      toast({
        title: "Success",
        description: "Application submitted successfully!"
      })

      // Reset form
      setShowApplicationForm(false)
      setSelectedTerm(null)
      setPersonalStatement("")
      setProgramChoices([])

      // Refresh applications
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit application",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any, icon: any, label: string }> = {
      draft: { variant: "outline", icon: FileText, label: "Draft" },
      submitted: { variant: "secondary", icon: Clock, label: "Submitted" },
      under_review: { variant: "default", icon: Eye, label: "Under Review" },
      accepted: { variant: "default", icon: CheckCircle, label: "Accepted" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
      waitlisted: { variant: "secondary", icon: AlertCircle, label: "Waitlisted" },
      enrolled: { variant: "default", icon: CheckCircle, label: "Enrolled" }
    }

    const { variant, icon: Icon, label } = config[status] || config.draft

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">Apply for admission to programs</p>
        </div>
        {!showApplicationForm && (
          <Button onClick={() => setShowApplicationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        )}
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Application</CardTitle>
            <CardDescription>Submit your application for admission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Term Selection */}
            <div className="space-y-2">
              <Label htmlFor="term">Select Term *</Label>
              <Select value={selectedTerm?.toString()} onValueChange={(val) => setSelectedTerm(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose admission term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term.id} value={term.id.toString()}>
                      {term.name} - {term.semester} {term.academic_year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program Choices */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Program Choices * (Rank in order of preference)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProgramChoice}
                  disabled={programChoices.length >= 3}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Choice
                </Button>
              </div>

              {programChoices.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No program choices added yet</p>
                  <p className="text-sm">Click "Add Choice" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {programChoices.map((choice, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-none pt-2">
                        <Badge variant="outline">#{choice.preference_order}</Badge>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={choice.program_id.toString()}
                          onValueChange={(val) => updateProgramChoice(index, Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map(program => (
                              <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name} ({program.department.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProgramChoice(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Statement */}
            <div className="space-y-2">
              <Label htmlFor="statement">Personal Statement (Optional)</Label>
              <Textarea
                id="statement"
                value={personalStatement}
                onChange={(e) => setPersonalStatement(e.target.value)}
                placeholder="Tell us about yourself, your goals, and why you want to join this program..."
                rows={6}
                maxLength={2000}
              />
              <p className="text-sm text-muted-foreground">
                {personalStatement.length}/2000 characters
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowApplicationForm(false)
                setSelectedTerm(null)
                setPersonalStatement("")
                setProgramChoices([])
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* My Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>View your submitted applications and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {myApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any applications
              </p>
              {!showApplicationForm && (
                <Button onClick={() => setShowApplicationForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Application
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => (
                <Card key={app.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{app.term.name}</h4>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Applied: {new Date(app.application_date).toLocaleDateString()}</p>
                          {app.program_choices.length > 0 && (
                            <p>Programs: {app.program_choices.map(c => c.program.name).join(', ')}</p>
                          )}
                        </div>
                        {app.decision_status && (
                          <div className="text-sm">
                            <Badge variant="outline">{app.decision_status}</Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingApplication(app)
                          setViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {viewingApplication && viewingApplication.term.name}
            </DialogDescription>
          </DialogHeader>
          {viewingApplication && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(viewingApplication.status)}</div>
              </div>

              <div>
                <Label>Application Date</Label>
                <p className="text-sm mt-1">
                  {new Date(viewingApplication.application_date).toLocaleDateString()}
                </p>
              </div>

              {viewingApplication.decision_date && (
                <div>
                  <Label>Decision Date</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingApplication.decision_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <Label>Program Choices</Label>
                <div className="mt-2 space-y-2">
                  {viewingApplication.program_choices
                    .sort((a, b) => a.preference_order - b.preference_order)
                    .map(choice => (
                      <div key={choice.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">#{choice.preference_order}</Badge>
                        <span>{choice.program.name}</span>
                      </div>
                    ))}
                </div>
              </div>

              {viewingApplication.comments && (
                <div>
                  <Label>Personal Statement</Label>
                  <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                    {viewingApplication.comments}
                  </div>
                </div>
              )}

              {viewingApplication.decision_status && (
                <div>
                  <Label>Decision Notes</Label>
                  <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                    {viewingApplication.decision_status}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
