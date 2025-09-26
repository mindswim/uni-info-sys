'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import {
  Calendar, Clock, BookOpen, GraduationCap,
  TrendingUp, Users, Bell, AlertCircle,
  CheckCircle, XCircle, User, Award,
  FileText, MessageSquare, DollarSign,
  Activity, Target, Briefcase, Home,
  MapPin, ClipboardCheck
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' }
]

interface DashboardData {
  user: {
    name: string
    role: string
    program: string
    year: number
    gpa: number
    credits_earned: number
    credits_required: number
  }
  stats: {
    enrolled_courses: number
    completed_courses: number
    upcoming_assignments: number
    unread_messages: number
  }
  upcoming_classes: Array<{
    id: number
    course_code: string
    course_name: string
    time: string
    location: string
    instructor: string
  }>
  recent_grades: Array<{
    id: number
    course_code: string
    course_name: string
    grade: string
    credits: number
    date: string
  }>
  announcements: Array<{
    id: number
    title: string
    message: string
    type: 'info' | 'warning' | 'success'
    date: string
  }>
  deadlines: Array<{
    id: number
    title: string
    course: string
    due_date: string
    type: 'assignment' | 'exam' | 'project'
  }>
}

// Mock data generator
const generateMockData = (userName?: string): DashboardData => ({
  user: {
    name: userName || 'David Park',
    role: 'Student',
    program: 'Computer Science',
    year: 2,
    gpa: 3.75,
    credits_earned: 60,
    credits_required: 120
  },
  stats: {
    enrolled_courses: 5,
    completed_courses: 12,
    upcoming_assignments: 3,
    unread_messages: 2
  },
  upcoming_classes: [
    {
      id: 1,
      course_code: 'CS350',
      course_name: 'Artificial Intelligence',
      time: '10:00 AM',
      location: 'Science Building, Room 301',
      instructor: 'Prof. Turing'
    },
    {
      id: 2,
      course_code: 'MATH201',
      course_name: 'Linear Algebra',
      time: '2:00 PM',
      location: 'Math Building, Room 105',
      instructor: 'Dr. Gauss'
    },
    {
      id: 3,
      course_code: 'CS201',
      course_name: 'Data Structures',
      time: '4:00 PM',
      location: 'Computer Lab 2',
      instructor: 'Prof. Dijkstra'
    }
  ],
  recent_grades: [
    {
      id: 1,
      course_code: 'CS250',
      course_name: 'Database Systems',
      grade: 'A-',
      credits: 3,
      date: '2024-03-15'
    },
    {
      id: 2,
      course_code: 'PHYS101',
      course_name: 'Physics I',
      grade: 'B+',
      credits: 4,
      date: '2024-03-14'
    },
    {
      id: 3,
      course_code: 'ENGL102',
      course_name: 'Technical Writing',
      grade: 'A',
      credits: 3,
      date: '2024-03-12'
    }
  ],
  announcements: [
    {
      id: 1,
      title: 'Course Registration Opens',
      message: 'Registration for Fall 2024 semester opens on April 1st',
      type: 'info',
      date: '2024-03-18'
    },
    {
      id: 2,
      title: 'Midterm Exam Schedule',
      message: 'Midterm exams will be held from March 25-29',
      type: 'warning',
      date: '2024-03-17'
    },
    {
      id: 3,
      title: 'Dean\'s List Achievement',
      message: 'Congratulations! You made the Dean\'s List for Fall 2023',
      type: 'success',
      date: '2024-03-15'
    }
  ],
  deadlines: [
    {
      id: 1,
      title: 'Neural Networks Assignment',
      course: 'CS350',
      due_date: '2024-03-22',
      type: 'assignment'
    },
    {
      id: 2,
      title: 'Linear Algebra Midterm',
      course: 'MATH201',
      due_date: '2024-03-25',
      type: 'exam'
    },
    {
      id: 3,
      title: 'Database Design Project',
      course: 'CS250',
      due_date: '2024-03-28',
      type: 'project'
    }
  ]
})

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Load dashboard data
    setTimeout(() => {
      setDashboardData(generateMockData(user?.name))
      setLoading(false)
    }, 500)

    return () => clearInterval(timer)
  }, [user])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getDeadlineColor = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 2) return 'text-red-500'
    if (days <= 5) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!dashboardData) return null

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">
                  {getGreeting()}, {dashboardData.user.name}!
                </h1>
                <p className="text-muted-foreground">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {dashboardData.user.program}
                  </Badge>
                  <Badge variant="outline">Year {dashboardData.user.year}</Badge>
                  <Badge variant="outline">GPA: {dashboardData.user.gpa}</Badge>
                </div>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage src="/api/placeholder/150/150" alt={dashboardData.user.name} />
                <AvatarFallback className="text-xl">
                  {dashboardData.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.enrolled_courses}</div>
              <p className="text-xs text-muted-foreground">Current semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.user.credits_earned}/{dashboardData.user.credits_required}
              </div>
              <Progress
                value={(dashboardData.user.credits_earned / dashboardData.user.credits_required) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.upcoming_assignments}</div>
              <p className="text-xs text-muted-foreground">Due this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.unread_messages}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
              <Link href="/messages">
                <Button variant="link" className="px-0 h-auto mt-1" size="sm">
                  View messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Classes</CardTitle>
                <Link href="/schedule">
                  <Button variant="outline" size="sm">View Full Schedule</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.upcoming_classes.map((class_item) => (
                <div key={class_item.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-1">
                      {class_item.time}
                    </Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">
                      {class_item.course_code}: {class_item.course_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {class_item.instructor}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {class_item.location}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.upcoming_classes.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Deadlines</CardTitle>
                <Link href="/assignments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.deadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{deadline.course}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={deadline.type === 'exam' ? 'destructive' : 'secondary'}>
                        {deadline.type}
                      </Badge>
                      <span className={`text-sm ${getDeadlineColor(deadline.due_date)}`}>
                        Due: {new Date(deadline.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.deadlines.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Tabs */}
        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">Recent Grades</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Grades</CardTitle>
                  <Link href="/grades">
                    <Button variant="outline" size="sm">View All Grades</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recent_grades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{grade.course_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.course_code} • {grade.credits} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {grade.grade}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Announcements</CardTitle>
                  <Link href="/announcements">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start space-x-3">
                      {getAnnouncementIcon(announcement.type)}
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-muted-foreground">{announcement.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/enrollment">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Enrollment</span>
                </Button>
              </Link>
              <Link href="/academic-records">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                  <FileText className="h-5 w-5" />
                  <span>Academic Records</span>
                </Button>
              </Link>
              <Link href="/transcripts">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                  <Award className="h-5 w-5" />
                  <span>Transcripts</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}