"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Megaphone, Pin, AlertTriangle, AlertCircle, Info,
  Globe, BookOpen, User
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  is_pinned: boolean
  published_at?: string
  expires_at?: string
  announceable_type?: string
  announceable_id?: number
  course_code?: string
  course_title?: string
  author?: {
    id: number
    user: {
      name: string
    }
  }
  created_at: string
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', icon: Info, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  important: { label: 'Important', icon: AlertCircle, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  urgent: { label: 'Urgent', icon: AlertTriangle, className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

export function StudentAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch announcements')
      const data = await response.json()
      setAnnouncements(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const universityAnnouncements = announcements.filter(a => !a.announceable_type)
  const courseAnnouncements = announcements.filter(a => a.announceable_type)

  const filteredAnnouncements = activeTab === 'all'
    ? announcements
    : activeTab === 'university'
    ? universityAnnouncements
    : courseAnnouncements

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned)
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned)

  const renderAnnouncement = (announcement: Announcement) => {
    const priorityConfig = PRIORITY_CONFIG[announcement.priority]
    const PriorityIcon = priorityConfig.icon

    return (
      <Card
        key={announcement.id}
        className={`${announcement.priority === 'urgent' ? 'border-red-200 dark:border-red-800' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {announcement.is_pinned && (
                  <Pin className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                )}
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {announcement.priority !== 'normal' && (
                  <Badge className={priorityConfig.className}>
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {priorityConfig.label}
                  </Badge>
                )}
                {announcement.announceable_type ? (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    {announcement.course_code || 'Course'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    University
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {announcement.content}
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            {announcement.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {announcement.author.user.name}
              </span>
            )}
            <span>
              {formatDistanceToNow(new Date(announcement.published_at || announcement.created_at), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">University-wide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{universityAnnouncements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Course-specific</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseAnnouncements.length}</div>
          </CardContent>
        </Card>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No announcements</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({announcements.length})</TabsTrigger>
            <TabsTrigger value="university">
              <Globe className="h-4 w-4 mr-1" />
              University ({universityAnnouncements.length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-1" />
              Courses ({courseAnnouncements.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4 space-y-6">
            {/* Pinned announcements */}
            {pinnedAnnouncements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned
                </h3>
                {pinnedAnnouncements.map(renderAnnouncement)}
              </div>
            )}

            {/* Regular announcements */}
            {regularAnnouncements.length > 0 && (
              <div className="space-y-4">
                {pinnedAnnouncements.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
                )}
                {regularAnnouncements.map(renderAnnouncement)}
              </div>
            )}

            {filteredAnnouncements.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    No announcements in this category
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
