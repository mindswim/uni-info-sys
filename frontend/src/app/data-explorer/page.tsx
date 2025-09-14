"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { ChevronRight, ExternalLink, Eye } from "lucide-react"

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Data Explorer" }
]

// All table data consolidated for spreadsheet view
const allTableData = {
  // Authentication & People
  users: [
    { id: 1, name: "Dr. Elizabeth Harper", email: "admin@demo.com", role: "Administrator", verified: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "Maria Rodriguez", email: "maria@demo.com", role: "Student", verified: true, created_at: "2024-01-20T14:20:00Z" },
    { id: 3, name: "David Park", email: "david@demo.com", role: "Student", verified: true, created_at: "2023-09-10T11:15:00Z" },
    { id: 4, name: "Prof. Sarah Kim", email: "sarah.kim@demo.com", role: "Faculty", verified: true, created_at: "2024-01-10T09:00:00Z" }
  ],
  students: [
    { id: 1, user_id: 2, student_number: "STU2025001", first_name: "Maria", last_name: "Rodriguez", date_of_birth: "2000-03-15", gender: "female", country: "Mexico", city: "Mexico City", phone: "+52-555-123-4567" },
    { id: 2, user_id: 4, student_number: "STU2024002", first_name: "David", last_name: "Park", date_of_birth: "1999-07-22", gender: "male", country: "South Korea", city: "Seoul", phone: "+82-10-1234-5678" },
    { id: 3, user_id: 5, student_number: "STU2025003", first_name: "Sophie", last_name: "Turner", date_of_birth: "2001-11-08", gender: "female", country: "United States", city: "New York", phone: "+1-555-987-6543" }
  ],
  staff: [
    { id: 1, user_id: 1, employee_number: "EMP2024001", first_name: "Elizabeth", last_name: "Harper", position: "Administrator", department_id: 1, hire_date: "2020-09-01", salary: 75000 },
    { id: 2, user_id: 3, employee_number: "FAC2023001", first_name: "Sarah", last_name: "Kim", position: "Professor", department_id: 1, hire_date: "2018-08-15", salary: 85000 }
  ],
  roles: [
    { id: 1, name: "administrator", display_name: "Administrator", description: "Full system access", created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "faculty", display_name: "Faculty", description: "Course management and grading", created_at: "2024-01-15T10:30:00Z" },
    { id: 3, name: "student", display_name: "Student", description: "Course enrollment and records", created_at: "2024-01-15T10:30:00Z" },
    { id: 4, name: "staff", display_name: "Staff", description: "Administrative functions", created_at: "2024-01-15T10:30:00Z" }
  ],
  permissions: [
    { id: 1, name: "manage_users", display_name: "Manage Users", description: "Create, edit, delete users", guard_name: "web" },
    { id: 2, name: "manage_courses", display_name: "Manage Courses", description: "Create, edit, delete courses", guard_name: "web" },
    { id: 3, name: "enroll_courses", display_name: "Enroll in Courses", description: "Student course enrollment", guard_name: "web" },
    { id: 4, name: "view_grades", display_name: "View Grades", description: "Access to academic records", guard_name: "web" }
  ],

  // Academic Structure
  faculties: [
    { id: 1, name: "Faculty of Engineering", code: "ENG", dean_id: 1, established_date: "1965-01-01", is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "Faculty of Science", code: "SCI", dean_id: 2, established_date: "1963-01-01", is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 3, name: "Faculty of Business", code: "BUS", dean_id: null, established_date: "1970-01-01", is_active: true, created_at: "2024-01-15T10:30:00Z" }
  ],
  departments: [
    { id: 1, name: "Computer Science", code: "CS", faculty_id: 1, head_id: 1, is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "Electrical Engineering", code: "EE", faculty_id: 1, head_id: 2, is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 3, name: "Mathematics", code: "MATH", faculty_id: 2, head_id: null, is_active: true, created_at: "2024-01-15T10:30:00Z" }
  ],
  programs: [
    { id: 1, name: "Computer Science", degree_type: "bachelor", department_id: 1, duration_years: 4, total_credits: 120, is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "Data Science", degree_type: "bachelor", department_id: 1, duration_years: 4, total_credits: 120, is_active: true, created_at: "2024-01-15T10:30:00Z" },
    { id: 3, name: "Master of Computer Science", degree_type: "master", department_id: 1, duration_years: 2, total_credits: 36, is_active: true, created_at: "2024-01-15T10:30:00Z" }
  ],
  courses: [
    { id: 1, code: "CS101", name: "Introduction to Programming", department_id: 1, credits: 3, level: "undergraduate", description: "Basic programming concepts", prerequisites: null, is_active: true },
    { id: 2, code: "CS201", name: "Data Structures", department_id: 1, credits: 3, level: "undergraduate", description: "Advanced data structures", prerequisites: "CS101", is_active: true },
    { id: 3, code: "MATH101", name: "Calculus I", department_id: 3, credits: 4, level: "undergraduate", description: "Differential calculus", prerequisites: null, is_active: true }
  ],

  // Operational Core
  terms: [
    { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15", is_active: true, registration_start: "2024-08-01", registration_end: "2024-08-31" },
    { id: 2, name: "Spring 2025", code: "S2025", start_date: "2025-01-15", end_date: "2025-05-15", is_active: false, registration_start: "2024-11-01", registration_end: "2024-11-30" },
    { id: 3, name: "Summer 2025", code: "SU2025", start_date: "2025-06-01", end_date: "2025-08-15", is_active: false, registration_start: "2025-04-01", registration_end: "2025-04-30" }
  ],
  courseSections: [
    { id: 1, course_id: 1, section_number: "001", term_id: 1, instructor_id: 2, room_id: 1, max_enrollment: 30, current_enrollment: 25, schedule: "MWF 09:00-10:00", status: "active" },
    { id: 2, course_id: 1, section_number: "002", term_id: 1, instructor_id: 2, room_id: 2, max_enrollment: 30, current_enrollment: 30, schedule: "TT 14:00-15:30", status: "full" },
    { id: 3, course_id: 2, section_number: "001", term_id: 1, instructor_id: 2, room_id: 3, max_enrollment: 25, current_enrollment: 18, schedule: "MWF 11:00-12:00", status: "active" }
  ],
  enrollments: [
    { id: 1, student_id: 1, course_section_id: 1, enrollment_status: "enrolled", grade: null, enrollment_date: "2024-08-15T10:00:00Z", credits_earned: 3, final_grade: null },
    { id: 2, student_id: 2, course_section_id: 1, enrollment_status: "enrolled", grade: "A", enrollment_date: "2024-08-15T10:30:00Z", credits_earned: 3, final_grade: "A" },
    { id: 3, student_id: 1, course_section_id: 3, enrollment_status: "waitlisted", grade: null, enrollment_date: "2024-08-16T14:00:00Z", credits_earned: 0, final_grade: null }
  ],
  applications: [
    { id: 1, student_id: 1, term_id: 1, status: "accepted", application_date: "2024-01-20T14:20:00Z", decision_date: "2024-01-25T10:30:00Z", decision_status: "accepted", created_at: "2024-01-20T14:20:00Z" },
    { id: 2, student_id: 3, term_id: 1, status: "pending", application_date: "2024-02-01T16:45:00Z", decision_date: null, decision_status: "pending", created_at: "2024-02-01T16:45:00Z" },
    { id: 3, student_id: 2, term_id: 2, status: "accepted", application_date: "2023-11-15T09:30:00Z", decision_date: "2023-12-01T14:00:00Z", decision_status: "accepted", created_at: "2023-11-15T09:30:00Z" }
  ],

  // Infrastructure
  buildings: [
    { id: 1, name: "Engineering Complex", code: "ENG", address: "123 University Ave", floors: 4, year_built: 1995, is_active: true, total_rooms: 45, accessibility_compliant: true },
    { id: 2, name: "Science Center", code: "SCI", address: "456 Research Blvd", floors: 6, year_built: 2010, is_active: true, total_rooms: 32, accessibility_compliant: true },
    { id: 3, name: "Library Building", code: "LIB", address: "789 Knowledge St", floors: 3, year_built: 1985, is_active: true, total_rooms: 10, accessibility_compliant: false }
  ],
  rooms: [
    { id: 1, building_id: 1, room_number: "ENG101", room_type: "classroom", capacity: 30, equipment: "projector, whiteboard", is_accessible: true, floor: 1, is_active: true },
    { id: 2, building_id: 1, room_number: "ENG205", room_type: "laboratory", capacity: 20, equipment: "computers, network", is_accessible: true, floor: 2, is_active: true },
    { id: 3, building_id: 2, room_number: "SCI301", room_type: "classroom", capacity: 25, equipment: "smart board, audio system", is_accessible: true, floor: 3, is_active: true }
  ],

  // Supporting Data
  academicRecords: [
    { id: 1, student_id: 1, institution_name: "Instituto Tecnológico de México", qualification_type: "high_school", gpa: 9.8, max_gpa: 10.0, graduation_date: "2023-06-15", is_verified: true, verification_date: "2024-01-20T14:20:00Z" },
    { id: 2, student_id: 2, institution_name: "Seoul National University", qualification_type: "bachelor", gpa: 3.85, max_gpa: 4.0, graduation_date: "2023-08-20", is_verified: true, verification_date: "2023-09-10T11:15:00Z" },
    { id: 3, student_id: 3, institution_name: "New York High School", qualification_type: "high_school", gpa: 3.92, max_gpa: 4.0, graduation_date: "2024-06-10", is_verified: false, verification_date: null }
  ],
  documents: [
    { id: 1, student_id: 1, document_type: "transcript", file_name: "maria_rodriguez_transcript.pdf", file_size: 2456789, mime_type: "application/pdf", is_verified: true, version: 1, created_at: "2024-01-20T14:20:00Z" },
    { id: 2, student_id: 1, document_type: "personal_statement", file_name: "maria_personal_statement.docx", file_size: 1234567, mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", is_verified: true, version: 2, created_at: "2024-01-21T10:15:00Z" },
    { id: 3, student_id: 2, document_type: "recommendation", file_name: "david_park_recommendation_prof_kim.pdf", file_size: 987654, mime_type: "application/pdf", is_verified: true, version: 1, created_at: "2023-09-10T11:15:00Z" }
  ],
  programChoices: [
    { id: 1, admission_application_id: 1, program_id: 1, preference_order: 1, status: "accepted", created_at: "2024-01-20T14:20:00Z", updated_at: "2024-01-25T10:30:00Z" },
    { id: 2, admission_application_id: 1, program_id: 2, preference_order: 2, status: "rejected", created_at: "2024-01-20T14:20:00Z", updated_at: "2024-01-25T10:30:00Z" },
    { id: 3, admission_application_id: 2, program_id: 3, preference_order: 1, status: "pending", created_at: "2024-02-01T16:45:00Z", updated_at: "2024-02-01T16:45:00Z" }
  ]
}

const tableMetadata = {
  users: { category: "Authentication & People", recordCount: 4, path: "/users" },
  students: { category: "Authentication & People", recordCount: 3, path: "/students" },
  staff: { category: "Authentication & People", recordCount: 2, path: "/staff" },
  roles: { category: "Authentication & People", recordCount: 4, path: "/roles" },
  permissions: { category: "Authentication & People", recordCount: 4, path: "/permissions" },
  faculties: { category: "Academic Structure", recordCount: 3, path: "/faculties" },
  departments: { category: "Academic Structure", recordCount: 3, path: "/departments" },
  programs: { category: "Academic Structure", recordCount: 3, path: "/programs" },
  courses: { category: "Academic Structure", recordCount: 3, path: "/courses" },
  terms: { category: "Operational Core", recordCount: 3, path: "/terms" },
  courseSections: { category: "Operational Core", recordCount: 3, path: "/course-sections" },
  enrollments: { category: "Operational Core", recordCount: 3, path: "/enrollments" },
  applications: { category: "Operational Core", recordCount: 3, path: "/admissions" },
  buildings: { category: "Infrastructure", recordCount: 3, path: "/buildings" },
  rooms: { category: "Infrastructure", recordCount: 3, path: "/rooms" },
  academicRecords: { category: "Supporting Data", recordCount: 3, path: "/academic-records" },
  documents: { category: "Supporting Data", recordCount: 3, path: "/documents" },
  programChoices: { category: "Supporting Data", recordCount: 3, path: "/program-choices" }
}

const categories = [
  "Authentication & People",
  "Academic Structure", 
  "Operational Core",
  "Infrastructure",
  "Supporting Data"
]

function SpreadsheetTable({ tableName, data }: { tableName: string, data: any[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data available</div>

  const columns = Object.keys(data[0])
  const metadata = tableMetadata[tableName as keyof typeof tableMetadata]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold capitalize">{tableName.replace(/([A-Z])/g, ' $1').trim()}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{metadata?.category}</Badge>
            <span>•</span>
            <span>{data.length} records</span>
            <span>•</span>
            <span>{columns.length} columns</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={metadata?.path || '#'}>
              <Eye className="w-4 h-4 mr-2" />
              View Table
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="text-left p-2 font-medium border-r border-border min-w-[120px]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-border hover:bg-muted/25">
                    {columns.map((column) => (
                      <td key={column} className="p-2 border-r border-border text-xs">
                        <div className="max-w-[200px] truncate">
                          {typeof row[column] === 'boolean' ? (
                            <Badge variant={row[column] ? "default" : "outline"} className="text-xs">
                              {row[column] ? "True" : "False"}
                            </Badge>
                          ) : typeof row[column] === 'object' && row[column] !== null ? (
                            <span className="text-muted-foreground italic">
                              {Array.isArray(row[column]) ? `[${row[column].length} items]` : "[object]"}
                            </span>
                          ) : row[column] === null ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : (
                            String(row[column])
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function DataExplorerPage() {
  const totalTables = Object.keys(allTableData).length
  const totalRecords = Object.values(allTableData).reduce((sum, data) => sum + data.length, 0)

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Explorer</h1>
            <p className="text-muted-foreground">
              Spreadsheet view of all {totalTables} tables with {totalRecords} total records for troubleshooting and analysis
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/system">
              <ChevronRight className="w-4 h-4 mr-2" />
              System Overview
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalTables}</div>
              <p className="text-xs text-muted-foreground">Total Tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalRecords}</div>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tables</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                {category.replace(' & ', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {Object.entries(allTableData).map(([tableName, data]) => (
              <SpreadsheetTable key={tableName} tableName={tableName} data={data} />
            ))}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent 
              key={category} 
              value={category.toLowerCase().replace(/\s+/g, '-')} 
              className="space-y-8"
            >
              {Object.entries(allTableData)
                .filter(([tableName]) => tableMetadata[tableName as keyof typeof tableMetadata]?.category === category)
                .map(([tableName, data]) => (
                  <SpreadsheetTable key={tableName} tableName={tableName} data={data} />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  )
}