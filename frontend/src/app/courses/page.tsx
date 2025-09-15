"use client"

import { useState, useEffect } from 'react'
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Clock,
  Users
} from "lucide-react"
import UniversityAPI, { Course, ApiResponse } from "@/lib/university-api"

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Courses" }
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)

  useEffect(() => {
    loadCourses()
  }, [currentPage, programFilter, searchTerm])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        per_page: 20
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (programFilter && programFilter !== 'all') {
        params.program_id = programFilter
      }

      // Use demo endpoint for now since authentication isn't set up
      const response = await fetch('http://localhost:8001/api/demo/courses')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform demo data to match expected format
      const transformedCourses = data.data.map((course: any) => ({
        id: course.id,
        course_code: course.course_code,
        title: course.title,
        description: course.description,
        credits: course.credits,
        is_core: true, // Default value
        program: {
          department: {
            name: course.department
          }
        },
        sections: course.sections
      }))

      setCourses(transformedCourses)
      setTotalPages(1) // Demo only has one page
      setTotalCourses(data.data.length)
      
    } catch (err) {
      console.error('Failed to load courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Course Catalog
          </h1>
          <p className="text-muted-foreground">
            Browse all courses offered by the university
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by code, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="1">Computer Science</SelectItem>
                <SelectItem value="2">Mathematics</SelectItem>
                <SelectItem value="3">Physics</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadCourses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({totalCourses})</CardTitle>
          <CardDescription>
            Showing page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || programFilter !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'No courses available in the catalog'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Sections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{course.course_code}</div>
                          <div className="text-sm font-medium">{course.title}</div>
                          {course.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {course.program?.department?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {course.credits} credits
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.is_core ? "default" : "outline"}>
                          {course.is_core ? 'Core' : 'Elective'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {course.sections?.length || 0} sections
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCourses)} of {totalCourses} courses
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AppShell>
  )
}