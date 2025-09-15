"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info,
  GraduationCap,
  Clock,
  Calendar,
  BookOpen,
  Mail,
  MessageSquare,
  RefreshCw
} from "lucide-react"

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Notifications" }
]

interface Notification {
  id: string
  type: 'grade_update' | 'enrollment_confirmation' | 'deadline_reminder' | 'system_announcement' | 'course_update'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  related_course?: string
  action_url?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'grade_update':
      return <GraduationCap className="h-5 w-5 text-blue-500" />
    case 'enrollment_confirmation':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'deadline_reminder':
      return <Clock className="h-5 w-5 text-orange-500" />
    case 'system_announcement':
      return <Info className="h-5 w-5 text-purple-500" />
    case 'course_update':
      return <BookOpen className="h-5 w-5 text-indigo-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50'
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-50'
    case 'low':
      return 'border-l-blue-500 bg-blue-50'
    default:
      return 'border-l-gray-500 bg-gray-50'
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      // Since we don't have authentication set up, let's create realistic demo notifications
      // In a real app, this would call: await fetch('/api/v1/notifications')

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'grade_update',
          title: 'Grade Posted: CS350',
          message: 'Your final grade for Introduction to Artificial Intelligence has been posted. Grade: A-',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          related_course: 'CS350',
          action_url: '/grades'
        },
        {
          id: '2',
          type: 'enrollment_confirmation',
          title: 'Enrollment Confirmed',
          message: 'You have been successfully enrolled in CS201 - Data Structures and Algorithms for Fall 2024.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          related_course: 'CS201',
          action_url: '/course-catalog'
        },
        {
          id: '3',
          type: 'deadline_reminder',
          title: 'Add/Drop Deadline Approaching',
          message: 'Reminder: The add/drop deadline is September 15, 2025. Make sure to finalize your course schedule.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'medium',
          action_url: '/schedule'
        },
        {
          id: '4',
          type: 'system_announcement',
          title: 'Maintenance Window Scheduled',
          message: 'The student portal will be unavailable for maintenance on September 20, 2025 from 2:00 AM to 4:00 AM EST.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low'
        },
        {
          id: '5',
          type: 'course_update',
          title: 'Course Material Updated',
          message: 'Prof. Turing has uploaded new lecture notes for Week 3 in your AI course.',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low',
          related_course: 'CS350'
        }
      ]

      setNotifications(demoNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app: await fetch(`/api/v1/notifications/${notificationId}/read`, { method: 'POST' })

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
              <BellRing className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with important announcements and course updates
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" onClick={loadNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      You're all caught up! Check back later for updates.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id} className={`border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'shadow-md' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                              {notification.related_course && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {notification.related_course}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {notification.action_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={notification.action_url}>View</a>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread">
            <div className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">
                      You have no unread notifications.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                unreadNotifications.map((notification) => (
                  <Card key={notification.id} className={`border-l-4 ${getPriorityColor(notification.priority)} shadow-md`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                              {notification.related_course && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {notification.related_course}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {notification.action_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={notification.action_url}>View</a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="read">
            <div className="space-y-4">
              {readNotifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No read notifications</h3>
                    <p className="text-muted-foreground">
                      Read notifications will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                readNotifications.map((notification) => (
                  <Card key={notification.id} className={`border-l-4 ${getPriorityColor(notification.priority)} opacity-75`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                              {notification.related_course && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {notification.related_course}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {notification.action_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={notification.action_url}>View</a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}