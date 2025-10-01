"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function SectionsTab() {
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">My Sections</h3>
          <p className="text-sm text-muted-foreground">Manage course sections and enrollments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Section
        </Button>
      </div>

      {/* Section Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Section List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your teaching sections with enrollment, schedule, and room info
            </p>
            {/* TODO: Section cards with enrollment count, meeting times */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
