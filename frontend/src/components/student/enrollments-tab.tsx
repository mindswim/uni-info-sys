"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/layouts"
import { BookOpen, Calendar, User, Award, LogOut, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { studentService } from "@/services"
import type { Enrollment } from "@/types/api-types"

export function EnrollmentsTab() {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const student = await studentService.getCurrentProfile()
      setEnrollments(student.enrollments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowWithdrawDialog(true)
  }

  const handleWithdraw = async () => {
    if (!selectedEnrollment) return

    setWithdrawing(selectedEnrollment.id)
    setShowWithdrawDialog(false)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/${selectedEnrollment.id}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to withdraw from course')
      }

      toast({
        title: "Withdrawal Successful",
        description: "You have been withdrawn from the course.",
      })

      // Refresh enrollments
      fetchEnrollments()
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw from course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setWithdrawing(null)
      setSelectedEnrollment(null)
    }
  }

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
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {enrollment.course_section?.course?.course_code || 'Course'} - {enrollment.course_section?.course?.title || 'Unknown Course'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Section {enrollment.course_section?.section_number}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(enrollment.status)}>
                    {enrollment.status}
                  </Badge>
                  {enrollment.status === 'enrolled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWithdrawClick(enrollment)}
                      disabled={withdrawing === enrollment.id}
                    >
                      {withdrawing === enrollment.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3 w-3 mr-1" />
                          Withdraw
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {enrollment.course_section?.schedule_display && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium">{enrollment.course_section.schedule_display}</p>
                    </div>
                  </div>
                )}
                {enrollment.grade ? (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Grade</p>
                      <p className="font-medium">{enrollment.grade}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Grade</p>
                      <p className="font-medium text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                )}
                {enrollment.course_section?.course?.credits && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Credits</p>
                      <p className="font-medium">{enrollment.course_section.course.credits}</p>
                    </div>
                  </div>
                )}
                {enrollment.course_section && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-medium">{enrollment.course_section.enrolled_count}/{enrollment.course_section.capacity}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEnrollment && (
                <>
                  Are you sure you want to withdraw from{' '}
                  <strong>
                    {selectedEnrollment.course_section?.course?.course_code} -{' '}
                    {selectedEnrollment.course_section?.course?.title}
                  </strong>
                  ?
                  <br /><br />
                  This action cannot be undone. You will need to re-enroll if you change your mind.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} className="bg-destructive hover:bg-destructive/90">
              Withdraw from Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
