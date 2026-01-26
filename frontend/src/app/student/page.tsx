"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Info,
  Megaphone,
  XCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Student, Enrollment, Assignment, Announcement, Hold, ActionItem, ActionItemDashboard, HoldSummary } from '@/types/api-types'
import Link from 'next/link'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

interface DashboardData {
  student: Student | null
  enrollments: Enrollment[]
  upcomingAssignments: Assignment[]
  announcements: Announcement[]
  holdsSummary: HoldSummary | null
  actionItemsDashboard: ActionItemDashboard | null
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    student: null,
    enrollments: [],
    upcomingAssignments: [],
    announcements: [],
    holdsSummary: null,
    actionItemsDashboard: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [completingItem, setCompletingItem] = useState<number | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem('auth_token')
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }

        // Fetch all dashboard data in parallel
        const [
          studentRes,
          enrollmentsRes,
          announcementsRes,
          holdsRes,
          actionItemsRes
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/me`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/holds/summary`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items/dashboard`, { headers }).catch(() => null),
        ])

        const student = studentRes.ok ? (await studentRes.json()).data : null
        const enrollments = enrollmentsRes.ok ? (await enrollmentsRes.json()).data || [] : []
        const announcements = announcementsRes?.ok ? (await announcementsRes.json()).data || [] : []
        const holdsSummary = holdsRes?.ok ? (await holdsRes.json()).data : null
        const actionItemsDashboard = actionItemsRes?.ok ? (await actionItemsRes.json()).data : null

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
          .filter((a: Assignment) => a.is_published && !isPast(new Date(a.due_date)))
          .sort((a: Assignment, b: Assignment) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 5)

        setData({
          student,
          enrollments,
          upcomingAssignments,
          announcements: announcements.slice(0, 3),
          holdsSummary,
          actionItemsDashboard,
        })
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleCompleteItem = async (itemId: number) => {
    setCompletingItem(itemId)
    try {
      const token = sessionStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items/${itemId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (res.ok && data.actionItemsDashboard) {
        // Remove the item from the list
        setData(prev => ({
          ...prev,
          actionItemsDashboard: prev.actionItemsDashboard ? {
            ...prev.actionItemsDashboard,
            total_pending: prev.actionItemsDashboard.total_pending - 1,
            items: prev.actionItemsDashboard.items.filter(item => item.id !== itemId),
          } : null,
        }))
      }
    } catch (error) {
      console.error('Failed to complete item:', error)
    } finally {
      setCompletingItem(null)
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

  const { student, enrollments, upcomingAssignments, announcements, holdsSummary, actionItemsDashboard } = data

  // Calculate real stats from the data
  const gpa = student?.gpa || 'N/A'
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled')
  const totalCredits = student?.total_credits_earned || 0
  const creditsInProgress = activeEnrollments.reduce((sum, e) => sum + (e.course_section?.course?.credits || 3), 0)
  const requiredCredits = student?.major_program?.credits_required || 120
  const completionPercentage = requiredCredits > 0 ? Math.round((totalCredits / requiredCredits) * 100) : 0

  // Check for critical holds
  const hasActiveHolds = holdsSummary && holdsSummary.active > 0
  const hasCriticalHold = holdsSummary?.holds?.some(h => h.severity === 'critical')
  const hasRegistrationHold = holdsSummary?.has_registration_hold

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Holds Alert Banner */}
        {hasActiveHolds && (
          <div className={`rounded-lg border p-4 ${
            hasCriticalHold
              ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${hasCriticalHold ? 'text-red-600' : 'text-amber-600'}`}>
                {hasCriticalHold ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${hasCriticalHold ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}`}>
                  {hasCriticalHold ? 'Critical Hold on Your Account' : 'You Have Active Holds'}
                </h3>
                <p className={`text-sm mt-1 ${hasCriticalHold ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                  {hasRegistrationHold
                    ? 'A hold is preventing you from registering for classes. Please resolve this immediately.'
                    : `You have ${holdsSummary.active} active hold${holdsSummary.active > 1 ? 's' : ''} on your account.`
                  }
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    variant={hasCriticalHold ? 'destructive' : 'default'}
                    size="sm"
                    asChild
                  >
                    <Link href="/student/holds">
                      View Holds
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  {holdsSummary.holds.slice(0, 2).map(hold => (
                    <Badge
                      key={hold.id}
                      variant={hold.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {hold.department || hold.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {student?.preferred_name || student?.first_name || 'Student'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {student?.student_number && (
              <Badge variant="outline" className="font-mono">
                {student.student_number}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{gpa}</p>
                  <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{creditsInProgress}</p>
                  <p className="text-xs text-muted-foreground">Credits This Term</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completionPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Degree Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${student?.financial_hold ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                  <DollarSign className={`h-5 w-5 ${student?.financial_hold ? 'text-red-500' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${student?.financial_hold ? 'text-red-500' : ''}`}>
                    {student?.financial_hold ? 'Hold' : 'Clear'}
                  </p>
                  <p className="text-xs text-muted-foreground">Account Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* To-Do List - Primary Focus */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  To-Do List
                </CardTitle>
                <CardDescription>
                  {actionItemsDashboard?.total_pending || 0} items need your attention
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/holds">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!actionItemsDashboard || actionItemsDashboard.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium text-foreground">All caught up!</p>
                  <p className="text-sm">You have no pending action items.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Overdue warning */}
                  {actionItemsDashboard.overdue_count > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-3 pb-3 border-b">
                      <AlertCircle className="h-4 w-4" />
                      <span>{actionItemsDashboard.overdue_count} overdue item{actionItemsDashboard.overdue_count > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {actionItemsDashboard.items.map((item) => {
                    const isOverdue = item.due_date && isPast(new Date(item.due_date))
                    const isDueToday = item.due_date && isToday(new Date(item.due_date))
                    const isDueTomorrow = item.due_date && isTomorrow(new Date(item.due_date))

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                          isOverdue ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50' : ''
                        }`}
                      >
                        <Checkbox
                          checked={false}
                          disabled={completingItem === item.id}
                          onCheckedChange={() => handleCompleteItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            {item.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                            {item.priority === 'high' && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">High</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {item.due_date && (
                              <span className={`text-xs flex items-center gap-1 ${
                                isOverdue
                                  ? 'text-red-600 font-medium'
                                  : isDueToday
                                    ? 'text-amber-600 font-medium'
                                    : isDueTomorrow
                                      ? 'text-amber-500'
                                      : 'text-muted-foreground'
                              }`}>
                                <Clock className="h-3 w-3" />
                                {isOverdue
                                  ? `Overdue by ${formatDistanceToNow(new Date(item.due_date))}`
                                  : isDueToday
                                    ? 'Due today'
                                    : isDueTomorrow
                                      ? 'Due tomorrow'
                                      : `Due ${format(new Date(item.due_date), 'MMM d')}`
                                }
                              </span>
                            )}
                            {item.action_url && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                <Link href={item.action_url}>
                                  {item.action_label || 'Take Action'}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        <ActionItemIcon type={item.type} />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Next Class */}
            {activeEnrollments.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Your Classes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeEnrollments.slice(0, 4).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {enrollment.course_section?.course?.course_code}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {enrollment.course_section?.course?.title}
                        </p>
                      </div>
                      {enrollment.grade && (
                        <Badge variant="outline" className="ml-2">
                          {enrollment.grade}
                        </Badge>
                      )}
                    </div>
                  ))}
                  <Separator />
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/student/schedule">
                      View Full Schedule
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Degree Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Degree Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Credits Earned</span>
                    <span className="font-medium">{totalCredits} / {requiredCredits}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Program</dt>
                    <dd className="font-medium text-right max-w-[140px] truncate">
                      {student?.major_program?.name || 'Undeclared'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Standing</dt>
                    <dd className="font-medium capitalize">{student?.class_standing || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Expected Graduation</dt>
                    <dd className="font-medium">
                      {student?.expected_graduation_date
                        ? format(new Date(student.expected_graduation_date), 'MMM yyyy')
                        : 'N/A'
                      }
                    </dd>
                  </div>
                </dl>
                <Separator />
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/student/degree-audit">
                    View Degree Audit
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Assignments & Announcements */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                    const dueDate = new Date(assignment.due_date)
                    const isUrgent = dueDate.getTime() - Date.now() < 48 * 60 * 60 * 1000
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcements
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
      </div>
    </AppShell>
  )
}

// Helper component for action item type icons
function ActionItemIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4 text-muted-foreground"
  switch (type) {
    case 'registration':
      return <BookOpen className={iconClass} />
    case 'financial_aid':
      return <Award className={iconClass} />
    case 'payment':
      return <CreditCard className={iconClass} />
    case 'document':
      return <FileText className={iconClass} />
    case 'advising':
      return <GraduationCap className={iconClass} />
    case 'graduation':
      return <GraduationCap className={iconClass} />
    default:
      return <Info className={iconClass} />
  }
}
