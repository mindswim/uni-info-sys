"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, BookOpen, Calendar, TrendingUp } from 'lucide-react'
import { studentService } from '@/services'
import { useState, useEffect } from 'react'
import type { Student } from '@/types/api-types'
import Link from 'next/link'

export default function StudentOverviewPage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await studentService.getCurrentProfile()
        setStudent(data)
      } catch (error) {
        console.error('Failed to load student:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudent()
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

  // Calculate real stats from the data
  const gpa = student?.academic_records?.[0]?.gpa || 'N/A'
  const enrollmentCount = student?.enrollments?.length || 0
  const totalCredits = student?.enrollments?.reduce((sum, e) => sum + (e.course_section?.course?.credits || 0), 0) || 0
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
              <CardTitle className="text-sm font-medium">Credits Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                Out of {requiredCredits} required
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
                  <div className="h-full bg-primary" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {requiredCredits - totalCredits} credits remaining to complete your degree.
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
                  <dd className="font-medium">{student?.student_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Enrollment Status</dt>
                  <dd className="font-medium">{student?.enrollment_status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{student?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{student?.phone}</dd>
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
                <Link href="/student/enrollments">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Enrollments
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
