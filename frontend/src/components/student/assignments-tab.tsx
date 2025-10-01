"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layouts"
import { Clock } from "lucide-react"

export function AssignmentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Clock className="h-12 w-12" />}
            title="No assignments due"
            description="You&apos;re all caught up! Check back later for new assignments."
          />
          {/* TODO: Assignment list with due dates, submission status */}
        </CardContent>
      </Card>
    </div>
  )
}
