"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRegistrationStore, Course } from '@/stores/registration-store'
import {
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  Check,
  ShoppingCart
} from 'lucide-react'

// Mock course data
const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS301',
    name: 'Data Structures and Algorithms',
    credits: 4,
    instructor: 'Dr. Sarah Johnson',
    schedule: {
      days: ['Mon', 'Wed', 'Fri'],
      startTime: '10:00',
      endTime: '11:15'
    },
    enrollment: { current: 45, max: 60 },
    prerequisites: ['CS101', 'CS102'],
    description: 'Advanced study of data structures and algorithmic techniques',
    section: '001',
    location: 'Engineering Hall 203'
  },
  {
    id: '2',
    code: 'MATH201',
    name: 'Calculus II',
    credits: 4,
    instructor: 'Prof. Michael Chen',
    schedule: {
      days: ['Tue', 'Thu'],
      startTime: '14:00',
      endTime: '15:30'
    },
    enrollment: { current: 30, max: 40 },
    prerequisites: ['MATH101'],
    description: 'Techniques of integration, applications of integrals, infinite series',
    section: '002',
    location: 'Math Building 105'
  },
  {
    id: '3',
    code: 'ENG201',
    name: 'Creative Writing',
    credits: 3,
    instructor: 'Dr. Emily Williams',
    schedule: {
      days: ['Mon', 'Wed'],
      startTime: '13:00',
      endTime: '14:15'
    },
    enrollment: { current: 18, max: 20 },
    prerequisites: ['ENG101'],
    description: 'Workshop in creative writing with emphasis on fiction and poetry',
    section: '001',
    location: 'Liberal Arts 301'
  },
  {
    id: '4',
    code: 'BIO101',
    name: 'Introduction to Biology',
    credits: 4,
    instructor: 'Dr. Robert Martinez',
    schedule: {
      days: ['Mon', 'Wed', 'Fri'],
      startTime: '09:00',
      endTime: '10:15'
    },
    enrollment: { current: 55, max: 80 },
    prerequisites: [],
    description: 'Fundamental concepts in biological sciences',
    section: '003',
    location: 'Science Center 120'
  },
  {
    id: '5',
    code: 'HIST202',
    name: 'Modern World History',
    credits: 3,
    instructor: 'Prof. Lisa Anderson',
    schedule: {
      days: ['Tue', 'Thu'],
      startTime: '10:30',
      endTime: '11:45'
    },
    enrollment: { current: 35, max: 50 },
    prerequisites: ['HIST101'],
    description: 'Global history from 1500 to present',
    section: '001',
    location: 'Humanities 210'
  }
]

const departments = ['All', 'Computer Science', 'Mathematics', 'English', 'Biology', 'History']
const creditOptions = ['All', '1', '2', '3', '4', '5+']

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedCredits, setSelectedCredits] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const { shoppingCart, addToCart, checkPrerequisites } = useRegistrationStore()

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === 'All' ||
      course.code.startsWith(selectedDepartment.substring(0, 2).toUpperCase())

    const matchesCredits = selectedCredits === 'All' ||
      (selectedCredits === '5+' ? course.credits >= 5 : course.credits === parseInt(selectedCredits))

    return matchesSearch && matchesDepartment && matchesCredits
  })

  const handleAddToCart = (course: Course) => {
    const meetsPrereqs = checkPrerequisites(course)
    if (meetsPrereqs || course.prerequisites.length === 0) {
      addToCart(course)
    } else {
      alert(`You don't meet the prerequisites for ${course.code}`)
    }
  }

  const isInCart = (courseId: string) => {
    return shoppingCart.some(course => course.id === courseId)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex gap-2 p-4 bg-muted rounded-lg">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCredits} onValueChange={setSelectedCredits}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Credits" />
              </SelectTrigger>
              <SelectContent>
                {creditOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option === 'All' ? 'All Credits' : `${option} Credit${option === '1' ? '' : 's'}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Course Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredCourses.map((course) => {
          const inCart = isInCart(course.id)
          const isFull = course.enrollment.current >= course.enrollment.max

          return (
            <Card key={course.id} className={inCart ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {course.code} - {course.name}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  <Badge variant={course.credits >= 4 ? 'default' : 'secondary'}>
                    {course.credits} credits
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Instructor */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{course.instructor}</span>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {course.schedule.days.join(', ')} {course.schedule.startTime} - {course.schedule.endTime}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{course.location}</span>
                </div>

                {/* Enrollment */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className={isFull ? 'text-destructive' : ''}>
                    {course.enrollment.current} / {course.enrollment.max} enrolled
                  </span>
                  {isFull && <Badge variant="destructive">Full</Badge>}
                </div>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Prerequisites: </span>
                      {course.prerequisites.join(', ')}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={inCart ? 'secondary' : 'default'}
                  disabled={isFull && !inCart}
                  onClick={() => handleAddToCart(course)}
                >
                  {inCart ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cart Summary */}
      {shoppingCart.length > 0 && (
        <div className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">{shoppingCart.length} courses in cart</span>
            <Badge>
              {shoppingCart.reduce((sum, c) => sum + c.credits, 0)} credits
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}