"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ProgramsTable } from "@/components/data-table/programs-table"
import { Program, TableData } from "@/types/university"

// Mock data for programs
const mockPrograms: Program[] = [
  {
    id: 1,
    name: "Computer Science",
    degree_type: "bachelor",
    department_id: 1,
    duration_years: 4,
    total_credits: 120,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(45).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 8 ? 'pending' : i < 25 ? 'accepted' : 'rejected' 
    })),
    students: Array(156).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 2,
    name: "Data Science",
    degree_type: "bachelor",
    department_id: 1,
    duration_years: 4,
    total_credits: 120,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(32).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 6 ? 'pending' : i < 18 ? 'accepted' : 'rejected' 
    })),
    students: Array(87).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 3,
    name: "Master of Computer Science",
    degree_type: "master",
    department_id: 1,
    duration_years: 2,
    total_credits: 36,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(28).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 4 ? 'pending' : i < 12 ? 'accepted' : 'rejected' 
    })),
    students: Array(34).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 4,
    name: "Mathematics",
    degree_type: "bachelor",
    department_id: 2,
    duration_years: 4,
    total_credits: 120,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(22).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 3 ? 'pending' : i < 14 ? 'accepted' : 'rejected' 
    })),
    students: Array(67).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 5,
    name: "English Literature",
    degree_type: "bachelor",
    department_id: 3,
    duration_years: 4,
    total_credits: 120,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 3,
      name: "English Literature",
      code: "ENG",
      faculty_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(18).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 2 ? 'pending' : i < 10 ? 'accepted' : 'rejected' 
    })),
    students: Array(43).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 6,
    name: "Physics",
    degree_type: "bachelor",
    department_id: 4,
    duration_years: 4,
    total_credits: 128,
    is_active: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 4,
      name: "Physics",
      code: "PHYS",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(8).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: 'rejected'
    })),
    students: Array(15).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 7,
    name: "Business Administration (MBA)",
    degree_type: "master",
    department_id: 5,
    duration_years: 2,
    total_credits: 60,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 5,
      name: "Business Administration",
      code: "BUS",
      faculty_id: 4,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(38).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 7 ? 'pending' : i < 22 ? 'accepted' : 'rejected' 
    })),
    students: Array(89).fill(null).map((_, i) => ({ id: i + 1 }))
  },
  {
    id: 8,
    name: "Psychology",
    degree_type: "bachelor",
    department_id: 6,
    duration_years: 4,
    total_credits: 120,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 6,
      name: "Psychology",
      code: "PSY",
      faculty_id: 5,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    admission_applications: Array(29).fill(null).map((_, i) => ({ 
      id: i + 1, 
      status: i < 4 ? 'pending' : i < 17 ? 'accepted' : 'rejected' 
    })),
    students: Array(72).fill(null).map((_, i) => ({ id: i + 1 }))
  }
]

const mockTableData: TableData<Program> = {
  data: mockPrograms,
  total: 8,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Programs" }
]

export default function ProgramsPage() {
  const handleProgramSelect = (program: Program) => {
    console.log("Selected program:", program.name)
  }

  const handleProgramView = (program: Program) => {
    console.log("View program:", program.name)
  }

  const handleProgramEdit = (program: Program) => {
    console.log("Edit program:", program.name)
  }

  const handleProgramDelete = (program: Program) => {
    console.log("Delete program:", program.name)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ProgramsTable
          data={mockTableData}
          loading={false}
          onProgramSelect={handleProgramSelect}
          onProgramView={handleProgramView}
          onProgramEdit={handleProgramEdit}
          onProgramDelete={handleProgramDelete}
        />
      </div>
    </AppShell>
  )
}