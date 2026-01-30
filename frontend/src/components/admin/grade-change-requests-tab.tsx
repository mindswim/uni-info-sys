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
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface GradeChangeRequest {
  id: number
  enrollment_id: number
  requested_by: number
  current_grade: string
  requested_grade: string
  reason: string
  status: string
  admin_notes?: string
  enrollment?: {
    id: number
    student?: { id: number; student_id: string; user?: { name: string } }
    course_section?: { id: number; section_number: string; course?: { course_code: string; title: string } }
  }
  requester?: { id: number; name: string }
  created_at: string
}

export function GradeChangeRequestsTab() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<GradeChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [denyDialogOpen, setDenyDialogOpen] = useState(false)
  const [denyingRequest, setDenyingRequest] = useState<GradeChangeRequest | null>(null)
  const [denyReason, setDenyReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    const token = getAuthToken()
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/grade-change-requests${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setRequests(data.data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchRequests() }, [statusFilter])

  const handleApprove = async (id: number) => {
    setProcessing(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/grade-change-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to approve')
      toast({ title: "Approved", description: "Grade change request approved" })
      fetchRequests()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!denyingRequest) return
    setProcessing(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/grade-change-requests/${denyingRequest.id}/deny`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: denyReason }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to deny')
      toast({ title: "Denied", description: "Grade change request denied" })
      setDenyDialogOpen(false)
      setDenyingRequest(null)
      setDenyReason("")
      fetchRequests()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'approved': return <Badge className="bg-green-600">Approved</Badge>
      case 'denied': return <Badge variant="destructive">Denied</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Change Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : requests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No grade change requests found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{req.enrollment?.student?.user?.name || req.enrollment?.student?.student_id || '-'}</TableCell>
                    <TableCell>{req.enrollment?.course_section?.course?.course_code || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{req.current_grade}</Badge></TableCell>
                    <TableCell><Badge>{req.requested_grade}</Badge></TableCell>
                    <TableCell className="max-w-48 truncate">{req.reason}</TableCell>
                    <TableCell>{req.requester?.name || '-'}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell>
                      {req.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600" disabled={processing} onClick={() => handleApprove(req.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" disabled={processing} onClick={() => { setDenyingRequest(req); setDenyDialogOpen(true) }}>
                            <XCircle className="h-4 w-4" />
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
            <DialogTitle>Deny Grade Change Request</DialogTitle>
            <DialogDescription>Provide a reason for denying this request</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for denial..."
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeny} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
