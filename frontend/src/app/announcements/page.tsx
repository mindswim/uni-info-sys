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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Star,
  Pin,
  Send,
  Globe,
  User,
  GraduationCap,
  Loader2
} from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  category: 'general' | 'academic' | 'events' | 'urgent' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  audience: 'all' | 'students' | 'faculty' | 'staff' | 'admissions'
  isPinned: boolean
  isPublished: boolean
  publishedAt: string
  expiresAt?: string
  readBy: number
  totalAudience: number
  attachments?: { name: string, size: string }[]
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterAudience, setFilterAudience] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getAnnouncements()
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Failed to load announcements:', error)
      setError('Failed to load announcements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data for development
  useEffect(() => {
    if (announcements.length === 0 && !loading && !error) {
      const mockAnnouncements: Announcement[] = [
      {
        id: 1,
        title: "Fall 2024 Final Exam Schedule Released",
        content: "The final examination schedule for Fall 2024 semester has been posted. Students can access their exam schedules through the student portal. Please review your exam times and locations carefully.",
        author: "Academic Affairs Office",
        category: "academic",
        priority: "high",
        audience: "students",
        isPinned: true,
        isPublished: true,
        publishedAt: "2024-12-10T09:00:00Z",
        expiresAt: "2024-12-20T23:59:59Z",
        readBy: 847,
        totalAudience: 2847,
        attachments: [
          { name: "Final_Exam_Schedule_Fall2024.pdf", size: "2.3 MB" }
        ]
      },
      {
        id: 2,
        title: "Campus Network Maintenance - December 15th",
        content: "The campus network will undergo scheduled maintenance on December 15th from 2:00 AM to 6:00 AM. During this time, online services may be temporarily unavailable.",
        author: "IT Services",
        category: "maintenance",
        priority: "medium",
        audience: "all",
        isPinned: false,
        isPublished: true,
        publishedAt: "2024-12-08T14:30:00Z",
        readBy: 1205,
        totalAudience: 3450
      },
      {
        id: 3,
        title: "Spring 2025 Course Registration Opens",
        content: "Registration for Spring 2025 courses begins on December 16th. Priority registration will be given to graduating seniors, followed by class standing order.",
        author: "Registrar's Office",
        category: "academic",
        priority: "high",
        audience: "students",
        isPinned: true,
        isPublished: true,
        publishedAt: "2024-12-07T11:15:00Z",
        readBy: 1576,
        totalAudience: 2847
      },
      {
        id: 4,
        title: "Holiday Campus Closure",
        content: "The university will be closed from December 22nd through January 2nd for the winter break. Emergency services will remain available.",
        author: "Administration",
        category: "general",
        priority: "medium",
        audience: "all",
        isPinned: false,
        isPublished: true,
        publishedAt: "2024-12-05T16:00:00Z",
        readBy: 2890,
        totalAudience: 3450
      },
      {
        id: 5,
        title: "Faculty Meeting - Curriculum Review",
        content: "All department heads are required to attend the curriculum review meeting on December 18th at 10:00 AM in the Conference Center.",
        author: "Academic Affairs",
        category: "academic",
        priority: "high",
        audience: "faculty",
        isPinned: false,
        isPublished: true,
        publishedAt: "2024-12-04T13:45:00Z",
        readBy: 142,
        totalAudience: 156
      },
      {
        id: 6,
        title: "New Student Orientation Schedule",
        content: "Spring 2025 new student orientation will take place on January 8-10. All new students must attend one of the orientation sessions.",
        author: "Student Affairs",
        category: "events",
        priority: "medium",
        audience: "admissions",
        isPinned: false,
        isPublished: true,
        publishedAt: "2024-12-03T09:20:00Z",
        readBy: 89,
        totalAudience: 234
      }
      ]
      setAnnouncements(mockAnnouncements)
    }
  }, [announcements.length, loading, error])

  const stats = [
    {
      label: "Active Announcements",
      value: announcements.filter(a => a.isPublished).length.toString(),
      description: "Currently published"
    },
    {
      label: "Pinned Announcements",
      value: announcements.filter(a => a.isPinned).length.toString(),
      description: "High priority items"
    },
    {
      label: "Total Reach",
      value: "3,450",
      description: "People in announcement system"
    },
    {
      label: "Read Rate",
      value: "78%",
      description: "Average engagement"
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Communication", href: "/communication" },
    { label: "Announcements" }
  ]

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory
    const matchesAudience = filterAudience === "all" || announcement.audience === filterAudience
    return matchesSearch && matchesCategory && matchesAudience
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'events': return 'bg-green-100 text-green-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high': return <Star className="h-4 w-4 text-orange-500" />
      case 'medium': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'students': return <GraduationCap className="h-4 w-4" />
      case 'faculty': return <User className="h-4 w-4" />
      case 'staff': return <Users className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
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

  const calculateReadPercentage = (readBy: number, totalAudience: number) => {
    return Math.round((readBy / totalAudience) * 100)
  }

  return (
    <DataPageTemplate
      title="Announcements"
      description="Create, manage, and distribute announcements to students, faculty, and staff"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="published" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Create and publish an announcement to your selected audience
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter announcement title..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement content..."
                    className="min-h-32"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="audience">Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="faculty">Faculty Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="admissions">Admissions Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Save Draft
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="published" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAudience} onValueChange={setFilterAudience}>
                  <SelectTrigger className="w-48">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admissions">Admissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                  onClick={loadAnnouncements}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading announcements...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pinned Announcements */}
          {!loading && !error && filteredAnnouncements.filter(a => a.isPinned).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pin className="h-5 w-5" />
                  Pinned Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAnnouncements.filter(a => a.isPinned).map((announcement) => (
                    <Alert key={announcement.id} className="border-l-4 border-l-blue-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{announcement.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {announcement.content.substring(0, 150)}...
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAnnouncement(announcement)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Announcements */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredAnnouncements.filter(a => !a.isPinned).map((announcement) => (
                <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(announcement.priority)}
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <Badge className={getCategoryColor(announcement.category)}>
                            {announcement.category}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground">
                          {announcement.content.length > 200
                            ? `${announcement.content.substring(0, 200)}...`
                            : announcement.content
                          }
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{announcement.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(announcement.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getAudienceIcon(announcement.audience)}
                            <span className="capitalize">{announcement.audience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>
                              {announcement.readBy} / {announcement.totalAudience}
                              ({calculateReadPercentage(announcement.readBy, announcement.totalAudience)}%)
                            </span>
                          </div>
                        </div>

                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Attachments:</span>
                            {announcement.attachments.map((attachment, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {attachment.name} ({attachment.size})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnnouncement(announcement)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAnnouncements.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center text-muted-foreground">
                      <Megaphone className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No announcements found</h3>
                      <p>Try adjusting your search criteria or create a new announcement</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-muted-foreground">
                <Edit className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Draft Announcements</h3>
                <p>Saved drafts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
                <CardDescription>Read rates and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Detailed analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>Most viewed announcement types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4" />
                    <p>Category analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Announcement Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getPriorityIcon(selectedAnnouncement.priority)}
                  {selectedAnnouncement.title}
                  {selectedAnnouncement.isPinned && <Pin className="h-4 w-4" />}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(selectedAnnouncement.category)}>
                    {selectedAnnouncement.category}
                  </Badge>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    By {selectedAnnouncement.author}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedAnnouncement.publishedAt)}
                  </span>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedAnnouncement.content}
                </p>

                {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedAnnouncement.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{attachment.name}</span>
                          <Badge variant="outline">{attachment.size}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {getAudienceIcon(selectedAnnouncement.audience)}
                        <span className="capitalize">{selectedAnnouncement.audience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {selectedAnnouncement.readBy} / {selectedAnnouncement.totalAudience} read
                        </span>
                      </div>
                    </div>
                    <div>
                      {calculateReadPercentage(selectedAnnouncement.readBy, selectedAnnouncement.totalAudience)}% engagement
                    </div>
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