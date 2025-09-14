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
import { CourseAPI } from "@/lib/real-api"
import type { CourseSection } from "@/lib/mock-api"

const mockUser = {
  name: "Maria Rodriguez",
  email: "maria@demo.com", 
  role: "Student",
  avatar: "/avatars/student.jpg"
}

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
  const missingPrereqs = section.course.prerequisites.filter(
    (prereq: string) => !['MATH101'].includes(prereq) // Mock completed courses
  )
  
  if (missingPrereqs.length > 0) {
    return { 
      status: "blocked", 
      message: `Missing prerequisites: ${missingPrereqs.join(", ")}` 
    }
  }

  // Check capacity
  if (section.current_enrollment >= section.max_enrollment) {
    return { 
      status: "waitlist", 
      message: `Section full. Join waitlist (${section.waitlist_count} students waiting)` 
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
            {section.course.code} - {section.course.name}
          </DialogTitle>
          <DialogDescription>
            Section {section.section_number} • {section.course.credits} credits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Instructor:</strong> {section.instructor.name}
            </div>
            <div>
              <strong>Schedule:</strong> {section.schedule}
            </div>
            <div>
              <strong>Location:</strong> {section.room.building.name} {section.room.room_number}
            </div>
            <div>
              <strong>Enrollment:</strong> {section.current_enrollment}/{section.max_enrollment}
              {section.waitlist_count > 0 && ` (${section.waitlist_count} waitlisted)`}
            </div>
          </div>

          <div>
            <strong>Course Description:</strong>
            <p className="text-sm text-muted-foreground mt-1">{section.course.description}</p>
          </div>

          {section.course.prerequisites.length > 0 && (
            <div>
              <strong>Prerequisites:</strong>
              <div className="flex gap-1 mt-1">
                {section.course.prerequisites.map((prereq: string) => (
                  <Badge key={prereq} variant="outline" className="text-xs">
                    {prereq}
                  </Badge>
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
      const response = await CourseAPI.getCourseSections({
        search: searchQuery,
        department: selectedDepartment !== "all" ? selectedDepartment : undefined,
        level: selectedLevel !== "all" ? selectedLevel : undefined
      })
      setCourseSections(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course sections')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentData = async () => {
    try {
      const enrollmentData = await CourseAPI.getStudentEnrollments(1) // Maria's ID
      setStudentEnrollments(enrollmentData.enrollments)
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

  const departments = [...new Set(courseSections.map(s => s.course.department.code))]
  const filteredSections = courseSections

  const handleEnrollment = async (sectionId: number, action: string) => {
    const section = courseSections.find(s => s.id === sectionId)
    if (!section) return

    try {
      let result
      if (action === "enroll") {
        result = await CourseAPI.enrollInSection(sectionId)
        setEnrollmentMessage({
          type: "success",
          message: result.message
        })
        // Update local state
        setStudentEnrollments(prev => [...prev, sectionId])
      } else if (action === "waitlist") {
        result = await CourseAPI.joinWaitlist(sectionId)
        setEnrollmentMessage({
          type: "success", 
          message: result.message
        })
      } else if (action === "drop") {
        result = await CourseAPI.dropFromSection(sectionId)
        setEnrollmentMessage({
          type: "success",
          message: result.message
        })
        // Update local state
        setStudentEnrollments(prev => prev.filter(id => id !== sectionId))
      }

      // Reload course sections to get updated capacity/waitlist counts
      await loadCourseSections()

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
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
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
                          {section.course.code} - {section.course.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Section {section.section_number} • {section.course.credits} credits • {section.course.department.name}
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
                        <span>{section.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{section.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{section.room.building.name} {section.room.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {section.current_enrollment}/{section.max_enrollment}
                          {section.waitlist_count > 0 && ` (+${section.waitlist_count} waitlisted)`}
                        </span>
                      </div>
                    </div>

                    {section.course.prerequisites.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Prerequisites: </span>
                        <div className="flex gap-1 mt-1">
                          {section.course.prerequisites.map((prereq) => (
                            <Badge key={prereq} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
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