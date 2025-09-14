"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  User, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import UniversityAPI, { Student, AdmissionApplication, Enrollment } from "@/lib/university-api"

const demoPersonas = [
  {
    id: 1,
    name: "Maria Rodriguez",
    email: "maria@demo.com",
    role: "Prospective Student",
    avatar: "/avatars/maria.jpg",
    background: "High school graduate from Mexico, applying for Computer Science program",
    status: "Application Submitted",
    stage: "admission"
  },
  {
    id: 2,
    name: "David Park",
    email: "david@demo.com", 
    role: "Current Student",
    avatar: "/avatars/david.jpg",
    background: "Second-year Computer Science student from South Korea",
    status: "Enrolled - 2nd Year",
    stage: "enrolled"
  },
  {
    id: 3,
    name: "Sophie Turner",
    email: "sophie@demo.com",
    role: "Waitlisted Student", 
    avatar: "/avatars/sophie.jpg",
    background: "Transfer student from California, waitlisted for popular courses",
    status: "Waitlisted",
    stage: "waitlisted"
  }
]

const journeyStages = [
  {
    id: "application",
    title: "Application",
    description: "Submit admission application with required documents",
    icon: FileText,
    color: "blue"
  },
  {
    id: "review",
    title: "Review Process",
    description: "Application under review by admissions committee",
    icon: Clock,
    color: "yellow"
  },
  {
    id: "acceptance",
    title: "Acceptance",
    description: "Application approved, enrollment invitation sent",
    icon: CheckCircle,
    color: "green"
  },
  {
    id: "enrollment",
    title: "Course Enrollment",
    description: "Register for courses and build academic schedule",
    icon: BookOpen,
    color: "purple"
  },
  {
    id: "academic",
    title: "Academic Progress",
    description: "Track grades, prerequisites, and graduation requirements",
    icon: GraduationCap,
    color: "indigo"
  }
]


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Interactive Demo" }
]

export default function DemoPage() {
  const [selectedPersona, setSelectedPersona] = useState(demoPersonas[0])
  const [currentStage, setCurrentStage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)

  // Auto-advance demo stages
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStage < journeyStages.length - 1) {
      interval = setInterval(() => {
        setCurrentStage(prev => prev + 1)
      }, 4000)
    } else if (currentStage >= journeyStages.length - 1) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStage])

  // Load student data when persona changes
  useEffect(() => {
    loadPersonaData(selectedPersona.id)
  }, [selectedPersona])

  const loadPersonaData = async (studentId: number) => {
    try {
      setLoading(true)
      
      // Load student data
      const student = await UniversityAPI.getStudent(studentId)
      setStudentData(student)
      
      // Load applications
      const appResponse = await UniversityAPI.getAdmissionApplications({
        student_id: studentId
      })
      setApplications(appResponse.data)
      
      // Load enrollments  
      const enrollResponse = await UniversityAPI.getEnrollments({
        student_id: studentId
      })
      setEnrollments(enrollResponse.data)
      
    } catch (error) {
      console.error('Failed to load persona data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetDemo = () => {
    setCurrentStage(0)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const getStageColor = (index: number) => {
    if (index < currentStage) return "bg-green-500"
    if (index === currentStage) return "bg-blue-500"
    return "bg-gray-200"
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interactive Student Journey Demo</h1>
            <p className="text-muted-foreground">
              Experience the complete student lifecycle from application to graduation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetDemo}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={togglePlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"} Demo
            </Button>
          </div>
        </div>

        {/* Persona Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Demo Persona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoPersonas.map((persona) => (
                <Card 
                  key={persona.id}
                  className={`cursor-pointer transition-all ${
                    selectedPersona.id === persona.id 
                      ? "ring-2 ring-blue-500 bg-blue-50" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPersona(persona)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {persona.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">{persona.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{persona.background}</p>
                    <Badge variant="outline" className="text-xs">
                      {persona.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journey Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Student Journey Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(currentStage / (journeyStages.length - 1)) * 100} className="w-full" />
              
              <div className="flex items-center justify-between">
                {journeyStages.map((stage, index) => {
                  const Icon = stage.icon
                  const isActive = index === currentStage
                  const isCompleted = index < currentStage
                  
                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? 'bg-green-500 text-white' : 
                          isActive ? 'bg-blue-500 text-white' : 
                          'bg-gray-200 text-gray-500'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                          {stage.title}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-24">
                          {stage.description}
                        </p>
                      </div>
                      {index < journeyStages.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400 absolute translate-x-12" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : studentData ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{studentData.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Student Number</p>
                    <p className="text-sm text-muted-foreground">{studentData.student_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{studentData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enrollment Status</p>
                    <Badge variant={studentData.enrollment_status === 'active' ? 'default' : 'secondary'}>
                      {studentData.enrollment_status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No student data available</p>
              )}
            </CardContent>
          </Card>

          {/* Current Stage Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Current Stage: {journeyStages[currentStage]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStage === 0 && (
                <div className="space-y-3">
                  <p className="text-sm">Applications submitted: {applications.length}</p>
                  {applications.map(app => (
                    <div key={app.id} className="border rounded p-2">
                      <p className="text-sm font-medium">Application #{app.id}</p>
                      <p className="text-sm text-muted-foreground">Status: {app.status}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(app.application_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentStage === 4 && (
                <div className="space-y-3">
                  <p className="text-sm">Current enrollments: {enrollments.length}</p>
                  {enrollments.slice(0, 3).map(enrollment => (
                    <div key={enrollment.id} className="border rounded p-2">
                      <p className="text-sm font-medium">
                        {enrollment.course_section.course.course_code} - {enrollment.course_section.course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">Status: {enrollment.status}</p>
                      <p className="text-sm text-muted-foreground">
                        Section {enrollment.course_section.section_number} • {enrollment.course_section.course.credits} credits
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {(currentStage === 1 || currentStage === 2 || currentStage === 3) && (
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {currentStage === 1 && "Application is currently being reviewed by the admissions committee."}
                      {currentStage === 2 && "Congratulations! Your application has been accepted. Enrollment invitation sent."}
                      {currentStage === 3 && "Course enrollment period is now open. Students can register for courses."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span>View Applications</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admission Applications</DialogTitle>
                    <DialogDescription>
                      Review {selectedPersona.name}'s admission applications
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Application #{app.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Applied: {new Date(app.application_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            app.status === 'accepted' ? 'default' : 
                            app.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                        {app.comments && (
                          <p className="text-sm text-gray-600">{app.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span>Course Enrollments</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Current Enrollments</DialogTitle>
                    <DialogDescription>
                      {selectedPersona.name}'s course enrollments for current term
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {enrollments.map(enrollment => (
                      <div key={enrollment.id} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {enrollment.course_section.course.course_code} - {enrollment.course_section.course.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Section {enrollment.course_section.section_number} • {enrollment.course_section.course.credits} credits
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Instructor: {enrollment.course_section.instructor.user.name}
                            </p>
                          </div>
                          <Badge variant={
                            enrollment.status === 'enrolled' ? 'default' : 
                            enrollment.status === 'dropped' ? 'destructive' : 
                            'secondary'
                          }>
                            {enrollment.status}
                          </Badge>
                        </div>
                        {enrollment.grade && (
                          <p className="text-sm font-medium">Grade: {enrollment.grade}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                <span>Academic Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}