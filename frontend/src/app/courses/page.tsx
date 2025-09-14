"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  Search, 
  Filter, 
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Clock,
  Users
} from "lucide-react"
import UniversityAPI, { Course, ApiResponse } from "@/lib/university-api"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)

  useEffect(() => {
    loadCourses()
  }, [currentPage, programFilter, searchTerm])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        per_page: 20
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (programFilter && programFilter !== 'all') {
        params.program_id = programFilter
      }

      const response = await UniversityAPI.getCourses(params)

      setCourses(response.data)
      setTotalPages(response.meta?.last_page || 1)
      setTotalCourses(response.meta?.total || 0)
      
    } catch (err) {
      console.error('Failed to load courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Course Catalog
          </h1>
          <p className="text-muted-foreground">
            Browse all courses offered by the university
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by code, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="1">Computer Science</SelectItem>
                <SelectItem value="2">Mathematics</SelectItem>
                <SelectItem value="3">Physics</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadCourses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({totalCourses})</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || programFilter !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'No courses available in the catalog'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Sections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{course.course_code}</div>
                          <div className="text-sm font-medium">{course.title}</div>
                          {course.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {course.program?.department?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {course.credits} credits
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.is_core ? "default" : "outline"}>
                          {course.is_core ? 'Core' : 'Elective'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {course.sections?.length || 0} sections
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCourses)} of {totalCourses} courses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Old mock data to be removed:
const oldMockCourses: any[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science including programming basics, algorithms, and problem-solving techniques.",
    credits: 3,
    level: "undergraduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 1,
        course_id: 1,
        section_number: "001",
        term_id: 1,
        instructor_id: 1,
        max_enrollment: 30,
        current_enrollment: 28,
        status: "open",
        schedule: "MWF 9:00-10:00",
        room_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        course_id: 1,
        section_number: "002",
        term_id: 1,
        instructor_id: 2,
        max_enrollment: 30,
        current_enrollment: 30,
        status: "closed",
        schedule: "TTh 2:00-3:30",
        room_id: 2,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 2,
    code: "CS201",
    name: "Data Structures and Algorithms",
    description: "Comprehensive study of data structures and algorithms including arrays, linked lists, trees, graphs, and sorting algorithms.",
    credits: 4,
    level: "undergraduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science"
      }
    ],
    course_sections: [
      {
        id: 3,
        course_id: 2,
        section_number: "001",
        term_id: 1,
        instructor_id: 1,
        max_enrollment: 25,
        current_enrollment: 22,
        status: "open",
        schedule: "MWF 11:00-12:00",
        room_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 3,
    code: "MATH101",
    name: "Calculus I",
    description: "Differential and integral calculus of functions of one variable.",
    credits: 4,
    level: "undergraduate",
    department_id: 2,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 4,
        course_id: 3,
        section_number: "001",
        term_id: 1,
        instructor_id: 3,
        max_enrollment: 35,
        current_enrollment: 32,
        status: "open",
        schedule: "MWF 8:00-9:00",
        room_id: 3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 5,
        course_id: 3,
        section_number: "002",
        term_id: 1,
        instructor_id: 4,
        max_enrollment: 35,
        current_enrollment: 30,
        status: "open",
        schedule: "TTh 10:00-11:30",
        room_id: 4,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 4,
    code: "CS501",
    name: "Advanced Machine Learning",
    description: "Advanced topics in machine learning including deep learning, neural networks, and AI applications.",
    credits: 3,
    level: "graduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 2,
        code: "CS201",
        name: "Data Structures and Algorithms"
      },
      {
        id: 5,
        code: "CS301",
        name: "Statistics and Probability"
      }
    ],
    course_sections: [
      {
        id: 6,
        course_id: 4,
        section_number: "001",
        term_id: 1,
        instructor_id: 5,
        max_enrollment: 15,
        current_enrollment: 12,
        status: "open",
        schedule: "MW 3:00-4:30",
        room_id: 5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 5,
    code: "ENG101",
    name: "English Composition",
    description: "Introduction to academic writing and critical thinking skills.",
    credits: 3,
    level: "undergraduate",
    department_id: 3,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 3,
      name: "English Literature",
      code: "ENG",
      faculty_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 7,
        course_id: 5,
        section_number: "001",
        term_id: 1,
        instructor_id: 6,
        max_enrollment: 20,
        current_enrollment: 18,
        status: "open",
        schedule: "TTh 1:00-2:30",
        room_id: 6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 6,
    code: "PHYS201",
    name: "Classical Mechanics",
    description: "Principles of classical mechanics including kinematics, dynamics, and conservation laws.",
    credits: 4,
    level: "undergraduate",
    department_id: 4,
    is_active: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 4,
      name: "Physics",
      code: "PHYS",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 3,
        code: "MATH101",
        name: "Calculus I"
      }
    ],
    course_sections: []
  }
]

const mockTableData: TableData<Course> = {
  data: mockCourses,
  total: 6,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Courses" }
]

export default function CoursesPage() {
  const handleCourseSelect = (course: Course) => {
    console.log("Selected course:", course.code)
  }

  const handleCourseView = (course: Course) => {
    console.log("View course:", course.code)
  }

  const handleCourseEdit = (course: Course) => {
    console.log("Edit course:", course.code)
  }

  const handleCourseDelete = (course: Course) => {
    console.log("Delete course:", course.code)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <CoursesTable
          data={mockTableData}
          loading={false}
          onCourseSelect={handleCourseSelect}
          onCourseView={handleCourseView}
          onCourseEdit={handleCourseEdit}
          onCourseDelete={handleCourseDelete}
        />
      </div>
    </AppShell>
  )
}