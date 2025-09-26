"use client"

import { useState, useEffect } from "react"
import { DataPageTemplate } from "@/components/templates/data-page-template"
import { apiService } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Copy,
  Award,
  TrendingUp,
  User,
  Paperclip,
  Send,
  CalendarDays,
  Loader2
} from "lucide-react"

interface Assignment {
  id: number
  title: string
  description: string
  course: {
    id: number
    code: string
    name: string
    section: string
  }
  instructor: string
  type: 'homework' | 'project' | 'exam' | 'quiz' | 'lab' | 'essay'
  totalPoints: number
  dueDate: string
  assignedDate: string
  status: 'draft' | 'published' | 'closed' | 'graded'
  submissions: number
  totalStudents: number
  instructions?: string
  attachments?: { name: string, size: string, type: string }[]
  rubric?: string
  allowLateSubmissions: boolean
  latePenalty?: number
}

interface Submission {
  id: number
  assignment: Assignment
  student: {
    id: number
    name: string
    studentNumber: string
    email: string
  }
  submittedAt: string
  status: 'submitted' | 'late' | 'graded' | 'missing'
  grade?: number
  feedback?: string
  attachments: { name: string, size: string, type: string }[]
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load assignments from API
      const assignmentsResponse = await apiService.getAssignments()
      setAssignments(assignmentsResponse.data)
    } catch (error) {
      console.error('Failed to load assignments:', error)
      setError('Failed to load assignments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data for development
  useEffect(() => {
    if (assignments.length === 0 && !loading && !error) {
      const mockAssignments: Assignment[] = [
        {
          id: 1,
          title: "Machine Learning Project - Neural Networks",
          description: "Implement a neural network from scratch to classify handwritten digits using the MNIST dataset.",
          course: { id: 1, code: "CS350", name: "Introduction to AI", section: "A" },
          instructor: "Dr. Sarah Johnson",
          type: "project",
          totalPoints: 100,
          dueDate: "2024-12-20T23:59:59Z",
          assignedDate: "2024-12-01T09:00:00Z",
          status: "published",
          submissions: 28,
          totalStudents: 32,
          instructions: "Create a neural network implementation with proper documentation and testing.",
          attachments: [
            { name: "project_requirements.pdf", size: "2.3 MB", type: "pdf" },
            { name: "mnist_dataset.zip", size: "15.2 MB", type: "zip" }
          ],
          allowLateSubmissions: true,
          latePenalty: 10
        },
        {
          id: 2,
          title: "Algorithm Analysis Report",
          description: "Analyze the time complexity of various sorting algorithms and provide empirical testing results.",
          course: { id: 2, code: "CS250", name: "Data Structures", section: "B" },
          instructor: "Prof. Michael Chen",
          type: "homework",
          totalPoints: 50,
          dueDate: "2024-12-18T23:59:59Z",
          assignedDate: "2024-12-05T10:00:00Z",
          status: "published",
          submissions: 25,
          totalStudents: 28,
          instructions: "Compare bubble sort, merge sort, and quicksort with both theoretical and practical analysis.",
          allowLateSubmissions: false
        },
        {
          id: 3,
          title: "Programming Lab 8 - Recursion",
          description: "Complete recursive programming exercises focusing on tree traversal and dynamic programming.",
          course: { id: 3, code: "CS101", name: "Intro Programming", section: "C" },
          instructor: "Dr. Emily Watson",
          type: "lab",
          totalPoints: 25,
          dueDate: "2024-12-15T23:59:59Z",
          assignedDate: "2024-12-08T09:00:00Z",
          status: "published",
          submissions: 42,
          totalStudents: 45,
          allowLateSubmissions: true,
          latePenalty: 5
        },
        {
          id: 4,
          title: "Final Exam Review Assignment",
          description: "Practice problems covering all topics from the semester to prepare for the final examination.",
          course: { id: 1, code: "CS350", name: "Introduction to AI", section: "A" },
          instructor: "Dr. Sarah Johnson",
          type: "homework",
          totalPoints: 30,
          dueDate: "2024-12-16T23:59:59Z",
          assignedDate: "2024-12-10T09:00:00Z",
          status: "published",
          submissions: 30,
          totalStudents: 32,
          allowLateSubmissions: false
        },
        {
          id: 5,
          title: "Database Design Project",
          description: "Design and implement a relational database for a library management system.",
          course: { id: 4, code: "CS300", name: "Database Systems", section: "A" },
          instructor: "Prof. David Kim",
          type: "project",
          totalPoints: 80,
          dueDate: "2024-12-22T23:59:59Z",
          assignedDate: "2024-11-25T09:00:00Z",
          status: "graded",
          submissions: 24,
          totalStudents: 26,
          allowLateSubmissions: true,
          latePenalty: 15
        }
      ]

      setAssignments(mockAssignments)
    }
  }, [assignments.length, loading, error])

  const stats = [
    {
      label: "Active Assignments",
      value: assignments.filter(a => a.status === 'published').length.toString(),
      description: "Currently published"
    },
    {
      label: "Pending Submissions",
      value: "127",
      description: "Awaiting student work"
    },
    {
      label: "To Grade",
      value: "89",
      description: "Submissions to review"
    },
    {
      label: "This Week Due",
      value: "8",
      description: "Assignments due soon"
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Assignments" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'graded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <Award className="h-4 w-4" />
      case 'exam': return <FileText className="h-4 w-4" />
      case 'quiz': return <CheckCircle className="h-4 w-4" />
      case 'lab': return <BookOpen className="h-4 w-4" />
      case 'essay': return <Edit className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateSubmissionRate = (submissions: number, total: number) => {
    return Math.round((submissions / total) * 100)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDueDateStatus = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate)
    if (days < 0) return { text: 'Overdue', color: 'text-red-600' }
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' }
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' }
    if (days <= 3) return { text: `Due in ${days} days`, color: 'text-yellow-600' }
    return { text: `Due in ${days} days`, color: 'text-muted-foreground' }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = selectedCourse === "all" || assignment.course.id.toString() === selectedCourse
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const recentSubmissions = [
    {
      id: 1,
      studentName: "Alice Johnson",
      assignmentTitle: "ML Project - Neural Networks",
      submittedAt: "2024-12-12 14:30",
      status: "submitted"
    },
    {
      id: 2,
      studentName: "Bob Smith",
      assignmentTitle: "Algorithm Analysis Report",
      submittedAt: "2024-12-12 11:45",
      status: "late"
    },
    {
      id: 3,
      studentName: "Carol Davis",
      assignmentTitle: "Programming Lab 8",
      submittedAt: "2024-12-12 09:15",
      status: "submitted"
    }
  ]

  // Loading state
  if (loading) {
    return (
      <DataPageTemplate
        title="Assignment Management"
        description="Create, distribute, and manage course assignments with automated grading and feedback systems"
        stats={stats}
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading assignments...</span>
            </div>
          </CardContent>
        </Card>
      </DataPageTemplate>
    )
  }

  return (
    <DataPageTemplate
      title="Assignment Management"
      description="Create, distribute, and manage course assignments with automated grading and feedback systems"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="assignments" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="grading">Grading</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Create a new assignment for your students
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input id="title" placeholder="Enter assignment title..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the assignment..."
                    className="min-h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="course">Course</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs350">CS350-A - Introduction to AI</SelectItem>
                        <SelectItem value="cs250">CS250-B - Data Structures</SelectItem>
                        <SelectItem value="cs101">CS101-C - Intro Programming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="lab">Lab Exercise</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="points">Total Points</Label>
                    <Input id="points" type="number" placeholder="100" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="datetime-local" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Detailed instructions for students..."
                    className="min-h-32"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Attachments</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Late Submission Policy</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Allow late submissions</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Penalty:</span>
                      <Input type="number" placeholder="10" className="w-16" />
                      <span className="text-sm">% per day</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Save as Draft</Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="assignments" className="space-y-6">
          {/* Error State */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={loadAssignments}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="1">CS350-A</SelectItem>
                    <SelectItem value="2">CS250-B</SelectItem>
                    <SelectItem value="3">CS101-C</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const dueDateStatus = getDueDateStatus(assignment.dueDate)
              const submissionRate = calculateSubmissionRate(assignment.submissions, assignment.totalStudents)

              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(assignment.type)}
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {assignment.type}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground">
                          {assignment.description.length > 150
                            ? `${assignment.description.substring(0, 150)}...`
                            : assignment.description
                          }
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{assignment.course.code}-{assignment.course.section}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{assignment.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>{assignment.totalPoints} points</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className={dueDateStatus.color}>
                              {dueDateStatus.text}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {assignment.submissions}/{assignment.totalStudents} submitted ({submissionRate}%)
                            </span>
                            <Progress value={submissionRate} className="w-20 h-2" />
                          </div>

                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                  <p>Try adjusting your search criteria or create a new assignment</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest student submissions across all assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.studentName}
                      </TableCell>
                      <TableCell>{submission.assignmentTitle}</TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                      <TableCell>
                        <Badge className={
                          submission.status === 'submitted' ? 'bg-green-100 text-green-800' :
                          submission.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
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
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Grading Interface</h3>
                <p>Advanced grading tools and rubrics coming soon</p>
                <p className="text-sm mt-2">Bulk grading, rubric-based assessment, and automated feedback</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Submission Trends
                </CardTitle>
                <CardDescription>Assignment completion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Submission analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>Performance statistics across assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4" />
                    <p>Grade analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Assignment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedAssignment.type)}
                  {selectedAssignment.title}
                  <Badge className={getStatusColor(selectedAssignment.status)}>
                    {selectedAssignment.status}
                  </Badge>
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedAssignment.course.code}-{selectedAssignment.course.section}</span>
                  <span>•</span>
                  <span>{selectedAssignment.totalPoints} points</span>
                  <span>•</span>
                  <span>Due {formatDate(selectedAssignment.dueDate)}</span>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedAssignment.description}</p>
                </div>

                {selectedAssignment.instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <p className="text-muted-foreground">{selectedAssignment.instructions}</p>
                  </div>
                )}

                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedAssignment.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{attachment.size}</Badge>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Submissions</div>
                    <div className="font-bold">
                      {selectedAssignment.submissions}/{selectedAssignment.totalStudents}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                    <div className="font-bold">
                      {calculateSubmissionRate(selectedAssignment.submissions, selectedAssignment.totalStudents)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Late Policy</div>
                    <div className="text-sm">
                      {selectedAssignment.allowLateSubmissions
                        ? `${selectedAssignment.latePenalty}% penalty per day`
                        : 'No late submissions'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instructor</div>
                    <div className="text-sm">{selectedAssignment.instructor}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DataPageTemplate>
  )
}