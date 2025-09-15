"use client"

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

export default function GradebookPage() {
  const stats = [
    {
      label: "Active Courses",
      value: "8",
      description: "Courses you're teaching"
    },
    {
      label: "Total Students",
      value: "247", 
      description: "Across all sections"
    },
    {
      label: "Assignments Due",
      value: "12",
      description: "Pending grading"
    },
    {
      label: "Average Grade",
      value: "82.5%",
      description: "All courses combined"
    }
  ]

  const courses = [
    {
      id: 1,
      code: "CS350",
      name: "Introduction to Artificial Intelligence",
      section: "A",
      term: "Fall 2024",
      students: 32,
      averageGrade: 85.2,
      gradedAssignments: 8,
      totalAssignments: 10
    },
    {
      id: 2,
      code: "CS250",
      name: "Data Structures and Algorithms",
      section: "B",
      term: "Fall 2024",
      students: 28,
      averageGrade: 78.9,
      gradedAssignments: 6,
      totalAssignments: 8
    },
    {
      id: 3,
      code: "CS101",
      name: "Introduction to Programming",
      section: "C",
      term: "Fall 2024",
      students: 45,
      averageGrade: 82.1,
      gradedAssignments: 12,
      totalAssignments: 15
    }
  ]

  const recentGrades = [
    {
      student: "Alice Johnson",
      course: "CS350-A",
      assignment: "Final Project",
      grade: "A-",
      points: "88/100",
      submittedAt: "2024-12-10"
    },
    {
      student: "Bob Smith",
      course: "CS250-B", 
      assignment: "Midterm Exam",
      grade: "B+",
      points: "82/100",
      submittedAt: "2024-12-09"
    },
    {
      student: "Carol Davis",
      course: "CS101-C",
      assignment: "Lab Assignment 5",
      grade: "A",
      points: "95/100",
      submittedAt: "2024-12-08"
    },
    {
      student: "David Wilson",
      course: "CS350-A",
      assignment: "Research Paper",
      grade: "B",
      points: "85/100",
      submittedAt: "2024-12-07"
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
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {course.code}-{course.section}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {course.name}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course.term}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.students}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {course.averageGrade.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            {course.gradedAssignments}/{course.totalAssignments} graded
                          </div>
                          <Progress 
                            value={(course.gradedAssignments / course.totalAssignments) * 100} 
                            className="h-2 w-20" 
                          />
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