"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, BookOpen, ClipboardCheck, TrendingUp, FileText, Megaphone, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format, formatDistanceToNow, isPast } from "date-fns"

interface DashboardData {
  sections: any[]
  pendingSubmissions: number
  upcomingDeadlines: any[]
  announcements: any[]
}

export function OverviewTab() {
  const [data, setData] = useState<DashboardData>({
    sections: [],
    pendingSubmissions: 0,
    upcomingDeadlines: [],
    announcements: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = sessionStorage.getItem('auth_token')
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }

        // Fetch sections
        const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff/me/sections`, { headers })
        const sections = sectionsRes.ok ? (await sectionsRes.json()).data || [] : []

        // Fetch announcements created by this faculty
        const announcementsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/me/created`, { headers })
          .catch(() => null)
        const announcements = announcementsRes?.ok ? (await announcementsRes.json()).data || [] : []

        // Fetch assignments for each section to find upcoming deadlines and pending submissions
        let pendingSubmissions = 0
        const allDeadlines: any[] = []

        for (const section of sections) {
          try {
            const assignmentsRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${section.id}/assignments`,
              { headers }
            )
            if (assignmentsRes.ok) {
              const assignmentsData = (await assignmentsRes.json()).data || []
              for (const assignment of assignmentsData) {
                // Count pending submissions (submission_count - graded_count)
                const pending = (assignment.submission_count || 0) - (assignment.graded_count || 0)
                pendingSubmissions += pending

                // Add upcoming deadlines
                if (assignment.is_published && !isPast(new Date(assignment.due_at))) {
                  allDeadlines.push({
                    ...assignment,
                    course_code: section.course?.course_code || section.course?.code,
                    section_number: section.section_number,
                  })
                }
              }
            }
          } catch {
            // Ignore individual section errors
          }
        }

        // Sort deadlines by due date and take top 5
        const upcomingDeadlines = allDeadlines
          .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
          .slice(0, 5)

        setData({
          sections,
          pendingSubmissions,
          upcomingDeadlines,
          announcements: announcements.slice(0, 3),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
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
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { sections, pendingSubmissions, upcomingDeadlines, announcements } = data

  // Calculate stats from sections
  const totalStudents = sections.reduce((sum: number, section: any) => sum + (section.enrolled_count || 0), 0)
  const activeSections = sections.length
  const totalCapacity = sections.reduce((sum: number, s: any) => sum + (s.capacity || s.max_enrollment || 30), 0)
  const fillRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your courses and students
        </p>
      </div>

      {/* Faculty Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSections}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingSubmissions > 0 ? 'text-amber-600' : ''}`}>
              {pendingSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">Submissions to grade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fillRate}%</div>
            <p className="text-xs text-muted-foreground">Average capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines & Announcements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/faculty/assignments">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((assignment: any) => {
                  const dueDate = new Date(assignment.due_at)
                  const isUrgent = dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{assignment.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.course_code} - Section {assignment.section_number}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {isUrgent && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        <div className="text-right">
                          <div className={`text-sm font-medium ${isUrgent ? 'text-amber-600' : ''}`}>
                            {format(dueDate, 'MMM d, h:mm a')}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Your Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/faculty/announcements">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No announcements posted</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/faculty/announcements">Create One</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement: any) => (
                  <div key={announcement.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{announcement.title}</div>
                      {announcement.priority === 'urgent' && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      {announcement.priority === 'important' && (
                        <Badge variant="secondary">Important</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Posted {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sections Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Sections</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/faculty/sections">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No sections assigned</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section: any) => (
                <Link
                  key={section.id}
                  href={`/faculty/sections?id=${section.id}`}
                  className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">
                    {section.course?.course_code || section.course?.code} - Section {section.section_number}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {section.course?.title || section.course?.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">
                      <Users className="h-3 w-3 inline mr-1" />
                      {section.enrolled_count || 0} / {section.capacity || section.max_enrollment || 30}
                    </span>
                    <Badge variant={section.status === 'active' ? 'default' : 'secondary'}>
                      {section.status || 'active'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
