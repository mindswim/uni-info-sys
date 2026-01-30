"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, GraduationCap } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface GradApplication {
  id: number
  student_id: number
  program_id: number
  term_id: number
  status: string
  application_date: string
  ceremony_date?: string
  special_requests?: string
  reviewer_notes?: string
  reviewed_at?: string
  student?: { id: number; student_id: string; user?: { name: string } }
  program?: { id: number; name: string; code: string }
  term?: { id: number; name: string }
  reviewer?: { id: number; name: string }
}

export function GraduationApplicationsTab() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<GradApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [processing, setProcessing] = useState(false)

  const [denyDialogOpen, setDenyDialogOpen] = useState(false)
  const [denyingApp, setDenyingApp] = useState<GradApplication | null>(null)
  const [denyNotes, setDenyNotes] = useState("")

  const fetchApplications = async () => {
    setLoading(true)
    const token = getAuthToken()
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/graduation-applications${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setApplications(data.data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [statusFilter])

  const handleApprove = async (id: number) => {
    setProcessing(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/graduation-applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to approve')
      toast({ title: "Approved", description: "Graduation application approved" })
      fetchApplications()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!denyingApp || !denyNotes) {
      toast({ title: "Error", description: "Reviewer notes are required", variant: "destructive" })
      return
    }
    setProcessing(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/graduation-applications/${denyingApp.id}/deny`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_notes: denyNotes }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to deny')
      toast({ title: "Denied", description: "Graduation application denied" })
      setDenyDialogOpen(false)
      setDenyingApp(null)
      setDenyNotes("")
      fetchApplications()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No graduation applications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell>{app.student?.user?.name || app.student?.student_id || '-'}</TableCell>
                    <TableCell>{app.program?.code} - {app.program?.name}</TableCell>
                    <TableCell>{app.term?.name}</TableCell>
                    <TableCell>{new Date(app.application_date).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell>
                      {(app.status === 'pending' || app.status === 'under_review') && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600" disabled={processing} onClick={() => handleApprove(app.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" disabled={processing} onClick={() => { setDenyingApp(app); setDenyDialogOpen(true) }}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Graduation Application</DialogTitle>
            <DialogDescription>Provide reviewer notes explaining the denial</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reviewer notes (required)..."
            value={denyNotes}
            onChange={(e) => setDenyNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeny} disabled={processing || !denyNotes}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deny Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
