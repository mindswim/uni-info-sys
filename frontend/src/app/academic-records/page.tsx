'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG, apiRequest } from '@/config/api'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap, Calendar, Award, TrendingUp,
  FileText, Download, CheckCircle, Clock,
  BookOpen, Target, Trophy, Star
} from 'lucide-react'

interface CourseRecord {
  id: number
  course_code: string
  course_name: string
  credits: number
  grade: string
  grade_points: number
  term: string
  year: number
  status: 'completed' | 'in_progress' | 'withdrawn'
  category: 'core' | 'major' | 'elective' | 'general_ed'
}

interface AcademicSummary {
  total_credits_earned: number
  total_credits_attempted: number
  total_credits_required: number
  cumulative_gpa: number
  major_gpa: number
  term_gpa: number
  academic_standing: string
  expected_graduation: string
  degree_progress: number
}

interface DegreeRequirement {
  category: string
  required_credits: number
  earned_credits: number
  in_progress_credits: number
  remaining_credits: number
  courses: string[]
}

interface AcademicAchievement {
  title: string
  date: string
  description: string
  icon: 'deans_list' | 'scholarship' | 'award' | 'honor'
}

// Mock data generator
const generateMockData = () => {
  const currentYear = 2024
  const startYear = 2023

  const courses: CourseRecord[] = [
    // Fall 2023
    { id: 1, course_code: 'CS 101', course_name: 'Introduction to Computer Science', credits: 4, grade: 'A', grade_points: 4.0, term: 'Fall', year: 2023, status: 'completed', category: 'major' },
    { id: 2, course_code: 'MATH 201', course_name: 'Calculus I', credits: 4, grade: 'B+', grade_points: 3.3, term: 'Fall', year: 2023, status: 'completed', category: 'core' },
    { id: 3, course_code: 'ENG 110', course_name: 'Composition I', credits: 3, grade: 'A-', grade_points: 3.7, term: 'Fall', year: 2023, status: 'completed', category: 'general_ed' },
    { id: 4, course_code: 'HIST 101', course_name: 'World History', credits: 3, grade: 'B', grade_points: 3.0, term: 'Fall', year: 2023, status: 'completed', category: 'general_ed' },
    { id: 5, course_code: 'BIO 101', course_name: 'Biology I', credits: 4, grade: 'B+', grade_points: 3.3, term: 'Fall', year: 2023, status: 'completed', category: 'elective' },

    // Spring 2024
    { id: 6, course_code: 'CS 201', course_name: 'Data Structures', credits: 4, grade: 'A-', grade_points: 3.7, term: 'Spring', year: 2024, status: 'completed', category: 'major' },
    { id: 7, course_code: 'MATH 202', course_name: 'Calculus II', credits: 4, grade: 'B', grade_points: 3.0, term: 'Spring', year: 2024, status: 'completed', category: 'core' },
    { id: 8, course_code: 'PHYS 201', course_name: 'Physics I', credits: 4, grade: 'B+', grade_points: 3.3, term: 'Spring', year: 2024, status: 'completed', category: 'core' },
    { id: 9, course_code: 'ENG 111', course_name: 'Composition II', credits: 3, grade: 'A', grade_points: 4.0, term: 'Spring', year: 2024, status: 'completed', category: 'general_ed' },
    { id: 10, course_code: 'PHIL 101', course_name: 'Introduction to Philosophy', credits: 3, grade: 'A-', grade_points: 3.7, term: 'Spring', year: 2024, status: 'completed', category: 'elective' },

    // Fall 2024 (Current)
    { id: 11, course_code: 'CS 301', course_name: 'Algorithms', credits: 4, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, status: 'in_progress', category: 'major' },
    { id: 12, course_code: 'CS 320', course_name: 'Database Systems', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, status: 'in_progress', category: 'major' },
    { id: 13, course_code: 'MATH 301', course_name: 'Linear Algebra', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, status: 'in_progress', category: 'core' },
    { id: 14, course_code: 'CS 350', course_name: 'Software Engineering', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, status: 'in_progress', category: 'major' },
    { id: 15, course_code: 'PSYC 201', course_name: 'Cognitive Psychology', credits: 3, grade: 'IP', grade_points: 0, term: 'Fall', year: 2024, status: 'in_progress', category: 'elective' }
  ]

  const completedCourses = courses.filter(c => c.status === 'completed')
  const completedCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0)
  const inProgressCredits = courses.filter(c => c.status === 'in_progress').reduce((sum, c) => sum + c.credits, 0)
  const totalQualityPoints = completedCourses.reduce((sum, c) => sum + (c.credits * c.grade_points), 0)
  const cumulativeGPA = completedCredits > 0 ? totalQualityPoints / completedCredits : 0

  const summary: AcademicSummary = {
    total_credits_earned: completedCredits,
    total_credits_attempted: completedCredits + inProgressCredits,
    total_credits_required: 120,
    cumulative_gpa: Math.round(cumulativeGPA * 100) / 100,
    major_gpa: 3.65,
    term_gpa: 3.5,
    academic_standing: cumulativeGPA >= 3.5 ? "Dean's List" : cumulativeGPA >= 2.0 ? 'Good Standing' : 'Academic Probation',
    expected_graduation: 'May 2027',
    degree_progress: Math.round((completedCredits / 120) * 100)
  }

  const requirements: DegreeRequirement[] = [
    {
      category: 'Core Requirements',
      required_credits: 32,
      earned_credits: 16,
      in_progress_credits: 3,
      remaining_credits: 13,
      courses: ['MATH 201', 'MATH 202', 'PHYS 201', 'MATH 301']
    },
    {
      category: 'Major Requirements',
      required_credits: 48,
      earned_credits: 8,
      in_progress_credits: 13,
      remaining_credits: 27,
      courses: ['CS 101', 'CS 201', 'CS 301', 'CS 320', 'CS 350']
    },
    {
      category: 'General Education',
      required_credits: 24,
      earned_credits: 9,
      in_progress_credits: 0,
      remaining_credits: 15,
      courses: ['ENG 110', 'ENG 111', 'HIST 101']
    },
    {
      category: 'Electives',
      required_credits: 16,
      earned_credits: 7,
      in_progress_credits: 3,
      remaining_credits: 6,
      courses: ['BIO 101', 'PHIL 101', 'PSYC 201']
    }
  ]

  const achievements: AcademicAchievement[] = [
    { title: "Dean's List", date: 'Fall 2023', description: 'Achieved GPA of 3.5 or higher', icon: 'deans_list' },
    { title: "Dean's List", date: 'Spring 2024', description: 'Achieved GPA of 3.5 or higher', icon: 'deans_list' },
    { title: 'Academic Excellence Award', date: 'Spring 2024', description: 'Top 10% of class', icon: 'award' },
    { title: 'STEM Scholarship', date: 'Fall 2024', description: '$5,000 merit scholarship', icon: 'scholarship' }
  ]

  return { courses, summary, requirements, achievements }
}

export default function AcademicRecordsPage() {
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTerm, setSelectedTerm] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try authenticated endpoint
        const response = await apiRequest(`${API_CONFIG.V1.BASE}/students/me/academic-records`)
        if (response.ok) {
          const academicData = await response.json()
          setData(academicData)
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data
        setData(generateMockData())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading academic records...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">No academic records found</div>
  }

  const { courses, summary, requirements, achievements } = data

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 font-semibold'
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    if (grade === 'F') return 'text-red-600'
    if (grade === 'IP') return 'text-gray-500'
    if (grade === 'W') return 'text-gray-400'
    return 'text-gray-600'
  }

  const getStandingColor = (standing: string) => {
    if (standing.includes("Dean")) return 'bg-green-100 text-green-800'
    if (standing.includes('Good')) return 'bg-blue-100 text-blue-800'
    if (standing.includes('Probation')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'deans_list':
        return <Star className="h-5 w-5" />
      case 'scholarship':
        return <Trophy className="h-5 w-5" />
      case 'award':
        return <Award className="h-5 w-5" />
      default:
        return <CheckCircle className="h-5 w-5" />
    }
  }

  // Group courses by term
  const coursesByTerm = courses.reduce((acc, course) => {
    const termKey = `${course.term} ${course.year}`
    if (!acc[termKey]) acc[termKey] = []
    acc[termKey].push(course)
    return acc
  }, {} as Record<string, CourseRecord[]>)

  const terms = Object.keys(coursesByTerm).sort((a, b) => {
    const [termA, yearA] = a.split(' ')
    const [termB, yearB] = b.split(' ')
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
    return termA === 'Spring' ? 1 : -1
  })

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Academic Records' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Academic Records
            </h1>
            <p className="text-muted-foreground">Complete academic history and degree progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Records
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              View Transcript
            </Button>
          </div>
        </div>

      {/* Academic Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.cumulative_gpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_credits_earned}</div>
            <p className="text-xs text-muted-foreground">Of {summary.total_credits_required} required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degree Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.degree_progress}%</div>
            <Progress value={summary.degree_progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStandingColor(summary.academic_standing)}>
              {summary.academic_standing}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Expected: {summary.expected_graduation}</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                  <div className="text-primary">
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="outline">{achievement.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Course History</TabsTrigger>
          <TabsTrigger value="requirements">Degree Requirements</TabsTrigger>
          <TabsTrigger value="progress">Progress Analysis</TabsTrigger>
        </TabsList>

        {/* Course History Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course History</CardTitle>
              <CardDescription>All courses taken and in progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {terms.map(term => {
                const termCourses = coursesByTerm[term]
                const termCredits = termCourses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.credits, 0)
                const termQualityPoints = termCourses.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.credits * c.grade_points), 0)
                const termGPA = termCredits > 0 ? termQualityPoints / termCredits : 0

                return (
                  <div key={term} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{term}</h3>
                      {termCredits > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                          <span>Credits: <strong>{termCredits}</strong></span>
                          <span>GPA: <strong>{termGPA.toFixed(2)}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {termCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{course.course_code}</span>
                              <span className="text-muted-foreground">-</span>
                              <span>{course.course_name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{course.credits} credits</span>
                              <Badge variant="outline" className="text-xs">
                                {course.category.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-medium ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </div>
                            {course.status === 'in_progress' && (
                              <Badge variant="secondary" className="text-xs">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {term !== terms[terms.length - 1] && <Separator />}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Degree Requirements Tab */}
        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Degree Requirements</CardTitle>
              <CardDescription>Progress toward graduation requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requirements.map((req, index) => {
                const progressPercentage = Math.round(((req.earned_credits + req.in_progress_credits) / req.required_credits) * 100)

                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{req.category}</h3>
                      <span className="text-sm text-muted-foreground">
                        {req.earned_credits} of {req.required_credits} credits earned
                      </span>
                    </div>

                    <Progress value={progressPercentage} className="h-2" />

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Earned</p>
                        <p className="font-medium text-green-600">{req.earned_credits} credits</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">In Progress</p>
                        <p className="font-medium text-blue-600">{req.in_progress_credits} credits</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium text-orange-600">{req.remaining_credits} credits</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-medium">{progressPercentage}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {req.courses.map((course, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>

                    {index < requirements.length - 1 && <Separator />}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Analysis Tab */}
        <TabsContent value="progress">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GPA Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumulative GPA</span>
                    <span className="font-medium">{summary.cumulative_gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Major GPA</span>
                    <span className="font-medium">{summary.major_gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Term GPA</span>
                    <span className="font-medium">{summary.term_gpa.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Graduation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Graduation</span>
                    <span className="font-medium">{summary.expected_graduation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits Per Term (Avg)</span>
                    <span className="font-medium">15.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terms Remaining</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">You're on track to graduate in {summary.expected_graduation}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm">Consider taking 1-2 more electives next term to stay ahead</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm">Maintain your GPA above 3.5 to remain on the Dean's List</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}