"use client"

import { AppShell } from "@/components/layout/app-shell"
import { DepartmentsTable } from "@/components/data-table/departments-table"
import { Department, TableData } from "@/types/university"

// Mock data for departments
const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Computer Science",
    code: "CS",
    faculty_id: 1,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 1,
      name: "Faculty of Engineering and Technology",
      code: "ENG",
      dean_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(8).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(3).fill(null).map((_, i) => ({ id: i + 1, is_active: true })),
    courses: Array(25).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 22 }))
  },
  {
    id: 2,
    name: "Mathematics",
    code: "MATH",
    faculty_id: 2,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 2,
      name: "Faculty of Sciences",
      code: "SCI",
      dean_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(6).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(2).fill(null).map((_, i) => ({ id: i + 1, is_active: true })),
    courses: Array(18).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 16 }))
  },
  {
    id: 3,
    name: "English Literature",
    code: "ENG",
    faculty_id: 3,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 3,
      name: "Faculty of Arts and Humanities",
      code: "ART",
      dean_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(5).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(2).fill(null).map((_, i) => ({ id: i + 1, is_active: true })),
    courses: Array(15).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 14 }))
  },
  {
    id: 4,
    name: "Physics",
    code: "PHYS",
    faculty_id: 2,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 2,
      name: "Faculty of Sciences",
      code: "SCI",
      dean_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(4).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(2).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 1 })),
    courses: Array(12).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 10 }))
  },
  {
    id: 5,
    name: "Business Administration",
    code: "BUS",
    faculty_id: 4,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 4,
      name: "Faculty of Business",
      code: "BUS",
      dean_id: 4,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(7).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(3).fill(null).map((_, i) => ({ id: i + 1, is_active: true })),
    courses: Array(20).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 18 }))
  },
  {
    id: 6,
    name: "Psychology",
    code: "PSY",
    faculty_id: 5,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    faculty: {
      id: 5,
      name: "Faculty of Social Sciences",
      code: "SOC",
      dean_id: 5,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    staff: Array(5).fill(null).map((_, i) => ({ id: i + 1 })),
    programs: Array(2).fill(null).map((_, i) => ({ id: i + 1, is_active: true })),
    courses: Array(14).fill(null).map((_, i) => ({ id: i + 1, is_active: i < 12 }))
  }
]

const mockTableData: TableData<Department> = {
  data: mockDepartments,
  total: 6,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Departments" }
]

export default function DepartmentsPage() {
  const handleDepartmentSelect = (department: Department) => {
    console.log("Selected department:", department.code)
  }

  const handleDepartmentView = (department: Department) => {
    console.log("View department:", department.code)
  }

  const handleDepartmentEdit = (department: Department) => {
    console.log("Edit department:", department.code)
  }

  const handleDepartmentDelete = (department: Department) => {
    console.log("Delete department:", department.code)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DepartmentsTable
          data={mockTableData}
          loading={false}
          onDepartmentSelect={handleDepartmentSelect}
          onDepartmentView={handleDepartmentView}
          onDepartmentEdit={handleDepartmentEdit}
          onDepartmentDelete={handleDepartmentDelete}
        />
      </div>
    </AppShell>
  )
}