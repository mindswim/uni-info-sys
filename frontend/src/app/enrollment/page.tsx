'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen, Search, Filter, Plus, Minus,
  Calendar, Clock, Users, AlertCircle,
  CheckCircle, XCircle, Info, GraduationCap,
  MapPin, User, ShoppingCart, Trash2,
  ArrowRight, AlertTriangle
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Enrollment' }
]

interface Course {
  id: number
  code: string
  name: string
  credits: number
  instructor: string
  schedule: string
  location: string
  enrolled: number
  capacity: number
  status: 'open' | 'closed' | 'waitlist'
  prerequisites?: string[]
  description: string
  department: string
}

interface EnrolledCourse {
  id: number
  code: string
  name: string
  credits: number
  instructor: string
  schedule: string
  status: 'confirmed' | 'waitlist' | 'pending'
  grade?: string
}

// Mock data
const availableCourses: Course[] = [
  {
    id: 1,
    code: 'CS401',
    name: 'Advanced Algorithms',
    credits: 3,
    instructor: 'Prof. Knuth',
    schedule: 'MWF 10:00-11:00 AM',
    location: 'Science Building 301',
    enrolled: 28,
    capacity: 30,
    status: 'open',
    prerequisites: ['CS201', 'MATH201'],
    description: 'Study of advanced algorithmic techniques including dynamic programming, greedy algorithms, and graph algorithms.',
    department: 'Computer Science'
  },
  {
    id: 2,
    code: 'CS450',
    name: 'Machine Learning',
    credits: 4,
    instructor: 'Dr. Mitchell',
    schedule: 'TTh 2:00-3:30 PM',
    location: 'Tech Lab 105',
    enrolled: 35,
    capacity: 35,
    status: 'closed',
    prerequisites: ['CS350', 'MATH301'],
    description: 'Introduction to machine learning algorithms and applications.',
    department: 'Computer Science'
  },
  {
    id: 3,
    code: 'MATH301',
    name: 'Probability & Statistics',
    credits: 3,
    instructor: 'Dr. Bayes',
    schedule: 'MWF 1:00-2:00 PM',
    location: 'Math Building 201',
    enrolled: 22,
    capacity: 40,
    status: 'open',
    prerequisites: ['MATH201'],
    description: 'Probability theory, statistical inference, and hypothesis testing.',
    department: 'Mathematics'
  },
  {
    id: 4,
    code: 'PHYS201',
    name: 'Quantum Mechanics',
    credits: 4,
    instructor: 'Prof. Feynman',
    schedule: 'TTh 10:00-11:30 AM',
    location: 'Physics Hall 110',
    enrolled: 18,
    capacity: 25,
    status: 'open',
    prerequisites: ['PHYS101', 'MATH201'],
    description: 'Introduction to quantum mechanics and wave functions.',
    department: 'Physics'
  },
  {
    id: 5,
    code: 'CS380',
    name: 'Computer Networks',
    credits: 3,
    instructor: 'Dr. Cerf',
    schedule: 'MWF 3:00-4:00 PM',
    location: 'Network Lab 202',
    enrolled: 30,
    capacity: 30,
    status: 'waitlist',
    prerequisites: ['CS250'],
    description: 'TCP/IP protocols, network architecture, and distributed systems.',
    department: 'Computer Science'
  }
]

const currentEnrollments: EnrolledCourse[] = [
  {
    id: 1,
    code: 'CS350',
    name: 'Artificial Intelligence',
    credits: 3,
    instructor: 'Prof. Turing',
    schedule: 'MWF 10:00-11:00 AM',
    status: 'confirmed'
  },
  {
    id: 2,
    code: 'CS201',
    name: 'Data Structures',
    credits: 3,
    instructor: 'Prof. Dijkstra',
    schedule: 'TTh 2:00-3:30 PM',
    status: 'confirmed'
  },
  {
    id: 3,
    code: 'MATH201',
    name: 'Linear Algebra',
    credits: 3,
    instructor: 'Dr. Gauss',
    schedule: 'MWF 2:00-3:00 PM',
    status: 'confirmed'
  }
]

export default function EnrollmentPage() {
  const [courses, setCourses] = useState<Course[]>(availableCourses)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(currentEnrollments)
  const [shoppingCart, setShoppingCart] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0)
  const cartCredits = shoppingCart.reduce((sum, course) => sum + course.credits, 0)
  const maxCredits = 18

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const addToCart = (course: Course) => {
    if (shoppingCart.find(c => c.id === course.id)) {
      setShoppingCart(shoppingCart.filter(c => c.id !== course.id))
    } else {
      if (totalCredits + cartCredits + course.credits > maxCredits) {
        alert(`Adding this course would exceed the maximum credit limit of ${maxCredits}`)
        return
      }
      setShoppingCart([...shoppingCart, course])
    }
  }

  const enrollInCourses = () => {
    setLoading(true)
    setTimeout(() => {
      const newEnrollments = shoppingCart.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        instructor: course.instructor,
        schedule: course.schedule,
        status: course.status === 'waitlist' ? 'waitlist' as const : 'confirmed' as const
      }))
      setEnrolledCourses([...enrolledCourses, ...newEnrollments])
      setShoppingCart([])
      setLoading(false)
      setShowEnrollDialog(false)
    }, 1500)
  }

  const dropCourse = (courseId: number) => {
    setEnrolledCourses(enrolledCourses.filter(c => c.id !== courseId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-500'
      case 'closed': return 'text-red-500'
      case 'waitlist': return 'text-yellow-500'
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Course Enrollment
            </h1>
            <p className="text-muted-foreground">
              Register for courses, manage your schedule, and track waitlists
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Term</p>
            <p className="font-semibold">Fall 2024</p>
          </div>
        </div>

        {/* Credit Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {totalCredits} / {maxCredits} credits
                </p>
                <p className="text-sm text-muted-foreground">
                  Currently enrolled
                </p>
              </div>
              {cartCredits > 0 && (
                <div className="text-right space-y-1">
                  <p className="text-xl font-semibold text-blue-500">
                    +{cartCredits} credits
                  </p>
                  <p className="text-sm text-muted-foreground">
                    In shopping cart
                  </p>
                </div>
              )}
              <div className="flex-1 mx-8">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${((totalCredits + cartCredits) / maxCredits) * 100}%` }}
                  >
                    {cartCredits > 0 && (
                      <div
                        className="bg-blue-600 h-3 rounded-full float-right transition-all"
                        style={{ width: `${(cartCredits / (totalCredits + cartCredits)) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="enrolled">
              My Enrollments ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="cart">
              Shopping Cart ({shoppingCart.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search courses by name, code, or instructor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Course List */}
            <div className="grid gap-4">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourses.find(c => c.code === course.code)
                const isInCart = shoppingCart.find(c => c.id === course.id)

                return (
                  <Card key={course.id} className={isInCart ? 'ring-2 ring-blue-500' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">
                                {course.code}: {course.name}
                              </h3>
                              <Badge variant={course.status === 'open' ? 'default' : course.status === 'closed' ? 'destructive' : 'secondary'}>
                                {course.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {course.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{course.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{course.schedule}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{course.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{course.enrolled}/{course.capacity} enrolled</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {course.credits} credits
                            </Badge>
                            {course.prerequisites && course.prerequisites.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                Prerequisites: {course.prerequisites.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-4">
                          {isEnrolled ? (
                            <Badge variant="default" className="px-4 py-2">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Enrolled
                            </Badge>
                          ) : course.status === 'closed' ? (
                            <Button variant="outline" disabled>
                              <XCircle className="h-4 w-4 mr-2" />
                              Full
                            </Button>
                          ) : (
                            <Button
                              variant={isInCart ? "secondary" : "default"}
                              onClick={() => addToCart(course)}
                            >
                              {isInCart ? (
                                <>
                                  <Minus className="h-4 w-4 mr-2" />
                                  Remove
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="enrolled">
            <Card>
              <CardHeader>
                <CardTitle>Current Enrollments</CardTitle>
                <CardDescription>
                  Your confirmed and waitlisted courses for Fall 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses enrolled</h3>
                    <p className="text-muted-foreground">
                      Browse available courses to start enrollment
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course.code}</p>
                              <p className="text-sm text-muted-foreground">{course.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell className="text-sm">{course.schedule}</TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'confirmed' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => dropCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Drop
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cart">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shopping Cart</CardTitle>
                    <CardDescription>
                      Review and confirm your course selections
                    </CardDescription>
                  </div>
                  {shoppingCart.length > 0 && (
                    <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enroll in {shoppingCart.length} Course{shoppingCart.length > 1 ? 's' : ''}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Enrollment</DialogTitle>
                          <DialogDescription>
                            You are about to enroll in the following courses:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          {shoppingCart.map((course) => (
                            <div key={course.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{course.code}: {course.name}</p>
                                <p className="text-sm text-muted-foreground">{course.credits} credits</p>
                              </div>
                              <Badge variant={course.status === 'waitlist' ? 'secondary' : 'default'}>
                                {course.status === 'waitlist' ? 'Waitlist' : 'Available'}
                              </Badge>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex items-center justify-between font-semibold">
                            <span>Total Credits:</span>
                            <span>{cartCredits}</span>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={enrollInCourses} disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Enrollment'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {shoppingCart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Add courses from the Browse tab to get started
                    </p>
                    <Button variant="outline" onClick={() => document.querySelector('[value="browse"]')?.click()}>
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shoppingCart.map((course) => (
                      <div key={course.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="font-medium">
                              {course.code}: {course.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {course.instructor} • {course.schedule}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{course.credits} credits</Badge>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {course.location}
                            </span>
                            <Badge variant={course.status === 'waitlist' ? 'secondary' : 'default'}>
                              {course.status === 'waitlist' ? 'Join Waitlist' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToCart(course)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {totalCredits + cartCredits > maxCredits && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Total credits ({totalCredits + cartCredits}) exceeds maximum allowed ({maxCredits})
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}