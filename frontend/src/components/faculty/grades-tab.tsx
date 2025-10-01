"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Upload, Save } from "lucide-react"

export function GradesTab() {
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
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Gradebook */}
      <Card>
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter and manage student grades for assignments, exams, and final grades
            </p>
            {/* TODO: Gradebook table with students rows, assignment columns */}
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Grades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
