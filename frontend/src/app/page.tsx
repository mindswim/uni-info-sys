'use client'

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import UniversityAPI from "@/lib/university-api"
import { API_CONFIG } from "@/config/api"


const breadcrumbs = [
  { label: "Dashboard" }
]

interface DashboardStats {
  total_students: number
  active_courses: number
  pending_applications: number
  total_enrollments: number
  departments: number
  pending_grades: number
  active_staff: number
  available_reports: number
}

interface RecentActivity {
  type: string
  message: string
  timestamp: string
}

interface TermInfo {
  name: string
  start_date: string
  end_date: string
  add_drop_deadline: string
}

interface DashboardData {
  stats: DashboardStats
  recent_activity: RecentActivity[]
  current_term: TermInfo
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      total_students: 0,
      active_courses: 0,
      pending_applications: 0,
      total_enrollments: 0,
      departments: 0,
      pending_grades: 0,
      active_staff: 0,
      available_reports: 0
    },
    recent_activity: [],
    current_term: {
      name: '',
      start_date: '',
      end_date: '',
      add_drop_deadline: ''
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Use the real demo dashboard API
        const response = await fetch(API_CONFIG.DEMO.DASHBOARD)

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])
  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : dashboardData.stats.total_students.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Active students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : dashboardData.stats.active_courses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Courses in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : dashboardData.stats.pending_applications.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Requiring review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : dashboardData.stats.total_enrollments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system activity and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </>
              ) : (
                dashboardData.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    <Badge
                      variant={
                        activity.type.includes('application') ? 'default' :
                        activity.type.includes('enrollment') ? 'secondary' :
                        'outline'
                      }
                      className="ml-2 text-xs"
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Capacity</CardTitle>
              <CardDescription>
                Courses approaching maximum enrollment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">CS 350 - AI Introduction</p>
                  <p className="text-xs text-muted-foreground">48/50 enrolled</p>
                </div>
                <Badge variant="destructive">96%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">MATH 201 - Statistics</p>
                  <p className="text-xs text-muted-foreground">42/50 enrolled</p>
                </div>
                <Badge variant="outline">84%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">ENG 101 - Composition</p>
                  <p className="text-xs text-muted-foreground">38/45 enrolled</p>
                </div>
                <Badge variant="secondary">84%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Term</CardTitle>
              <CardDescription>
                Academic term information and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Term</p>
                    <Badge className="bg-blue-600">{dashboardData.current_term.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Start Date</p>
                    <span className="text-sm text-muted-foreground">
                      {new Date(dashboardData.current_term.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">End Date</p>
                    <span className="text-sm text-muted-foreground">
                      {new Date(dashboardData.current_term.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Add/Drop Deadline</p>
                    <Badge variant="outline">
                      {new Date(dashboardData.current_term.add_drop_deadline).toLocaleDateString()}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
