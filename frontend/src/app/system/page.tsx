"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "System Overview" }
]

// System data with relationships and counts
const systemTables = [
  // Authentication & People
  {
    category: "Authentication & People",
    tables: [
      {
        name: "Users",
        path: "/users",
        description: "System user accounts with RBAC",
        recordCount: 8,
        status: "healthy",
        relationships: ["Student", "Staff", "Role"],
        keyMetrics: { verified: 7, unverified: 1, roles: 5 }
      },
      {
        name: "Students",
        path: "/students",
        description: "Student profiles and demographics",
        recordCount: 1247,
        status: "healthy",
        relationships: ["User", "Enrollment", "Application", "AcademicRecord"],
        keyMetrics: { active: 1189, inactive: 58, countries: 23 }
      },
      {
        name: "Staff",
        path: "/staff", 
        description: "Faculty and employee management",
        recordCount: 89,
        status: "healthy",
        relationships: ["User", "Department", "CourseSection"],
        keyMetrics: { professors: 45, admin: 28, support: 16 }
      },
      {
        name: "Roles",
        path: "/roles",
        description: "User roles and access levels",
        recordCount: 10,
        status: "healthy", 
        relationships: ["User", "Permission"],
        keyMetrics: { system: 5, custom: 5, permissions: 28 }
      },
      {
        name: "Permissions", 
        path: "/permissions",
        description: "Granular access permissions",
        recordCount: 28,
        status: "healthy",
        relationships: ["Role"],
        keyMetrics: { admin: 8, staff: 12, student: 8 }
      }
    ]
  },
  // Academic Structure
  {
    category: "Academic Structure",
    tables: [
      {
        name: "Faculties",
        path: "/faculties",
        description: "Top-level academic divisions",
        recordCount: 6,
        status: "healthy",
        relationships: ["Department", "Staff"],
        keyMetrics: { withDean: 5, vacant: 1, departments: 12 }
      },
      {
        name: "Departments",
        path: "/departments", 
        description: "Academic departments",
        recordCount: 12,
        status: "healthy",
        relationships: ["Faculty", "Program", "Course", "Staff"],
        keyMetrics: { programs: 25, courses: 156, staff: 89 }
      },
      {
        name: "Programs", 
        path: "/programs",
        description: "Degree programs and requirements",
        recordCount: 25,
        status: "healthy",
        relationships: ["Department", "Course", "Student", "Application"],
        keyMetrics: { bachelor: 18, master: 5, phd: 2 }
      },
      {
        name: "Courses",
        path: "/courses",
        description: "Course catalog and definitions", 
        recordCount: 156,
        status: "healthy",
        relationships: ["Department", "CourseSection", "Program"],
        keyMetrics: { active: 145, inactive: 11, prerequisites: 89 }
      }
    ]
  },
  // Operational Core
  {
    category: "Operational Core", 
    tables: [
      {
        name: "Terms",
        path: "/terms",
        description: "Academic calendar periods",
        recordCount: 6,
        status: "healthy",
        relationships: ["CourseSection", "Application"],
        keyMetrics: { current: 1, upcoming: 2, past: 3 }
      },
      {
        name: "Course Sections",
        path: "/course-sections", 
        description: "Specific class instances with scheduling",
        recordCount: 89,
        status: "healthy",
        relationships: ["Course", "Term", "Staff", "Room", "Enrollment"],
        keyMetrics: { active: 76, full: 23, capacity: 2340 }
      },
      {
        name: "Enrollments",
        path: "/enrollments",
        description: "Student course registrations",
        recordCount: 3456,
        status: "healthy", 
        relationships: ["Student", "CourseSection"],
        keyMetrics: { enrolled: 2987, waitlisted: 234, completed: 235 }
      },
      {
        name: "Applications",
        path: "/admissions",
        description: "Admission application processing", 
        recordCount: 892,
        status: "healthy",
        relationships: ["Student", "Program", "Term", "Document"],
        keyMetrics: { pending: 156, accepted: 423, rejected: 313 }
      }
    ]
  },
  // Infrastructure
  {
    category: "Infrastructure",
    tables: [
      {
        name: "Buildings",
        path: "/buildings",
        description: "Campus facilities and infrastructure",
        recordCount: 5,
        status: "healthy",
        relationships: ["Room"],
        keyMetrics: { rooms: 87, capacity: 4230, utilization: "78%" }
      },
      {
        name: "Rooms", 
        path: "/rooms",
        description: "Individual spaces and equipment",
        recordCount: 87,
        status: "healthy",
        relationships: ["Building", "CourseSection"],
        keyMetrics: { classrooms: 45, labs: 25, offices: 17 }
      }
    ]
  },
  // Supporting Data
  {
    category: "Supporting Data",
    tables: [
      {
        name: "Academic Records",
        path: "/academic-records",
        description: "Student academic history",
        recordCount: 2156,
        status: "healthy",
        relationships: ["Student"],
        keyMetrics: { verified: 1834, pending: 322, gpa_avg: 3.24 }
      },
      {
        name: "Documents",
        path: "/documents", 
        description: "Uploaded files and verification",
        recordCount: 4567,
        status: "healthy",
        relationships: ["Student", "Application"],
        keyMetrics: { verified: 3892, pending: 675, size: "2.3GB" }
      },
      {
        name: "Program Choices",
        path: "/program-choices",
        description: "Application program preferences", 
        recordCount: 1789,
        status: "healthy",
        relationships: ["Application", "Program"],
        keyMetrics: { first_choice: 892, second_choice: 623, third_choice: 274 }
      }
    ]
  }
]

const getStatusVariant = (status: string) => {
  const variants = {
    'healthy': 'default',
    'warning': 'secondary', 
    'error': 'destructive'
  } as const
  return variants[status as keyof typeof variants] || 'outline'
}

const getStatusColor = (status: string) => {
  const colors = {
    'healthy': 'text-green-600',
    'warning': 'text-yellow-600',
    'error': 'text-red-600'
  } as const
  return colors[status as keyof typeof colors] || 'text-gray-600'
}

export default function SystemOverviewPage() {
  const totalTables = systemTables.reduce((sum, category) => sum + category.tables.length, 0)
  const totalRecords = systemTables.reduce((sum, category) => 
    sum + category.tables.reduce((catSum, table) => catSum + table.recordCount, 0), 0
  )
  const healthyTables = systemTables.reduce((sum, category) => 
    sum + category.tables.filter(table => table.status === 'healthy').length, 0
  )

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <p className="text-muted-foreground">
              Complete university management system with {totalTables} interconnected data tables
            </p>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
              <span className="text-2xl">🗄️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTables}</div>
              <p className="text-xs text-muted-foreground">All backend models covered</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Mock data entries</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <span className="text-2xl">💚</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((healthyTables / totalTables) * 100)}%</div>
              <p className="text-xs text-muted-foreground">{healthyTables}/{totalTables} tables healthy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <span className="text-2xl">🏗️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemTables.length}</div>
              <p className="text-xs text-muted-foreground">Functional areas</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Categories */}
        {systemTables.map((category) => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">{category.category}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tables.map((table) => (
                <Card key={table.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <Badge variant={getStatusVariant(table.status)} className="capitalize">
                        {table.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{table.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Record Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Records:</span>
                      <Badge variant="outline">
                        {table.recordCount.toLocaleString()}
                      </Badge>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Key Metrics:</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(table.keyMetrics).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Relationships */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Connected to:</span>
                      <div className="flex flex-wrap gap-1">
                        {table.relationships.map((rel) => (
                          <Badge key={rel} variant="outline" className="text-xs">
                            {rel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="default" size="sm" className="flex-1">
                        <Link href={table.path}>View Table</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Data Flow Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>System Data Flow</CardTitle>
            <p className="text-sm text-muted-foreground">
              How data flows through your university management system
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">User</Badge>
                <span>→</span>
                <Badge variant="outline">Student/Staff</Badge>
                <span>→</span>
                <Badge variant="outline">Applications</Badge>
                <span>→</span>
                <Badge variant="outline">Programs</Badge>
                <span>→</span>
                <Badge variant="outline">Enrollments</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Faculties</Badge>
                <span>→</span>
                <Badge variant="outline">Departments</Badge>
                <span>→</span>
                <Badge variant="outline">Programs</Badge>
                <span>→</span>
                <Badge variant="outline">Courses</Badge>
                <span>→</span>
                <Badge variant="outline">Sections</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Terms</Badge>
                <span>→</span>
                <Badge variant="outline">Sections</Badge>
                <span>→</span>
                <Badge variant="outline">Rooms</Badge>
                <span>→</span>
                <Badge variant="outline">Buildings</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}