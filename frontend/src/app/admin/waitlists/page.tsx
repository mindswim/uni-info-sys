"use client"

import { useState, useEffect } from 'react'
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

interface WaitlistEntry {
  id: number
  student_name: string
  student_email: string
  student_id: string
  course_code: string
  course_name: string
  section: string
  position: number
  added_at: string
  status: 'waiting' | 'offered' | 'enrolled' | 'expired'
}

export default function WaitlistsPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  // Mock waitlist data
  const mockEntries: WaitlistEntry[] = [
    {
      id: 1,
      student_name: 'Sophie Turner',
      student_email: 'sturner@university.edu',
      student_id: 'STU003',
      course_code: 'CS 301',
      course_name: 'Data Structures',
      section: '001',
      position: 1,
      added_at: '2025-01-10T09:30:00Z',
      status: 'waiting',
    },
    {
      id: 2,
      student_name: 'James Wilson',
      student_email: 'jwilson@university.edu',
      student_id: 'STU004',
      course_code: 'CS 301',
      course_name: 'Data Structures',
      section: '001',
      position: 2,
      added_at: '2025-01-10T10:15:00Z',
      status: 'waiting',
    },
    {
      id: 3,
      student_name: 'Maria Rodriguez',
      student_email: 'mrodriguez@university.edu',
      student_id: 'STU001',
      course_code: 'MATH 240',
      course_name: 'Linear Algebra',
      section: '002',
      position: 1,
      added_at: '2025-01-08T14:00:00Z',
      status: 'offered',
    },
    {
      id: 4,
      student_name: 'David Park',
      student_email: 'dpark@university.edu',
      student_id: 'STU002',
      course_code: 'CS 450',
      course_name: 'Machine Learning',
      section: '001',
      position: 1,
      added_at: '2025-01-05T11:00:00Z',
      status: 'enrolled',
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setEntries(mockEntries)
      setLoading(false)
    }, 500)
  }, [])

  const handlePromote = (entry: WaitlistEntry) => {
    toast({ title: `Offered spot to ${entry.student_name}` })
  }

  const handleRemove = (entry: WaitlistEntry) => {
    setEntries(entries.filter(e => e.id !== entry.id))
    toast({ title: 'Removed from waitlist' })
  }

  const filteredEntries = entries.filter(e => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!e.student_name.toLowerCase().includes(q) &&
          !e.course_code.toLowerCase().includes(q) &&
          !e.student_id.toLowerCase().includes(q)) {
        return false
      }
    }
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-amber-100 text-amber-800">Waiting</Badge>
      case 'offered':
        return <Badge className="bg-blue-100 text-blue-800">Offered</Badge>
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Stats
  const stats = {
    total: entries.length,
    waiting: entries.filter(e => e.status === 'waiting').length,
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
          <Button variant="outline">
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
                        <span className="text-lg font-bold">#{entry.position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.student_name}</p>
                        <p className="text-xs text-muted-foreground">{entry.student_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.course_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.course_name} - Sec {entry.section}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(entry.added_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.status === 'waiting' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => handlePromote(entry)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Offer Spot
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
