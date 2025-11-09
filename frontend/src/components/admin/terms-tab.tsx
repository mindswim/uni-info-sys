"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatCard } from "@/components/layouts"
import { Calendar, Plus, Search, CalendarCheck, CalendarClock, Loader2, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services"
import type { Term } from "@/types/api-types"

export function TermsTab() {
  const { toast } = useToast()
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear(),
    semester: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: ''
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear(),
    semester: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: ''
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTerm, setDeletingTerm] = useState<Term | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllTerms()
      setTerms(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load terms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const handleCreateTerm = async () => {
    // Validation
    if (!formData.name || !formData.semester || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            academic_year: formData.academic_year,
            semester: formData.semester,
            start_date: formData.start_date,
            end_date: formData.end_date,
            registration_start: formData.registration_start || undefined,
            registration_end: formData.registration_end || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create term')
      }

      toast({
        title: "Term Created",
        description: "The academic term has been created successfully",
      })

      setCreateDialogOpen(false)
      setFormData({
        name: '',
        academic_year: new Date().getFullYear(),
        semester: '',
        start_date: '',
        end_date: '',
        registration_start: '',
        registration_end: ''
      })
      fetchTerms()
    } catch (error: any) {
      console.error('Create term error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create term. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (term: Term) => {
    setEditingTerm(term)
    setEditFormData({
      name: term.name || '',
      academic_year: term.academic_year || new Date().getFullYear(),
      semester: term.semester || '',
      start_date: term.start_date || '',
      end_date: term.end_date || '',
      registration_start: term.registration_start || '',
      registration_end: term.registration_end || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateTerm = async () => {
    if (!editingTerm) return

    // Validation
    if (!editFormData.name || !editFormData.semester || !editFormData.start_date || !editFormData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (new Date(editFormData.end_date) <= new Date(editFormData.start_date)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms/${editingTerm.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: editFormData.name,
            academic_year: editFormData.academic_year,
            semester: editFormData.semester,
            start_date: editFormData.start_date,
            end_date: editFormData.end_date,
            registration_start: editFormData.registration_start || undefined,
            registration_end: editFormData.registration_end || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update term')
      }

      toast({
        title: "Term Updated",
        description: "The academic term has been updated successfully",
      })

      setEditDialogOpen(false)
      setEditingTerm(null)
      fetchTerms()
    } catch (error: any) {
      console.error('Update term error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update term. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (term: Term) => {
    setDeletingTerm(term)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTerm = async () => {
    if (!deletingTerm) return

    setDeleting(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/terms/${deletingTerm.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete term')
      }

      toast({
        title: "Term Deleted",
        description: "The term has been deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingTerm(null)
      fetchTerms()
    } catch (error: any) {
      console.error('Delete term error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete term. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalTerms = terms.length
  const currentTerm = terms.find(t => t.is_current)
  const upcomingTerms = terms.filter(t => new Date(t.start_date) > new Date() && !t.is_current).length
  const pastTerms = terms.filter(t => new Date(t.end_date) < new Date()).length

  // Filter terms by search
  const filteredTerms = terms.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.academic_year?.toString().includes(searchTerm)
  )

  // Sort terms by start date (most recent first)
  const sortedTerms = [...filteredTerms].sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Term Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Terms"
          value={totalTerms.toString()}
          description="All academic terms"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Current Term"
          value={currentTerm ? "1" : "0"}
          description={currentTerm?.name || "No active term"}
          icon={<CalendarCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Upcoming"
          value={upcomingTerms.toString()}
          description="Future terms"
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          title="Past Terms"
          value={pastTerms.toString()}
          description="Completed terms"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Term
        </Button>
      </div>

      {/* Terms List */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Terms ({filteredTerms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTerms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No terms found
            </p>
          ) : (
            <div className="space-y-2">
              {sortedTerms.map((term) => {
                const isActive = term.is_current
                const isUpcoming = new Date(term.start_date) > new Date()
                const isPast = new Date(term.end_date) < new Date()

                return (
                  <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{term.name}</p>
                        {isActive && <Badge className="bg-green-600">Current</Badge>}
                        {isUpcoming && !isActive && <Badge variant="secondary">Upcoming</Badge>}
                        {isPast && <Badge variant="outline">Past</Badge>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-2">
                        <div>
                          <p className="font-medium">Academic Year</p>
                          <p>{term.academic_year}</p>
                        </div>
                        <div>
                          <p className="font-medium">Semester</p>
                          <p>{term.semester}</p>
                        </div>
                        <div>
                          <p className="font-medium">Term Duration</p>
                          <p>{formatDate(term.start_date)} - {formatDate(term.end_date)}</p>
                        </div>
                        {term.registration_start && term.registration_end && (
                          <div>
                            <p className="font-medium">Registration</p>
                            <p>{formatDate(term.registration_start)} - {formatDate(term.registration_end)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(term)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(term)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Term Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Academic Term</DialogTitle>
            <DialogDescription>
              Add a new academic term to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Term Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Term Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Fall 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Academic Year and Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Term Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Registration Period (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_start">Registration Start (Optional)</Label>
                <Input
                  id="registration_start"
                  type="date"
                  value={formData.registration_start}
                  onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_end">Registration End (Optional)</Label>
                <Input
                  id="registration_end"
                  type="date"
                  value={formData.registration_end}
                  onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTerm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Term
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Term Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Academic Term</DialogTitle>
            <DialogDescription>
              Update the academic term information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Term Name */}
            <div className="space-y-2">
              <Label htmlFor="edit_name">Term Name *</Label>
              <Input
                id="edit_name"
                placeholder="e.g., Fall 2024"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            {/* Academic Year and Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_academic_year">Academic Year *</Label>
                <Input
                  id="edit_academic_year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={editFormData.academic_year}
                  onChange={(e) => setEditFormData({ ...editFormData, academic_year: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_semester">Semester *</Label>
                <Select
                  value={editFormData.semester}
                  onValueChange={(value) => setEditFormData({ ...editFormData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Term Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={editFormData.start_date}
                  onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={editFormData.end_date}
                  onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Registration Period (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_registration_start">Registration Start (Optional)</Label>
                <Input
                  id="edit_registration_start"
                  type="date"
                  value={editFormData.registration_start}
                  onChange={(e) => setEditFormData({ ...editFormData, registration_start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_registration_end">Registration End (Optional)</Label>
                <Input
                  id="edit_registration_end"
                  type="date"
                  value={editFormData.registration_end}
                  onChange={(e) => setEditFormData({ ...editFormData, registration_end: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTerm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Term
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Term</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTerm && (
                <>
                  Are you sure you want to delete <strong>{deletingTerm.name}</strong>?
                  <br /><br />
                  This action cannot be undone. All associated course sections and enrollments may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTerm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Term'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
