"use client"

import { AppShell } from "@/components/layout/app-shell"
import { UsersTable } from "@/components/data-table/users-table"
import { User, TableData } from "@/types/university"

// Mock data for users
const mockUsers: User[] = [
  {
    id: 1,
    name: "Dr. Elizabeth Harper",
    email: "admin@demo.com",
    email_verified_at: "2024-01-15T10:30:00Z",
    password_algorithm: "bcrypt",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    role_names: ["administrator"],
    all_permissions: Array(25).fill(null).map((_, i) => ({ id: i, name: `permission_${i}` }))
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria@demo.com",
    email_verified_at: "2024-01-20T14:20:00Z",
    password_algorithm: "bcrypt",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    role_names: ["student"],
    all_permissions: Array(5).fill(null).map((_, i) => ({ id: i, name: `student_permission_${i}` })),
    student: {
      id: 1,
      user_id: 2,
      student_number: "STU2025001",
      first_name: "Maria",
      last_name: "Rodriguez",
      date_of_birth: "2000-03-15",
      gender: "female",
      phone: "+52-555-123-4567",
      address: "123 Calle Principal",
      city: "Mexico City",
      state: "CDMX",
      postal_code: "01234",
      country: "Mexico",
      emergency_contact_name: "Carmen Rodriguez",
      emergency_contact_phone: "+52-555-234-5678",
      created_at: "2024-01-20T14:20:00Z",
      updated_at: "2024-01-20T14:20:00Z"
    }
  },
  {
    id: 3,
    name: "Dr. Alan Turing",
    email: "turing@university.edu",
    email_verified_at: "2018-08-15T09:00:00Z",
    password_algorithm: "bcrypt",
    created_at: "2018-08-15T09:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    role_names: ["staff", "instructor"],
    all_permissions: Array(15).fill(null).map((_, i) => ({ id: i, name: `staff_permission_${i}` })),
    staff: {
      id: 1,
      employee_id: "CS001",
      first_name: "Dr. Alan",
      last_name: "Turing",
      title: "Professor",
      email: "turing@university.edu",
      phone: "(555) 0201",
      hire_date: "2018-08-15",
      department_id: 1,
      salary: 85000,
      is_active: true,
      created_at: "2018-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 4,
    name: "David Park",
    email: "david@demo.com",
    email_verified_at: "2023-09-10T11:15:00Z",
    password_algorithm: "bcrypt",
    created_at: "2023-09-10T11:15:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    role_names: ["student"],
    all_permissions: Array(5).fill(null).map((_, i) => ({ id: i, name: `student_permission_${i}` })),
    student: {
      id: 2,
      user_id: 4,
      student_number: "STU2024002",
      first_name: "David",
      last_name: "Park",
      date_of_birth: "1999-07-22",
      gender: "male",
      phone: "+82-10-1234-5678",
      address: "456 Gangnam-gu",
      city: "Seoul",
      state: "Seoul",
      postal_code: "06292",
      country: "South Korea",
      emergency_contact_name: "Jung Park",
      emergency_contact_phone: "+82-10-9876-5432",
      created_at: "2023-09-10T11:15:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 5,
    name: "Sophie Turner",
    email: "sophie@demo.com",
    email_verified_at: "2024-02-01T16:45:00Z",
    password_algorithm: "bcrypt",
    created_at: "2024-02-01T16:45:00Z",
    updated_at: "2024-02-01T16:45:00Z",
    role_names: ["student"],
    all_permissions: Array(5).fill(null).map((_, i) => ({ id: i, name: `student_permission_${i}` })),
    student: {
      id: 3,
      user_id: 5,
      student_number: "STU2025003",
      first_name: "Sophie",
      last_name: "Turner",
      date_of_birth: "2001-11-08",
      gender: "female",
      phone: "+1-555-987-6543",
      address: "789 Broadway Ave",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "United States",
      emergency_contact_name: "Sarah Turner",
      emergency_contact_phone: "+1-555-876-5432",
      created_at: "2024-02-01T16:45:00Z",
      updated_at: "2024-02-01T16:45:00Z"
    }
  },
  {
    id: 6,
    name: "Dr. Ada Lovelace",
    email: "lovelace@university.edu",
    email_verified_at: "2019-01-15T09:00:00Z",
    password_algorithm: "bcrypt",
    created_at: "2019-01-15T09:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    role_names: ["staff", "instructor"],
    all_permissions: Array(15).fill(null).map((_, i) => ({ id: i, name: `staff_permission_${i}` })),
    staff: {
      id: 2,
      employee_id: "CS002",
      first_name: "Dr. Ada",
      last_name: "Lovelace",
      title: "Associate Professor",
      email: "lovelace@university.edu",
      phone: "(555) 0202",
      hire_date: "2019-01-15",
      department_id: 1,
      salary: 78000,
      is_active: true,
      created_at: "2019-01-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 7,
    name: "John Smith",
    email: "john@demo.com",
    email_verified_at: null,
    password_algorithm: "bcrypt",
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z",
    role_names: [],
    all_permissions: []
  },
  {
    id: 8,
    name: "Dr. Sarah Williams",
    email: "s.williams@university.edu",
    email_verified_at: "2019-09-01T09:00:00Z",
    password_algorithm: "bcrypt",
    created_at: "2019-09-01T09:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    role_names: ["staff", "dean"],
    all_permissions: Array(20).fill(null).map((_, i) => ({ id: i, name: `dean_permission_${i}` })),
    staff: {
      id: 3,
      employee_id: "SCI001",
      first_name: "Dr. Sarah",
      last_name: "Williams",
      title: "Dean of Sciences",
      email: "s.williams@university.edu",
      phone: "(555) 0102",
      hire_date: "2019-09-01",
      department_id: 2,
      salary: 158000,
      is_active: true,
      created_at: "2019-09-01T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  }
]

const mockTableData: TableData<User> = {
  data: mockUsers,
  total: 8,
  page: 1,
  per_page: 25,
  last_page: 1
}

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Users" }
]

export default function UsersPage() {
  const handleUserSelect = (user: User) => {
    console.log("Selected user:", user.email)
  }

  const handleUserView = (user: User) => {
    console.log("View user:", user.email)
  }

  const handleUserEdit = (user: User) => {
    console.log("Edit user:", user.email)
  }

  const handleUserDelete = (user: User) => {
    console.log("Delete user:", user.email)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <UsersTable
          data={mockTableData}
          loading={false}
          onUserSelect={handleUserSelect}
          onUserView={handleUserView}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
        />
      </div>
    </AppShell>
  )
}