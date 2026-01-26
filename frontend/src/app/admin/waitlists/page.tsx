"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Users, Search, Clock, UserPlus, ArrowUp, ArrowDown, RefreshCw,
  CheckCircle, XCircle, Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { EnrollmentAPI } from '@/lib/api-client'

interface WaitlistEntry {
  id: number
  student_id: number
  student?: {
    id: number
    name?: string
    first_name?: string
    last_name?: string
    student_number: string
    email?: string
    user?: { email: string }
  }
  course_section_id: number
  course_section?: {
    id: number
    section_number: string
    course?: {
      course_code: string
      title: string
    }
  }
  waitlist_position?: number
  status: string
  created_at: string
  updated_at: string
}

// Helper functions
function getStudentName(entry: WaitlistEntry): string {
  if (entry.student) {
    // API returns 'name' as combined field
    return entry.student.name || `${entry.student.first_name || ''} ${entry.student.last_name || ''}`.trim() || `Student #${entry.student_id}`
  }
  return `Student #${entry.student_id}`
}

function getStudentEmail(entry: WaitlistEntry): string {
  return entry.student?.email || entry.student?.user?.email || ''
}

function getStudentNumber(entry: WaitlistEntry): string {
  return entry.student?.student_number || `#${entry.student_id}`
}

function getCourseCode(entry: WaitlistEntry): string {
  return entry.course_section?.course?.course_code || `Section ${entry.course_section_id}`
}

function getCourseName(entry: WaitlistEntry): string {
  return entry.course_section?.course?.title || ''
}

function getSectionNumber(entry: WaitlistEntry): string {
  return entry.course_section?.section_number || ''
}

export default function WaitlistsPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  const fetchWaitlist = useCallback(async () => {
    setLoading(true)
    try {
      const response = await EnrollmentAPI.getWaitlist({
        search: searchQuery || undefined,
      })
      setEntries(response.data || [])
    } catch (error) {
      console.error('Failed to fetch waitlist:', error)
      toast({ title: 'Failed to load waitlist', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, toast])

  useEffect(() => {
    fetchWaitlist()
  }, [fetchWaitlist])

  const handlePromote = async (entry: WaitlistEntry) => {
    try {
      await EnrollmentAPI.promoteFromWaitlist(entry.id)
      toast({ title: `Enrolled ${getStudentName(entry)} in course` })
      fetchWaitlist()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to promote student'
      toast({ title: message, variant: 'destructive' })
    }
  }

  const handleRemove = async (entry: WaitlistEntry) => {
    try {
      await EnrollmentAPI.deleteEnrollment(entry.id)
      setEntries(entries.filter(e => e.id !== entry.id))
      toast({ title: 'Removed from waitlist' })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from waitlist'
      toast({ title: message, variant: 'destructive' })
    }
  }

  const filteredEntries = entries.filter(e => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const studentName = getStudentName(e).toLowerCase()
      const courseCode = getCourseCode(e).toLowerCase()
      const studentNumber = getStudentNumber(e).toLowerCase()
      if (!studentName.includes(q) && !courseCode.includes(q) && !studentNumber.includes(q)) {
        return false
      }
    }
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waitlisted':
      case 'waiting':
        return <Badge className="bg-amber-100 text-amber-800">Waiting</Badge>
      case 'offered':
        return <Badge className="bg-blue-100 text-blue-800">Offered</Badge>
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
      case 'expired':
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Stats
  const stats = {
    total: entries.length,
    waiting: entries.filter(e => e.status === 'waitlisted' || e.status === 'waiting').length,
    offered: entries.filter(e => e.status === 'offered').length,
    enrolled: entries.filter(e => e.status === 'enrolled').length,
  }

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
            <h1 className="text-2xl font-bold">Waitlist Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage course waitlists and promote students
            </p>
          </div>
          <Button variant="outline" onClick={fetchWaitlist}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.waiting}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.offered}</p>
                  <p className="text-xs text-muted-foreground">Offers Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.enrolled}</p>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Waitlist Table */}
        {filteredEntries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No waitlist entries"
            description="There are no students on waitlists matching your criteria."
            variant="card"
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">#{entry.waitlist_position || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getStudentName(entry)}</p>
                        <p className="text-xs text-muted-foreground">{getStudentNumber(entry)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getCourseCode(entry)}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCourseName(entry)} {getSectionNumber(entry) && `- Sec ${getSectionNumber(entry)}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(entry.status === 'waitlisted' || entry.status === 'waiting') && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => handlePromote(entry)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Enroll
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleRemove(entry)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {entry.status === 'offered' && (
                        <Badge variant="outline">Expires in 24h</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
