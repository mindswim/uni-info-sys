"use client"

import { AppShell } from "@/components/layout/app-shell"
import { StudentsTable } from "@/components/data-table/students-table"
import { Student, TableData } from "@/types/university"

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: 1,
    user_id: 1,
    student_number: "2024001",
    first_name: "Maria",
    last_name: "Rodriguez",
    date_of_birth: "2002-03-15",
    gender: "female",
    phone: "+1-555-0123",
    address: "123 Main St",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90210",
    country: "USA",
    emergency_contact_name: "Carlos Rodriguez",
    emergency_contact_phone: "+1-555-0124",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 1,
      name: "Maria Rodriguez",
      email: "maria@demo.com",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    enrollments: [
      {
        id: 1,
        student_id: 1,
        course_section_id: 1,
        status: "enrolled",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      },
      {
        id: 2,
        student_id: 1,
        course_section_id: 2,
        status: "enrolled",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      }
    ]
  },
  {
    id: 2,
    user_id: 2,
    student_number: "2024002",
    first_name: "David",
    last_name: "Park",
    date_of_birth: "2001-08-22",
    gender: "male",
    phone: "+1-555-0125",
    address: "456 Oak Ave",
    city: "San Francisco",
    state: "CA",
    postal_code: "94102",
    country: "USA",
    emergency_contact_name: "Sarah Park",
    emergency_contact_phone: "+1-555-0126",
    created_at: "2024-01-20T14:15:00Z",
    updated_at: "2024-01-20T14:15:00Z",
    user: {
      id: 2,
      name: "David Park",
      email: "david@demo.com",
      created_at: "2024-01-20T14:15:00Z",
      updated_at: "2024-01-20T14:15:00Z"
    },
    enrollments: [
      {
        id: 3,
        student_id: 2,
        course_section_id: 3,
        status: "enrolled",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      },
      {
        id: 4,
        student_id: 2,
        course_section_id: 4,
        status: "waitlisted",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      }
    ]
  },
  {
    id: 3,
    user_id: 3,
    student_number: "2024003",
    first_name: "Sophie",
    last_name: "Turner",
    date_of_birth: "2003-01-10",
    gender: "female",
    phone: "+1-555-0127",
    address: "789 Pine Rd",
    city: "Seattle",
    state: "WA",
    postal_code: "98101",
    country: "USA",
    emergency_contact_name: "Michael Turner",
    emergency_contact_phone: "+1-555-0128",
    created_at: "2024-01-25T11:45:00Z",
    updated_at: "2024-01-25T11:45:00Z",
    user: {
      id: 3,
      name: "Sophie Turner",
      email: "sophie@demo.com",
      created_at: "2024-01-25T11:45:00Z",
      updated_at: "2024-01-25T11:45:00Z"
    },
    enrollments: [
      {
        id: 5,
        student_id: 3,
        course_section_id: 5,
        status: "enrolled",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      }
    ]
  },
  {
    id: 4,
    user_id: 4,
    student_number: "2023045",
    first_name: "James",
    last_name: "Wilson",
    date_of_birth: "2000-11-30",
    gender: "male",
    phone: "+1-555-0129",
    address: "321 Elm St",
    city: "Austin",
    state: "TX",
    postal_code: "73301",
    country: "USA",
    emergency_contact_name: "Linda Wilson",
    emergency_contact_phone: "+1-555-0130",
    created_at: "2023-08-15T09:00:00Z",
    updated_at: "2023-08-15T09:00:00Z",
    user: {
      id: 4,
      name: "James Wilson",
      email: "james@demo.com",
      created_at: "2023-08-15T09:00:00Z",
      updated_at: "2023-08-15T09:00:00Z"
    },
    enrollments: [
      {
        id: 6,
        student_id: 4,
        course_section_id: 6,
        status: "completed",
        grade: "A",
        enrollment_date: "2023-09-01",
        completion_date: "2023-12-15",
        created_at: "2023-09-01T09:00:00Z",
        updated_at: "2023-12-15T17:00:00Z"
      },
      {
        id: 7,
        student_id: 4,
        course_section_id: 7,
        status: "enrolled",
        enrollment_date: "2024-02-01",
        created_at: "2024-02-01T09:00:00Z",
        updated_at: "2024-02-01T09:00:00Z"
      }
    ]
  },
  {
    id: 5,
    user_id: 5,
    student_number: "2024004",
    first_name: "Emma",
    last_name: "Chen",
    date_of_birth: "2002-07-18",
    gender: "female",
    phone: "+1-555-0131",
    address: "654 Maple Dr",
    city: "Portland",
    state: "OR",
    postal_code: "97201",
    country: "USA",
    emergency_contact_name: "Wei Chen",
    emergency_contact_phone: "+1-555-0132",
    created_at: "2024-02-01T16:20:00Z",
    updated_at: "2024-02-01T16:20:00Z",
    user: {
      id: 5,
      name: "Emma Chen",
      email: "emma@demo.com",
      created_at: "2024-02-01T16:20:00Z",
      updated_at: "2024-02-01T16:20:00Z"
    },
    enrollments: []
  }
]

const mockTableData: TableData<Student> = {
  data: mockStudents,
  total: 5,
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
  { label: "Students" }
]

export default function StudentsPage() {
  const handleStudentSelect = (student: Student) => {
    console.log("Selected student:", student.student_number)
  }

  const handleStudentView = (student: Student) => {
    console.log("View student:", student.student_number)
  }

  const handleStudentEdit = (student: Student) => {
    console.log("Edit student:", student.student_number)
  }

  const handleStudentDelete = (student: Student) => {
    console.log("Delete student:", student.student_number)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <StudentsTable
          data={mockTableData}
          loading={false}
          onStudentSelect={handleStudentSelect}
          onStudentView={handleStudentView}
          onStudentEdit={handleStudentEdit}
          onStudentDelete={handleStudentDelete}
        />
      </div>
    </AppShell>
  )
}