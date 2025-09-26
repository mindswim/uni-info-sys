'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users, Search, Filter, Download, Mail, Phone,
  Calendar, MessageSquare, FileText, AlertCircle,
  TrendingUp, TrendingDown, Minus, GraduationCap,
  BookOpen, Target, Clock, UserPlus, ChevronRight
} from 'lucide-react'

export default function MyStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterMajor, setFilterMajor] = useState('all')

  const students = [
    {
      id: 1,
      name: 'Sarah Johnson',
      studentId: 'S00123450',
      email: 'sjohnson@university.edu',
      phone: '(555) 123-4567',
      major: 'Computer Science',
      year: 'Junior',
      gpa: 3.67,
      gpaChange: 0.12,
      credits: 78,
      creditsThisTerm: 15,
      status: 'on-track',
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-01-15',
      advisingSessions: 8,
      alerts: 0,
      holds: 0
    },
    {
      id: 2,
      name: 'Michael Chen',
      studentId: 'S00123451',
      email: 'mchen@university.edu',
      phone: '(555) 123-4568',
      major: 'Business Administration',
      year: 'Senior',
      gpa: 3.42,
      gpaChange: -0.05,
      credits: 112,
      creditsThisTerm: 12,
      status: 'graduating',
      lastMeeting: '2024-12-26',
      nextMeeting: null,
      advisingSessions: 12,
      alerts: 0,
      holds: 0
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      studentId: 'S00123452',
      email: 'erodriguez@university.edu',
      phone: '(555) 123-4569',
      major: 'Biology',
      year: 'Sophomore',
      gpa: 3.89,
      gpaChange: 0.08,
      credits: 45,
      creditsThisTerm: 16,
      status: 'on-track',
      lastMeeting: '2024-12-26',
      nextMeeting: '2025-02-01',
      advisingSessions: 4,
      alerts: 0,
      holds: 0
    },
    {
      id: 4,
      name: 'David Park',
      studentId: 'S00123456',
      email: 'dpark@university.edu',
      phone: '(555) 123-4570',
      major: 'Engineering',
      year: 'Junior',
      gpa: 1.8,
      gpaChange: -0.3,
      credits: 68,
      creditsThisTerm: 12,
      status: 'at-risk',
      lastMeeting: '2024-12-22',
      nextMeeting: '2025-01-08',
      advisingSessions: 15,
      alerts: 2,
      holds: 1
    },
    {
      id: 5,
      name: 'Jennifer Lee',
      studentId: 'S00123789',
      email: 'jlee@university.edu',
      phone: '(555) 123-4571',
      major: 'Psychology',
      year: 'Senior',
      gpa: 3.75,
      gpaChange: 0.02,
      credits: 105,
      creditsThisTerm: 15,
      status: 'on-track',
      lastMeeting: '2024-12-15',
      nextMeeting: '2025-01-20',
      advisingSessions: 10,
      alerts: 0,
      holds: 0
    },
    {
      id: 6,
      name: 'Robert Martinez',
      studentId: 'S00124567',
      email: 'rmartinez@university.edu',
      phone: '(555) 123-4572',
      major: 'History',
      year: 'Freshman',
      gpa: 2.95,
      gpaChange: 0,
      credits: 15,
      creditsThisTerm: 15,
      status: 'on-track',
      lastMeeting: '2024-12-10',
      nextMeeting: '2025-01-25',
      advisingSessions: 2,
      alerts: 0,
      holds: 1
    },
    {
      id: 7,
      name: 'Amanda Taylor',
      studentId: 'S00125678',
      email: 'ataylor@university.edu',
      phone: '(555) 123-4573',
      major: 'Mathematics',
      year: 'Sophomore',
      gpa: 2.1,
      gpaChange: -0.4,
      credits: 42,
      creditsThisTerm: 14,
      status: 'probation',
      lastMeeting: '2024-12-16',
      nextMeeting: '2025-01-05',
      advisingSessions: 9,
      alerts: 1,
      holds: 0
    },
    {
      id: 8,
      name: 'Christopher Brown',
      studentId: 'S00126789',
      email: 'cbrown@university.edu',
      phone: '(555) 123-4574',
      major: 'English Literature',
      year: 'Junior',
      gpa: 3.55,
      gpaChange: 0.15,
      credits: 82,
      creditsThisTerm: 18,
      status: 'on-track',
      lastMeeting: '2024-11-28',
      nextMeeting: '2025-02-10',
      advisingSessions: 6,
      alerts: 0,
      holds: 0
    }
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.major.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    const matchesYear = filterYear === 'all' || student.year === filterYear
    const matchesMajor = filterMajor === 'all' || student.major === filterMajor

    return matchesSearch && matchesStatus && matchesYear && matchesMajor
  })

  const stats = {
    total: students.length,
    onTrack: students.filter(s => s.status === 'on-track').length,
    atRisk: students.filter(s => s.status === 'at-risk' || s.status === 'probation').length,
    graduating: students.filter(s => s.status === 'graduating').length,
    avgGPA: (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2),
    withAlerts: students.filter(s => s.alerts > 0).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800'
      case 'at-risk': return 'bg-red-100 text-red-800'
      case 'probation': return 'bg-orange-100 text-orange-800'
      case 'graduating': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGPATrend = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard', href: '/advisor-dashboard' },
    { label: 'My Students' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              My Students
            </h1>
            <p className="text-muted-foreground">
              Manage your advisee caseload
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">On Track</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Graduating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.graduating}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgGPA}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">With Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withAlerts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, ID, or major..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="graduating">Graduating</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="Freshman">Freshman</SelectItem>
                  <SelectItem value="Sophomore">Sophomore</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterMajor} onValueChange={setFilterMajor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Major" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Majors</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Business Administration">Business Admin</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Psychology">Psychology</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English Literature">English Literature</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Caseload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Major / Year</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Meeting</TableHead>
                  <TableHead>Next Meeting</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.studentId}</p>
                          <div className="flex gap-2 mt-1">
                            <a
                              href={`mailto:${student.email}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {student.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{student.major}</p>
                      <p className="text-sm text-muted-foreground">{student.year}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={student.gpa < 2.0 ? 'font-medium text-red-600' : ''}>
                          {student.gpa.toFixed(2)}
                        </span>
                        {getGPATrend(student.gpaChange)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {student.gpaChange > 0 ? '+' : ''}{student.gpaChange.toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{student.credits}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.creditsThisTerm} this term
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.lastMeeting}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.advisingSessions} total sessions
                      </p>
                    </TableCell>
                    <TableCell>
                      {student.nextMeeting ? (
                        <div>
                          <p className="text-sm font-medium">{student.nextMeeting}</p>
                          <Button size="sm" variant="link" className="p-0 h-auto">
                            Reschedule
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {student.alerts > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {student.alerts}
                          </Badge>
                        )}
                        {student.holds > 0 && (
                          <Badge variant="secondary">
                            {student.holds} hold{student.holds > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {student.alerts === 0 && student.holds === 0 && (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}