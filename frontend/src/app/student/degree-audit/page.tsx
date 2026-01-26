"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Target,
  TrendingUp,
  FileText,
  Printer
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

interface RequirementCategory {
  name: string
  description: string
  credits_required: number
  credits_completed: number
  courses: CourseProgress[]
}

interface CourseProgress {
  code: string
  title: string
  credits: number
  status: 'completed' | 'in_progress' | 'planned' | 'required'
  grade?: string
  term?: string
}

interface DegreeAuditData {
  student: {
    name: string
    student_number: string
    program: string
    catalog_year: string
    class_standing: string
    expected_graduation: string
    gpa: number
    advisor: string
  }
  overall: {
    total_credits_required: number
    total_credits_completed: number
    total_credits_in_progress: number
    gpa_required: number
    gpa_current: number
    on_track: boolean
  }
  requirements: RequirementCategory[]
}

export default function DegreeAuditPage() {
  const [auditData, setAuditData] = useState<DegreeAuditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDegreeAudit()
  }, [])

  const fetchDegreeAudit = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }

      // Fetch student data and enrollments to build the audit
      const [studentRes, enrollmentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, { headers }),
      ])

      const student = studentRes.ok ? (await studentRes.json()).data : null
      const enrollments = enrollmentsRes.ok ? (await enrollmentsRes.json()).data || [] : []

      if (student) {
        // Build degree audit from student and enrollment data
        const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed' && e.grade)
        const inProgressEnrollments = enrollments.filter((e: any) => e.status === 'enrolled')

        const completedCredits = completedEnrollments.reduce((sum: number, e: any) =>
          sum + (e.course_section?.course?.credits || 3), 0)
        const inProgressCredits = inProgressEnrollments.reduce((sum: number, e: any) =>
          sum + (e.course_section?.course?.credits || 3), 0)

        const totalRequired = student.major_program?.credits_required || 120

        // Group courses by type for requirements
        const csCourses = enrollments.filter((e: any) =>
          e.course_section?.course?.course_code?.startsWith('CS'))
        const mathCourses = enrollments.filter((e: any) =>
          e.course_section?.course?.course_code?.startsWith('MATH'))
        const genEdCourses = enrollments.filter((e: any) =>
          ['ENG', 'HIST', 'PHIL', 'SOC', 'PSY'].some(prefix =>
            e.course_section?.course?.course_code?.startsWith(prefix)))
        const electives = enrollments.filter((e: any) =>
          !csCourses.includes(e) && !mathCourses.includes(e) && !genEdCourses.includes(e))

        const buildCourseList = (enrollmentList: any[]): CourseProgress[] =>
          enrollmentList.map((e: any) => ({
            code: e.course_section?.course?.course_code || 'UNKNOWN',
            title: e.course_section?.course?.title || 'Unknown Course',
            credits: e.course_section?.course?.credits || 3,
            status: e.status === 'completed' ? 'completed' : 'in_progress',
            grade: e.grade,
            term: e.course_section?.term?.name,
          }))

        const calculateCategoryCredits = (list: any[], status: 'completed' | 'in_progress') =>
          list.filter((e: any) =>
            status === 'completed' ? e.status === 'completed' : e.status === 'enrolled'
          ).reduce((sum: number, e: any) => sum + (e.course_section?.course?.credits || 3), 0)

        // Build requirements with sample required courses
        const requirements: RequirementCategory[] = [
          {
            name: 'Major Core Requirements',
            description: 'Required courses for your major',
            credits_required: 42,
            credits_completed: calculateCategoryCredits(csCourses, 'completed'),
            courses: [
              ...buildCourseList(csCourses),
              // Add some required but not taken courses
              ...(csCourses.length < 10 ? [
                { code: 'CS 301', title: 'Algorithms', credits: 3, status: 'required' as const },
                { code: 'CS 350', title: 'Operating Systems', credits: 3, status: 'required' as const },
                { code: 'CS 401', title: 'Software Engineering', credits: 3, status: 'required' as const },
              ] : [])
            ]
          },
          {
            name: 'Mathematics Requirements',
            description: 'Required math courses',
            credits_required: 16,
            credits_completed: calculateCategoryCredits(mathCourses, 'completed'),
            courses: [
              ...buildCourseList(mathCourses),
              ...(mathCourses.length < 4 ? [
                { code: 'MATH 201', title: 'Calculus II', credits: 4, status: 'required' as const },
                { code: 'MATH 301', title: 'Linear Algebra', credits: 3, status: 'required' as const },
              ] : [])
            ]
          },
          {
            name: 'General Education',
            description: 'Breadth requirements across disciplines',
            credits_required: 30,
            credits_completed: calculateCategoryCredits(genEdCourses, 'completed'),
            courses: [
              ...buildCourseList(genEdCourses),
              ...(genEdCourses.length < 6 ? [
                { code: 'ENG 102', title: 'Composition II', credits: 3, status: 'required' as const },
                { code: 'HIST 101', title: 'World History', credits: 3, status: 'required' as const },
              ] : [])
            ]
          },
          {
            name: 'Free Electives',
            description: 'Additional courses to complete degree requirements',
            credits_required: 32,
            credits_completed: calculateCategoryCredits(electives, 'completed'),
            courses: buildCourseList(electives)
          },
        ]

        setAuditData({
          student: {
            name: `${student.first_name} ${student.last_name}`,
            student_number: student.student_number,
            program: student.major_program?.name || 'Undeclared',
            catalog_year: '2023-2024',
            class_standing: student.class_standing || 'Freshman',
            expected_graduation: student.expected_graduation_date || 'May 2027',
            gpa: student.gpa || 0,
            advisor: 'Dr. Smith',
          },
          overall: {
            total_credits_required: totalRequired,
            total_credits_completed: completedCredits,
            total_credits_in_progress: inProgressCredits,
            gpa_required: 2.0,
            gpa_current: student.gpa || 0,
            on_track: completedCredits >= (totalRequired * 0.25), // Simple check
          },
          requirements,
        })
      }
    } catch (error) {
      console.error('Failed to load degree audit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    )
  }

  if (!auditData) {
    return (
      <AppShell>
        <div className="flex flex-col gap-6 p-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No Degree Audit Available</h3>
                <p className="text-sm mt-1">
                  Please contact your academic advisor to set up your degree plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const { student, overall, requirements } = auditData
  const completionPercent = Math.round((overall.total_credits_completed / overall.total_credits_required) * 100)

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Degree Audit</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress toward graduation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/transcripts">
                <FileText className="h-4 w-4 mr-2" />
                View Transcript
              </Link>
            </Button>
          </div>
        </div>

        {/* Student Info & Overall Progress */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Student Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{student.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Student ID</dt>
                  <dd className="font-mono">{student.student_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Program</dt>
                  <dd className="font-medium text-right max-w-[160px] truncate">{student.program}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Catalog Year</dt>
                  <dd className="font-medium">{student.catalog_year}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Class Standing</dt>
                  <dd className="font-medium capitalize">{student.class_standing}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expected Graduation</dt>
                  <dd className="font-medium">{student.expected_graduation}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Academic Advisor</dt>
                  <dd className="font-medium">{student.advisor}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Overall Progress
                </CardTitle>
                {overall.on_track ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    On Track
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Attention
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large progress ring - simulated with progress bar */}
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${completionPercent * 3.52} 352`}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{completionPercent}%</span>
                    <span className="text-xs text-muted-foreground">Complete</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">{overall.total_credits_completed}</p>
                      <p className="text-xs text-muted-foreground">Credits Completed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-blue-500">{overall.total_credits_in_progress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{overall.total_credits_required - overall.total_credits_completed - overall.total_credits_in_progress}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-muted-foreground">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <span className="text-sm text-muted-foreground">Remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GPA Progress */}
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Cumulative GPA</span>
                    <span className={`text-lg font-bold ${overall.gpa_current >= overall.gpa_required ? 'text-emerald-600' : 'text-red-600'}`}>
                      {overall.gpa_current.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(overall.gpa_current / 4.0) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum required: {overall.gpa_required.toFixed(1)} GPA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Degree Requirements
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your degree requirements and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={requirements[0]?.name.toLowerCase().replace(/\s+/g, '-')} className="space-y-4">
              <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
                {requirements.map((req) => {
                  const percent = Math.round((req.credits_completed / req.credits_required) * 100)
                  const isComplete = percent >= 100
                  return (
                    <TabsTrigger
                      key={req.name}
                      value={req.name.toLowerCase().replace(/\s+/g, '-')}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {isComplete && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {req.name}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {percent}%
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {requirements.map((req) => {
                const percent = Math.min(100, Math.round((req.credits_completed / req.credits_required) * 100))

                return (
                  <TabsContent
                    key={req.name}
                    value={req.name.toLowerCase().replace(/\s+/g, '-')}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <h3 className="font-medium">{req.name}</h3>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {req.credits_completed} / {req.credits_required}
                        </p>
                        <p className="text-sm text-muted-foreground">credits completed</p>
                      </div>
                    </div>

                    <Progress value={percent} className="h-3" />

                    <div className="space-y-2">
                      {req.courses.map((course, idx) => (
                        <div
                          key={`${course.code}-${idx}`}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            course.status === 'completed'
                              ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                              : course.status === 'in_progress'
                                ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                                : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {course.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : course.status === 'in_progress' ? (
                              <Clock className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">{course.code}</p>
                              <p className="text-sm text-muted-foreground">{course.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{course.credits} credits</Badge>
                            {course.grade && (
                              <Badge className={getGradeBadgeColor(course.grade)}>
                                {course.grade}
                              </Badge>
                            )}
                            {course.term && (
                              <span className="text-sm text-muted-foreground">{course.term}</span>
                            )}
                            {course.status === 'required' && (
                              <Badge variant="secondary">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {req.credits_completed < req.credits_required && (
                      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">
                            {req.credits_required - req.credits_completed} credits remaining in this category
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/student/registration">
                            Browse Courses
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This degree audit is an unofficial planning tool. Please consult with your
              academic advisor to confirm all requirements have been met.
            </p>
            <p>
              Requirements shown are based on the {student.catalog_year} catalog year.
              If you entered under a different catalog year, some requirements may differ.
            </p>
            <p>
              Courses currently in progress are shown but grades are not yet recorded.
              Your final audit will be updated after grades are posted.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function getGradeBadgeColor(grade: string): string {
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (grade.startsWith('C')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  if (grade === 'F') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  return 'bg-muted text-muted-foreground'
}
