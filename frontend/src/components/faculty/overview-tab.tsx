"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react"

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Faculty Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="87"
          description="Across all sections"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active Sections"
          value="4"
          description="This semester"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Advisees"
          value="23"
          description="Assigned students"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Attendance Rate"
          value="94%"
          description="Average across sections"
          icon={<ClipboardCheck className="h-4 w-4" />}
          trend={{ value: 3, label: "from last week" }}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Activity feed will be displayed here</p>
          {/* TODO: Recent grades entered, attendance taken, student meetings */}
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Class schedule for today</p>
          {/* TODO: Today's classes with times, rooms, enrollment counts */}
        </CardContent>
      </Card>
    </div>
  )
}
