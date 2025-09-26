'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen, Users, Clock, MapPin,
  Calendar, Edit, Settings, AlertCircle,
  CheckCircle, XCircle, Search, Filter
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Course Sections' }
]

interface Section {
  id: number
  courseCode: string
  courseName: string
  section: string
  instructor: string
  schedule: string
  location: string
  enrolled: number
  capacity: number
  waitlist: number
  status: 'open' | 'full' | 'cancelled'
  term: string
}

// Mock data
const mockSections: Section[] = [
  {
    id: 1,
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    section: '001',
    instructor: 'Dr. Smith',
    schedule: 'MWF 9:00-10:00 AM',
    location: 'Science Building 301',
    enrolled: 28,
    capacity: 30,
    waitlist: 2,
    status: 'open',
    term: 'Fall 2024'
  },
  {
    id: 2,
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    section: '002',
    instructor: 'Dr. Johnson',
    schedule: 'TTh 2:00-3:30 PM',
    location: 'Science Building 302',
    enrolled: 30,
    capacity: 30,
    waitlist: 5,
    status: 'full',
    term: 'Fall 2024'
  },
  {
    id: 3,
    courseCode: 'CS201',
    courseName: 'Data Structures',
    section: '001',
    instructor: 'Prof. Dijkstra',
    schedule: 'MWF 11:00-12:00 PM',
    location: 'Computer Lab 101',
    enrolled: 25,
    capacity: 30,
    waitlist: 0,
    status: 'open',
    term: 'Fall 2024'
  },
  {
    id: 4,
    courseCode: 'MATH201',
    courseName: 'Linear Algebra',
    section: '001',
    instructor: 'Dr. Gauss',
    schedule: 'MWF 2:00-3:00 PM',
    location: 'Math Building 201',
    enrolled: 35,
    capacity: 40,
    waitlist: 0,
    status: 'open',
    term: 'Fall 2024'
  },
  {
    id: 5,
    courseCode: 'CS350',
    courseName: 'Artificial Intelligence',
    section: '001',
    instructor: 'Prof. Turing',
    schedule: 'TTh 10:00-11:30 AM',
    location: 'Tech Center 105',
    enrolled: 40,
    capacity: 40,
    waitlist: 8,
    status: 'full',
    term: 'Fall 2024'
  }
]

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>(mockSections)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === 'all' || section.courseCode === courseFilter
    const matchesStatus = statusFilter === 'all' || section.status === statusFilter
    return matchesSearch && matchesCourse && matchesStatus
  })

  const totalEnrolled = sections.reduce((sum, s) => sum + s.enrolled, 0)
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0)
  const totalWaitlist = sections.reduce((sum, s) => sum + s.waitlist, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default'
      case 'full': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const getCapacityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100
    if (percentage >= 100) return 'text-red-500'
    if (percentage >= 80) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Course Sections
            </h1>
            <p className="text-muted-foreground">
              Manage course sections, schedules, and enrollment
            </p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Section Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sections.length}</div>
              <p className="text-xs text-muted-foreground">
                {sections.filter(s => s.status === 'open').length} open for enrollment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrolled}</div>
              <Progress
                value={(totalEnrolled / totalCapacity) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((totalEnrolled / totalCapacity) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCapacity - totalEnrolled} seats available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWaitlist}</div>
              <p className="text-xs text-muted-foreground">
                Students waiting
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sections by course, instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="CS101">CS101</SelectItem>
                  <SelectItem value="CS201">CS201</SelectItem>
                  <SelectItem value="CS350">CS350</SelectItem>
                  <SelectItem value="MATH201">MATH201</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sections Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <CardDescription>
              Manage and monitor all course sections for Fall 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Waitlist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{section.courseCode}</p>
                        <p className="text-sm text-muted-foreground">{section.courseName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{section.section}</TableCell>
                    <TableCell>{section.instructor}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{section.schedule}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {section.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`font-medium ${getCapacityColor(section.enrolled, section.capacity)}`}>
                          {section.enrolled}/{section.capacity}
                        </div>
                        <Progress
                          value={(section.enrolled / section.capacity) * 100}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {section.waitlist > 0 && (
                        <Badge variant="outline">
                          {section.waitlist}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
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