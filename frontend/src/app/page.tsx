'use client'

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import UniversityAPI from "@/lib/university-api"


const breadcrumbs = [
  { label: "Dashboard" }
]

interface SystemStats {
  students: number
  staff: number
  courses: number
  enrollments: number
  applications: number
  faculties: number
  departments: number
  programs: number
}

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({
    students: 0,
    staff: 0,
    courses: 0,
    enrollments: 0,
    applications: 0,
    faculties: 0,
    departments: 0,
    programs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const systemStats = await UniversityAPI.getSystemStats()
        setStats(systemStats)
      } catch (error) {
        console.error('Failed to fetch system stats:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
                {loading ? '...' : stats.students.toLocaleString()}
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
                {loading ? '...' : stats.courses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Courses in catalog
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.applications.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Admission applications
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
                {loading ? '...' : stats.enrollments.toLocaleString()}
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
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest student applications requiring review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Maria Rodriguez</p>
                  <p className="text-xs text-muted-foreground">Computer Science</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">David Park</p>
                  <p className="text-xs text-muted-foreground">Engineering</p>
                </div>
                <Badge variant="outline">Under Review</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sophie Turner</p>
                  <p className="text-xs text-muted-foreground">Business</p>
                </div>
                <Badge variant="secondary">Waitlist</Badge>
              </div>
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
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                University management system overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Database</p>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">API Services</p>
                <Badge className="bg-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Backup Status</p>
                <Badge className="bg-green-600">Current</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
