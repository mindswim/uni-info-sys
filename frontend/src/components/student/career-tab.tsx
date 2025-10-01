"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText, Calendar, Users } from "lucide-react"

export function CareerTab() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Briefcase className="h-5 w-5" />
          <span className="text-sm">Job Search</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Resume Review</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm">Career Fair</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Users className="h-5 w-5" />
          <span className="text-sm">Networking</span>
        </Button>
      </div>

      {/* Recommended Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Job and internship opportunities matching your profile will appear here
          </p>
          {/* TODO: Job listings, application tracking */}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Career Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Career events and workshops will be listed here</p>
          {/* TODO: Event calendar, registration */}
        </CardContent>
      </Card>
    </div>
  )
}
