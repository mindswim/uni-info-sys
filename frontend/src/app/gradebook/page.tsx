"use client"

import { useState, useEffect } from "react"
import { DataPageTemplate } from "@/components/templates/data-page-template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, TrendingUp, Edit, Download, Plus, GraduationCap, Award, BarChart3 } from "lucide-react"
import { facultyService } from "@/services"
import type { CourseSection } from "@/types/api-types"

export default function GradebookPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<CourseSection[]>([])

  useEffect(() => {
    const loadGradebookData = async () => {
      try {
        setLoading(true)
        setError(null)

        const mySections = await facultyService.getMySections()
        setSections(mySections)
      } catch (err) {
        console.error('Failed to load gradebook data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load gradebook')
      } finally {
        setLoading(false)
      }
    }

    loadGradebookData()
  }, [])

  const totalStudents = sections.reduce((sum, s) => sum + (s.enrolled_count || 0), 0)
  const averageEnrollment = sections.length > 0 ? Math.round(totalStudents / sections.length) : 0

  const stats = [
    {
      label: "Active Courses",
      value: sections.length.toString(),
      description: "Courses you're teaching"
    },
    {
      label: "Total Students",
      value: totalStudents.toString(),
      description: "Across all sections"
    },
    {
      label: "Avg Enrollment",
      value: averageEnrollment.toString(),
      description: "Students per course"
    },
    {
      label: "Sections",
      value: sections.length.toString(),
      description: "Active this term"
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Gradebook" }
  ]

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <DataPageTemplate
        title="Gradebook"
        description="Loading gradebook data..."
        stats={[]}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DataPageTemplate>
    )
  }

  if (error) {
    return (
      <DataPageTemplate
        title="Gradebook"
        description="Error loading gradebook"
        stats={[]}
        breadcrumbs={breadcrumbs}
      >
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      </DataPageTemplate>
    )
  }

  return (
    <DataPageTemplate
      title="Gradebook"
      description="Manage grades, assignments, and track student performance across all your courses"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="grading">Pending Grading</TabsTrigger>
          <TabsTrigger value="analytics">Grade Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Grades
                </CardTitle>
                <CardDescription>
                  Latest graded assignments across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{grade.student}</div>
                        <div className="text-sm text-muted-foreground">
                          {grade.course} • {grade.assignment}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>
                  Overall grade distribution across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>A (90-100%)</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>B (80-89%)</span>
                      <span>41%</span>
                    </div>
                    <Progress value={41} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>C (70-79%)</span>
                      <span>19%</span>
                    </div>
                    <Progress value={19} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>D/F (Below 70%)</span>
                      <span>8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Sections
              </CardTitle>
              <CardDescription>
                All courses you're currently teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Average Grade</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {section.course?.code}-{section.section_number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {section.course?.name}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {section.term?.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{section.enrolled_count || 0}/{section.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          -
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            View gradebook
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Grades
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Pending Grading
              </CardTitle>
              <CardDescription>
                Assignments waiting to be graded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="cs350">CS350-A</SelectItem>
                      <SelectItem value="cs250">CS250-B</SelectItem>
                      <SelectItem value="cs101">CS101-C</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Search assignments..." 
                    className="max-w-sm"
                  />
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      course: "CS350-A",
                      assignment: "Machine Learning Project",
                      dueDate: "2024-12-15",
                      submissions: 28,
                      total: 32,
                      priority: "high"
                    },
                    {
                      course: "CS250-B", 
                      assignment: "Algorithm Analysis Report",
                      dueDate: "2024-12-18",
                      submissions: 15,
                      total: 28,
                      priority: "medium"
                    },
                    {
                      course: "CS101-C",
                      assignment: "Programming Exercise 8",
                      dueDate: "2024-12-20",
                      submissions: 42,
                      total: 45,
                      priority: "low"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{item.assignment}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.course} • Due {item.dueDate}
                        </div>
                        <div className="text-sm">
                          {item.submissions}/{item.total} submitted
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.priority === 'high' ? 'destructive' : 
                                  item.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {item.priority} priority
                        </Badge>
                        <Button>Grade Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Grade trend charts would appear here</p>
                    <p className="text-sm">Implementation pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Course Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{course.code}</span>
                        <span>{course.averageGrade.toFixed(1)}%</span>
                      </div>
                      <Progress value={course.averageGrade} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DataPageTemplate>
  )
}