"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function MyStudentsTab() {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search advisees..." className="pl-9" />
        </div>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Advisees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            List of assigned students with academic status, contact info, and advising notes
          </p>
          {/* TODO: Student table with GPA, credits, status, last meeting */}
        </CardContent>
      </Card>
    </div>
  )
}
