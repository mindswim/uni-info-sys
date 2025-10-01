"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { CourseSectionsTable } from "@/components/data-table/course-sections-table"
import { adminService } from "@/services"
import type { CourseSection } from "@/types/api-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, RefreshCw } from "lucide-react"

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Course Sections" }
]

export default function CourseSectionsPage() {
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSections, setTotalSections] = useState(0)

  const loadCourseSections = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        per_page: 20
      }

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await adminService.getCourseSections(params)
      setCourseSections(response.data)
      setTotalPages(response.meta?.last_page || 1)
      setTotalSections(response.meta?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourseSections()
  }, [currentPage, statusFilter])

  const handleRefresh = () => {
    loadCourseSections()
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSectionSelect = (section: CourseSection) => {
    console.log("Selected section:", section.id)
  }

  const handleSectionView = (section: CourseSection) => {
    console.log("View section:", section.id)
  }

  const handleSectionEdit = (section: CourseSection) => {
    console.log("Edit section:", section.id)
  }

  const handleSectionDelete = async (section: CourseSection) => {
    try {
      await adminService.deleteCourseSection(section.id)
      loadCourseSections()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course section')
    }
  }

  const filteredSections = searchTerm
    ? courseSections.filter(section => {
        const courseCode = section.course?.code || ''
        const courseName = section.course?.name || ''
        const instructorName = section.instructor ?
          `${section.instructor.first_name} ${section.instructor.last_name}` : ''

        return courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      })
    : courseSections

  const tableData = {
    data: filteredSections,
    total: totalSections,
    page: currentPage,
    per_page: 20,
    last_page: totalPages
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search course sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {totalSections} total sections
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <CourseSectionsTable
          data={tableData}
          loading={loading}
          onSectionSelect={handleSectionSelect}
          onSectionView={handleSectionView}
          onSectionEdit={handleSectionEdit}
          onSectionDelete={handleSectionDelete}
          onPageChange={setCurrentPage}
        />
      </div>
    </AppShell>
  )
}
