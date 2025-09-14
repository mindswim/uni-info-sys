"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { EnrollmentsTable } from "@/components/data-table/enrollments-table"
import { Enrollment } from "@/lib/university-api"
import UniversityAPI from "@/lib/university-api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, RefreshCw } from "lucide-react"


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Enrollments" }
]

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEnrollments, setTotalEnrollments] = useState(0)

  const loadEnrollments = async () => {
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
      
      const response = await UniversityAPI.getEnrollments(params)
      setEnrollments(response.data)
      setTotalPages(response.meta?.last_page || 1)
      setTotalEnrollments(response.meta?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnrollments()
  }, [currentPage, statusFilter])

  const handleRefresh = () => {
    loadEnrollments()
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleEnrollmentSelect = (enrollment: Enrollment) => {
    console.log("Selected enrollment:", enrollment.id)
  }

  const handleEnrollmentView = (enrollment: Enrollment) => {
    console.log("View enrollment:", enrollment.id)
  }

  const handleEnrollmentEdit = (enrollment: Enrollment) => {
    console.log("Edit enrollment:", enrollment.id)
  }

  const handleEnrollmentDelete = async (enrollment: Enrollment) => {
    try {
      await UniversityAPI.withdrawEnrollment(enrollment.id)
      loadEnrollments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw enrollment')
    }
  }

  const filteredEnrollments = searchTerm
    ? enrollments.filter(enrollment => 
        enrollment.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course_section.course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course_section.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : enrollments

  const tableData = {
    data: filteredEnrollments,
    total: totalEnrollments,
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
                placeholder="Search enrollments..."
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
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {totalEnrollments} total enrollments
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

        <EnrollmentsTable
          data={tableData}
          loading={loading}
          onEnrollmentSelect={handleEnrollmentSelect}
          onEnrollmentView={handleEnrollmentView}
          onEnrollmentEdit={handleEnrollmentEdit}
          onEnrollmentDelete={handleEnrollmentDelete}
          onPageChange={setCurrentPage}
        />
      </div>
    </AppShell>
  )
}