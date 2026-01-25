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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, FileText, File, Video, Link as LinkIcon, BookOpen,
  Pencil, Trash2, Eye, EyeOff, GripVertical, Download,
  FileImage, FileSpreadsheet, FileArchive
} from "lucide-react"
import { format } from "date-fns"

interface CourseSection {
  id: number
  course: {
    course_code: string
    title: string
  }
  section_number: string
}

interface CourseMaterial {
  id: number
  course_section_id: number
  title: string
  description?: string
  type: string
  file_path?: string
  file_name?: string
  file_size?: number
  url?: string
  is_required: boolean
  is_published: boolean
  display_order: number
  created_at: string
}

const MATERIAL_TYPES = [
  { value: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { value: 'reading', label: 'Reading', icon: FileText },
  { value: 'lecture_notes', label: 'Lecture Notes', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'file', label: 'File', icon: File },
  { value: 'other', label: 'Other', icon: File },
]

const getTypeIcon = (type: string) => {
  const typeConfig = MATERIAL_TYPES.find(t => t.value === type)
  return typeConfig?.icon || File
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MaterialsTab() {
  const [sections, setSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'file',
    url: '',
    is_required: false,
    is_published: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchMaterials(selectedSection)
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

  const fetchMaterials = async (sectionId: string) => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${sectionId}/materials`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch materials')
      const data = await response.json()
      setMaterials(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const payload = {
        ...formData,
        course_section_id: parseInt(selectedSection),
      }

      const url = editingMaterial
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-materials/${editingMaterial.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-materials`

      const response = await fetch(url, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save material')

      toast({
        title: editingMaterial ? "Material Updated" : "Material Added",
        description: `"${formData.title}" has been ${editingMaterial ? 'updated' : 'added'}.`,
      })

      setDialogOpen(false)
      resetForm()
      fetchMaterials(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save material",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (material: CourseMaterial) => {
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-materials/${material.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to delete material')

      toast({
        title: "Material Deleted",
        description: `"${material.title}" has been removed.`,
      })

      fetchMaterials(selectedSection)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete material",
        variant: "destructive",
      })
    }
  }

  const togglePublish = async (material: CourseMaterial) => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-materials/${material.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ is_published: !material.is_published }),
        }
      )

      if (!response.ok) throw new Error('Failed to update material')

      toast({
        title: material.is_published ? "Unpublished" : "Published",
        description: `"${material.title}" is now ${material.is_published ? 'hidden from' : 'visible to'} students.`,
      })

      fetchMaterials(selectedSection)
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
      description: '',
      type: 'file',
      url: '',
      is_required: false,
      is_published: true,
    })
    setEditingMaterial(null)
  }

  const openEditDialog = (material: CourseMaterial) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description || '',
      type: material.type,
      url: material.url || '',
      is_required: material.is_required,
      is_published: material.is_published,
    })
    setDialogOpen(true)
  }

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.type]) acc[material.type] = []
    acc[material.type].push(material)
    return acc
  }, {} as Record<string, CourseMaterial[]>)

  const stats = {
    total: materials.length,
    published: materials.filter(m => m.is_published).length,
    required: materials.filter(m => m.is_required).length,
  }

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {selectedSection && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.required}</div>
              </CardContent>
            </Card>
          </div>

          {/* Materials List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Share resources with your students</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMaterial ? 'Edit Material' : 'Add Material'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Material title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(formData.type === 'link' || formData.type === 'video') && (
                      <div className="grid gap-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_required"
                        checked={formData.is_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                      />
                      <Label htmlFor="is_required">Required reading</Label>
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
                      {editingMaterial ? 'Update' : 'Add'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No materials yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first course material</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedMaterials).map(([type, items]) => {
                    const TypeIcon = getTypeIcon(type)
                    const typeLabel = MATERIAL_TYPES.find(t => t.value === type)?.label || type
                    return (
                      <div key={type}>
                        <div className="flex items-center gap-2 mb-3">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium capitalize">{typeLabel}</h3>
                          <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                        </div>
                        <div className="border rounded-lg divide-y">
                          {items.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{material.title}</span>
                                  {material.is_required && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                  {!material.is_published && (
                                    <Badge variant="secondary" className="text-xs">Draft</Badge>
                                  )}
                                </div>
                                {material.description && (
                                  <p className="text-sm text-muted-foreground truncate mt-1">
                                    {material.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {material.file_size && (
                                    <span>{formatFileSize(material.file_size)}</span>
                                  )}
                                  <span>Added {format(new Date(material.created_at), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => togglePublish(material)}
                                  title={material.is_published ? "Unpublish" : "Publish"}
                                >
                                  {material.is_published ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(material)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(material)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedSection && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course section above to manage materials
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
