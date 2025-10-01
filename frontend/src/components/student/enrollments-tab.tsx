"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layouts"
import { BookOpen } from "lucide-react"

export function EnrollmentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No active enrollments"
            description="Enroll in courses to see them listed here"
          />
          {/* TODO: List enrolled courses, connect to API */}
        </CardContent>
      </Card>
    </div>
  )
}
