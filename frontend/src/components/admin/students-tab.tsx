"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Users, UserPlus, Search, UserCheck, UserX, GraduationCap } from "lucide-react"

export function StudentsTab() {
  return (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,234"
          description="All active students"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active"
          value="1,180"
          description="Currently enrolled"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Inactive"
          value="32"
          description="On leave/suspended"
          icon={<UserX className="h-4 w-4" />}
        />
        <StatCard
          title="Graduated"
          value="22"
          description="This semester"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-9" />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comprehensive student list with filters, search, and bulk actions
          </p>
          {/* TODO: Student table with name, ID, status, GPA, major, enrollment date */}
        </CardContent>
      </Card>
    </div>
  )
}
