"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, ArrowLeft, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Term {
  id: number
  name: string
  term_type: string
  academic_year: string
  start_date: string
  end_date: string
}

interface Program {
  id: number
  name: string
  code: string
  degree_level: string
  department?: {
    name: string
  }
}

export function ApplyForm() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [terms, setTerms] = useState<Term[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const [personalStatement, setPersonalStatement] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const [termsResponse, programsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, { headers }),
      ])

      if (termsResponse.ok) {
        const termsData = await termsResponse.json()
        setTerms(termsData.data || [])
      }
      if (programsResponse.ok) {
        const programsData = await programsResponse.json()
        setPrograms(programsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: "Error",
        description: "Failed to load application data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleProgramSelection = (programId: number) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId)
      } else if (prev.length < 3) {
        return [...prev, programId]
      }
      return prev
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/apply')
      return
    }

    if (!selectedTerm) {
      toast({
        title: "Validation Error",
        description: "Please select a term",
        variant: "destructive",
      })
      return
    }

    if (selectedPrograms.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one program",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Get student ID from profile
      const studentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`,
        { headers: authHeaders }
      )

      if (!studentResponse.ok) {
        throw new Error('Could not retrieve student profile. Make sure your account has a student record.')
      }

      const studentData = await studentResponse.json()
      const studentId = studentData.data.id

      // Create the application
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            student_id: studentId,
            term_id: parseInt(selectedTerm),
            comments: personalStatement || undefined,
            status: 'submitted',
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application')
      }

      const applicationId = result.data.id

      // Add program choices, tracking failures
      const choiceErrors: string[] = []
      for (let i = 0; i < selectedPrograms.length; i++) {
        const choiceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${applicationId}/program-choices`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              program_id: selectedPrograms[i],
              preference_order: i + 1,
            }),
          }
        )

        if (!choiceResponse.ok) {
          const programName = programs.find(p => p.id === selectedPrograms[i])?.name || `Program #${i + 1}`
          choiceErrors.push(programName)
        }
      }

      if (choiceErrors.length > 0 && choiceErrors.length === selectedPrograms.length) {
        throw new Error('Failed to save any program choices. Please try editing your application later.')
      }

      toast({
        title: "Application Submitted!",
        description: choiceErrors.length > 0
          ? `Application submitted, but some program choices failed to save: ${choiceErrors.join(', ')}. You can edit these later.`
          : "Your application has been successfully submitted. You will be notified of the decision.",
      })

      setTimeout(() => {
        router.push('/student/admissions')
      }, 2000)

    } catch (error: any) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Group programs by degree level
  const programsByLevel = programs.reduce((acc, program) => {
    const level = program.degree_level || 'Other'
    if (!acc[level]) acc[level] = []
    acc[level].push(program)
    return acc
  }, {} as Record<string, Program[]>)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <Alert>
          <LogIn className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You need to be signed in to submit an application. You can browse programs below.</span>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login?redirect=/apply">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register?redirect=/apply">Create Account</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Application Term */}
      <Card>
        <CardHeader>
          <CardTitle>Application Term</CardTitle>
          <CardDescription>Select the term you wish to apply for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="term">Term *</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id.toString()}>
                    {term.name} ({term.academic_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Program Choices */}
      <Card>
        <CardHeader>
          <CardTitle>Program Choices</CardTitle>
          <CardDescription>
            Select up to 3 programs in order of preference. Select at least one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(programsByLevel).map(([level, levelPrograms]) => (
              <div key={level} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{level} Programs</h3>
                <div className="space-y-2">
                  {levelPrograms.map((program) => {
                    const isSelected = selectedPrograms.includes(program.id)
                    const preferenceOrder = selectedPrograms.indexOf(program.id) + 1

                    return (
                      <div
                        key={program.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => toggleProgramSelection(program.id)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProgramSelection(program.id)}
                            disabled={!isSelected && selectedPrograms.length >= 3}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{program.name}</p>
                            {isSelected && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                Choice #{preferenceOrder}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {program.code}
                            {program.department && ` • ${program.department.name}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedPrograms.length === 0 && (
            <p className="text-sm text-destructive mt-2">Please select at least one program</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Statement</CardTitle>
          <CardDescription>
            Tell us why you want to join our university (optional, max 1000 characters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={personalStatement}
            onChange={(e) => setPersonalStatement(e.target.value.slice(0, 1000))}
            placeholder="Share your academic interests, career goals, and why you're applying..."
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {personalStatement.length}/1000 characters
          </p>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        {isAuthenticated ? (
          <Button
            type="submit"
            disabled={submitting || selectedPrograms.length === 0 || !selectedTerm}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        ) : (
          <Button type="button" className="flex-1" asChild>
            <Link href="/auth/login?redirect=/apply">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Submit
            </Link>
          </Button>
        )}
      </div>
    </form>
  )
}
