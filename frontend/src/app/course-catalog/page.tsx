"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, Users, MapPin, User, BookOpen, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import UniversityAPI, { CourseSection, Enrollment } from "@/lib/university-api"


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Course Catalog" }
]


function getEnrollmentStatus(section: CourseSection, currentEnrollments: number[]) {
  // Check if already enrolled
  if (currentEnrollments.includes(section.id)) {
    return { status: "enrolled", message: "You are enrolled in this section" }
  }

  // Check prerequisites (simplified for now - would need real academic record check)
  const prerequisites = section.course.prerequisites?.split(',').map(p => p.trim()) || []
  const missingPrereqs = prerequisites.filter(
    (prereq: string) => prereq && !['MATH101'].includes(prereq) // Mock completed courses
  )
  
  if (missingPrereqs.length > 0) {
    return { 
      status: "blocked", 
      message: `Missing prerequisites: ${missingPrereqs.join(", ")}` 
    }
  }

  // Check capacity - use enrollments count
  const currentEnrollmentCount = section.enrollments?.length || 0
  if (currentEnrollmentCount >= section.capacity) {
    return { 
      status: "waitlist", 
      message: `Section full. Join waitlist` 
    }
  }

  return { status: "available", message: "Available for enrollment" }
}

function getStatusBadge(section: CourseSection, currentEnrollments: number[]) {
  const enrollmentStatus = getEnrollmentStatus(section, currentEnrollments)
  
  const variants = {
    enrolled: { variant: "default", icon: CheckCircle, text: "Enrolled" },
    blocked: { variant: "destructive", icon: XCircle, text: "Prerequisites Required" },
    waitlist: { variant: "secondary", icon: Clock, text: "Join Waitlist" },
    available: { variant: "outline", icon: Users, text: "Available" }
  } as const

  const config = variants[enrollmentStatus.status as keyof typeof variants]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  )
}

function EnrollmentDialog({ section, onEnroll, currentEnrollments }: { 
  section: CourseSection, 
  onEnroll: (sectionId: number, action: string) => Promise<void>,
  currentEnrollments: number[]
}) {
  const enrollmentStatus = getEnrollmentStatus(section, currentEnrollments)
  const [isLoading, setIsLoading] = useState(false)

  const handleEnrollment = async (action: "enroll" | "waitlist" | "drop") => {
    setIsLoading(true)
    try {
      await onEnroll(section.id, action)
    } catch (error) {
      console.error('Enrollment action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {enrollmentStatus.status === "enrolled" ? "Manage" : "Enroll"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {section.course.course_code} - {section.course.title}
          </DialogTitle>
          <DialogDescription>
            Section {section.section_number} • {section.course.credits} credits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Instructor:</strong> {section.instructor}
            </div>
            <div>
              <strong>Schedule:</strong> {section.schedule}
            </div>
            <div>
              <strong>Location:</strong> {section.room || 'TBD'}
            </div>
            <div>
              <strong>Enrollment:</strong> {section.enrollments?.length || 0}/{section.capacity}
            </div>
          </div>

          <div>
            <strong>Course Description:</strong>
            <p className="text-sm text-muted-foreground mt-1">{section.course.description}</p>
          </div>

          {section.course.prerequisites && (
            <div>
              <strong>Prerequisites:</strong>
              <div className="flex gap-1 mt-1">
                {section.course.prerequisites.split(',').map((prereq: string, index: number) => (
                  prereq.trim() && (
                    <Badge key={index} variant="outline" className="text-xs">
                      {prereq.trim()}
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {enrollmentStatus.message}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            {enrollmentStatus.status === "enrolled" ? (
              <Button 
                variant="destructive" 
                onClick={() => handleEnrollment("drop")}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Drop Course"}
              </Button>
            ) : enrollmentStatus.status === "available" ? (
              <Button 
                onClick={() => handleEnrollment("enroll")}
                disabled={isLoading}
              >
                {isLoading ? "Enrolling..." : "Enroll Now"}
              </Button>
            ) : enrollmentStatus.status === "waitlist" ? (
              <Button 
                variant="secondary"
                onClick={() => handleEnrollment("waitlist")}
                disabled={isLoading}
              >
                {isLoading ? "Joining..." : "Join Waitlist"}
              </Button>
            ) : (
              <Button disabled>
                Prerequisites Required
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CourseCatalogPage() {
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [enrollmentMessage, setEnrollmentMessage] = useState<{type: "success" | "error", message: string} | null>(null)
  const [studentEnrollments, setStudentEnrollments] = useState<number[]>([])

  // Load course sections from real API
  useEffect(() => {
    loadCourseSections()
    loadStudentData()
  }, [])

  const loadCourseSections = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use demo endpoint for now since authentication isn't set up
      const response = await fetch('http://localhost/api/demo/courses')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform demo data to match expected CourseSection format
      const transformedSections = data.data.flatMap((course: any) => 
        course.sections.map((section: any) => ({
          id: section.id,
          section_number: section.section_number,
          capacity: section.capacity,
          enrolled: section.enrolled,
          waitlisted: section.waitlisted,
          instructor: section.instructor,
          schedule: section.schedule,
          room: section.room,
          course: {
            id: course.id,
            course_code: course.course_code,
            title: course.title,
            description: course.description,
            credits: course.credits,
            department: course.department
          },
          enrollments: [] // Mock empty enrollments array
        }))
      )

      setCourseSections(transformedSections)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course sections')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentData = async () => {
    try {
      // Mock some student enrollment data for demo
      setStudentEnrollments([1]) // Pretend student is enrolled in section 1
    } catch (err) {
      console.warn('Failed to load student enrollment data:', err)
    }
  }

  // Reload when filters change
  useEffect(() => {
    if (!loading) {
      loadCourseSections()
    }
  }, [searchQuery, selectedDepartment, selectedLevel])

  const departments = [...new Set(courseSections.map(s => s.course.program?.department?.abbreviation || 'UNKNOWN'))]
  
  // Apply client-side filtering
  const filteredSections = courseSections.filter(section => {
    const matchesSearch = !searchQuery || 
      section.course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || 
      section.course.program?.department?.abbreviation === selectedDepartment
    
    const matchesLevel = selectedLevel === 'all' || 
      (section.course.course_code.match(/\d/)?.[0] ? 
        (parseInt(section.course.course_code.match(/\d/)[0]) >= 5 ? 'graduate' : 'undergraduate') === selectedLevel :
        true)
    
    return matchesSearch && matchesDepartment && matchesLevel
  })

  const handleEnrollment = async (sectionId: number, action: string) => {
    const section = courseSections.find(s => s.id === sectionId)
    if (!section) return

    try {
      // Enhanced enrollment logic with capacity checking
      if (action === "enroll" || action === "waitlist") {
        const availableSpots = section.capacity - section.enrolled

        if (availableSpots > 0 && action === "enroll") {
          setEnrollmentMessage({
            type: "success",
            message: `Successfully enrolled in ${section.course.course_code}! Confirmation email sent.`
          })
          // Update section capacity locally
          setCourseSections(prev =>
            prev.map(s =>
              s.id === sectionId
                ? { ...s, enrolled: s.enrolled + 1 }
                : s
            )
          )
        } else {
          setEnrollmentMessage({
            type: "success",
            message: `Added to waitlist for ${section.course.course_code}. You're position #${section.waitlisted + 1}.`
          })
          // Update waitlist count locally
          setCourseSections(prev =>
            prev.map(s =>
              s.id === sectionId
                ? { ...s, waitlisted: s.waitlisted + 1 }
                : s
            )
          )
        }

        // Update local state
        setStudentEnrollments(prev => [...prev, sectionId])
      } else if (action === "drop") {
        setEnrollmentMessage({
          type: "success",
          message: `Successfully dropped from ${section.course.course_code}. Refund will be processed within 3-5 business days.`
        })
        // Update section capacity locally
        setCourseSections(prev =>
          prev.map(s =>
            s.id === sectionId
              ? { ...s, enrolled: Math.max(0, s.enrolled - 1) }
              : s
          )
        )
        // Update local state
        setStudentEnrollments(prev => prev.filter(id => id !== sectionId))
      }

      // Simulate API delay for realism
      await new Promise(resolve => setTimeout(resolve, 800))

    } catch (error) {
      setEnrollmentMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred. Please try again."
      })
    }

    // Clear message after 5 seconds
    setTimeout(() => setEnrollmentMessage(null), 5000)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
            <p className="text-muted-foreground">
              Browse and enroll in courses for Fall 2024
            </p>
          </div>
        </div>

        {enrollmentMessage && (
          <Alert className={enrollmentMessage.type === "success" ? "border-green-500" : "border-red-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{enrollmentMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Sections */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Courses</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadCourseSections} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredSections.map((section) => {
              const enrollmentStatus = getEnrollmentStatus(section, studentEnrollments)
              
              return (
                <Card key={`${section.course.id}-${section.id}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {section.course.course_code} - {section.course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Section {section.section_number} • {section.course.credits} credits • {section.course.program?.department?.name || 'Unknown Dept'}
                        </p>
                      </div>
                      {getStatusBadge(section, studentEnrollments)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm">{section.course.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{section.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{section.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{section.room || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {section.enrollments?.length || 0}/{section.capacity}
                        </span>
                      </div>
                    </div>

                    {section.course.prerequisites && (
                      <div>
                        <span className="text-sm font-medium">Prerequisites: </span>
                        <div className="flex gap-1 mt-1">
                          {section.course.prerequisites.split(',').map((prereq, index) => (
                            prereq.trim() && (
                              <Badge key={index} variant="outline" className="text-xs">
                                {prereq.trim()}
                              </Badge>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <EnrollmentDialog section={section} onEnroll={handleEnrollment} currentEnrollments={studentEnrollments} />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}