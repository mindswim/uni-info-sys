"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Calendar, Clock, MapPin, User, AlertTriangle, Trash2, Plus,
  CheckCircle, XCircle, Info, ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Enrollment {
  id: number
  course_section: {
    id: number
    section_number: string
    schedule: string
    room: string
    instructor: string
    course: {
      course_code: string
      course_name: string
      credits: number
    }
  }
  status: string
  grade: string | null
  enrolled_at: string
}

interface DropPeriod {
  type: 'add' | 'drop' | 'withdraw'
  deadline: string
  description: string
  refund_percentage?: number
}

export default function DropAddPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [showDropDialog, setShowDropDialog] = useState(false)
  const [dropping, setDropping] = useState(false)
  const { toast } = useToast()

  // Mock drop/add period dates
  const periods: DropPeriod[] = [
    { type: 'add', deadline: '2025-01-24', description: 'Last day to add classes' },
    { type: 'drop', deadline: '2025-01-31', description: 'Last day to drop without W grade', refund_percentage: 100 },
    { type: 'withdraw', deadline: '2025-03-15', description: 'Last day to withdraw with W grade', refund_percentage: 50 },
  ]

  const currentDate = new Date()
  const canAdd = new Date(periods[0].deadline) >= currentDate
  const canDrop = new Date(periods[1].deadline) >= currentDate
  const canWithdraw = new Date(periods[2].deadline) >= currentDate

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me/enrollments?include=courseSection.course`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async () => {
    if (!selectedEnrollment) return

    setDropping(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/${selectedEnrollment.id}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (response.ok) {
        toast({ title: 'Course dropped successfully' })
        fetchEnrollments()
      } else {
        throw new Error('Failed to drop course')
      }
    } catch (err) {
      toast({ title: 'Failed to drop course', variant: 'destructive' })
    } finally {
      setDropping(false)
      setShowDropDialog(false)
      setSelectedEnrollment(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
      case 'waitlisted':
        return <Badge className="bg-amber-100 text-amber-800">Waitlisted</Badge>
      case 'dropped':
        return <Badge className="bg-gray-100 text-gray-800">Dropped</Badge>
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800">Withdrawn</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="list" />
      </AppShell>
    )
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled' || e.status === 'waitlisted')
  const droppedEnrollments = enrollments.filter(e => e.status === 'dropped' || e.status === 'withdrawn')

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Drop/Add Classes</h1>
            <p className="text-sm text-muted-foreground">
              Manage your course enrollment for the current term
            </p>
          </div>
          {canAdd && (
            <Button asChild>
              <Link href="/student/registration">
                <Plus className="h-4 w-4 mr-2" />
                Add Classes
              </Link>
            </Button>
          )}
        </div>

        {/* Important Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Important Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {periods.map((period) => {
                const isPast = new Date(period.deadline) < currentDate
                return (
                  <div
                    key={period.type}
                    className={`p-3 rounded-lg border ${isPast ? 'bg-muted/50 opacity-60' : 'bg-background'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isPast ? (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium capitalize">{period.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{period.description}</p>
                    <p className="text-sm font-medium mt-1">
                      {format(new Date(period.deadline), 'MMM d, yyyy')}
                    </p>
                    {period.refund_percentage !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {period.refund_percentage}% tuition refund
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alert if past add period */}
        {!canAdd && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The add period has ended. You can no longer add new classes for this term.
              {canWithdraw && ' You may still withdraw from courses with a W grade.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Enrollments */}
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current ({activeEnrollments.length})</TabsTrigger>
            <TabsTrigger value="dropped">Dropped/Withdrawn ({droppedEnrollments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            {activeEnrollments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No current enrollments"
                description="You are not enrolled in any classes for this term."
                action={{ label: 'Register for Classes', href: '/student/registration' }}
                variant="card"
              />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {enrollment.course_section.course.course_code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course_section.course.course_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {enrollment.course_section.schedule || 'TBA'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {enrollment.course_section.room || 'TBA'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {enrollment.course_section.instructor || 'TBA'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.course_section.course.credits}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(enrollment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(canDrop || canWithdraw) && enrollment.status === 'enrolled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedEnrollment(enrollment)
                                setShowDropDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {canDrop ? 'Drop' : 'Withdraw'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dropped" className="mt-4">
            {droppedEnrollments.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No dropped courses"
                description="You haven't dropped any courses this term."
                variant="card"
              />
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {droppedEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id} className="opacity-60">
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {enrollment.course_section.course.course_code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course_section.course.course_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.course_section.course.credits}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(enrollment.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Drop Confirmation Dialog */}
        <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {canDrop ? 'Drop Course' : 'Withdraw from Course'}
              </DialogTitle>
              <DialogDescription>
                {canDrop
                  ? 'This will remove the course from your schedule. You will receive a full refund.'
                  : 'This will result in a W grade on your transcript. You may receive a partial refund.'}
              </DialogDescription>
            </DialogHeader>
            {selectedEnrollment && (
              <div className="py-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-medium">
                    {selectedEnrollment.course_section.course.course_code} - {selectedEnrollment.course_section.course.course_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEnrollment.course_section.course.credits} credits
                  </p>
                </div>
                {!canDrop && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      A "W" grade will appear on your transcript. This does not affect your GPA but is visible to graduate schools and employers.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDropDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDrop}
                disabled={dropping}
              >
                {dropping ? 'Processing...' : canDrop ? 'Drop Course' : 'Withdraw'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
