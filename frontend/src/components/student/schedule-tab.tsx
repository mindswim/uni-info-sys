"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layouts"
import { Calendar } from "lucide-react"

export function ScheduleTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="No classes scheduled"
            description="Your schedule will appear here once courses are enrolled"
          />
          {/* TODO: Add weekly calendar view, connect to API */}
        </CardContent>
      </Card>
    </div>
  )
}
