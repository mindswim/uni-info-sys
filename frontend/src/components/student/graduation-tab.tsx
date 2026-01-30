"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, GraduationCap, CheckCircle, Clock, XCircle } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface Program {
  id: number
  name: string
  code: string
}

interface Term {
  id: number
  name: string
}

interface GradApplication {
  id: number
  program_id: number
  term_id: number
  status: string
  application_date: string
  ceremony_date?: string
  special_requests?: string
  reviewer_notes?: string
  reviewed_at?: string
  program?: Program
  term?: Term
}

export function GraduationTab() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<GradApplication[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    program_id: '', term_id: '', ceremony_date: '', special_requests: '',
  })

  useEffect(() => {
    const fetchAll = async () => {
      const token = getAuthToken()
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      const [appsRes, progsRes, termsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/graduation-applications/me`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, { headers }),
      ])
      if (appsRes.ok) {
        const data = await appsRes.json()
        setApplications(data.data || [])
      }
      if (progsRes.ok) {
        const data = await progsRes.json()
        setPrograms(data.data || [])
      }
      if (termsRes.ok) {
        const data = await termsRes.json()
        setTerms(data.data || [])
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleSubmit = async () => {
    if (!formData.program_id || !formData.term_id) {
      toast({ title: "Validation Error", description: "Program and term are required", variant: "destructive" })
      return
    }
    setSubmitting(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/graduation-applications`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: parseInt(formData.program_id),
          term_id: parseInt(formData.term_id),
          ceremony_date: formData.ceremony_date || undefined,
          special_requests: formData.special_requests || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to submit application')
      }
      const data = await res.json()
      toast({ title: "Application Submitted", description: "Your graduation application has been submitted for review" })
      setApplications([data.data, ...applications])
      setShowForm(false)
      setFormData({ program_id: '', term_id: '', ceremony_date: '', special_requests: '' })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'denied': return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-amber-600" />
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'under_review': return <Badge className="bg-amber-600">Under Review</Badge>
      case 'approved': return <Badge className="bg-green-600">Approved</Badge>
      case 'denied': return <Badge variant="destructive">Denied</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-12"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Existing Applications */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Graduation Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {statusIcon(app.status)}
                  <div>
                    <p className="font-medium">{app.program?.name || `Program #${app.program_id}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.term?.name || `Term #${app.term_id}`} -- Applied {new Date(app.application_date).toLocaleDateString()}
                    </p>
                    {app.reviewer_notes && (
                      <p className="text-sm text-muted-foreground mt-1">Reviewer: {app.reviewer_notes}</p>
                    )}
                  </div>
                </div>
                {statusBadge(app.status)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Apply Section */}
      {!showForm ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Apply for Graduation</h3>
            <p className="text-muted-foreground mb-4">
              Submit your graduation application when you are ready to complete your degree requirements.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Start Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Graduation Application</CardTitle>
            <CardDescription>Fill in the details below to submit your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select value={formData.program_id} onValueChange={(v) => setFormData({...formData, program_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.code} - {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Graduation Term *</Label>
                <Select value={formData.term_id} onValueChange={(v) => setFormData({...formData, term_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Ceremony Date (optional)</Label>
              <Input type="date" value={formData.ceremony_date} onChange={(e) => setFormData({...formData, ceremony_date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Special Requests (optional)</Label>
              <Textarea
                placeholder="Any special accommodations or requests..."
                value={formData.special_requests}
                onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
