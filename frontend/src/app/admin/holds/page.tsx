"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AlertCircle, Ban, DollarSign, GraduationCap, Shield, Syringe,
  Book, Car, Search, Plus, CheckCircle, XCircle, Clock, ChevronRight,
  AlertTriangle, Filter, RefreshCw, User
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface Hold {
  id: number
  student_id: number
  student_name: string
  student_email: string
  type: 'registration' | 'financial' | 'academic' | 'administrative' | 'immunization' | 'library' | 'parking'
  reason: string
  description?: string
  severity: 'info' | 'warning' | 'critical'
  prevents_registration: boolean
  prevents_transcript: boolean
  prevents_graduation: boolean
  placed_by: string
  placed_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
}

interface HoldsSummary {
  total: number
  by_type: Record<string, number>
  by_severity: Record<string, number>
  preventing_registration: number
  preventing_transcript: number
  preventing_graduation: number
}

const holdTypeIcons: Record<string, React.ElementType> = {
  registration: Ban,
  financial: DollarSign,
  academic: GraduationCap,
  administrative: Shield,
  immunization: Syringe,
  library: Book,
  parking: Car,
}

const holdTypeLabels: Record<string, string> = {
  registration: 'Registration',
  financial: 'Financial',
  academic: 'Academic',
  administrative: 'Administrative',
  immunization: 'Immunization',
  library: 'Library',
  parking: 'Parking',
}

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

// Mock data for demonstration
const mockHolds: Hold[] = [
  {
    id: 1,
    student_id: 101,
    student_name: 'Maria Rodriguez',
    student_email: 'maria@demo.com',
    type: 'financial',
    reason: 'Unpaid tuition balance',
    description: 'Outstanding balance of $2,450.00 from Fall 2024 term',
    severity: 'critical',
    prevents_registration: true,
    prevents_transcript: true,
    prevents_graduation: true,
    placed_by: 'Bursar Office',
    placed_at: '2024-12-15T10:30:00Z',
  },
  {
    id: 2,
    student_id: 102,
    student_name: 'David Park',
    student_email: 'david@demo.com',
    type: 'immunization',
    reason: 'Missing immunization records',
    description: 'Required MMR vaccination documentation not on file',
    severity: 'warning',
    prevents_registration: true,
    prevents_transcript: false,
    prevents_graduation: false,
    placed_by: 'Health Services',
    placed_at: '2024-11-20T14:15:00Z',
  },
  {
    id: 3,
    student_id: 103,
    student_name: 'Sophie Turner',
    student_email: 'sophie@demo.com',
    type: 'academic',
    reason: 'Academic probation review',
    description: 'Must meet with academic advisor before registering',
    severity: 'warning',
    prevents_registration: true,
    prevents_transcript: false,
    prevents_graduation: false,
    placed_by: 'Academic Affairs',
    placed_at: '2024-12-01T09:00:00Z',
  },
  {
    id: 4,
    student_id: 104,
    student_name: 'James Wilson',
    student_email: 'james@demo.com',
    type: 'library',
    reason: 'Overdue library materials',
    description: '3 books overdue for more than 30 days',
    severity: 'info',
    prevents_registration: false,
    prevents_transcript: false,
    prevents_graduation: true,
    placed_by: 'Library Services',
    placed_at: '2024-12-10T11:00:00Z',
  },
  {
    id: 5,
    student_id: 105,
    student_name: 'Emma Johnson',
    student_email: 'emma@demo.com',
    type: 'registration',
    reason: 'Advising hold',
    description: 'Must complete mandatory advising session before registration',
    severity: 'info',
    prevents_registration: true,
    prevents_transcript: false,
    prevents_graduation: false,
    placed_by: 'Advising Center',
    placed_at: '2024-12-05T13:30:00Z',
  },
]

export default function AdminHoldsPage() {
  const { toast } = useToast()
  const [holds, setHolds] = useState<Hold[]>([])
  const [summary, setSummary] = useState<HoldsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved'>('active')
  const [showPlaceHoldDialog, setShowPlaceHoldDialog] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [selectedHold, setSelectedHold] = useState<Hold | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // New hold form state
  const [newHold, setNewHold] = useState({
    student_id: '',
    type: 'registration' as Hold['type'],
    reason: '',
    description: '',
    severity: 'warning' as Hold['severity'],
    prevents_registration: true,
    prevents_transcript: false,
    prevents_graduation: false,
  })

  useEffect(() => {
    fetchHolds()
  }, [])

  const fetchHolds = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real app, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500))
      setHolds(mockHolds)

      // Calculate summary
      const summary: HoldsSummary = {
        total: mockHolds.length,
        by_type: {},
        by_severity: {},
        preventing_registration: 0,
        preventing_transcript: 0,
        preventing_graduation: 0,
      }

      mockHolds.forEach(hold => {
        summary.by_type[hold.type] = (summary.by_type[hold.type] || 0) + 1
        summary.by_severity[hold.severity] = (summary.by_severity[hold.severity] || 0) + 1
        if (hold.prevents_registration) summary.preventing_registration++
        if (hold.prevents_transcript) summary.preventing_transcript++
        if (hold.prevents_graduation) summary.preventing_graduation++
      })

      setSummary(summary)
    } catch (error) {
      toast({ title: 'Failed to load holds', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceHold = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      toast({ title: 'Hold placed successfully' })
      setShowPlaceHoldDialog(false)
      setNewHold({
        student_id: '',
        type: 'registration',
        reason: '',
        description: '',
        severity: 'warning',
        prevents_registration: true,
        prevents_transcript: false,
        prevents_graduation: false,
      })
      fetchHolds()
    } catch (error) {
      toast({ title: 'Failed to place hold', variant: 'destructive' })
    }
  }

  const handleResolveHold = async () => {
    if (!selectedHold) return
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setHolds(holds.filter(h => h.id !== selectedHold.id))
      toast({ title: 'Hold resolved successfully' })
      setShowResolveDialog(false)
      setSelectedHold(null)
      setResolutionNotes('')
    } catch (error) {
      toast({ title: 'Failed to resolve hold', variant: 'destructive' })
    }
  }

  // Filter holds
  const filteredHolds = holds.filter(hold => {
    if (searchQuery && !hold.student_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !hold.student_email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !hold.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && hold.type !== typeFilter) return false
    if (severityFilter !== 'all' && hold.severity !== severityFilter) return false
    if (statusFilter === 'active' && hold.resolved_at) return false
    if (statusFilter === 'resolved' && !hold.resolved_at) return false
    return true
  })

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="list" />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Holds Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage student registration and transcript holds
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchHolds}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showPlaceHoldDialog} onOpenChange={setShowPlaceHoldDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Place Hold
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Place New Hold</DialogTitle>
                  <DialogDescription>
                    Create a new hold on a student account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID or Email</Label>
                    <Input
                      id="student_id"
                      placeholder="Enter student ID or email"
                      value={newHold.student_id}
                      onChange={(e) => setNewHold({ ...newHold, student_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Hold Type</Label>
                    <Select
                      value={newHold.type}
                      onValueChange={(value) => setNewHold({ ...newHold, type: value as Hold['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(holdTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={newHold.severity}
                      onValueChange={(value) => setNewHold({ ...newHold, severity: value as Hold['severity'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="Brief reason for the hold"
                      value={newHold.reason}
                      onChange={(e) => setNewHold({ ...newHold, reason: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional details..."
                      value={newHold.description}
                      onChange={(e) => setNewHold({ ...newHold, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Restrictions</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={newHold.prevents_registration ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setNewHold({ ...newHold, prevents_registration: !newHold.prevents_registration })}
                      >
                        Registration
                      </Badge>
                      <Badge
                        variant={newHold.prevents_transcript ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setNewHold({ ...newHold, prevents_transcript: !newHold.prevents_transcript })}
                      >
                        Transcript
                      </Badge>
                      <Badge
                        variant={newHold.prevents_graduation ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setNewHold({ ...newHold, prevents_graduation: !newHold.prevents_graduation })}
                      >
                        Graduation
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPlaceHoldDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePlaceHold} disabled={!newHold.student_id || !newHold.reason}>
                    Place Hold
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{summary.total}</p>
                    <p className="text-xs text-muted-foreground">Total Holds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{summary.by_severity.critical || 0}</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Ban className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{summary.preventing_registration}</p>
                    <p className="text-xs text-muted-foreground">Blocking Reg.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{summary.by_type.financial || 0}</p>
                    <p className="text-xs text-muted-foreground">Financial</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{summary.preventing_graduation}</p>
                    <p className="text-xs text-muted-foreground">Blocking Grad.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student, email, or reason..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Hold Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(holdTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Holds Table */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'active' | 'resolved')}>
          <TabsList>
            <TabsTrigger value="active">Active Holds ({holds.filter(h => !h.resolved_at).length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({holds.filter(h => h.resolved_at).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {filteredHolds.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No active holds"
                description="There are no active holds matching your filters."
                variant="card"
              />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Restrictions</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHolds.map((hold) => {
                      const Icon = holdTypeIcons[hold.type] || AlertCircle
                      return (
                        <TableRow key={hold.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-muted">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{hold.student_name}</p>
                                <p className="text-xs text-muted-foreground">{hold.student_email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{holdTypeLabels[hold.type]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="font-medium truncate">{hold.reason}</p>
                              {hold.description && (
                                <p className="text-xs text-muted-foreground truncate">{hold.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={severityColors[hold.severity]}>
                              {hold.severity.charAt(0).toUpperCase() + hold.severity.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {hold.prevents_registration && (
                                <Badge variant="outline" className="text-xs">Reg</Badge>
                              )}
                              {hold.prevents_transcript && (
                                <Badge variant="outline" className="text-xs">Trans</Badge>
                              )}
                              {hold.prevents_graduation && (
                                <Badge variant="outline" className="text-xs">Grad</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{formatDistanceToNow(new Date(hold.placed_at), { addSuffix: true })}</p>
                              <p className="text-xs text-muted-foreground">by {hold.placed_by}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedHold(hold)
                                setShowResolveDialog(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            <EmptyState
              icon={Clock}
              title="No resolved holds"
              description="Resolved holds will appear here."
              variant="card"
            />
          </TabsContent>
        </Tabs>

        {/* Resolve Dialog */}
        <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Hold</DialogTitle>
              <DialogDescription>
                This will remove the hold from {selectedHold?.student_name}'s account.
              </DialogDescription>
            </DialogHeader>
            {selectedHold && (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = holdTypeIcons[selectedHold.type]
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="font-medium">{holdTypeLabels[selectedHold.type]} Hold</span>
                    <Badge className={severityColors[selectedHold.severity]}>
                      {selectedHold.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{selectedHold.reason}</p>
                  {selectedHold.description && (
                    <p className="text-xs text-muted-foreground">{selectedHold.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolution_notes">Resolution Notes (Optional)</Label>
                  <Textarea
                    id="resolution_notes"
                    placeholder="Add notes about how this hold was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolveHold}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Hold
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
