"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Users, AlertCircle, CheckCircle } from "lucide-react"

export function AdvisingTab() {
  return (
    <div className="space-y-6">
      {/* Advising Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Advisees"
          value="23"
          description="Assigned students"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="At-Risk Students"
          value="3"
          description="Need attention"
          icon={<AlertCircle className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="On Track"
          value="20"
          description="Meeting requirements"
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Advising Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Advising Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View and add notes from student advising meetings
          </p>
          {/* TODO: Notes list with student name, date, summary */}
        </CardContent>
      </Card>

      {/* Degree Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Degree Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Review degree progress for advisees
          </p>
          {/* TODO: List of advisees with completion percentage */}
        </CardContent>
      </Card>
    </div>
  )
}
