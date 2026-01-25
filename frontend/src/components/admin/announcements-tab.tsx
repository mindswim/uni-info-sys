"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/api-client"
import {
  Plus, Megaphone, Pin, Pencil, Trash2, Eye, EyeOff,
  AlertTriangle, AlertCircle, Info, Globe, Building
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

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
  announceable?: {
    name?: string
    course_code?: string
  }
  created_at: string
}

interface Department {
  id: number
  name: string
}

const PRIORITY_CONFIG = {
  normal: { label: 'Normal', icon: Info, className: 'bg-slate-100 text-slate-700' },
  important: { label: 'Important', icon: AlertCircle, className: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', icon: AlertTriangle, className: 'bg-red-100 text-red-700' },
}

export function AdminAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    target_type: '' as '' | 'department',
    target_id: '',
    is_published: true,
    is_pinned: false,
    expires_at: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAnnouncements()
    fetchDepartments()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements?visible_only=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch announcements')
      const data = await response.json()
      setAnnouncements(data.data || [])
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = getAuthToken()

      // Get staff ID for author
      const staffRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const staffData = await staffRes.json()
      const adminStaff = staffData.data?.find((s: { user?: { roles?: { name: string }[] } }) =>
        s.user?.roles?.some((r: { name: string }) => r.name === 'admin')
      ) || staffData.data?.[0]

      if (!adminStaff) {
        toast({
          title: "Error",
          description: "Could not find staff record for creating announcement",
          variant: "destructive",
        })
        return
      }

      const payload: Record<string, unknown> = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_published: formData.is_published,
        is_pinned: formData.is_pinned,
        author_id: adminStaff.id,
      }

      if (formData.target_type && formData.target_id) {
        payload.target_type = formData.target_type
        payload.target_id = parseInt(formData.target_id)
      }

      if (formData.expires_at) {
        payload.expires_at = formData.expires_at
      }

      const url = editingAnnouncement
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${editingAnnouncement.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements`

      const response = await fetch(url, {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save announcement')

      toast({
        title: "Success",
        description: editingAnnouncement ? "Announcement updated" : "Announcement created",
      })

      setDialogOpen(false)
      resetForm()
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast({ title: "Deleted", description: "Announcement deleted" })
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  const togglePublish = async (announcement: Announcement) => {
    try {
      const token = getAuthToken()
      const endpoint = announcement.is_published ? 'unpublish' : 'publish'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${announcement.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to toggle publish')
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
    }
  }

  const togglePin = async (announcement: Announcement) => {
    try {
      const token = getAuthToken()
      const endpoint = announcement.is_pinned ? 'unpin' : 'pin'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/announcements/${announcement.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to toggle pin')
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_type: '',
      target_id: '',
      is_published: true,
      is_pinned: false,
      expires_at: '',
    })
    setEditingAnnouncement(null)
  }

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target_type: announcement.announceable_type?.includes('Department') ? 'department' : '',
      target_id: announcement.announceable_id?.toString() || '',
      is_published: announcement.is_published,
      is_pinned: announcement.is_pinned,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
    })
    setDialogOpen(true)
  }

  const getAnnouncementScope = (announcement: Announcement) => {
    if (!announcement.announceable_type) {
      return { label: 'University-wide', icon: Globe }
    }
    if (announcement.announceable_type.includes('Department')) {
      return { label: announcement.announceable?.name || 'Department', icon: Building }
    }
    return { label: 'Course', icon: Megaphone }
  }

  const filteredAnnouncements = announcements.filter(a => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'university') return !a.announceable_type
    if (activeFilter === 'department') return a.announceable_type?.includes('Department')
    if (activeFilter === 'published') return a.is_published
    if (activeFilter === 'draft') return !a.is_published
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="university">University</TabsTrigger>
            <TabsTrigger value="department">Departments</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No announcements</h3>
            <p className="text-muted-foreground text-sm">Create your first announcement to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const PriorityIcon = PRIORITY_CONFIG[announcement.priority].icon
            const scope = getAnnouncementScope(announcement)
            const ScopeIcon = scope.icon

            return (
              <Card key={announcement.id} className={!announcement.is_published ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.is_pinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ScopeIcon className="h-3 w-3" />
                        <span>{scope.label}</span>
                        <span className="mx-1">-</span>
                        <span>{announcement.author?.user?.name || 'Unknown'}</span>
                        <span className="mx-1">-</span>
                        <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={PRIORITY_CONFIG[announcement.priority].className}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {PRIORITY_CONFIG[announcement.priority].label}
                      </Badge>
                      {!announcement.is_published && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(announcement)}
                    >
                      {announcement.is_published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePin(announcement)}
                    >
                      <Pin className={`h-4 w-4 mr-1 ${announcement.is_pinned ? 'fill-current' : ''}`} />
                      {announcement.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(announcement)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement content..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as 'normal' | 'important' | 'urgent' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scope</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(v) => setFormData({ ...formData, target_type: v as '' | 'department', target_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="University-wide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">University-wide</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.target_type === 'department' && (
              <div>
                <Label>Department</Label>
                <Select
                  value={formData.target_id}
                  onValueChange={(v) => setFormData({ ...formData, target_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="expires_at">Expires At (optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(v) => setFormData({ ...formData, is_published: v })}
                />
                <Label>Publish immediately</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(v) => setFormData({ ...formData, is_pinned: v })}
                />
                <Label>Pin announcement</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
              {editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
