"use client"

import { AppShell } from "@/components/layout/app-shell"
import { PermissionsTable } from "@/components/data-table/permissions-table"
import { Permission, TableData } from "@/types/university"

// Mock data for permissions
const mockPermissions: Permission[] = [
  // System Administration Permissions
  { id: 1, name: "manage_system", description: "Full system administration including configuration and maintenance", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  { id: 2, name: "manage_users", description: "Create, edit, and delete user accounts", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 3 },
  { id: 3, name: "manage_roles", description: "Create and modify user roles and permissions", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  
  // User Management
  { id: 4, name: "view_users", description: "View user profiles and basic information", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 5 },
  { id: 5, name: "edit_users", description: "Modify user profiles and account settings", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 4 },
  { id: 6, name: "delete_users", description: "Remove user accounts from the system", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  
  // Student Management
  { id: 7, name: "view_students", description: "Access student profiles and academic information", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 8 },
  { id: 8, name: "edit_students", description: "Modify student records and academic data", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 6 },
  { id: 9, name: "manage_enrollments", description: "Handle student course registrations and scheduling", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 5 },
  
  // Academic Management
  { id: 10, name: "view_courses", description: "Browse course catalog and section information", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 10 },
  { id: 11, name: "manage_courses", description: "Create, edit, and delete courses and sections", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 4 },
  { id: 12, name: "manage_programs", description: "Oversee academic programs and degree requirements", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 3 },
  { id: 13, name: "grade_students", description: "Enter and modify student grades", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  
  // Admissions
  { id: 14, name: "view_applications", description: "Access admission applications and supporting documents", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 6 },
  { id: 15, name: "manage_applications", description: "Process applications and make admission decisions", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 3 },
  { id: 16, name: "verify_documents", description: "Authenticate and verify submitted academic documents", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  
  // Infrastructure
  { id: 17, name: "manage_buildings", description: "Administer campus buildings and facilities", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  { id: 18, name: "manage_rooms", description: "Schedule and maintain classroom and office spaces", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 3 },
  { id: 19, name: "view_schedules", description: "Access room and course scheduling information", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 7 },
  
  // Student-specific Permissions
  { id: 20, name: "enroll_courses", description: "Register for available course sections", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 1 },
  { id: 21, name: "view_grades", description: "Access personal academic records and grades", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 1 },
  { id: 22, name: "edit_profile", description: "Update personal profile information", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 1 },
  { id: 23, name: "submit_applications", description: "Apply for admission to academic programs", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 1 },
  
  // Reporting and Analytics
  { id: 24, name: "view_reports", description: "Access institutional reports and analytics", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 4 },
  { id: 25, name: "generate_reports", description: "Create custom reports and data exports", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 3 },
  
  // Faculty Specific
  { id: 26, name: "manage_sections", description: "Administer course sections including roster and attendance", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  { id: 27, name: "view_roster", description: "Access student enrollment lists for assigned courses", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 },
  { id: 28, name: "manage_waitlists", description: "Process course waitlists and enrollment changes", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z", role_count: 2 }
]

const mockTableData: TableData<Permission> = {
  data: mockPermissions,
  total: 28,
  page: 1,
  per_page: 25,
  last_page: 2
}

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Permissions" }
]

export default function PermissionsPage() {
  const handlePermissionSelect = (permission: Permission) => {
    console.log("Selected permission:", permission.name)
  }

  const handlePermissionView = (permission: Permission) => {
    console.log("View permission:", permission.name)
  }

  const handlePermissionEdit = (permission: Permission) => {
    console.log("Edit permission:", permission.name)
  }

  const handlePermissionDelete = (permission: Permission) => {
    console.log("Delete permission:", permission.name)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PermissionsTable
          data={mockTableData}
          loading={false}
          onPermissionSelect={handlePermissionSelect}
          onPermissionView={handlePermissionView}
          onPermissionEdit={handlePermissionEdit}
          onPermissionDelete={handlePermissionDelete}
        />
      </div>
    </AppShell>
  )
}