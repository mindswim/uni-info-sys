"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layouts"
import { BookOpen, Calendar, User, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { studentService } from "@/services"
import type { Enrollment } from "@/types/api-types"

export function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true)
        const data = await studentService.getCurrentEnrollments()
        setEnrollments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load enrollments')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
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

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No active enrollments"
            description="Enroll in courses to see them listed here"
          />
        </CardContent>
      </Card>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enrolled':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'dropped':
        return 'destructive'
      case 'withdrawn':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Current Enrollments</h3>
        <Badge variant="outline">{enrollments.length} course{enrollments.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid gap-4">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {enrollment.section?.course?.code || 'Course'} - {enrollment.section?.course?.name || 'Unknown Course'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Section {enrollment.section?.section_number}
                  </p>
                </div>
                <Badge variant={getStatusVariant(enrollment.status)}>
                  {enrollment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {enrollment.section?.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Instructor</p>
                      <p className="font-medium">{enrollment.section.instructor}</p>
                    </div>
                  </div>
                )}
                {enrollment.section?.schedule && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium">{enrollment.section.schedule}</p>
                    </div>
                  </div>
                )}
                {enrollment.grade && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Grade</p>
                      <p className="font-medium">{enrollment.grade}</p>
                    </div>
                  </div>
                )}
                {enrollment.section?.course?.credits && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Credits</p>
                      <p className="font-medium">{enrollment.section.course.credits}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
