"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Users, UserPlus, Search, Briefcase, Building } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { adminService } from "@/services"
import type { Staff } from "@/types/api-types"

export function StaffTab() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const data = await adminService.getAllStaff()
        setStaff(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load staff')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

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
  const totalStaff = staff.length
  const departments = new Set(staff.map(s => s.department_id).filter(Boolean)).size
  const withOffice = staff.filter(s => s.office_location).length

  // Get unique job titles
  const jobTitles = new Set(staff.map(s => s.job_title).filter(Boolean)).size

  // Filter staff by search term
  const filteredStaff = staff.filter(s =>
    s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staff_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={totalStaff.toString()}
          description="All staff members"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Departments"
          value={departments.toString()}
          description="Unique departments"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Job Titles"
          value={jobTitles.toString()}
          description="Unique positions"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="With Office"
          value={withOffice.toString()}
          description="Assigned offices"
          icon={<Building className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No staff members found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredStaff.slice(0, 20).map((staffMember) => (
                <div key={staffMember.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{staffMember.user?.name || 'Unknown'}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>ID: {staffMember.staff_number}</span>
                      {staffMember.job_title && <span>{staffMember.job_title}</span>}
                      {staffMember.department && <span>{staffMember.department.name}</span>}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {staffMember.user?.email && <span>{staffMember.user.email}</span>}
                      {staffMember.office_location && <span>Office: {staffMember.office_location}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {staffMember.hire_date && (
                      <Badge variant="outline">
                        Hired: {new Date(staffMember.hire_date).getFullYear()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
