"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

export function AppointmentsTab() {
  return (
    <div className="space-y-6">
      {/* Availability Management */}
      <Card>
        <CardHeader>
          <CardTitle>Office Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your office hours and appointment availability
            </p>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Set Office Hours
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View and manage scheduled student appointments
            </p>
            {/* TODO: Appointment list with student name, time, purpose */}
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
