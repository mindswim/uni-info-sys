"use client"

import { AppShell } from "@/components/layout/app-shell"
import { RolesTable } from "@/components/data-table/roles-table"
import { Role, TableData } from "@/types/university"

// Mock data for roles
const mockRoles: Role[] = [
  {
    id: 1,
    name: "administrator",
    description: "Full system access with all administrative privileges including user management, system configuration, and complete data access.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 2,
    permission_count: 25
  },
  {
    id: 2,
    name: "dean",
    description: "Faculty-level administrator with authority over academic programs, department management, and faculty oversight within their college.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 5,
    permission_count: 18
  },
  {
    id: 3,
    name: "staff",
    description: "University employees including professors, administrative staff, and support personnel with access to relevant academic and operational functions.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 42,
    permission_count: 12
  },
  {
    id: 4,
    name: "instructor",
    description: "Teaching faculty with access to course management, student grading, enrollment oversight, and academic content administration.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 28,
    permission_count: 8
  },
  {
    id: 5,
    name: "student",
    description: "Enrolled students with access to course registration, academic records, application management, and personal profile updates.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 1247,
    permission_count: 5
  },
  {
    id: 6,
    name: "admissions_officer",
    description: "Staff responsible for application review, admission decisions, document verification, and prospective student communications.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 8,
    permission_count: 10
  },
  {
    id: 7,
    name: "registrar",
    description: "Academic records management including transcript processing, enrollment verification, degree audits, and graduation processing.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 3,
    permission_count: 14
  },
  {
    id: 8,
    name: "academic_advisor",
    description: "Student support role with access to academic planning tools, degree requirements, course recommendations, and student progress tracking.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 15,
    permission_count: 7
  },
  {
    id: 9,
    name: "department_chair",
    description: "Department-level leadership with authority over faculty management, course scheduling, budget oversight, and departmental policies.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 12,
    permission_count: 16
  },
  {
    id: 10,
    name: "it_support",
    description: "Technical support staff with system maintenance privileges, user account management, and infrastructure monitoring capabilities.",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 6,
    permission_count: 9
  }
]

const mockTableData: TableData<Role> = {
  data: mockRoles,
  total: 10,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Roles" }
]

export default function RolesPage() {
  const handleRoleSelect = (role: Role) => {
    console.log("Selected role:", role.name)
  }

  const handleRoleView = (role: Role) => {
    console.log("View role:", role.name)
  }

  const handleRoleEdit = (role: Role) => {
    console.log("Edit role:", role.name)
  }

  const handleRoleDelete = (role: Role) => {
    console.log("Delete role:", role.name)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <RolesTable
          data={mockTableData}
          loading={false}
          onRoleSelect={handleRoleSelect}
          onRoleView={handleRoleView}
          onRoleEdit={handleRoleEdit}
          onRoleDelete={handleRoleDelete}
        />
      </div>
    </AppShell>
  )
}