"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, GraduationCap, Send, ArrowLeft } from "lucide-react"
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

interface ProgramChoice {
  program_id: number
  preference_order: number
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

  // Personal info (for non-authenticated users)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      // Fetch available terms
      const termsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          } : {
            'Accept': 'application/json',
          },
        }
      )

      if (termsResponse.ok) {
        const termsData = await termsResponse.json()
        setTerms(termsData.data || [])
      }

      // Fetch available programs
      const programsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          } : {
            'Accept': 'application/json',
          },
        }
      )

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

    // For non-authenticated users, validate personal info
    if (!isAuthenticated) {
      if (!firstName || !lastName || !email) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required personal information",
          variant: "destructive",
        })
        return
      }
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      // If user is authenticated, get their student ID
      let studentId: number | null = null

      if (isAuthenticated && user) {
        // Get student profile to get student ID
        const studentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        )

        if (studentResponse.ok) {
          const studentData = await studentResponse.json()
          studentId = studentData.data.id
        } else {
          throw new Error('Could not retrieve student profile')
        }
      }

      // Create the application
      const applicationData: any = {
        term_id: parseInt(selectedTerm),
        comments: personalStatement || undefined,
        status: 'submitted'
      }

      // If authenticated, include student_id
      if (studentId) {
        applicationData.student_id = studentId
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications`,
        {
          method: 'POST',
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          } : {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(applicationData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application')
      }

      const applicationId = result.data.id

      // Add program choices
      const programChoices: ProgramChoice[] = selectedPrograms.map((programId, index) => ({
        program_id: programId,
        preference_order: index + 1
      }))

      for (const choice of programChoices) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/${applicationId}/program-choices`,
          {
            method: 'POST',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            } : {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(choice),
          }
        )
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been successfully submitted. You will be notified of the decision.",
      })

      // Redirect after success
      setTimeout(() => {
        if (isAuthenticated) {
          router.push('/student')
        } else {
          router.push('/')
        }
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
      {/* Personal Information (for non-authenticated users) */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Please provide your contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Note: You can create an account to track your application status after submission.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
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
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProgramSelection(program.id)}
                          disabled={!isSelected && selectedPrograms.length >= 3}
                        />
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
      </div>
    </form>
  )
}
