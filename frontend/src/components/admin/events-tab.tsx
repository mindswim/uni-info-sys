"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, Pencil, Trash2, Calendar, XCircle } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface Event {
  id: number
  title: string
  description?: string
  event_type: string
  start_datetime: string
  end_datetime: string
  visibility: string
  status: string
  term_id?: number
  course_section_id?: number
  created_at: string
}

export function EventsTab() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', event_type: '', start_datetime: '', end_datetime: '',
    visibility: 'public', term_id: '', course_section_id: '',
  })

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingEvent, setCancellingEvent] = useState<Event | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    const token = getAuthToken()
    const params = typeFilter !== 'all' ? `?event_type=${typeFilter}` : ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setEvents(data.data || [])
    }
    setLoading(false)
  }

  const fetchTypes = async () => {
    const token = getAuthToken()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/types`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setEventTypes(data.data || data.types || data || [])
    }
  }

  useEffect(() => { fetchTypes() }, [])
  useEffect(() => { fetchEvents() }, [typeFilter])

  const openCreate = () => {
    setEditing(null)
    setFormData({ title: '', description: '', event_type: '', start_datetime: '', end_datetime: '', visibility: 'public', term_id: '', course_section_id: '' })
    setDialogOpen(true)
  }

  const openEdit = (event: Event) => {
    setEditing(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_datetime: event.start_datetime?.slice(0, 16) || '',
      end_datetime: event.end_datetime?.slice(0, 16) || '',
      visibility: event.visibility || 'public',
      term_id: event.term_id?.toString() || '',
      course_section_id: event.course_section_id?.toString() || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_type || !formData.start_datetime || !formData.end_datetime) {
      toast({ title: "Validation Error", description: "Title, type, and dates are required", variant: "destructive" })
      return
    }
    setSubmitting(true)
    const token = getAuthToken()
    const body: Record<string, unknown> = {
      title: formData.title,
      description: formData.description || undefined,
      event_type: formData.event_type,
      start_datetime: formData.start_datetime,
      end_datetime: formData.end_datetime,
      visibility: formData.visibility,
    }
    if (formData.term_id) body.term_id = parseInt(formData.term_id)
    if (formData.course_section_id) body.course_section_id = parseInt(formData.course_section_id)

    const url = editing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${editing.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events`
    const method = editing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to save event')
      toast({ title: editing ? "Event Updated" : "Event Created", description: "Event saved successfully" })
      setDialogOpen(false)
      fetchEvents()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!cancellingEvent) return
    setCancelling(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${cancellingEvent.id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to cancel')
      toast({ title: "Cancelled", description: "Event has been cancelled" })
      setCancelDialogOpen(false)
      setCancellingEvent(null)
      fetchEvents()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingEvent) return
    setDeleting(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${deletingEvent.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      })
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete')
      toast({ title: "Deleted", description: "Event deleted" })
      setDeleteDialogOpen(false)
      setDeletingEvent(null)
      fetchEvents()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const formatDateTime = (dt: string) => {
    if (!dt) return '-'
    return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': case 'scheduled': return <Badge className="bg-green-600">{status}</Badge>
      case 'cancelled': return <Badge variant="destructive">{status}</Badge>
      case 'completed': return <Badge variant="secondary">{status}</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(Array.isArray(eventTypes) ? eventTypes : []).map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell><Badge variant="outline">{event.event_type}</Badge></TableCell>
                    <TableCell>{formatDateTime(event.start_datetime)}</TableCell>
                    <TableCell>{formatDateTime(event.end_datetime)}</TableCell>
                    <TableCell><Badge variant="secondary">{event.visibility}</Badge></TableCell>
                    <TableCell>{statusBadge(event.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => openEdit(event)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {event.status !== 'cancelled' && (
                          <Button variant="outline" size="icon" onClick={() => { setCancellingEvent(event); setCancelDialogOpen(true) }}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => { setDeletingEvent(event); setDeleteDialogOpen(true) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Create'} Event</DialogTitle>
            <DialogDescription>{editing ? 'Update event details' : 'Create a new event'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({...formData, event_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(eventTypes) ? eventTypes : []).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v) => setFormData({...formData, visibility: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start *</Label>
                <Input type="datetime-local" value={formData.start_datetime} onChange={(e) => setFormData({...formData, start_datetime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End *</Label>
                <Input type="datetime-local" value={formData.end_datetime} onChange={(e) => setFormData({...formData, end_datetime: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{cancellingEvent?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling} className="bg-destructive hover:bg-destructive/90">
              {cancelling ? 'Cancelling...' : 'Cancel Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEvent?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
