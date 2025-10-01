"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload } from "lucide-react"

export function CoursesTab() {
  return (
    <div className="space-y-6">
      {/* Course Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload and manage syllabi, assignments, and course resources
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Manage Syllabus
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Materials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Management */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Create and manage course assignments</p>
          {/* TODO: Assignment list, create assignment, submission tracking */}
        </CardContent>
      </Card>
    </div>
  )
}
