"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { studentService } from "@/services"
import type { Enrollment } from "@/types/api-types"

export function GradesTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [gpa, setGpa] = useState<string>('N/A')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true)
        const student = await studentService.getCurrentProfile()
        setEnrollments(student.enrollments || [])
        setGpa(student.academic_records?.[0]?.gpa || 'N/A')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grades')
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const completedEnrollments = enrollments.filter(e => e.grade !== null)
  const inProgressEnrollments = enrollments.filter(e => e.grade === null && e.status === 'enrolled')

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gpa}</div>
            <p className="text-xs text-muted-foreground">
              Based on academic records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              With final grades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Courses (In Progress) */}
      {inProgressEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {enrollment.course_section?.course?.course_code}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{enrollment.course_section?.course?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Section {enrollment.course_section?.section_number} • {enrollment.course_section?.course?.credits} credits
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Courses with Grades */}
      {completedEnrollments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Grade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {enrollment.course_section?.course?.course_code}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{enrollment.course_section?.course?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Section {enrollment.course_section?.section_number} • {enrollment.course_section?.course?.credits} credits
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="text-lg font-bold">{enrollment.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Grade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No completed courses yet. Grades will appear here once courses are graded.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
