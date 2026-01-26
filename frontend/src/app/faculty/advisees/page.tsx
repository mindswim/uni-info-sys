"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import {
  Search, Users, Mail, Phone, GraduationCap, AlertCircle,
  Calendar, ChevronRight, TrendingUp, TrendingDown, Minus,
  ExternalLink, FileText
} from 'lucide-react'
import Link from 'next/link'

interface Advisee {
  id: number
  student_id: string
  name: string
  email: string
  phone?: string
  photo?: string
  major: string
  minor?: string
  classification: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior'
  gpa: number
  credits_completed: number
  credits_required: number
  expected_graduation: string
  holds: number
  last_meeting?: string
  academic_standing: 'good' | 'warning' | 'probation'
  notes?: string
}

export default function AdviseesPage() {
  const [advisees, setAdvisees] = useState<Advisee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAdvisee, setSelectedAdvisee] = useState<Advisee | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Mock advisee data
  const mockAdvisees: Advisee[] = [
    {
      id: 1,
      student_id: 'STU001',
      name: 'Maria Rodriguez',
      email: 'mrodriguez@university.edu',
      phone: '(555) 123-4567',
      major: 'Computer Science',
      minor: 'Mathematics',
      classification: 'Junior',
      gpa: 3.67,
      credits_completed: 89,
      credits_required: 120,
      expected_graduation: 'May 2026',
      holds: 0,
      last_meeting: '2024-12-15',
      academic_standing: 'good',
    },
    {
      id: 2,
      student_id: 'STU002',
      name: 'David Park',
      email: 'dpark@university.edu',
      major: 'Computer Science',
      classification: 'Senior',
      gpa: 3.45,
      credits_completed: 105,
      credits_required: 120,
      expected_graduation: 'May 2025',
      holds: 1,
      last_meeting: '2024-11-20',
      academic_standing: 'good',
    },
    {
      id: 3,
      student_id: 'STU003',
      name: 'Sophie Turner',
      email: 'sturner@university.edu',
      major: 'Computer Science',
      classification: 'Sophomore',
      gpa: 2.15,
      credits_completed: 45,
      credits_required: 120,
      expected_graduation: 'May 2027',
      holds: 2,
      last_meeting: '2024-10-10',
      academic_standing: 'probation',
      notes: 'Struggling with core courses. Needs tutoring referral.',
    },
    {
      id: 4,
      student_id: 'STU004',
      name: 'James Wilson',
      email: 'jwilson@university.edu',
      major: 'Computer Science',
      minor: 'Business',
      classification: 'Junior',
      gpa: 2.85,
      credits_completed: 75,
      credits_required: 120,
      expected_graduation: 'May 2026',
      holds: 0,
      academic_standing: 'warning',
    },
    {
      id: 5,
      student_id: 'STU005',
      name: 'Emma Johnson',
      email: 'ejohnson@university.edu',
      major: 'Computer Science',
      classification: 'Freshman',
      gpa: 3.92,
      credits_completed: 28,
      credits_required: 120,
      expected_graduation: 'May 2028',
      holds: 0,
      last_meeting: '2025-01-05',
      academic_standing: 'good',
    },
  ]

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setAdvisees(mockAdvisees)
      setLoading(false)
    }, 500)
  }, [])

  const filteredAdvisees = advisees.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStandingBadge = (standing: string) => {
    switch (standing) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Good Standing</Badge>
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">Warning</Badge>
      case 'probation':
        return <Badge className="bg-red-100 text-red-800">Probation</Badge>
      default:
        return <Badge variant="secondary">{standing}</Badge>
    }
  }

  const getGPATrend = (gpa: number) => {
    if (gpa >= 3.5) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (gpa >= 2.5) return <Minus className="h-4 w-4 text-gray-400" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  // Stats
  const stats = {
    total: advisees.length,
    goodStanding: advisees.filter(a => a.academic_standing === 'good').length,
    needsAttention: advisees.filter(a => a.academic_standing !== 'good' || a.holds > 0).length,
    upcomingGraduation: advisees.filter(a => a.expected_graduation.includes('2025')).length,
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
            <h1 className="text-2xl font-bold">My Advisees</h1>
            <p className="text-sm text-muted-foreground">
              Manage and support your assigned students
            </p>
          </div>
          <Button asChild>
            <Link href="/faculty/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              View Appointments
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Advisees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.goodStanding}</p>
                  <p className="text-xs text-muted-foreground">Good Standing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.needsAttention}</p>
                  <p className="text-xs text-muted-foreground">Needs Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingGraduation}</p>
                  <p className="text-xs text-muted-foreground">Graduating 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advisees Table */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({advisees.length})</TabsTrigger>
            <TabsTrigger value="attention">
              Needs Attention ({stats.needsAttention})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {filteredAdvisees.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No advisees found"
                description="No students match your search criteria."
                variant="card"
              />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdvisees.map((advisee) => (
                      <TableRow key={advisee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={advisee.photo} alt={advisee.name} />
                              <AvatarFallback>
                                {advisee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{advisee.name}</p>
                              <p className="text-xs text-muted-foreground">{advisee.student_id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{advisee.major}</p>
                            {advisee.minor && (
                              <p className="text-xs text-muted-foreground">Minor: {advisee.minor}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{advisee.classification}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{advisee.gpa.toFixed(2)}</span>
                            {getGPATrend(advisee.gpa)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress
                              value={(advisee.credits_completed / advisee.credits_required) * 100}
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {advisee.credits_completed}/{advisee.credits_required} cr
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStandingBadge(advisee.academic_standing)}
                            {advisee.holds > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {advisee.holds} hold{advisee.holds > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdvisee(advisee)
                              setShowDetailDialog(true)
                            }}
                          >
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attention" className="mt-4">
            {advisees.filter(a => a.academic_standing !== 'good' || a.holds > 0).length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="All students in good standing"
                description="None of your advisees need immediate attention."
                variant="card"
              />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Last Meeting</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advisees
                      .filter(a => a.academic_standing !== 'good' || a.holds > 0)
                      .map((advisee) => (
                        <TableRow key={advisee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {advisee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{advisee.name}</p>
                                <p className="text-xs text-muted-foreground">{advisee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {advisee.academic_standing !== 'good' && getStandingBadge(advisee.academic_standing)}
                              {advisee.holds > 0 && (
                                <Badge variant="destructive" className="text-xs w-fit">
                                  {advisee.holds} active hold{advisee.holds > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={advisee.gpa < 2.0 ? 'text-red-600 font-medium' : ''}>
                              {advisee.gpa.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {advisee.last_meeting || 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm">Schedule Meeting</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View detailed information about this advisee
              </DialogDescription>
            </DialogHeader>
            {selectedAdvisee && (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedAdvisee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAdvisee.name}</h3>
                    <p className="text-muted-foreground">{selectedAdvisee.student_id}</p>
                    <div className="flex gap-2 mt-1">
                      {getStandingBadge(selectedAdvisee.academic_standing)}
                      <Badge variant="outline">{selectedAdvisee.classification}</Badge>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Major</p>
                    <p className="font-medium">{selectedAdvisee.major}</p>
                  </div>
                  {selectedAdvisee.minor && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Minor</p>
                      <p className="font-medium">{selectedAdvisee.minor}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="font-medium">{selectedAdvisee.gpa.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected Graduation</p>
                    <p className="font-medium">{selectedAdvisee.expected_graduation}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedAdvisee.email}`} className="font-medium text-primary">
                      {selectedAdvisee.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="font-medium">
                      {selectedAdvisee.credits_completed} / {selectedAdvisee.credits_required}
                    </p>
                  </div>
                </div>

                {/* Degree Progress */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Degree Progress</p>
                  <Progress
                    value={(selectedAdvisee.credits_completed / selectedAdvisee.credits_required) * 100}
                    className="h-3"
                  />
                  <p className="text-sm mt-1">
                    {Math.round((selectedAdvisee.credits_completed / selectedAdvisee.credits_required) * 100)}% complete
                  </p>
                </div>

                {/* Notes */}
                {selectedAdvisee.notes && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800">Advisor Notes</p>
                    <p className="text-sm text-amber-700 mt-1">{selectedAdvisee.notes}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Degree Audit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
