"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText, File, Video, Link as LinkIcon, BookOpen,
  Download, ExternalLink, FileImage
} from "lucide-react"
import { format } from "date-fns"

interface Enrollment {
  id: number
  course_section: {
    id: number
    course: {
      course_code: string
      title: string
    }
    section_number: string
  }
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
  display_order: number
  created_at: string
}

const MATERIAL_TYPES = [
  { value: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { value: 'reading', label: 'Readings', icon: FileText },
  { value: 'lecture_notes', label: 'Lecture Notes', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'link', label: 'Links', icon: LinkIcon },
  { value: 'file', label: 'Files', icon: File },
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

export function StudentMaterialsTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("")
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [activeType, setActiveType] = useState<string>("all")

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    if (selectedEnrollment) {
      const enrollment = enrollments.find(e => e.id.toString() === selectedEnrollment)
      if (enrollment) {
        fetchMaterials(enrollment.course_section.id.toString())
      }
    }
  }, [selectedEnrollment, enrollments])

  const fetchEnrollments = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch enrollments')
      const data = await response.json()
      const enrolled = (data.data || []).filter((e: any) => e.status === 'enrolled')
      setEnrollments(enrolled)
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
      // Only show published materials
      const published = (data.data || []).filter((m: CourseMaterial) => m.is_required !== undefined)
      setMaterials(published)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = activeType === 'all'
    ? materials
    : materials.filter(m => m.type === activeType)

  const materialsByType = materials.reduce((acc, material) => {
    if (!acc[material.type]) acc[material.type] = []
    acc[material.type].push(material)
    return acc
  }, {} as Record<string, CourseMaterial[]>)

  const availableTypes = Object.keys(materialsByType)

  const renderMaterial = (material: CourseMaterial) => {
    const TypeIcon = getTypeIcon(material.type)
    const isLink = material.type === 'link' || material.type === 'video'

    return (
      <Card key={material.id} className="hover:border-primary/50 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{material.title}</h3>
                {material.is_required && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">Required</Badge>
                )}
              </div>
              {material.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {material.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {material.file_size && (
                  <span>{formatFileSize(material.file_size)}</span>
                )}
                <span>Added {format(new Date(material.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {isLink && material.url ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(material.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              ) : material.file_path ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    // In a real app, this would download the file
                    window.open(`${process.env.NEXT_PUBLIC_API_URL}/storage/${material.file_path}`, '_blank')
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedEnrollment} onValueChange={setSelectedEnrollment}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => (
                <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                  {enrollment.course_section.course.course_code} - {enrollment.course_section.course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEnrollment && (
        <>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : materials.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No materials available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later for course readings and resources
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{materials.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {materials.filter(m => m.is_required).length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {materials.filter(m => m.type === 'video').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Readings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {materials.filter(m => m.type === 'reading' || m.type === 'lecture_notes').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeType} onValueChange={setActiveType}>
                <TabsList>
                  <TabsTrigger value="all">All ({materials.length})</TabsTrigger>
                  {availableTypes.map(type => {
                    const typeLabel = MATERIAL_TYPES.find(t => t.value === type)?.label || type
                    return (
                      <TabsTrigger key={type} value={type}>
                        {typeLabel} ({materialsByType[type].length})
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                <TabsContent value={activeType} className="mt-4">
                  <div className="space-y-4">
                    {filteredMaterials.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8 text-muted-foreground">
                            No materials in this category
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredMaterials.map(renderMaterial)
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}

      {!selectedEnrollment && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course above to view materials
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
