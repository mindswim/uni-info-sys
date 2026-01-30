"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, Pencil, Trash2, BookOpen } from "lucide-react"
import { getAuthToken } from "@/lib/api-client"

interface DegreeRequirement {
  id: number
  program_id: number
  category: string
  description: string
  credits_required: number
  sort_order: number
}

interface Program {
  id: number
  name: string
  code: string
  degree_type: string
}

export function DegreeRequirementsTab({ programId }: { programId?: number }) {
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])
  const [requirements, setRequirements] = useState<DegreeRequirement[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programId?.toString() || '')
  const [loading, setLoading] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DegreeRequirement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ category: '', description: '', credits_required: '', sort_order: '0' })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingReq, setDeletingReq] = useState<DegreeRequirement | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchPrograms = async () => {
      const token = getAuthToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (res.ok) {
        const data = await res.json()
        setPrograms(data.data || [])
      }
    }
    fetchPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgramId) fetchRequirements()
  }, [selectedProgramId])

  const fetchRequirements = async () => {
    setLoading(true)
    const token = getAuthToken()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/${selectedProgramId}/degree-requirements`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      setRequirements(data.data || [])
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditing(null)
    setFormData({ category: '', description: '', credits_required: '', sort_order: '0' })
    setDialogOpen(true)
  }

  const openEdit = (req: DegreeRequirement) => {
    setEditing(req)
    setFormData({
      category: req.category,
      description: req.description,
      credits_required: req.credits_required.toString(),
      sort_order: req.sort_order.toString(),
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.category || !formData.credits_required) {
      toast({ title: "Validation Error", description: "Category and credits are required", variant: "destructive" })
      return
    }
    setSubmitting(true)
    const token = getAuthToken()
    const body = {
      category: formData.category,
      description: formData.description,
      credits_required: parseInt(formData.credits_required),
      sort_order: parseInt(formData.sort_order),
    }

    const url = editing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/degree-requirements/${editing.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/${selectedProgramId}/degree-requirements`
    const method = editing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to save requirement')
      }
      toast({ title: editing ? "Requirement Updated" : "Requirement Created", description: "Degree requirement saved successfully" })
      setDialogOpen(false)
      fetchRequirements()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingReq) return
    setDeleting(true)
    const token = getAuthToken()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/degree-requirements/${deletingReq.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: "Deleted", description: "Degree requirement removed" })
      setDeleteDialogOpen(false)
      setDeletingReq(null)
      fetchRequirements()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const sortedRequirements = [...requirements].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Select a program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.code} - {p.name} ({p.degree_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProgramId && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement
          </Button>
        )}
      </div>

      {!selectedProgramId ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Select a program to view its degree requirements</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card><CardContent className="pt-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Degree Requirements ({requirements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedRequirements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No requirements defined for this program</p>
            ) : (
              <div className="space-y-2">
                {sortedRequirements.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{req.category}</p>
                        <Badge variant="secondary">{req.credits_required} credits</Badge>
                        <Badge variant="outline">Order: {req.sort_order}</Badge>
                      </div>
                      {req.description && <p className="text-sm text-muted-foreground mt-1">{req.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(req)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => { setDeletingReq(req); setDeleteDialogOpen(true) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Degree Requirement</DialogTitle>
            <DialogDescription>{editing ? 'Update the requirement details' : 'Define a new degree requirement'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g., Core Courses, Electives, General Education" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional description of this requirement" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credits Required *</Label>
                <Input type="number" min="0" value={formData.credits_required} onChange={(e) => setFormData({...formData, credits_required: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" min="0" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: e.target.value})} />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deletingReq?.category}" requirement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
