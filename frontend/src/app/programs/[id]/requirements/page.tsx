'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  GraduationCap,
  BookOpen,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Trophy,
  Target,
  AlertCircle,
  Award
} from 'lucide-react'
import { API_CONFIG } from '@/config/api'

interface Program {
  id: number
  name: string
  code: string
  description: string
  degree_level: string
  duration_years: number
  total_credits: number
  cip_code?: string
  department_id: number
  department?: {
    id: number
    name: string
    faculty?: {
      name: string
    }
  }
}

interface RequiredCourse {
  course_id: number
  course_code: string
  course_title: string
  credits: number
  requirement_type: 'core' | 'major' | 'elective' | 'general'
  completed: boolean
  grade?: string
  enrolled?: boolean
}

interface StudentProgress {
  student_id: number
  student_name: string
  total_credits_earned: number
  total_credits_required: number
  core_credits_earned: number
  core_credits_required: number
  major_credits_earned: number
  major_credits_required: number
  elective_credits_earned: number
  elective_credits_required: number
  gpa: number
  expected_graduation: string
  can_graduate: boolean
}

export default function ProgramRequirementsPage() {
  const params = useParams()
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [requirements, setRequirements] = useState<RequiredCourse[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProgramData()
  }, [params.id])

  const fetchProgramData = async () => {
    try {
      setLoading(true)

      // Fetch program details
      const programResponse = await fetch(`${API_CONFIG.HOST}/api/data-viewer/programs?limit=100`)
      if (!programResponse.ok) {
        throw new Error('Failed to fetch program data')
      }

      const allPrograms = await programResponse.json()
      const programData = allPrograms.data?.find((p: any) => p.id === parseInt(params.id as string))

      if (!programData) {
        throw new Error('Program not found')
      }

      setProgram(programData)

      // Mock requirements data (since we don't have a requirements endpoint yet)
      const mockRequirements: RequiredCourse[] = [
        // Core Requirements
        { course_id: 1, course_code: 'CS101', course_title: 'Introduction to Computer Science', credits: 3, requirement_type: 'core', completed: true, grade: 'A' },
        { course_id: 2, course_code: 'CS201', course_title: 'Data Structures and Algorithms', credits: 3, requirement_type: 'core', completed: true, grade: 'B+' },
        { course_id: 3, course_code: 'CS301', course_title: 'Operating Systems', credits: 3, requirement_type: 'core', completed: false, enrolled: true },
        { course_id: 4, course_code: 'CS401', course_title: 'Software Engineering', credits: 3, requirement_type: 'core', completed: false, enrolled: false },

        // Major Requirements
        { course_id: 5, course_code: 'CS220', course_title: 'Web Development', credits: 3, requirement_type: 'major', completed: true, grade: 'A-' },
        { course_id: 6, course_code: 'CS350', course_title: 'Artificial Intelligence', credits: 3, requirement_type: 'major', completed: false, enrolled: true },
        { course_id: 7, course_code: 'CS360', course_title: 'Database Systems', credits: 3, requirement_type: 'major', completed: false, enrolled: false },
        { course_id: 8, course_code: 'CS370', course_title: 'Computer Networks', credits: 3, requirement_type: 'major', completed: false, enrolled: false },

        // General Education
        { course_id: 9, course_code: 'MATH101', course_title: 'Calculus I', credits: 4, requirement_type: 'general', completed: true, grade: 'B' },
        { course_id: 10, course_code: 'MATH102', course_title: 'Calculus II', credits: 4, requirement_type: 'general', completed: true, grade: 'B+' },
        { course_id: 11, course_code: 'PHYS101', course_title: 'Physics I', credits: 4, requirement_type: 'general', completed: true, grade: 'A-' },
        { course_id: 12, course_code: 'ENG101', course_title: 'English Composition', credits: 3, requirement_type: 'general', completed: true, grade: 'A' },

        // Electives
        { course_id: 13, course_code: 'CS480', course_title: 'Machine Learning', credits: 3, requirement_type: 'elective', completed: false, enrolled: false },
        { course_id: 14, course_code: 'CS490', course_title: 'Cloud Computing', credits: 3, requirement_type: 'elective', completed: false, enrolled: false },
        { course_id: 15, course_code: 'CS495', course_title: 'Cybersecurity', credits: 3, requirement_type: 'elective', completed: false, enrolled: false },
      ]

      setRequirements(mockRequirements)

      // Calculate student progress
      const completedCourses = mockRequirements.filter(r => r.completed)
      const enrolledCourses = mockRequirements.filter(r => r.enrolled)

      const progress: StudentProgress = {
        student_id: 1,
        student_name: 'Current Student',
        total_credits_earned: completedCourses.reduce((sum, c) => sum + c.credits, 0),
        total_credits_required: programData.total_credits || 120,
        core_credits_earned: completedCourses.filter(c => c.requirement_type === 'core').reduce((sum, c) => sum + c.credits, 0),
        core_credits_required: 12,
        major_credits_earned: completedCourses.filter(c => c.requirement_type === 'major').reduce((sum, c) => sum + c.credits, 0),
        major_credits_required: 24,
        elective_credits_earned: completedCourses.filter(c => c.requirement_type === 'elective').reduce((sum, c) => sum + c.credits, 0),
        elective_credits_required: 12,
        gpa: 3.45,
        expected_graduation: '2026-05-15',
        can_graduate: false
      }

      setStudentProgress(progress)

    } catch (err) {
      console.error('Error fetching program:', err)
      setError(err instanceof Error ? err.message : 'Failed to load program requirements')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading program requirements...</div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Program</CardTitle>
            <CardDescription>{error || 'Program not found'}</CardDescription>
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

  const calculateOverallProgress = () => {
    if (!studentProgress) return 0
    return Math.min((studentProgress.total_credits_earned / studentProgress.total_credits_required) * 100, 100)
  }

  const getRequirementProgress = (type: string) => {
    const typeRequirements = requirements.filter(r => r.requirement_type === type)
    const completed = typeRequirements.filter(r => r.completed).length
    return { completed, total: typeRequirements.length }
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

  const coreRequirements = requirements.filter(r => r.requirement_type === 'core')
  const majorRequirements = requirements.filter(r => r.requirement_type === 'major')
  const generalRequirements = requirements.filter(r => r.requirement_type === 'general')
  const electiveRequirements = requirements.filter(r => r.requirement_type === 'elective')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Award className="mr-2 h-4 w-4" />
            Degree Audit
          </Button>
          <Button variant="outline">
            <GraduationCap className="mr-2 h-4 w-4" />
            Graduation Check
          </Button>
        </div>
      </div>

      {/* Program Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {program.code}
                    </Badge>
                    <Badge variant="secondary">
                      {program.degree_level}
                    </Badge>
                    <Badge>
                      {program.duration_years} Years
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
                  <p className="text-muted-foreground">
                    {program.department?.faculty?.name} • {program.department?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Credits Required</p>
                  <p className="text-3xl font-bold">{program.total_credits}</p>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            {studentProgress && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Degree Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {studentProgress.total_credits_earned} / {studentProgress.total_credits_required} credits
                  </span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(calculateOverallProgress())}% Complete</span>
                  <span>Expected Graduation: {new Date(studentProgress.expected_graduation).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{requirements.filter(r => r.completed).length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{requirements.filter(r => r.enrolled).length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Target className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{requirements.filter(r => !r.completed && !r.enrolled).length}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{studentProgress?.gpa.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Current GPA</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graduation Status Alert */}
      {studentProgress && !studentProgress.can_graduate && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Yet Eligible for Graduation</AlertTitle>
          <AlertDescription>
            You need to complete {requirements.filter(r => !r.completed && !r.enrolled).length} more courses
            ({studentProgress.total_credits_required - studentProgress.total_credits_earned} credits) to meet graduation requirements.
          </AlertDescription>
        </Alert>
      )}

      {/* Requirements Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Requirements</TabsTrigger>
          <TabsTrigger value="core">Core ({getRequirementProgress('core').completed}/{getRequirementProgress('core').total})</TabsTrigger>
          <TabsTrigger value="major">Major ({getRequirementProgress('major').completed}/{getRequirementProgress('major').total})</TabsTrigger>
          <TabsTrigger value="general">General Ed ({getRequirementProgress('general').completed}/{getRequirementProgress('general').total})</TabsTrigger>
          <TabsTrigger value="elective">Electives ({getRequirementProgress('elective').completed}/{getRequirementProgress('elective').total})</TabsTrigger>
        </TabsList>

        {/* All Requirements */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Degree Requirements</CardTitle>
              <CardDescription>Complete list of courses required for graduation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.course_id}>
                      <TableCell>
                        {req.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : req.enrolled ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{req.course_code}</TableCell>
                      <TableCell>{req.course_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {req.requirement_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.credits}</TableCell>
                      <TableCell>
                        {req.grade ? (
                          <span className={`font-bold ${getGradeColor(req.grade)}`}>{req.grade}</span>
                        ) : req.enrolled ? (
                          <Badge variant="secondary">In Progress</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Requirements */}
        <TabsContent value="core" className="space-y-4">
          <RequirementSection
            title="Core Requirements"
            description="Fundamental courses required for your degree"
            requirements={coreRequirements}
            creditsRequired={12}
            creditsEarned={studentProgress?.core_credits_earned || 0}
          />
        </TabsContent>

        {/* Major Requirements */}
        <TabsContent value="major" className="space-y-4">
          <RequirementSection
            title="Major Requirements"
            description="Specialized courses in your field of study"
            requirements={majorRequirements}
            creditsRequired={24}
            creditsEarned={studentProgress?.major_credits_earned || 0}
          />
        </TabsContent>

        {/* General Education */}
        <TabsContent value="general" className="space-y-4">
          <RequirementSection
            title="General Education Requirements"
            description="Broad foundation courses across disciplines"
            requirements={generalRequirements}
            creditsRequired={32}
            creditsEarned={generalRequirements.filter(r => r.completed).reduce((sum, r) => sum + r.credits, 0)}
          />
        </TabsContent>

        {/* Electives */}
        <TabsContent value="elective" className="space-y-4">
          <RequirementSection
            title="Elective Requirements"
            description="Choose courses based on your interests"
            requirements={electiveRequirements}
            creditsRequired={12}
            creditsEarned={studentProgress?.elective_credits_earned || 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component for requirement sections
function RequirementSection({
  title,
  description,
  requirements,
  creditsRequired,
  creditsEarned
}: {
  title: string
  description: string
  requirements: RequiredCourse[]
  creditsRequired: number
  creditsEarned: number
}) {
  const getGradeColor = (grade?: string) => {
    if (!grade) return ''
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    if (grade === 'F') return 'text-red-600'
    return ''
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{creditsEarned}/{creditsRequired}</p>
            <p className="text-sm text-muted-foreground">Credits</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requirements.map((req) => (
            <div key={req.course_id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {req.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : req.enrolled ? (
                  <Clock className="h-5 w-5 text-blue-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">
                    {req.course_code} - {req.course_title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.credits} credits
                  </p>
                </div>
              </div>
              <div className="text-right">
                {req.grade ? (
                  <span className={`text-xl font-bold ${getGradeColor(req.grade)}`}>{req.grade}</span>
                ) : req.enrolled ? (
                  <Badge>In Progress</Badge>
                ) : (
                  <Button size="sm" variant="outline">Enroll</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}