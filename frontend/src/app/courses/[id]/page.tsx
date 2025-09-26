'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  AlertCircle,
  GraduationCap,
  Building,
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  BookMarked,
  Target
} from 'lucide-react'
import { API_CONFIG, getAuthHeaders } from '@/config/api'

interface Course {
  id: number
  course_code: string
  course_number?: string
  title: string
  description: string
  credits: number
  level?: string
  prerequisites?: string
  department_id: number
  department?: {
    id: number
    name: string
    code: string
    faculty?: {
      id: number
      name: string
    }
  }
  created_at: string
  updated_at: string

  // Relationships
  course_sections?: CourseSection[]
  prerequisite_courses?: Course[]
}

interface CourseSection {
  id: number
  section_number: string
  term_id: number
  instructor_id: number
  room_id: number
  capacity: number
  enrolled_count?: number
  waitlist_count?: number
  status: string
  schedule_days: string[]
  start_time: string
  end_time: string

  term?: {
    id: number
    name: string
    academic_year: number
    semester: string
  }
  instructor?: {
    id: number
    job_title: string
    user?: {
      id: number
      name: string
      email: string
    }
  }
  room?: {
    id: number
    room_number: string
    type: string
    capacity: number
    building?: {
      id: number
      name: string
      code: string
    }
  }
  enrollments?: any[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState<number | null>(null)

  useEffect(() => {
    fetchCourseData()
  }, [params.id])

  const fetchCourseData = async () => {
    try {
      setLoading(true)

      // Try authenticated endpoint first, fall back to demo endpoint
      let response = await fetch(`${API_CONFIG.V1.COURSES}/${params.id}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        // Fall back to demo endpoint
        response = await fetch(`${API_CONFIG.HOST}/api/data-viewer/courses?limit=200`)

        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }

        const allCourses = await response.json()
        const courseData = allCourses.data?.find((c: any) => c.id === parseInt(params.id as string))

        if (!courseData) {
          throw new Error('Course not found')
        }

        setCourse(courseData)
      } else {
        const courseData = await response.json()
        setCourse(courseData.data || courseData)
      }

      // Fetch course sections - try authenticated first, then demo
      try {
        const sectionsResponse = await fetch(
          `${API_CONFIG.V1.COURSE_SECTIONS}?course_id=${params.id}`,
          { headers: getAuthHeaders() }
        )

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json()
          setSections(sectionsData.data || [])
        } else {
          // Fall back to demo endpoint
          const demoSectionsResponse = await fetch(`${API_CONFIG.HOST}/api/data-viewer/course_sections?limit=500`)
          if (demoSectionsResponse.ok) {
            const allSections = await demoSectionsResponse.json()
            const courseSections = allSections.data?.filter((s: any) => s.course_id === parseInt(params.id as string)) || []
            setSections(courseSections)
          }
        }
      } catch (err) {
        console.log('Could not fetch sections:', err)
        // Continue without sections
      }

    } catch (err) {
      console.error('Error fetching course:', err)
      setError(err instanceof Error ? err.message : 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (sectionId: number) => {
    try {
      setEnrolling(sectionId)

      const response = await fetch(API_CONFIG.V1.ENROLLMENTS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          course_section_id: sectionId,
          student_id: 1 // TODO: Get from current user context
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Refresh sections to show updated enrollment count
        fetchCourseData()
        alert(result.status === 'waitlisted' ?
          'You have been added to the waitlist' :
          'Successfully enrolled in the course!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to enroll')
      }
    } catch (err) {
      console.error('Enrollment error:', err)
      alert('Failed to enroll in course')
    } finally {
      setEnrolling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading course details...</div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Course</CardTitle>
            <CardDescription>{error || 'Course not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-500'
      case 'closed': return 'bg-red-500'
      case 'waitlist': return 'bg-yellow-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateSectionFillRate = (section: CourseSection) => {
    const enrolled = section.enrolled_count || 0
    return (enrolled / section.capacity) * 100
  }

  const getAvailableSeats = (section: CourseSection) => {
    const enrolled = section.enrolled_count || 0
    return Math.max(0, section.capacity - enrolled)
  }

  const formatScheduleDays = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    }
    return days.map(day => dayMap[day] || day.substring(0, 3)).join(', ')
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const currentSections = sections.filter(s => s.status === 'open')
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0)
  const totalEnrolled = sections.reduce((sum, s) => sum + (s.enrolled_count || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Download Syllabus
          </Button>
          <Button variant="outline">
            <BookMarked className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </div>
      </div>

      {/* Course Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {course.course_code}
                    </Badge>
                    <Badge variant="secondary">
                      {course.credits} Credits
                    </Badge>
                    {course.level && (
                      <Badge variant="outline">
                        {course.level}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-muted-foreground">
                    {course.department?.faculty?.name} • {course.department?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Enrollment</p>
                  <p className="text-2xl font-bold">{totalEnrolled}/{totalCapacity}</p>
                </div>
              </div>
            </div>

            {course.description && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>
            )}

            {course.prerequisites && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Prerequisites Required</AlertTitle>
                <AlertDescription>
                  {course.prerequisites}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{sections.length}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentSections.length}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{course.credits}</div>
                <div className="text-sm text-muted-foreground">Credit Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round((totalEnrolled / totalCapacity) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Full</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">
                          Section {section.section_number}
                        </CardTitle>
                        <Badge className={getStatusColor(section.status)}>
                          {section.status}
                        </Badge>
                        {section.waitlist_count && section.waitlist_count > 0 && (
                          <Badge variant="outline">
                            {section.waitlist_count} on waitlist
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Available Seats</p>
                        <p className="text-xl font-bold">
                          {getAvailableSeats(section)}/{section.capacity}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress
                      value={calculateSectionFillRate(section)}
                      className="h-2"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Instructor</p>
                          <p className="font-medium">{section.instructor?.user?.name || 'TBA'}</p>
                          <p className="text-xs text-muted-foreground">{section.instructor?.job_title}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Schedule</p>
                          <p className="font-medium">{formatScheduleDays(section.schedule_days)}</p>
                          <p className="text-sm">{formatTime(section.start_time)} - {formatTime(section.end_time)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {section.room?.building?.name || 'TBA'}
                          </p>
                          <p className="text-sm">Room {section.room?.room_number}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Term</p>
                          <p className="font-medium">{section.term?.name || 'Current'}</p>
                        </div>
                      </div>
                    </div>

                    {section.status === 'open' && (
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => handleEnroll(section.id)}
                          disabled={enrolling === section.id}
                        >
                          {enrolling === section.id ? 'Enrolling...' :
                            getAvailableSeats(section) > 0 ? 'Enroll in Section' : 'Join Waitlist'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No sections available for this course
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Course Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course Code</span>
                      <span className="font-medium">{course.course_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-medium">{course.credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level || 'Undergraduate'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{course.department?.name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {course.prerequisites ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Prerequisites</p>
                        <p className="text-sm">{course.prerequisites}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No prerequisites required</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Master fundamental concepts and theories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Apply knowledge to solve real-world problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Develop critical thinking and analytical skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Collaborate effectively in team environments</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Assessment Methods</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Midterm Exam</p>
                    <p className="text-sm text-muted-foreground">30% of grade</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Final Exam</p>
                    <p className="text-sm text-muted-foreground">35% of grade</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Assignments</p>
                    <p className="text-sm text-muted-foreground">25% of grade</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Participation</p>
                    <p className="text-sm text-muted-foreground">10% of grade</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Syllabus</CardTitle>
              <CardDescription>Complete course outline and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Course Description</h3>
                  <p className="text-sm leading-relaxed">{course.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Weekly Schedule</h3>
                  <div className="space-y-3">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="w-20 font-medium">Week {i + 1}</div>
                        <div className="flex-1">
                          <p className="font-medium">Topic {i + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            Module content and assignments for week {i + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Required Textbooks</h3>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Textbook Information</AlertTitle>
                    <AlertDescription>
                      Textbook information will be provided by the instructor at the beginning of the semester
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>Additional materials and support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Lecture Notes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Reading Materials
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Practice Problems
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Discussion Forum
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructor Information</CardTitle>
            </CardHeader>
            <CardContent>
              {sections[0]?.instructor ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/api/placeholder/100/100" />
                    <AvatarFallback>
                      {sections[0].instructor.user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{sections[0].instructor.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{sections[0].instructor.job_title}</p>
                    <p className="text-sm text-muted-foreground">{sections[0].instructor.user?.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Instructor information not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}