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
import { Loader2, CheckCircle, XCircle, GraduationCap, ShieldCheck, AlertTriangle, Clock } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface ClearanceDept {
  status: string
  cleared_by: number | null
  cleared_at: string | null
  notes: string | null
}

interface ClearanceSummary {
  total: number
  cleared: number
  pending: number
  hold: number
}

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
  clearance_status?: Record<string, ClearanceDept>
  clearance_summary?: ClearanceSummary
  degree_audit_snapshot?: {
    graduation_eligible?: boolean
    overall_progress?: { credits_completed: number; credits_needed: number; percentage_complete: number }
  }
  student?: { id: number; student_id: string; user?: { name: string } }
  program?: { id: number; name: string; code: string }
  term?: { id: number; name: string }
  reviewer?: { id: number; name: string }
}

const DEPARTMENTS = ['academic', 'financial', 'library', 'registrar'] as const

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function GraduationApplicationsTab() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<GradApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [processing, setProcessing] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [denyDialogOpen, setDenyDialogOpen] = useState(false)
  const [denyingApp, setDenyingApp] = useState<GradApplication | null>(null)
  const [denyNotes, setDenyNotes] = useState("")

  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockingDept, setBlockingDept] = useState<{ appId: number; dept: string } | null>(null)
  const [blockNotes, setBlockNotes] = useState("")

  const headers = () => {
    const token = getAuthToken()
    return { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' }
  }

  const fetchApplications = async () => {
    setLoading(true)
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    const res = await fetch(`${API_URL}/api/v1/graduation-applications${params}`, { headers: headers() })
    if (res.ok) {
      const data = await res.json()
      setApplications(data.data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [statusFilter])

  const handleClear = async (appId: number, dept: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/graduation-applications/${appId}/clear/${dept}`, {
        method: 'POST', headers: headers(),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed')
      toast({ title: "Cleared", description: `${dept} department cleared` })
      fetchApplications()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed'
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally { setProcessing(false) }
  }

  const handleBlock = async () => {
    if (!blockingDept || !blockNotes) return
    setProcessing(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/graduation-applications/${blockingDept.appId}/block/${blockingDept.dept}`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ notes: blockNotes }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed')
      toast({ title: "Hold placed", description: `${blockingDept.dept} department hold placed` })
      setBlockDialogOpen(false)
      setBlockingDept(null)
      setBlockNotes("")
      fetchApplications()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed'
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally { setProcessing(false) }
  }

  const handleFinalApprove = async (appId: number) => {
    setProcessing(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/graduation-applications/${appId}/final-approve`, {
        method: 'POST', headers: headers(),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed')
      toast({ title: "Approved", description: "Graduation application approved" })
      fetchApplications()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed'
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally { setProcessing(false) }
  }

  const handleDeny = async () => {
    if (!denyingApp || !denyNotes) return
    setProcessing(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/graduation-applications/${denyingApp.id}/deny`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ reviewer_notes: denyNotes }),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed')
      toast({ title: "Denied", description: "Graduation application denied" })
      setDenyDialogOpen(false)
      setDenyingApp(null)
      setDenyNotes("")
      fetchApplications()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed'
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally { setProcessing(false) }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'under_review': return <Badge className="bg-amber-600">Under Review</Badge>
      case 'clearance_in_progress': return <Badge className="bg-blue-600">Clearance In Progress</Badge>
      case 'cleared': return <Badge className="bg-emerald-600">Cleared</Badge>
      case 'approved': return <Badge className="bg-green-600">Approved</Badge>
      case 'denied': return <Badge variant="destructive">Denied</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const deptStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'hold': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  const clearanceProgress = (summary?: ClearanceSummary) => {
    if (!summary) return null
    return (
      <span className="text-sm font-medium">
        {summary.cleared}/{summary.total}
        {summary.hold > 0 && <span className="text-red-600 ml-1">({summary.hold} hold)</span>}
      </span>
    )
  }

  const isInClearance = (status: string) =>
    ['clearance_in_progress', 'cleared'].includes(status)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="clearance_in_progress">Clearance In Progress</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
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
            <div className="space-y-2">
              {applications.map(app => (
                <div key={app.id} className="border rounded-lg">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{app.student?.user?.name || app.student?.student_id || '-'}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.program?.code} - {app.program?.name} | {app.term?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isInClearance(app.status) && clearanceProgress(app.clearance_summary)}
                      {statusBadge(app.status)}
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="border-t px-4 py-4 space-y-4 bg-muted/25">
                      {/* Clearance Steps */}
                      {app.clearance_status && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Clearance Status</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                                {isInClearance(app.status) && <TableHead>Actions</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {DEPARTMENTS.map(dept => {
                                const step = app.clearance_status?.[dept]
                                const deptStatus = step?.status || 'pending'
                                return (
                                  <TableRow key={dept}>
                                    <TableCell className="capitalize font-medium">{dept}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {deptStatusIcon(deptStatus)}
                                        <span className="capitalize">{deptStatus}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                                      {step?.notes || '--'}
                                    </TableCell>
                                    {isInClearance(app.status) && (
                                      <TableCell>
                                        {deptStatus !== 'cleared' && (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-green-600"
                                              disabled={processing}
                                              onClick={(e) => { e.stopPropagation(); handleClear(app.id, dept) }}
                                            >
                                              <ShieldCheck className="h-3 w-3 mr-1" />
                                              Clear
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600"
                                              disabled={processing}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setBlockingDept({ appId: app.id, dept })
                                                setBlockDialogOpen(true)
                                              }}
                                            >
                                              <AlertTriangle className="h-3 w-3 mr-1" />
                                              Hold
                                            </Button>
                                          </div>
                                        )}
                                        {deptStatus === 'cleared' && (
                                          <span className="text-green-600 text-sm">Cleared</span>
                                        )}
                                      </TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Degree Audit Snapshot */}
                      {app.degree_audit_snapshot && (
                        <div className="text-sm">
                          <h4 className="font-semibold mb-1">Degree Audit Snapshot</h4>
                          <p>
                            Credits: {app.degree_audit_snapshot.overall_progress?.credits_completed || 0} / {app.degree_audit_snapshot.overall_progress?.credits_needed || 0}
                            {' '}({app.degree_audit_snapshot.overall_progress?.percentage_complete || 0}%)
                          </p>
                          <p>
                            Graduation eligible: {app.degree_audit_snapshot.graduation_eligible ? 'Yes' : 'No'}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        {app.status === 'cleared' && (
                          <Button
                            size="sm"
                            disabled={processing}
                            onClick={(e) => { e.stopPropagation(); handleFinalApprove(app.id) }}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Final Approve
                          </Button>
                        )}
                        {['pending', 'under_review', 'clearance_in_progress', 'cleared'].includes(app.status) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processing}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDenyingApp(app)
                              setDenyDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deny Dialog */}
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

      {/* Block Department Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Hold on {blockingDept?.dept}</DialogTitle>
            <DialogDescription>Explain the reason for the hold</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Hold reason (required)..."
            value={blockNotes}
            onChange={(e) => setBlockNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlock} disabled={processing || !blockNotes}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
