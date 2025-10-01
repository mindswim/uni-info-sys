"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/layouts"
import { GraduationCap, Briefcase, DollarSign, Mail } from "lucide-react"

export function AlumniTab() {
  return (
    <div className="space-y-6">
      {/* Alumni Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alumni"
          value="15,432"
          description="All graduates"
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          title="Employment Rate"
          value="94%"
          description="Within 6 months"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Donations This Year"
          value="$234K"
          description="From 456 alumni"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Engagement Rate"
          value="67%"
          description="Active in events"
          icon={<Mail className="h-4 w-4" />}
        />
      </div>

      {/* Alumni Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Alumni Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Search and manage alumni records, employment, and engagement
          </p>
          {/* TODO: Alumni table with graduation year, degree, employer, contact status */}
        </CardContent>
      </Card>

      {/* Alumni Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Alumni Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage alumni communications and events
            </p>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Send Newsletter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
