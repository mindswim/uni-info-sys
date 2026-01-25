"use client"

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, GraduationCap, BarChart, TrendingUp, BookOpen, Calendar, Building, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { WelcomeCard } from '@/components/admin/welcome-card'
import { formatDistanceToNow } from 'date-fns'

interface DashboardData {
  students: { total: number; active: number }
  staff: { total: number }
  applications: {
    total: number
    pending: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
    enrolled: number
  }
  courses: { total: number }
  sections: { total: number }
  terms: { current: any }
  health: { status: string; database: boolean; timestamp: string }
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
          healthRes
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/students?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admission-applications/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections?per_page=1`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`).catch(() => null),
        ])

        // Parse responses
        const studentsData = studentsRes.ok ? await studentsRes.json() : { meta: { total: 0 } }
        const staffData = staffRes.ok ? await staffRes.json() : { meta: { total: 0 } }
        const appStats = applicationsStatsRes.ok ? await applicationsStatsRes.json() : { data: {} }
        const coursesData = coursesRes.ok ? await coursesRes.json() : { meta: { total: 0 } }
        const sectionsData = sectionsRes.ok ? await sectionsRes.json() : { meta: { total: 0 } }
        const termsData = termsRes.ok ? await termsRes.json() : { data: [] }
        const healthData = healthRes?.ok ? await healthRes.json() : { status: 'unknown' }

        // Find current term
        const now = new Date()
        const currentTerm = termsData.data?.find((t: any) =>
          new Date(t.start_date) <= now && new Date(t.end_date) >= now
        ) || termsData.data?.[0]

        setData({
          students: {
            total: studentsData.meta?.total || 0,
            active: studentsData.meta?.total || 0, // All returned are active by default
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
          },
          courses: {
            total: coursesData.meta?.total || 0,
          },
          sections: {
            total: sectionsData.meta?.total || 0,
          },
          terms: {
            current: currentTerm,
          },
          health: {
            status: healthData.status || 'unknown',
            database: healthData.database !== false,
            timestamp: healthData.timestamp || new Date().toISOString(),
          },
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
        <div className="flex flex-col gap-6 p-6">
          <WelcomeCard />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
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

  const { students, staff, applications, courses, sections, terms, health } = data!

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Overview</h1>
            <p className="text-muted-foreground">
              System-wide administration and management
              {terms.current && (
                <span className="ml-2">
                  <Badge variant="outline">{terms.current.name}</Badge>
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/system">System Settings</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active students enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${applications.pending > 0 ? 'text-amber-600' : ''}`}>
                {applications.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                {applications.submitted} submitted, {applications.under_review} under review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty & Staff</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.total}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {health.status === 'OK' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">Healthy</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-600">Degraded</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.total}</div>
              <p className="text-xs text-muted-foreground">Total courses in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sections.total}</div>
              <p className="text-xs text-muted-foreground">Active course sections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.total}</div>
              <p className="text-xs text-muted-foreground">
                {applications.accepted} accepted, {applications.enrolled} enrolled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/students">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/admissions">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Review Applications
                  {applications.pending > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {applications.pending}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Submitted</span>
                <Badge variant="outline">{applications.submitted}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Under Review</span>
                <Badge variant="secondary">{applications.under_review}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Accepted</span>
                <Badge className="bg-green-100 text-green-800">{applications.accepted}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Enrolled</span>
                <Badge>{applications.enrolled}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>API Server</span>
                <span className={`font-medium ${health.status === 'OK' ? 'text-green-600' : 'text-amber-600'}`}>
                  {health.status === 'OK' ? 'Operational' : 'Degraded'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Database</span>
                <span className={`font-medium ${health.database ? 'text-green-600' : 'text-red-600'}`}>
                  {health.database ? 'Operational' : 'Error'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Check</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(health.timestamp), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
