'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  Building,
  CreditCard,
  Users,
  ChevronLeft,
  FileText,
  DollarSign
} from 'lucide-react'
import { API_CONFIG, getAuthHeaders } from '@/config/api'

interface Student {
  id: number
  student_number: string
  user_id: number
  first_name: string
  last_name: string
  preferred_name?: string
  pronouns?: string
  email?: string
  phone: string
  date_of_birth: string
  gender: string
  nationality: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string

  // Academic Info
  gpa: number
  total_credits_earned: number
  credits_in_progress: number
  semester_gpa: number
  academic_status: string
  class_standing: string
  enrollment_status: string
  expected_graduation_date: string
  admission_date?: string
  major_program_id?: number
  minor_program_id?: number

  // Test Scores
  sat_score?: number
  act_score?: number
  high_school?: string
  high_school_graduation_year?: number

  // Contacts
  emergency_contact_name: string
  emergency_contact_phone: string
  parent_guardian_name?: string
  parent_guardian_phone?: string

  // Financial
  receives_financial_aid: boolean
  financial_hold: boolean

  // Relationships
  user?: any
  enrollments?: any[]
  academic_records?: any[]
  documents?: any[]
  admission_applications?: any[]
  major_program?: any
  minor_program?: any
}

interface Enrollment {
  id: number
  course_section_id: number
  status: string
  enrollment_date: string
  grade?: string
  course_section: {
    id: number
    section_number: string
    schedule_days: string[]
    start_time: string
    end_time: string
    course: {
      course_code: string
      title: string
      credits: number
      department: {
        name: string
      }
    }
    instructor: {
      user: {
        name: string
      }
    }
    room: {
      room_number: string
      building: {
        name: string
      }
    }
  }
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentData()
  }, [params.id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)

      // Try authenticated endpoint first, fall back to demo endpoint
      let response = await fetch(`${API_CONFIG.V1.STUDENTS}/${params.id}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        // Fall back to demo endpoint that doesn't require auth
        response = await fetch(`${API_CONFIG.HOST}/api/data-viewer/students?limit=200`)

        if (!response.ok) {
          throw new Error('Failed to fetch student data')
        }

        const allStudents = await response.json()
        const studentData = allStudents.data?.find((s: any) => s.id === parseInt(params.id as string))

        if (!studentData) {
          throw new Error('Student not found')
        }

        setStudent(studentData)
      } else {
        const studentData = await response.json()
        setStudent(studentData.data || studentData)
      }

      // Fetch enrollments - try authenticated first, then demo
      try {
        const enrollmentsResponse = await fetch(
          `${API_CONFIG.V1.STUDENTS}/${params.id}/enrollments`,
          { headers: getAuthHeaders() }
        )

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json()
          setEnrollments(enrollmentsData.data || [])
        } else {
          // Fall back to demo enrollments endpoint
          const demoEnrollmentsResponse = await fetch(`${API_CONFIG.HOST}/api/data-viewer/enrollments?limit=500`)
          if (demoEnrollmentsResponse.ok) {
            const allEnrollments = await demoEnrollmentsResponse.json()
            const studentEnrollments = allEnrollments.data?.filter((e: any) => e.student_id === parseInt(params.id as string)) || []
            setEnrollments(studentEnrollments)
          }
        }
      } catch (err) {
        console.log('Could not fetch enrollments:', err)
        // Continue without enrollments
      }

    } catch (err) {
      console.error('Error fetching student:', err)
      setError(err instanceof Error ? err.message : 'Failed to load student')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading student profile...</div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Student</CardTitle>
            <CardDescription>{error || 'Student not found'}</CardDescription>
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

  const calculateProgress = () => {
    const totalRequired = 120 // Standard bachelor's degree
    const earned = student.total_credits_earned || 0
    const inProgress = student.credits_in_progress || 0
    const total = earned + inProgress
    return Math.min((total / totalRequired) * 100, 100)
  }

  const getInitials = () => {
    return `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enrolled': return 'bg-green-500'
      case 'graduated': return 'bg-blue-500'
      case 'withdrawn': return 'bg-gray-500'
      case 'suspended': return 'bg-red-500'
      case 'probation': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getGradeColor = (grade?: string) => {
    if (!grade) return ''
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    if (grade === 'F') return 'text-red-600'
    return ''
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled')
  const completedEnrollments = enrollments.filter(e => e.grade)
  const currentCredits = activeEnrollments.reduce((sum, e) =>
    sum + (e.course_section?.course?.credits || 0), 0
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Transcript
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Student Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`/api/placeholder/150/150`} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {student.preferred_name || student.first_name} {student.last_name}
                  {student.pronouns && <span className="text-lg font-normal text-muted-foreground ml-2">({student.pronouns})</span>}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{student.student_number}</Badge>
                  <Badge className={getStatusColor(student.enrollment_status)}>
                    {student.enrollment_status || 'Active'}
                  </Badge>
                  {student.academic_status && (
                    <Badge variant={student.academic_status === 'Good Standing' ? 'default' : 'destructive'}>
                      {student.academic_status}
                    </Badge>
                  )}
                  {student.financial_hold && (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Financial Hold
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="text-2xl font-bold">{student.gpa?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Earned</p>
                  <p className="text-2xl font-bold">{student.total_credits_earned || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class Standing</p>
                  <p className="text-lg font-semibold">{student.class_standing || 'Freshman'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Graduation</p>
                  <p className="text-lg font-semibold">
                    {student.expected_graduation_date ?
                      new Date(student.expected_graduation_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                      'TBD'}
                  </p>
                </div>
              </div>

              {/* Degree Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Degree Progress</span>
                  <span className="font-medium">{Math.round(calculateProgress())}% Complete</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{student.total_credits_earned || 0} earned</span>
                  <span>{student.credits_in_progress || 0} in progress</span>
                  <span>{120 - (student.total_credits_earned || 0)} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.email || `${student.student_number}@university.edu`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{student.address}</p>
                    <p>{student.city}, {student.state} {student.postal_code}</p>
                    <p>{student.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{student.emergency_contact_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.emergency_contact_phone}</span>
                  </div>
                </div>
                {student.parent_guardian_name && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Parent/Guardian</p>
                    <p className="font-medium">{student.parent_guardian_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.parent_guardian_phone}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Semester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled Courses</span>
                    <span className="font-medium">{activeEnrollments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Hours</span>
                    <span className="font-medium">{currentCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester GPA</span>
                    <span className="font-medium">{student.semester_gpa?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Scores */}
            {(student.sat_score || student.act_score) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {student.sat_score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SAT Score</span>
                      <span className="font-medium">{student.sat_score}</span>
                    </div>
                  )}
                  {student.act_score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ACT Score</span>
                      <span className="font-medium">{student.act_score}</span>
                    </div>
                  )}
                  {student.high_school && (
                    <>
                      <Separator className="my-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">High School</p>
                        <p className="font-medium">{student.high_school}</p>
                        {student.high_school_graduation_year && (
                          <p className="text-sm text-muted-foreground">Class of {student.high_school_graduation_year}</p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Major</p>
                  <p className="font-medium">{student.major_program?.name || 'Undeclared'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minor</p>
                  <p className="font-medium">{student.minor_program?.name || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Academic Status</p>
                  <p className="font-medium">{student.academic_status || 'Good Standing'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium">
                    {student.admission_date ?
                      new Date(student.admission_date).toLocaleDateString() :
                      'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Academic Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{student.gpa?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{student.semester_gpa?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-muted-foreground">Semester GPA</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{student.total_credits_earned || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Enrollments</CardTitle>
              <CardDescription>Courses enrolled in this semester</CardDescription>
            </CardHeader>
            <CardContent>
              {activeEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {activeEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {enrollment.course_section?.course?.course_code} - {enrollment.course_section?.course?.title}
                          </p>
                          <Badge variant="outline">
                            {enrollment.course_section?.course?.credits} credits
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Section {enrollment.course_section?.section_number} •
                          {enrollment.course_section?.instructor?.user?.name} •
                          {enrollment.course_section?.room?.building?.name} {enrollment.course_section?.room?.room_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.course_section?.schedule_days?.join(', ')} {enrollment.course_section?.start_time} - {enrollment.course_section?.end_time}
                        </div>
                      </div>
                      {enrollment.grade && (
                        <div className={`text-2xl font-bold ${getGradeColor(enrollment.grade)}`}>
                          {enrollment.grade}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No current enrollments</p>
              )}
            </CardContent>
          </Card>

          {completedEnrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
                <CardDescription>Courses with final grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {enrollment.course_section?.course?.course_code} - {enrollment.course_section?.course?.title}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.course_section?.course?.credits} credits • Completed {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getGradeColor(enrollment.grade)}`}>
                        {enrollment.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Legal Name</p>
                  <p className="font-medium">{student.first_name} {student.last_name}</p>
                </div>
                {student.preferred_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Name</p>
                    <p className="font-medium">{student.preferred_name}</p>
                  </div>
                )}
                {student.pronouns && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pronouns</p>
                    <p className="font-medium">{student.pronouns}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(student.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{student.nationality}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Financial Aid</p>
                      <p className="text-sm text-muted-foreground">Receiving assistance</p>
                    </div>
                  </div>
                  <Badge variant={student.receives_financial_aid ? 'default' : 'secondary'}>
                    {student.receives_financial_aid ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Account Status</p>
                      <p className="text-sm text-muted-foreground">Payment standing</p>
                    </div>
                  </div>
                  <Badge variant={student.financial_hold ? 'destructive' : 'default'}>
                    {student.financial_hold ? 'Hold' : 'Good Standing'}
                  </Badge>
                </div>
              </div>
              {student.financial_hold && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Financial Hold Active</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This student has a financial hold on their account. They will not be able to register for courses or receive transcripts until the hold is resolved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}