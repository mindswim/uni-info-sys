"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export function AttendanceTab() {
  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="flex items-center gap-4">
        <Select>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cs101-01">CS 101 - Section 01</SelectItem>
            <SelectItem value="cs201-01">CS 201 - Section 01</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mark attendance for selected section and date
            </p>
            {/* TODO: Student roster with present/absent/late checkboxes */}
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
