"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Award, TrendingUp, BookOpen, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { studentService } from "@/services"
import type { Student } from "@/types/api-types"

export function AcademicRecordsTab() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const data = await studentService.getCurrentProfile()
        setStudent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
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

  const creditsEarned = student?.credits_earned || 0
  const creditsRequired = 120

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current GPA"
          value={student?.gpa?.toFixed(2) || "N/A"}
          description="Cumulative GPA"
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          title="Credits Earned"
          value={creditsEarned.toString()}
          description={`Out of ${creditsRequired} required`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Enrollment Status"
          value={student?.enrollment_status || "Unknown"}
          description="Current status"
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="Completion"
          value={`${Math.round((creditsEarned / creditsRequired) * 100)}%`}
          description="Degree progress"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Academic Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Degree Progress</span>
                <span className="font-medium">{creditsEarned} / {creditsRequired} credits</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${(creditsEarned / creditsRequired) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {creditsEarned >= creditsRequired
                ? "You have completed all required credits!"
                : `${creditsRequired - creditsEarned} credits remaining to complete your degree.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Student Number</dt>
              <dd className="mt-1">{student?.student_number}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Enrollment Status</dt>
              <dd className="mt-1 capitalize">{student?.enrollment_status}</dd>
            </div>
            {student?.user && (
              <>
                <div>
                  <dt className="font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{student.user.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Phone</dt>
                  <dd className="mt-1">{student.phone || 'Not provided'}</dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
