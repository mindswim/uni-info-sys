"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, GraduationCap, BookOpen, Calendar, Pencil, Trash2 } from 'lucide-react'
import { CsvImportExport } from '@/components/admin/csv-import-export'
import { getAuthToken } from '@/lib/api-client'

interface Department {
  id: number
  faculty_id: number
  name: string
  code: string
  description?: string
  created_at: string
  updated_at: string
}

interface Program {
  id: number
  department_id: number
  name: string
  code: string
  degree_type: 'bachelor' | 'master' | 'phd' | 'certificate'
  duration_years: number
  credits_required: number
  description?: string
  created_at: string
  updated_at: string
  department?: Department
}

export function ProgramsTab() {
  const { toast } = useToast()

  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [degreeTypeFilter, setDegreeTypeFilter] = useState<string>('all')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    degree_type: 'bachelor' as Program['degree_type'],
    duration_years: '',
    credits_required: '',
    description: ''
  })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    degree_type: 'bachelor' as Program['degree_type'],
    duration_years: '',
    credits_required: '',
    description: ''
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()

      const [programsResponse, departmentsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ])

      if (!programsResponse.ok || !departmentsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const programsData = await programsResponse.json()
      const departmentsData = await departmentsResponse.json()

      setPrograms(programsData.data || programsData)
      setDepartments(departmentsData.data || departmentsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch programs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = async () => {
    if (!formData.name || !formData.code || !formData.department_id || !formData.duration_years || !formData.credits_required) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          department_id: parseInt(formData.department_id),
          degree_type: formData.degree_type,
          duration_years: parseInt(formData.duration_years),
          credits_required: parseInt(formData.credits_required),
          description: formData.description || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create program')
      }

      toast({
        title: 'Success',
        description: 'Program created successfully'
      })

      setCreateDialogOpen(false)
      setFormData({
        name: '',
        code: '',
        department_id: '',
        degree_type: 'bachelor',
        duration_years: '',
        credits_required: '',
        description: ''
      })
      fetchPrograms()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create program',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (program: Program) => {
    setEditingProgram(program)
    setEditFormData({
      name: program.name,
      code: program.code,
      department_id: program.department_id.toString(),
      degree_type: program.degree_type,
      duration_years: program.duration_years.toString(),
      credits_required: program.credits_required.toString(),
      description: program.description || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateProgram = async () => {
    if (!editingProgram) return

    if (!editFormData.name || !editFormData.code || !editFormData.department_id || !editFormData.duration_years || !editFormData.credits_required) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          code: editFormData.code,
          department_id: parseInt(editFormData.department_id),
          degree_type: editFormData.degree_type,
          duration_years: parseInt(editFormData.duration_years),
          credits_required: parseInt(editFormData.credits_required),
          description: editFormData.description || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update program')
      }

      toast({
        title: 'Success',
        description: 'Program updated successfully'
      })

      setEditDialogOpen(false)
      setEditingProgram(null)
      fetchPrograms()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update program',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteDialog = (program: Program) => {
    setDeletingProgram(program)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProgram = async () => {
    if (!deletingProgram) return

    setDeleting(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/programs/${deletingProgram.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete program')
      }

      toast({
        title: 'Success',
        description: 'Program deleted successfully'
      })

      setDeleteDialogOpen(false)
      setDeletingProgram(null)
      fetchPrograms()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete program',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.department?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDegreeType = degreeTypeFilter === 'all' || program.degree_type === degreeTypeFilter

    return matchesSearch && matchesDegreeType
  })

  const getDegreeTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'bachelor': return 'default'
      case 'master': return 'secondary'
      case 'phd': return 'outline'
      case 'certificate': return 'outline'
      default: return 'default'
    }
  }

  const getDegreeTypeLabel = (type: string) => {
    switch (type) {
      case 'bachelor': return 'Bachelor'
      case 'master': return 'Master'
      case 'phd': return 'PhD'
      case 'certificate': return 'Certificate'
      default: return type
    }
  }

  const stats = {
    total: programs.length,
    bachelor: programs.filter(p => p.degree_type === 'bachelor').length,
    master: programs.filter(p => p.degree_type === 'master').length,
    phd: programs.filter(p => p.degree_type === 'phd').length,
    certificate: programs.filter(p => p.degree_type === 'certificate').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs Management</h1>
          <p className="text-muted-foreground">Manage academic programs and degree offerings</p>
        </div>
        <CsvImportExport
          entityName="programs"
          entityDisplayName="Programs"
          importEndpoint="/api/v1/programs/csv/import"
          exportEndpoint="/api/v1/programs/csv/export"
          templateEndpoint="/api/v1/programs/csv/template"
          onImportComplete={fetchPrograms}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bachelor</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bachelor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.master}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PhD</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.phd}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificate}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Programs</CardTitle>
              <CardDescription>View and manage all academic programs</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by program name, code, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={degreeTypeFilter} onValueChange={setDegreeTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by degree type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bachelor">Bachelor</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No programs found
                </div>
              ) : (
                filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge variant={getDegreeTypeBadgeVariant(program.degree_type)}>
                          {getDegreeTypeLabel(program.degree_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Code: {program.code}</span>
                        <span>Department: {program.department?.name || 'N/A'}</span>
                        <span>{program.duration_years} years</span>
                        <span>{program.credits_required} credits</span>
                      </div>
                      {program.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(program)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(program)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>Add a new academic program to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Program Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., CS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree_type">Degree Type *</Label>
                <Select
                  value={formData.degree_type}
                  onValueChange={(value) => setFormData({ ...formData, degree_type: value as Program['degree_type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (years) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_years}
                  onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                  placeholder="e.g., 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits Required *</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  value={formData.credits_required}
                  onChange={(e) => setFormData({ ...formData, credits_required: e.target.value })}
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the program..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProgram} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>Update program information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Program Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Program Code *</Label>
                <Input
                  id="edit-code"
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  placeholder="e.g., CS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department *</Label>
                <Select
                  value={editFormData.department_id}
                  onValueChange={(value) => setEditFormData({ ...editFormData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-degree_type">Degree Type *</Label>
                <Select
                  value={editFormData.degree_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, degree_type: value as Program['degree_type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (years) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={editFormData.duration_years}
                  onChange={(e) => setEditFormData({ ...editFormData, duration_years: e.target.value })}
                  placeholder="e.g., 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credits">Credits Required *</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="1"
                  value={editFormData.credits_required}
                  onChange={(e) => setEditFormData({ ...editFormData, credits_required: e.target.value })}
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Brief description of the program..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgram} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the program "{deletingProgram?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProgram} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
