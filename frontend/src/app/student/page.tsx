"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, BookOpen, Calendar, TrendingUp, FileText, Megaphone, Clock, AlertCircle } from 'lucide-react'
import { studentService } from '@/services'
import { useState, useEffect } from 'react'
import type { Student, Assignment, Announcement, Enrollment } from '@/types/api-types'
import Link from 'next/link'
import { format, formatDistanceToNow, isPast } from 'date-fns'

interface DashboardData {
  student: Student | null
  enrollments: Enrollment[]
  upcomingAssignments: Assignment[]
  announcements: Announcement[]
}

export default function StudentOverviewPage() {
  const [data, setData] = useState<DashboardData>({
    student: null,
    enrollments: [],
    upcomingAssignments: [],
    announcements: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem('auth_token')
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }

        // Fetch all dashboard data in parallel
        const [studentRes, enrollmentsRes, announcementsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/me`, { headers }).catch(() => null),
        ])

        const student = studentRes.ok ? (await studentRes.json()).data : null
        const enrollments = enrollmentsRes.ok ? (await enrollmentsRes.json()).data || [] : []
        const announcements = announcementsRes?.ok ? (await announcementsRes.json()).data || [] : []

        // Fetch upcoming assignments for each enrollment
        const assignmentPromises = enrollments
          .filter((e: Enrollment) => e.status === 'enrolled')
          .map((e: Enrollment) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${e.course_section_id}/assignments`, { headers })
              .then(res => res.ok ? res.json() : { data: [] })
              .then(data => (data.data || []).map((a: Assignment) => ({ ...a, course_section: e.course_section })))
              .catch(() => [])
          )

        const assignmentArrays = await Promise.all(assignmentPromises)
        const allAssignments = assignmentArrays.flat()
        const upcomingAssignments = allAssignments
          .filter((a: Assignment) => a.is_published && !isPast(new Date(a.due_at)))
          .sort((a: Assignment, b: Assignment) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
          .slice(0, 5)

        setData({ student, enrollments, upcomingAssignments, announcements: announcements.slice(0, 3) })
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    )
  }

  const { student, enrollments, upcomingAssignments, announcements } = data

  // Calculate real stats from the data
  const gpa = student?.gpa || student?.academic_records?.[0]?.gpa || 'N/A'
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled')
  const enrollmentCount = activeEnrollments.length
  const totalCredits = student?.total_credits_earned || 0
  const creditsInProgress = activeEnrollments.reduce((sum, e) => sum + (e.course_section?.course?.credits || 3), 0)
  const requiredCredits = student?.major_program?.credits_required || 120
  const completionPercentage = requiredCredits > 0 ? Math.round((totalCredits / requiredCredits) * 100) : 0

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Student Overview</h1>
            <p className="text-muted-foreground">
              Welcome back, {student?.first_name || 'Student'}
            </p>
          </div>
          <Button>Request Support</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gpa}</div>
              <p className="text-xs text-muted-foreground">Cumulative GPA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits This Term</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditsInProgress}</div>
              <p className="text-xs text-muted-foreground">
                {totalCredits} earned / {requiredCredits} required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrollment Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {student?.enrollment_status?.replace('_', ' ') || 'Unknown'}
              </div>
              <p className="text-xs text-muted-foreground">{enrollmentCount} courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">Degree progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Assignments & Announcements */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upcoming Assignments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/assignments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment: any) => {
                    const dueDate = new Date(assignment.due_at)
                    const isUrgent = dueDate.getTime() - Date.now() < 48 * 60 * 60 * 1000 // 48 hours
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{assignment.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.course_section?.course?.course_code || 'Course'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {isUrgent && (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                          <div className="text-right">
                            <div className={`text-sm font-medium ${isUrgent ? 'text-amber-600' : ''}`}>
                              {format(dueDate, 'MMM d')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(dueDate, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Recent Announcements
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/announcements">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No announcements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium">{announcement.title}</div>
                        {announcement.priority === 'urgent' && (
                          <Badge variant="destructive" className="flex-shrink-0">Urgent</Badge>
                        )}
                        {announcement.priority === 'important' && (
                          <Badge variant="secondary" className="flex-shrink-0">Important</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Degree Progress</span>
                  <span className="text-muted-foreground">
                    {totalCredits} / {requiredCredits} credits
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(completionPercentage, 100)}%` }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {requiredCredits - totalCredits > 0
                  ? `${requiredCredits - totalCredits} credits remaining to complete your degree.`
                  : 'You have completed all required credits!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Student Number</dt>
                  <dd className="font-medium font-mono">{student?.student_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Standing</dt>
                  <dd className="font-medium capitalize">{student?.class_standing || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={student?.enrollment_status === 'active' ? 'default' : 'secondary'}>
                      {student?.enrollment_status || 'N/A'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Program</dt>
                  <dd className="font-medium text-right max-w-[150px] truncate">
                    {student?.major_program?.name || 'Undeclared'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/registration">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Register for Courses
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/grades">
                  <Award className="mr-2 h-4 w-4" />
                  Check Grades
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/student/assignments">
                  <FileText className="mr-2 h-4 w-4" />
                  Assignments
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
