"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Building2, Plus, Search, GraduationCap, Folders } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminService } from "@/services"
import type { Faculty, Department } from "@/types/api-types"

export function FacultyTab() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [facultiesData, departmentsData] = await Promise.all([
          adminService.getAllFaculties(),
          adminService.getAllDepartments()
        ])
        setFaculties(facultiesData.data || [])
        setDepartments(departmentsData.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
  const totalFaculties = faculties.length
  const totalDepartments = departments.length
  const totalPrograms = departments.reduce((sum, dept) => sum + (dept.programs?.length || 0), 0)
  const withDeans = faculties.filter(f => f.dean_id).length

  // Filter functions
  const filteredFaculties = faculties.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = departments.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Faculties"
          value={totalFaculties.toString()}
          description="Academic divisions"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="Departments"
          value={totalDepartments.toString()}
          description="Academic departments"
          icon={<Folders className="h-4 w-4" />}
        />
        <StatCard
          title="Programs"
          value={totalPrograms.toString()}
          description="Academic programs"
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          title="With Deans"
          value={withDeans.toString()}
          description="Assigned leadership"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculties and departments..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs for Faculties and Departments */}
      <Tabs defaultValue="faculties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faculties">Faculties ({filteredFaculties.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({filteredDepartments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="faculties" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Faculties ({filteredFaculties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaculties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No faculties found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredFaculties.map((faculty) => (
                    <div key={faculty.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{faculty.name}</p>
                          <Badge variant="outline">{faculty.code}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {faculty.dean && <span>Dean: {faculty.dean.user?.name}</span>}
                          {faculty.departments && <span>{faculty.departments.length} departments</span>}
                        </div>
                        {faculty.description && (
                          <p className="text-sm text-muted-foreground mt-1">{faculty.description}</p>
                        )}
                      </div>
                      {faculty.established_date && (
                        <Badge variant="secondary">
                          Est. {new Date(faculty.established_date).getFullYear()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDepartments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No departments found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDepartments.map((department) => (
                    <div key={department.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{department.name}</p>
                          <Badge variant="outline">{department.code}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {department.faculty && <span>Faculty: {department.faculty.name}</span>}
                          {department.head && <span>Head: {department.head.user?.name}</span>}
                          {department.programs && <span>{department.programs.length} programs</span>}
                        </div>
                        {department.description && (
                          <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
