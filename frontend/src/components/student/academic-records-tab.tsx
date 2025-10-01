"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Award, TrendingUp, BookOpen, Target } from "lucide-react"

export function AcademicRecordsTab() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current GPA"
          value="3.75"
          description="Cumulative GPA"
          icon={<Award className="h-4 w-4" />}
          trend={{ value: 5, label: "from last semester" }}
        />
        <StatCard
          title="Credits Earned"
          value="87"
          description="Out of 120 required"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Dean's List"
          value="3x"
          description="Semesters on list"
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="Class Rank"
          value="Top 15%"
          description="Of graduating class"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Academic Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are on track to graduate in Spring 2025. Maintain your GPA above 3.5 to remain on the Dean&apos;s List.
            </p>
            {/* TODO: Add progress bars, semester breakdown, course history */}
          </div>
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Grade information will be displayed here.</p>
          {/* TODO: Connect to backend API */}
        </CardContent>
      </Card>
    </div>
  )
}
