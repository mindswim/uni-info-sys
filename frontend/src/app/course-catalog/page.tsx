"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, Users, MapPin, User, BookOpen, AlertCircle, CheckCircle, XCircle } from "lucide-react"

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

// Mock course sections with enrollment data
const courseSections = [
  {
    id: 1,
    course: {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      credits: 3,
      level: "undergraduate",
      description: "Basic programming concepts using Python. Learn variables, control structures, functions, and object-oriented programming fundamentals.",
      prerequisites: [],
      department: { name: "Computer Science", code: "CS" }
    },
    section_number: "001",
    term: { name: "Fall 2024", code: "F2024" },
    instructor: { name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { room_number: "ENG101", building: { name: "Engineering Complex" } },
    schedule: "MWF 09:00-10:00",
    max_enrollment: 30,
    current_enrollment: 25,
    waitlist_count: 0,
    status: "open",
    enrollment_status: null // null = not enrolled, "enrolled", "waitlisted", "blocked"
  },
  {
    id: 2,
    course: {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      credits: 3,
      level: "undergraduate", 
      description: "Basic programming concepts using Python. Learn variables, control structures, functions, and object-oriented programming fundamentals.",
      prerequisites: [],
      department: { name: "Computer Science", code: "CS" }
    },
    section_number: "002",
    term: { name: "Fall 2024", code: "F2024" },
    instructor: { name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { room_number: "ENG205", building: { name: "Engineering Complex" } },
    schedule: "TT 14:00-15:30",
    max_enrollment: 30,
    current_enrollment: 30,
    waitlist_count: 5,
    status: "full",
    enrollment_status: null
  },
  {
    id: 3,
    course: {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      credits: 3,
      level: "undergraduate",
      description: "Advanced data structures including linked lists, stacks, queues, trees, and hash tables. Algorithm analysis and implementation in Java.",
      prerequisites: ["CS101"],
      department: { name: "Computer Science", code: "CS" }
    },
    section_number: "001",
    term: { name: "Fall 2024", code: "F2024" },
    instructor: { name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { room_number: "SCI301", building: { name: "Science Center" } },
    schedule: "MWF 11:00-12:00",
    max_enrollment: 25,
    current_enrollment: 18,
    waitlist_count: 0,
    status: "open",
    enrollment_status: "blocked" // Student hasn't taken CS101 yet
  },
  {
    id: 4,
    course: {
      id: 3,
      code: "MATH101",
      name: "Calculus I",
      credits: 4,
      level: "undergraduate",
      description: "Differential calculus including limits, derivatives, and applications. Introduction to integral calculus.",
      prerequisites: [],
      department: { name: "Mathematics", code: "MATH" }
    },
    section_number: "001",
    term: { name: "Fall 2024", code: "F2024" },
    instructor: { name: "Prof. John Davis", email: "john.davis@demo.com" },
    room: { room_number: "SCI201", building: { name: "Science Center" } },
    schedule: "MTWTF 10:00-11:00",
    max_enrollment: 35,
    current_enrollment: 32,
    waitlist_count: 2,
    status: "open",
    enrollment_status: "enrolled"
  }
]

// Mock student's current enrollments to check prerequisites
const studentCompletedCourses = ["MATH101"] // Maria has completed Calculus I
const studentCurrentEnrollments = [4] // Currently enrolled in section 4 (MATH101)

function getEnrollmentStatus(section: any) {
  // Check if already enrolled
  if (studentCurrentEnrollments.includes(section.id)) {
    return { status: "enrolled", message: "You are enrolled in this section" }
  }

  // Check prerequisites
  const missingPrereqs = section.course.prerequisites.filter(
    (prereq: string) => !studentCompletedCourses.includes(prereq)
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

function getStatusBadge(section: any) {
  const enrollmentStatus = getEnrollmentStatus(section)
  
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

function EnrollmentDialog({ section, onEnroll }: { section: any, onEnroll: (sectionId: number, action: string) => void }) {
  const enrollmentStatus = getEnrollmentStatus(section)
  const [isLoading, setIsLoading] = useState(false)

  const handleEnrollment = async (action: "enroll" | "waitlist" | "drop") => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    onEnroll(section.id, action)
    setIsLoading(false)
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [enrollmentMessage, setEnrollmentMessage] = useState<{type: "success" | "error", message: string} | null>(null)

  const departments = [...new Set(courseSections.map(s => s.course.department.code))]
  
  const filteredSections = courseSections.filter(section => {
    const matchesSearch = searchQuery === "" || 
      section.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.course.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || 
      section.course.department.code === selectedDepartment
    
    const matchesLevel = selectedLevel === "all" || 
      section.course.level === selectedLevel

    return matchesSearch && matchesDepartment && matchesLevel
  })

  const handleEnrollment = (sectionId: number, action: string) => {
    const section = courseSections.find(s => s.id === sectionId)
    if (!section) return

    if (action === "enroll") {
      setEnrollmentMessage({
        type: "success",
        message: `Successfully enrolled in ${section.course.code} - Section ${section.section_number}`
      })
      // Update enrollment status in real app
      section.current_enrollment += 1
      studentCurrentEnrollments.push(sectionId)
    } else if (action === "waitlist") {
      setEnrollmentMessage({
        type: "success", 
        message: `Added to waitlist for ${section.course.code} - Section ${section.section_number}`
      })
      section.waitlist_count += 1
    } else if (action === "drop") {
      setEnrollmentMessage({
        type: "success",
        message: `Dropped from ${section.course.code} - Section ${section.section_number}`
      })
      section.current_enrollment -= 1
      const index = studentCurrentEnrollments.indexOf(sectionId)
      if (index > -1) studentCurrentEnrollments.splice(index, 1)
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
          {filteredSections.map((section) => {
            const enrollmentStatus = getEnrollmentStatus(section)
            
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
                    {getStatusBadge(section)}
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
                    <EnrollmentDialog section={section} onEnroll={handleEnrollment} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}