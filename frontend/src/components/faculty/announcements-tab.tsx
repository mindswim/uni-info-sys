"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, Megaphone, Pin, Pencil, Trash2, Eye, EyeOff,
  AlertTriangle, AlertCircle, Info, Globe, BookOpen
} from "lucide-react"
import { format, formatDistanceToNow, isPast } from "date-fns"

interface CourseSection {
  id: number
  course: {
    course_code: string
    title: string
  }
  section_number: string
}

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  is_published: boolean
  published_at?: string
  expires_at?: string
  is_pinned: boolean
  announceable_type?: string
  announceable_id?: number
  author?: {
    id: number
    user: {
      name: string
    }
  }
  created_at: string
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', icon: Info, className: 'bg-slate-100 text-slate-700' },
  important: { label: 'Important', icon: AlertCircle, className: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', icon: AlertTriangle, className: 'bg-red-100 text-red-700' },
}

export function AnnouncementsTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [activeTab, setActiveTab] = useState('section')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    target_type: 'course_section' as 'course_section' | undefined,
    is_published: true,
    is_pinned: false,
    expires_at: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
    fetchMyAnnouncements()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchSectionAnnouncements(selectedSection)
    }
  }, [selectedSection])

  const fetchSections = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff/me/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch sections')
      const data = await response.json()
      setSections(data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSectionAnnouncements = async (sectionId: string) => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/announcements`,
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

  const fetchMyAnnouncements = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/me/created`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch announcements')
      const data = await response.json()
      setMyAnnouncements(data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const payload: any = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_published: formData.is_published,
        is_pinned: formData.is_pinned,
      }

      if (formData.expires_at) {
        payload.expires_at = formData.expires_at
      }

      if (selectedSection && formData.target_type === 'course_section') {
        payload.target_type = 'course_section'
        payload.target_id = parseInt(selectedSection)
      }

      const url = editingAnnouncement
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${editingAnnouncement.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements`

      const response = await fetch(url, {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save announcement')

      toast({
        title: editingAnnouncement ? "Announcement Updated" : "Announcement Created",
        description: `"${formData.title}" has been ${editingAnnouncement ? 'updated' : 'posted'}.`,
      })

      setDialogOpen(false)
      resetForm()
      if (selectedSection) fetchSectionAnnouncements(selectedSection)
      fetchMyAnnouncements()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save announcement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (announcement: Announcement) => {
    if (!confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${announcement.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to delete announcement')

      toast({
        title: "Announcement Deleted",
        description: `"${announcement.title}" has been removed.`,
      })

      if (selectedSection) fetchSectionAnnouncements(selectedSection)
      fetchMyAnnouncements()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  const togglePin = async (announcement: Announcement) => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const action = announcement.is_pinned ? 'unpin' : 'pin'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${announcement.id}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error(`Failed to ${action} announcement`)

      toast({
        title: announcement.is_pinned ? "Unpinned" : "Pinned",
        description: `"${announcement.title}" has been ${action}ned.`,
      })

      if (selectedSection) fetchSectionAnnouncements(selectedSection)
      fetchMyAnnouncements()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const togglePublish = async (announcement: Announcement) => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const action = announcement.is_published ? 'unpublish' : 'publish'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${announcement.id}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error(`Failed to ${action} announcement`)

      toast({
        title: announcement.is_published ? "Unpublished" : "Published",
        description: `"${announcement.title}" is now ${announcement.is_published ? 'hidden' : 'visible'}.`,
      })

      if (selectedSection) fetchSectionAnnouncements(selectedSection)
      fetchMyAnnouncements()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_type: 'course_section',
      is_published: true,
      is_pinned: false,
      expires_at: '',
    })
    setEditingAnnouncement(null)
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target_type: announcement.announceable_type ? 'course_section' : undefined,
      is_published: announcement.is_published,
      is_pinned: announcement.is_pinned,
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : '',
    })
    setDialogOpen(true)
  }

  const renderAnnouncementCard = (announcement: Announcement) => {
    const priorityConfig = PRIORITY_CONFIG[announcement.priority]
    const PriorityIcon = priorityConfig.icon
    const isExpired = announcement.expires_at && isPast(new Date(announcement.expires_at))

    return (
      <Card key={announcement.id} className={`${!announcement.is_published || isExpired ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {announcement.is_pinned && (
                  <Pin className="h-4 w-4 text-primary fill-primary" />
                )}
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={priorityConfig.className}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {priorityConfig.label}
                </Badge>
                {!announcement.is_published && (
                  <Badge variant="secondary">Draft</Badge>
                )}
                {isExpired && (
                  <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
                )}
                {announcement.announceable_type ? (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    Course Section
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    University-wide
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(announcement)}
                title={announcement.is_pinned ? "Unpin" : "Pin"}
              >
                <Pin className={`h-4 w-4 ${announcement.is_pinned ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePublish(announcement)}
                title={announcement.is_published ? "Unpublish" : "Publish"}
              >
                {announcement.is_published ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(announcement)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(announcement)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {announcement.content}
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>
              Posted {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
            </span>
            {announcement.expires_at && (
              <span>
                {isExpired ? 'Expired' : 'Expires'} {format(new Date(announcement.expires_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="section">Course Section</TabsTrigger>
          <TabsTrigger value="all">All My Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="section" className="space-y-6">
          {/* Section Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a course section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.course.course_code} - {section.course.title} (Sec {section.section_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSection && (
                  <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Announcement title"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your announcement..."
                            rows={5}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value: 'normal' | 'important' | 'urgent') =>
                              setFormData({ ...formData, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="expires_at">Expires (optional)</Label>
                          <Input
                            id="expires_at"
                            type="datetime-local"
                            value={formData.expires_at}
                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_pinned"
                            checked={formData.is_pinned}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                          />
                          <Label htmlFor="is_pinned">Pin to top</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_published"
                            checked={formData.is_published}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                          />
                          <Label htmlFor="is_published">Publish immediately</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                          {editingAnnouncement ? 'Update' : 'Post'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedSection && (
            <>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : announcements.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No announcements for this section</p>
                      <p className="text-sm text-muted-foreground mt-1">Create your first announcement</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {announcements.map(renderAnnouncementCard)}
                </div>
              )}
            </>
          )}

          {!selectedSection && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Select a course section above to view and create announcements
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All My Announcements</CardTitle>
              <CardDescription>
                All announcements you have created across all courses
              </CardDescription>
            </CardHeader>
          </Card>

          {myAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't created any announcements yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAnnouncements.map(renderAnnouncementCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
