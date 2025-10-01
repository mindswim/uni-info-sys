"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Users, Calendar, MapPin, BookOpen } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface CourseSection {
  id: number
  section_number: string
  capacity: number
  status: string
  enrolled_count: number
  available_spots: number
  schedule_display: string
  course: {
    id: number
    course_code: string
    title: string
    credits: number
  }
  term: {
    id: number
    name: string
    semester: string
  }
  room: {
    room_number: string
    building: {
      name: string
    }
  }
  enrollments: Array<{
    id: number
    student: {
      id: number
      student_number: string
      name: string
      email: string
    }
    grade: string | null
    status: string
  }>
}

export function SectionsTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/staff/me/sections')
        setSections(response.data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sections')
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-48 w-full" />
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

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No sections assigned yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">My Teaching Sections</h3>
          <p className="text-sm text-muted-foreground">
            {sections.length} section{sections.length !== 1 ? 's' : ''} this term
          </p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {section.course?.course_code} - {section.course?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Section {section.section_number} • {section.term?.name}
                  </p>
                </div>
                <Badge variant={section.status === 'open' ? 'default' : 'secondary'}>
                  {section.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment</p>
                    <p className="text-lg font-semibold">
                      {section.enrolled_count}/{section.capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="text-sm font-medium">
                      {section.schedule_display}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {section.room?.building?.name}, Room {section.room?.room_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-lg font-semibold">{section.course?.credits}</p>
                  </div>
                </div>
              </div>

              {/* Student List */}
              {section.enrollments && section.enrollments.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium mb-3">Enrolled Students ({section.enrollments.length})</h4>
                  <div className="space-y-2">
                    {section.enrollments.slice(0, 5).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{enrollment.student?.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{enrollment.student?.student_number}</span>
                            <span>{enrollment.student?.email}</span>
                          </div>
                        </div>
                        <Badge variant={enrollment.grade ? 'default' : 'secondary'}>
                          {enrollment.grade || 'In Progress'}
                        </Badge>
                      </div>
                    ))}
                    {section.enrollments.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        And {section.enrollments.length - 5} more student{section.enrollments.length - 5 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
