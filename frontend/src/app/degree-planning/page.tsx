'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Target, GraduationCap, BookOpen, CheckCircle, AlertCircle,
  Clock, TrendingUp, Calendar, FileText, Download,
  Plus, Edit, Trash2, Info, Flag, Search, Filter
} from 'lucide-react'

export default function DegreePlanningPage() {
  const [selectedStudent, setSelectedStudent] = useState('sarah-johnson')
  const [selectedTerm, setSelectedTerm] = useState('spring-2025')

  const studentPlan = {
    student: 'Sarah Johnson',
    studentId: 'S00123450',
    major: 'Computer Science',
    minor: 'Mathematics',
    catalogYear: '2022-2023',
    expectedGraduation: 'Spring 2026',
    totalCredits: 78,
    requiredCredits: 120,
    gpa: 3.67,
    majorGPA: 3.75
  }

  const requirements = {
    general: {
      required: 42,
      completed: 42,
      inProgress: 0,
      categories: [
        { name: 'English Composition', required: 6, completed: 6 },
        { name: 'Mathematics', required: 6, completed: 6 },
        { name: 'Natural Sciences', required: 8, completed: 8 },
        { name: 'Social Sciences', required: 9, completed: 9 },
        { name: 'Humanities', required: 9, completed: 9 },
        { name: 'Fine Arts', required: 3, completed: 3 },
        { name: 'Cultural Diversity', required: 1, completed: 1 }
      ]
    },
    major: {
      required: 60,
      completed: 30,
      inProgress: 12,
      categories: [
        { name: 'Core Courses', required: 24, completed: 18, inProgress: 6 },
        { name: 'Advanced Courses', required: 18, completed: 9, inProgress: 6 },
        { name: 'Electives', required: 12, completed: 3, inProgress: 0 },
        { name: 'Capstone', required: 6, completed: 0, inProgress: 0 }
      ]
    },
    minor: {
      required: 18,
      completed: 6,
      inProgress: 3,
      categories: [
        { name: 'Core Courses', required: 12, completed: 6, inProgress: 3 },
        { name: 'Electives', required: 6, completed: 0, inProgress: 0 }
      ]
    }
  }

  const plannedCourses = {
    'Spring 2025': [
      { code: 'CS 350', name: 'Software Engineering', credits: 3, type: 'major-core' },
      { code: 'CS 375', name: 'Database Systems', credits: 3, type: 'major-core' },
      { code: 'CS 410', name: 'Computer Graphics', credits: 3, type: 'major-elective' },
      { code: 'MATH 310', name: 'Linear Algebra', credits: 3, type: 'minor-core' },
      { code: 'CS 390', name: 'Technical Writing', credits: 3, type: 'major-core' }
    ],
    'Fall 2025': [
      { code: 'CS 420', name: 'Artificial Intelligence', credits: 3, type: 'major-advanced' },
      { code: 'CS 430', name: 'Computer Networks', credits: 3, type: 'major-advanced' },
      { code: 'CS 450', name: 'Operating Systems', credits: 3, type: 'major-advanced' },
      { code: 'MATH 320', name: 'Discrete Mathematics', credits: 3, type: 'minor-elective' },
      { code: 'CS 480', name: 'Senior Seminar', credits: 3, type: 'major-capstone' }
    ],
    'Spring 2026': [
      { code: 'CS 490', name: 'Capstone Project', credits: 3, type: 'major-capstone' },
      { code: 'CS 460', name: 'Machine Learning', credits: 3, type: 'major-elective' },
      { code: 'CS 470', name: 'Cloud Computing', credits: 3, type: 'major-elective' },
      { code: 'MATH 330', name: 'Probability & Statistics', credits: 3, type: 'minor-elective' }
    ]
  }

  const whatIfScenarios = [
    { name: 'Add Data Science Minor', impact: '+18 credits', graduationDelay: '1 semester' },
    { name: 'Switch to Software Engineering', impact: '-6 credits', graduationDelay: 'None' },
    { name: 'Drop Mathematics Minor', impact: '-9 credits', graduationDelay: 'None' },
    { name: 'Add Business Minor', impact: '+21 credits', graduationDelay: '1-2 semesters' }
  ]

  const milestones = [
    { name: 'Complete General Education', target: 'Fall 2023', status: 'completed' },
    { name: 'Declare Major', target: 'Spring 2023', status: 'completed' },
    { name: 'Complete Core Requirements', target: 'Spring 2025', status: 'on-track' },
    { name: 'Apply for Internship', target: 'Fall 2025', status: 'upcoming' },
    { name: 'Begin Capstone Project', target: 'Fall 2025', status: 'upcoming' },
    { name: 'Apply for Graduation', target: 'Fall 2025', status: 'upcoming' },
    { name: 'Complete Degree Requirements', target: 'Spring 2026', status: 'projected' }
  ]

  const getTypeColor = (type: string) => {
    if (type.includes('major')) return 'bg-blue-100 text-blue-800'
    if (type.includes('minor')) return 'bg-purple-100 text-purple-800'
    if (type.includes('general')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'on-track': return 'text-blue-600'
      case 'upcoming': return 'text-yellow-600'
      case 'projected': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard', href: '/advisor-dashboard' },
    { label: 'Degree Planning' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Degree Planning
            </h1>
            <p className="text-muted-foreground">
              Academic pathway planning and degree audits
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                <SelectItem value="michael-chen">Michael Chen</SelectItem>
                <SelectItem value="emily-rodriguez">Emily Rodriguez</SelectItem>
                <SelectItem value="david-park">David Park</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Run Degree Audit
            </Button>
          </div>
        </div>

        {/* Student Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{studentPlan.student}</CardTitle>
                <CardDescription>
                  {studentPlan.studentId} • {studentPlan.major} Major
                  {studentPlan.minor && ` • ${studentPlan.minor} Minor`}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Expected Graduation: {studentPlan.expectedGraduation}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Progress to Degree</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {studentPlan.totalCredits}/{studentPlan.requiredCredits}
                    </span>
                    <span className="text-sm text-muted-foreground">credits</span>
                  </div>
                  <Progress value={(studentPlan.totalCredits / studentPlan.requiredCredits) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {studentPlan.requiredCredits - studentPlan.totalCredits} credits remaining
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                <p className="text-2xl font-bold mt-2">{studentPlan.gpa}</p>
                <p className="text-xs text-muted-foreground">Good standing</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Major GPA</p>
                <p className="text-2xl font-bold mt-2">{studentPlan.majorGPA}</p>
                <p className="text-xs text-muted-foreground">Above requirement</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catalog Year</p>
                <p className="text-2xl font-bold mt-2">{studentPlan.catalogYear}</p>
                <Button size="sm" variant="link" className="p-0 h-auto">
                  Change catalog
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="requirements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requirements">Degree Requirements</TabsTrigger>
            <TabsTrigger value="plan">4-Year Plan</TabsTrigger>
            <TabsTrigger value="whatif">What-If Analysis</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* General Education */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">General Education</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {requirements.general.completed}/{requirements.general.required} credits
                      </span>
                    </div>
                    <Progress value={100} className="h-2 bg-green-100" />
                  </div>
                  <div className="space-y-2">
                    {requirements.general.categories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <div className="flex items-center gap-1">
                          {cat.completed === cat.required ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : null}
                          <span className={cat.completed === cat.required ? 'text-green-600' : ''}>
                            {cat.completed}/{cat.required}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Major Requirements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Major Requirements</CardTitle>
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {requirements.major.completed}/{requirements.major.required} credits
                      </span>
                    </div>
                    <Progress
                      value={(requirements.major.completed / requirements.major.required) * 100}
                      className="h-2"
                    />
                    {requirements.major.inProgress > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        +{requirements.major.inProgress} credits in progress
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {requirements.major.categories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <div className="flex items-center gap-1">
                          {cat.completed === cat.required ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : cat.inProgress > 0 ? (
                            <Clock className="h-3 w-3 text-blue-600" />
                          ) : null}
                          <span>
                            {cat.completed}/{cat.required}
                            {cat.inProgress > 0 && (
                              <span className="text-blue-600"> (+{cat.inProgress})</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Minor Requirements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Minor Requirements</CardTitle>
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {requirements.minor.completed}/{requirements.minor.required} credits
                      </span>
                    </div>
                    <Progress
                      value={(requirements.minor.completed / requirements.minor.required) * 100}
                      className="h-2"
                    />
                    {requirements.minor.inProgress > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        +{requirements.minor.inProgress} credits in progress
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {requirements.minor.categories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <div className="flex items-center gap-1">
                          {cat.completed === cat.required ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : cat.inProgress > 0 ? (
                            <Clock className="h-3 w-3 text-blue-600" />
                          ) : null}
                          <span>
                            {cat.completed}/{cat.required}
                            {cat.inProgress > 0 && (
                              <span className="text-blue-600"> (+{cat.inProgress})</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Degree Audit Status:</strong> Based on current progress and planned courses,
                student is on track to graduate in {studentPlan.expectedGraduation}. All general
                education requirements are complete. Major and minor requirements are in progress.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>4-Year Academic Plan</CardTitle>
                    <CardDescription>Semester-by-semester course planning</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(plannedCourses).map(([term, courses]) => (
                    <div key={term} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{term}</h4>
                        <div className="text-sm text-muted-foreground">
                          {courses.reduce((sum, c) => sum + c.credits, 0)} credits
                        </div>
                      </div>
                      <div className="space-y-2">
                        {courses.map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-medium">{course.code}</span>
                              <span className="text-sm">{course.name}</span>
                              <Badge className={getTypeColor(course.type)} variant="secondary">
                                {course.type.replace('-', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{course.credits} cr</span>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> Consider adding one more elective in Fall 2025
                    to provide flexibility in your final semester. This would also allow for an
                    internship opportunity without delaying graduation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatif" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What-If Analysis</CardTitle>
                <CardDescription>
                  Explore how changes to your academic plan would affect graduation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Scenario Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="change-major">Change Major</SelectItem>
                        <SelectItem value="add-minor">Add Minor</SelectItem>
                        <SelectItem value="add-second-major">Add Second Major</SelectItem>
                        <SelectItem value="drop-minor">Drop Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>New Program</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="software-engineering">Software Engineering</SelectItem>
                        <SelectItem value="business">Business Administration</SelectItem>
                        <SelectItem value="psychology">Psychology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Saved Scenarios</h4>
                  {whatIfScenarios.map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{scenario.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Credit Impact: {scenario.impact} • Graduation Delay: {scenario.graduationDelay}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Run New Scenario
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Milestones</CardTitle>
                <CardDescription>Track important academic deadlines and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : milestone.status === 'on-track' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Flag className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">Target: {milestone.target}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(milestone.status)} variant="outline">
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next Milestone:</strong> Apply for Fall 2025 internships by March 15, 2025.
                    Consider scheduling a career counseling appointment to review your resume.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}