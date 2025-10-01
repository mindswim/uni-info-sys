"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

export function GradesTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-5 w-5" />
            <p className="text-sm">Grade details will be displayed here</p>
          </div>
          {/* TODO: Semester grades, course breakdown, grade trends */}
        </CardContent>
      </Card>
    </div>
  )
}
