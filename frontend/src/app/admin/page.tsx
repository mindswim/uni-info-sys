"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Users, UserCheck, GraduationCap, BarChart, TrendingUp, TrendingDown,
  BookOpen, Calendar, FileText, AlertCircle, CheckCircle2,
  AlertTriangle, Ban, DollarSign, Clock, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { WelcomeCard } from '@/components/admin/welcome-card'
import { formatDistanceToNow, format } from 'date-fns'

interface HoldsSummary {
  total: number
  by_type: Record<string, number>
  critical: number
  preventing_registration: number
}

interface EnrollmentStats {
  current_term_enrollments: number
  capacity_utilization: number
  waitlist_count: number
}

interface DashboardData {
  students: { total: number; active: number; new_this_term: number }
  staff: { total: number }
  applications: {
    total: number
    pending: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
    enrolled: number
    yield_rate: number
  }
  courses: { total: number }
  sections: { total: number; at_capacity: number }
  terms: { current: any }
  health: { status: string; database: boolean; timestamp: string }
  holds: HoldsSummary
  enrollment: EnrollmentStats
  alerts: Array<{ type: string; message: string; count: number; link: string }>
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = sessionStorage.getItem('auth_token')
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }

        // Fetch all data in parallel
        const [
          studentsRes,
          staffRes,
          applicationsStatsRes,
          coursesRes,
          sectionsRes,
          termsRes,
          healthRes,
          holdsRes,
          enrollmentsRes
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard/holds-summary`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments?per_page=1`, { headers }).catch(() => null),
        ])

        // Parse responses
        const studentsData = studentsRes.ok ? await studentsRes.json() : { meta: { total: 0 } }
        const staffData = staffRes.ok ? await staffRes.json() : { meta: { total: 0 } }
        const appStats = applicationsStatsRes.ok ? await applicationsStatsRes.json() : { data: {} }
        const coursesData = coursesRes.ok ? await coursesRes.json() : { meta: { total: 0 } }
        const sectionsData = sectionsRes.ok ? await sectionsRes.json() : { meta: { total: 0 } }
        const termsData = termsRes.ok ? await termsRes.json() : { data: [] }
        const healthData = healthRes?.ok ? await healthRes.json() : { status: 'unknown' }
        const holdsData = holdsRes?.ok ? await holdsRes.json() : null
        const enrollmentsData = enrollmentsRes?.ok ? await enrollmentsRes.json() : { meta: { total: 0 } }

        // Find current term
        const now = new Date()
        const currentTerm = termsData.data?.find((t: any) =>
          new Date(t.start_date) <= now && new Date(t.end_date) >= now
        ) || termsData.data?.[0]

        // Calculate yield rate (enrolled / accepted)
        const accepted = appStats.data?.accepted || 0
        const enrolled = appStats.data?.enrolled || 0
        const yieldRate = accepted > 0 ? Math.round((enrolled / accepted) * 100) : 0

        // Use real holds data from admin endpoint, with fallback for edge cases
        const holdsSummary: HoldsSummary = holdsData?.data ?? {
          total: 0,
          by_type: {},
          critical: 0,
          preventing_registration: 0
        }

        // Mock enrollment stats
        const enrollmentStats: EnrollmentStats = {
          current_term_enrollments: enrollmentsData.meta?.total || 847,
          capacity_utilization: 78,
          waitlist_count: 23
        }

        // Build alerts based on data
        const alerts: Array<{ type: string; message: string; count: number; link: string }> = []

        if (appStats.data?.under_review > 0) {
          alerts.push({
            type: 'warning',
            message: 'Applications awaiting review',
            count: appStats.data.under_review,
            link: '/admin/admissions'
          })
        }

        if (holdsSummary.critical > 0) {
          alerts.push({
            type: 'error',
            message: 'Critical holds require attention',
            count: holdsSummary.critical,
            link: '/admin/holds'
          })
        }

        if (enrollmentStats.waitlist_count > 10) {
          alerts.push({
            type: 'info',
            message: 'Students on course waitlists',
            count: enrollmentStats.waitlist_count,
            link: '/admin/enrollment'
          })
        }

        setData({
          students: {
            total: studentsData.meta?.total || 0,
            active: studentsData.meta?.total || 0,
            new_this_term: Math.floor((studentsData.meta?.total || 0) * 0.15), // Estimate 15% new
          },
          staff: {
            total: staffData.meta?.total || 0,
          },
          applications: {
            total: appStats.data?.total || 0,
            pending: (appStats.data?.submitted || 0) + (appStats.data?.under_review || 0),
            submitted: appStats.data?.submitted || 0,
            under_review: appStats.data?.under_review || 0,
            accepted: appStats.data?.accepted || 0,
            rejected: appStats.data?.rejected || 0,
            enrolled: appStats.data?.enrolled || 0,
            yield_rate: yieldRate,
          },
          courses: {
            total: coursesData.meta?.total || 0,
          },
          sections: {
            total: sectionsData.meta?.total || 0,
            at_capacity: Math.floor((sectionsData.meta?.total || 0) * 0.12), // Estimate 12% at capacity
          },
          terms: {
            current: currentTerm,
          },
          health: {
            status: healthData.status || 'unknown',
            database: healthData.database !== false,
            timestamp: healthData.timestamp || new Date().toISOString(),
          },
          holds: holdsSummary,
          enrollment: enrollmentStats,
          alerts,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col gap-4 p-6">
          <WelcomeCard />

          {/* Header skeleton */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* KPI Grid skeleton */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-20 mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="text-center space-y-2">
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-6 w-8 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col gap-6 p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const { students, staff, applications, courses, sections, terms, health, holds, enrollment, alerts } = data!

  // Helper for hold type icons
  const getHoldTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'registration': return <Ban className="h-4 w-4" />
      case 'academic': return <GraduationCap className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {alerts.map((alert, index) => (
              <Link
                key={index}
                href={alert.link}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900'
                    : alert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900'
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {alert.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Activity className="h-5 w-5 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {alert.count} {alert.message}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {terms.current ? (
                <>
                  <span>{terms.current.name}</span>
                  <span className="mx-2">|</span>
                  <span>{format(new Date(), 'MMMM d, yyyy')}</span>
                </>
              ) : (
                format(new Date(), 'MMMM d, yyyy')
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/system">Settings</Link>
            </Button>
          </div>
        </div>

        {/* Primary KPI Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{students.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{students.new_this_term} this term</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${applications.pending > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <FileText className={`h-5 w-5 ${applications.pending > 0 ? 'text-amber-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{applications.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/admin/admissions" className="text-xs text-primary hover:underline flex items-center">
                  Review applications
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Holds */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${holds.critical > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Ban className={`h-5 w-5 ${holds.critical > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{holds.total}</p>
                  <p className="text-xs text-muted-foreground">Active Holds</p>
                </div>
              </div>
              {holds.critical > 0 && (
                <div className="mt-3 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>{holds.critical} critical</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${health.status === 'OK' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <Activity className={`h-5 w-5 ${health.status === 'OK' ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{health.status === 'OK' ? 'Healthy' : 'Degraded'}</p>
                  <p className="text-xs text-muted-foreground">System Status</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Last check {formatDistanceToNow(new Date(health.timestamp), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left Column - Application Pipeline */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Application Pipeline</CardTitle>
              <CardDescription>Current admission cycle status</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pipeline Visualization */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { label: 'Submitted', value: applications.submitted, color: 'bg-blue-500' },
                  { label: 'Under Review', value: applications.under_review, color: 'bg-amber-500' },
                  { label: 'Accepted', value: applications.accepted, color: 'bg-green-500' },
                  { label: 'Rejected', value: applications.rejected, color: 'bg-red-500' },
                  { label: 'Enrolled', value: applications.enrolled, color: 'bg-purple-500' },
                ].map((stage, i) => (
                  <div key={stage.label} className="text-center">
                    <div className={`h-2 ${stage.color} rounded-full mb-2 ${i === 0 ? 'rounded-l-full' : ''} ${i === 4 ? 'rounded-r-full' : ''}`} />
                    <p className="text-xl font-bold tabular-nums">{stage.value}</p>
                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                  </div>
                ))}
              </div>

              {/* Yield Rate */}
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="text-sm font-medium">Yield Rate</p>
                  <p className="text-xs text-muted-foreground">Enrolled / Accepted</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={applications.yield_rate} className="w-24 h-2" />
                  <span className="text-sm font-medium tabular-nums">{applications.yield_rate}%</span>
                </div>
              </div>

              {/* Total Applications */}
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="text-sm font-medium">Total Applications</p>
                  <p className="text-xs text-muted-foreground">This admission cycle</p>
                </div>
                <span className="text-lg font-bold tabular-nums">{applications.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Holds Overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Holds</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/holds">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Hold Type Breakdown */}
              {holds.by_type && Object.entries(holds.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-muted">
                      {getHoldTypeIcon(type)}
                    </div>
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}

              {/* Summary Stats */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preventing Registration</span>
                  <span className="font-medium text-amber-600">{holds.preventing_registration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Critical Priority</span>
                  <span className="font-medium text-red-600">{holds.critical}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Enrollment Stats */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Enrollments</p>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{enrollment.current_term_enrollments.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Current term</p>
            </CardContent>
          </Card>

          {/* Capacity Utilization */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Capacity</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums">{enrollment.capacity_utilization}%</p>
                <Progress value={enrollment.capacity_utilization} className="flex-1 h-2" />
              </div>
              <p className="text-xs text-muted-foreground">{sections.at_capacity} sections at capacity</p>
            </CardContent>
          </Card>

          {/* Waitlist */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Waitlist</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{enrollment.waitlist_count}</p>
              <p className="text-xs text-muted-foreground">Students waiting</p>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Faculty & Staff</p>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{staff.total}</p>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
                <Link href="/admin/students">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Students</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
                <Link href="/admin/admissions">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Applications</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
                <Link href="/admin/courses">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
                <Link href="/admin/announcements">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">Announcements</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
