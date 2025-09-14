"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ProgramChoicesTable } from "@/components/data-table/program-choices-table"
import { ProgramChoice, TableData } from "@/types/university"

// Mock data for program choices
const mockProgramChoices: ProgramChoice[] = [
  {
    id: 1,
    admission_application_id: 1,
    program_id: 1,
    preference_order: 1,
    status: "accepted",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-25T10:30:00Z",
    program: {
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
      }
    },
    admission_application: {
      id: 1,
      student_id: 1,
      term_id: 1,
      status: "accepted",
      application_date: "2024-01-20T14:20:00Z",
      decision_date: "2024-01-25T10:30:00Z",
      decision_status: "accepted",
      created_at: "2024-01-20T14:20:00Z",
      updated_at: "2024-01-25T10:30:00Z",
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
    }
  },
  {
    id: 2,
    admission_application_id: 1,
    program_id: 2,
    preference_order: 2,
    status: "rejected",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-25T10:30:00Z",
    program: {
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
      }
    },
    admission_application: {
      id: 1,
      student_id: 1,
      term_id: 1,
      status: "accepted",
      application_date: "2024-01-20T14:20:00Z",
      decision_date: "2024-01-25T10:30:00Z",
      decision_status: "accepted",
      created_at: "2024-01-20T14:20:00Z",
      updated_at: "2024-01-25T10:30:00Z",
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
    }
  },
  {
    id: 3,
    admission_application_id: 2,
    program_id: 3,
    preference_order: 1,
    status: "pending",
    created_at: "2024-02-01T16:45:00Z",
    updated_at: "2024-02-01T16:45:00Z",
    program: {
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
      }
    },
    admission_application: {
      id: 2,
      student_id: 3,
      term_id: 1,
      status: "pending",
      application_date: "2024-02-01T16:45:00Z",
      decision_date: null,
      decision_status: "pending",
      created_at: "2024-02-01T16:45:00Z",
      updated_at: "2024-02-01T16:45:00Z",
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
    }
  },
  {
    id: 4,
    admission_application_id: 2,
    program_id: 1,
    preference_order: 2,
    status: "waitlisted",
    created_at: "2024-02-01T16:45:00Z",
    updated_at: "2024-02-05T09:20:00Z",
    program: {
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
      }
    },
    admission_application: {
      id: 2,
      student_id: 3,
      term_id: 1,
      status: "pending",
      application_date: "2024-02-01T16:45:00Z",
      decision_date: null,
      decision_status: "pending",
      created_at: "2024-02-01T16:45:00Z",
      updated_at: "2024-02-01T16:45:00Z",
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
    }
  }
]

const mockTableData: TableData<ProgramChoice> = {
  data: mockProgramChoices,
  total: 4,
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
  { label: "Program Choices" }
]

export default function ProgramChoicesPage() {
  const handleChoiceSelect = (choice: ProgramChoice) => {
    console.log("Selected choice:", choice.id)
  }

  const handleChoiceView = (choice: ProgramChoice) => {
    console.log("View choice:", choice.id)
  }

  const handleChoiceEdit = (choice: ProgramChoice) => {
    console.log("Edit choice:", choice.id)
  }

  const handleChoiceDelete = (choice: ProgramChoice) => {
    console.log("Delete choice:", choice.id)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ProgramChoicesTable
          data={mockTableData}
          loading={false}
          onChoiceSelect={handleChoiceSelect}
          onChoiceView={handleChoiceView}
          onChoiceEdit={handleChoiceEdit}
          onChoiceDelete={handleChoiceDelete}
        />
      </div>
    </AppShell>
  )
}