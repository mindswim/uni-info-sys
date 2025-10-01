"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { FileText, Clock, CheckCircle, XCircle, Users } from "lucide-react"

export function AdmissionsTab() {
  return (
    <div className="space-y-6">
      {/* Admissions Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Applications"
          value="543"
          description="This cycle"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Pending Review"
          value="187"
          description="Awaiting decision"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Accepted"
          value="234"
          description="43% acceptance rate"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Rejected"
          value="98"
          description="18% rejection rate"
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Enrolled"
          value="156"
          description="67% yield rate"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Application Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage applications by status, assign reviewers, and track decisions
          </p>
          {/* TODO: Pipeline view with drag-and-drop between stages */}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Latest submitted applications requiring review
          </p>
          {/* TODO: Application list with applicant name, program, date, reviewer */}
        </CardContent>
      </Card>
    </div>
  )
}
