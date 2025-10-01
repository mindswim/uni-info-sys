"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { facultyService } from "@/services"
import type { CourseSection } from "@/types/api-types"

export function OverviewTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const sectionsData = await facultyService.getMySections()
        setSections(sectionsData)
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

  // Calculate stats from sections
  const totalStudents = sections.reduce((sum, section) => sum + (section.enrolled_count || 0), 0)
  const activeSections = sections.length

  return (
    <div className="space-y-6">
      {/* Faculty Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toString()}
          description="Across all sections"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active Sections"
          value={activeSections.toString()}
          description="This semester"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Average Enrollment"
          value={activeSections > 0 ? Math.round(totalStudents / activeSections).toString() : "0"}
          description="Per section"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Capacity"
          value={`${Math.round((totalStudents / sections.reduce((sum, s) => sum + (s.max_enrollment || 0), 0)) * 100)}%`}
          description="Average fill rate"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections assigned</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{section.course?.code} - {section.course?.name}</p>
                    <p className="text-sm text-muted-foreground">Section {section.section_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{section.enrolled_count || 0} / {section.max_enrollment || 0}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
