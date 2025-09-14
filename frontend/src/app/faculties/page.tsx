"use client"

import { AppShell } from "@/components/layout/app-shell"
import { FacultiesTable } from "@/components/data-table/faculties-table"
import { Faculty, TableData } from "@/types/university"

// Mock data for faculties
const mockFaculties: Faculty[] = [
  {
    id: 1,
    name: "Faculty of Engineering and Technology",
    code: "ENG",
    dean_id: 1,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: {
      id: 1,
      employee_id: "ENG001",
      first_name: "Dr. Robert",
      last_name: "Chen",
      title: "Dean of Engineering",
      email: "r.chen@university.edu",
      phone: "(555) 0101",
      hire_date: "2020-08-15",
      department_id: 1,
      salary: 165000,
      is_active: true,
      created_at: "2020-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    departments: [
      {
        id: 1,
        name: "Computer Science",
        code: "CS",
        faculty_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(12).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 1, students: Array(156).fill(null).map((_, i) => ({ id: i + 1 })) },
          { id: 2, students: Array(87).fill(null).map((_, i) => ({ id: i + 1 })) },
          { id: 3, students: Array(34).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 7,
        name: "Electrical Engineering",
        code: "EE",
        faculty_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(9).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 9, students: Array(92).fill(null).map((_, i) => ({ id: i + 1 })) },
          { id: 10, students: Array(28).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Faculty of Sciences",
    code: "SCI",
    dean_id: 2,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: {
      id: 2,
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
    },
    departments: [
      {
        id: 2,
        name: "Mathematics",
        code: "MATH",
        faculty_id: 2,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(8).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 4, students: Array(67).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 4,
        name: "Physics",
        code: "PHYS",
        faculty_id: 2,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(6).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 6, students: Array(15).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 8,
        name: "Chemistry",
        code: "CHEM",
        faculty_id: 2,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(7).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 11, students: Array(54).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Faculty of Arts and Humanities",
    code: "ART",
    dean_id: 3,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: {
      id: 3,
      employee_id: "ART001",
      first_name: "Prof. Michael",
      last_name: "Thompson",
      title: "Dean of Arts and Humanities",
      email: "m.thompson@university.edu",
      phone: "(555) 0103",
      hire_date: "2018-01-15",
      department_id: 3,
      salary: 142000,
      is_active: true,
      created_at: "2018-01-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    departments: [
      {
        id: 3,
        name: "English Literature",
        code: "ENG",
        faculty_id: 3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(6).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 5, students: Array(43).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 9,
        name: "History",
        code: "HIST",
        faculty_id: 3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(5).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 12, students: Array(38).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Faculty of Business",
    code: "BUS",
    dean_id: 4,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: {
      id: 4,
      employee_id: "BUS001",
      first_name: "Dr. Lisa",
      last_name: "Anderson",
      title: "Dean of Business",
      email: "l.anderson@university.edu",
      phone: "(555) 0104",
      hire_date: "2021-03-01",
      department_id: 5,
      salary: 175000,
      is_active: true,
      created_at: "2021-03-01T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    departments: [
      {
        id: 5,
        name: "Business Administration",
        code: "BUS",
        faculty_id: 4,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(10).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 7, students: Array(89).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 10,
        name: "Accounting",
        code: "ACC",
        faculty_id: 4,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(6).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 13, students: Array(76).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Faculty of Social Sciences",
    code: "SOC",
    dean_id: 5,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: {
      id: 5,
      employee_id: "SOC001",
      first_name: "Dr. James",
      last_name: "Rodriguez",
      title: "Dean of Social Sciences",
      email: "j.rodriguez@university.edu",
      phone: "(555) 0105",
      hire_date: "2020-06-15",
      department_id: 6,
      salary: 148000,
      is_active: true,
      created_at: "2020-06-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    departments: [
      {
        id: 6,
        name: "Psychology",
        code: "PSY",
        faculty_id: 5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(7).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 8, students: Array(72).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      },
      {
        id: 11,
        name: "Sociology",
        code: "SOC",
        faculty_id: 5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(5).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 14, students: Array(45).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Faculty of Medicine",
    code: "MED",
    dean_id: null,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    dean: null,
    departments: [
      {
        id: 12,
        name: "Clinical Medicine",
        code: "MED",
        faculty_id: 6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        staff: Array(15).fill(null).map((_, i) => ({ id: i + 1 })),
        programs: [
          { id: 15, students: Array(120).fill(null).map((_, i) => ({ id: i + 1 })) }
        ]
      }
    ]
  }
]

const mockTableData: TableData<Faculty> = {
  data: mockFaculties,
  total: 6,
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
  { label: "Faculties" }
]

export default function FacultiesPage() {
  const handleFacultySelect = (faculty: Faculty) => {
    console.log("Selected faculty:", faculty.code)
  }

  const handleFacultyView = (faculty: Faculty) => {
    console.log("View faculty:", faculty.code)
  }

  const handleFacultyEdit = (faculty: Faculty) => {
    console.log("Edit faculty:", faculty.code)
  }

  const handleFacultyDelete = (faculty: Faculty) => {
    console.log("Delete faculty:", faculty.code)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <FacultiesTable
          data={mockTableData}
          loading={false}
          onFacultySelect={handleFacultySelect}
          onFacultyView={handleFacultyView}
          onFacultyEdit={handleFacultyEdit}
          onFacultyDelete={handleFacultyDelete}
        />
      </div>
    </AppShell>
  )
}