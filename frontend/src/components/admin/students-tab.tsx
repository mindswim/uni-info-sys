"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Users, UserPlus, Search, UserCheck, UserX, GraduationCap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { studentService } from "@/services"
import type { Student } from "@/types/api-types"

export function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const data = await studentService.getAll()
        setStudents(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.enrollment_status === 'active').length
  const inactiveStudents = students.filter(s => s.enrollment_status === 'inactive' || s.enrollment_status === 'suspended').length
  const graduatedStudents = students.filter(s => s.enrollment_status === 'graduated').length

  // Filter students by search term
  const filteredStudents = students.filter(student =>
    student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents.toString()}
          description="All students"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active"
          value={activeStudents.toString()}
          description="Currently enrolled"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Inactive"
          value={inactiveStudents.toString()}
          description="On leave/suspended"
          icon={<UserX className="h-4 w-4" />}
        />
        <StatCard
          title="Graduated"
          value={graduatedStudents.toString()}
          description="Completed program"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredStudents.slice(0, 20).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{student.user?.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>ID: {student.student_number}</span>
                      <span>GPA: {student.gpa?.toFixed(2) || 'N/A'}</span>
                      <span>{student.user?.email}</span>
                    </div>
                  </div>
                  <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}>
                    {student.enrollment_status}
                  </Badge>
                </div>
              ))}
              {filteredStudents.length > 20 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Showing 20 of {filteredStudents.length} students
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
