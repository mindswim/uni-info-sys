"use client"

import { AppShell } from "@/components/layout/app-shell"
import { EnrollmentsTable } from "@/components/data-table/enrollments-table"
import { Enrollment, TableData } from "@/types/university"

// Mock data for enrollments
const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    student_id: 1,
    course_section_id: 1,
    status: "enrolled",
    enrollment_date: "2024-02-01",
    completion_date: null,
    grade: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    student: {
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
      updated_at: "2024-01-15T10:30:00Z"
    },
    course_section: {
      id: 1,
      course_id: 1,
      section_number: "001",
      term_id: 1,
      instructor_id: 1,
      max_enrollment: 30,
      current_enrollment: 28,
      status: "open",
      schedule: "MWF 9:00-10:00",
      room_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science",
        description: "Fundamental concepts of computer science",
        credits: 3,
        level: "undergraduate",
        department_id: 1,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 1,
        user_id: 101,
        employee_id: "EMP001",
        first_name: "Dr. Sarah",
        last_name: "Thompson",
        title: "Professor",
        department_id: 1,
        hire_date: "2020-08-15",
        salary: 85000,
        is_active: true,
        created_at: "2020-08-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    id: 2,
    student_id: 1,
    course_section_id: 4,
    status: "enrolled",
    enrollment_date: "2024-02-01",
    completion_date: null,
    grade: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    student: {
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
      updated_at: "2024-01-15T10:30:00Z"
    },
    course_section: {
      id: 4,
      course_id: 3,
      section_number: "001",
      term_id: 1,
      instructor_id: 3,
      max_enrollment: 35,
      current_enrollment: 32,
      status: "open",
      schedule: "MWF 8:00-9:00",
      room_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 3,
        code: "MATH101",
        name: "Calculus I",
        description: "Differential and integral calculus",
        credits: 4,
        level: "undergraduate",
        department_id: 2,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 3,
        user_id: 103,
        employee_id: "EMP003",
        first_name: "Dr. Michael",
        last_name: "Johnson",
        title: "Associate Professor",
        department_id: 2,
        hire_date: "2019-01-10",
        salary: 75000,
        is_active: true,
        created_at: "2019-01-10T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    id: 3,
    student_id: 2,
    course_section_id: 3,
    status: "enrolled",
    enrollment_date: "2024-02-01",
    completion_date: null,
    grade: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    student: {
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
      updated_at: "2024-01-20T14:15:00Z"
    },
    course_section: {
      id: 3,
      course_id: 2,
      section_number: "001",
      term_id: 1,
      instructor_id: 1,
      max_enrollment: 25,
      current_enrollment: 22,
      status: "open",
      schedule: "MWF 11:00-12:00",
      room_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 2,
        code: "CS201",
        name: "Data Structures and Algorithms",
        description: "Comprehensive study of data structures",
        credits: 4,
        level: "undergraduate",
        department_id: 1,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 1,
        user_id: 101,
        employee_id: "EMP001",
        first_name: "Dr. Sarah",
        last_name: "Thompson",
        title: "Professor",
        department_id: 1,
        hire_date: "2020-08-15",
        salary: 85000,
        is_active: true,
        created_at: "2020-08-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    id: 4,
    student_id: 2,
    course_section_id: 5,
    status: "waitlisted",
    enrollment_date: "2024-02-01",
    completion_date: null,
    grade: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    student: {
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
      updated_at: "2024-01-20T14:15:00Z"
    },
    course_section: {
      id: 5,
      course_id: 3,
      section_number: "002",
      term_id: 1,
      instructor_id: 4,
      max_enrollment: 35,
      current_enrollment: 35,
      status: "closed",
      schedule: "TTh 10:00-11:30",
      room_id: 4,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 3,
        code: "MATH101",
        name: "Calculus I",
        description: "Differential and integral calculus",
        credits: 4,
        level: "undergraduate",
        department_id: 2,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 4,
        user_id: 104,
        employee_id: "EMP004",
        first_name: "Dr. Lisa",
        last_name: "Wong",
        title: "Assistant Professor",
        department_id: 2,
        hire_date: "2022-08-20",
        salary: 65000,
        is_active: true,
        created_at: "2022-08-20T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    id: 5,
    student_id: 4,
    course_section_id: 6,
    status: "completed",
    enrollment_date: "2023-09-01",
    completion_date: "2023-12-15",
    grade: "A",
    created_at: "2023-09-01T09:00:00Z",
    updated_at: "2023-12-15T17:00:00Z",
    student: {
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
      updated_at: "2023-08-15T09:00:00Z"
    },
    course_section: {
      id: 6,
      course_id: 4,
      section_number: "001",
      term_id: 2,
      instructor_id: 5,
      max_enrollment: 15,
      current_enrollment: 12,
      status: "closed",
      schedule: "MW 3:00-4:30",
      room_id: 5,
      created_at: "2023-08-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 4,
        code: "CS501",
        name: "Advanced Machine Learning",
        description: "Advanced topics in machine learning",
        credits: 3,
        level: "graduate",
        department_id: 1,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 5,
        user_id: 105,
        employee_id: "EMP005",
        first_name: "Dr. Robert",
        last_name: "Chen",
        title: "Professor",
        department_id: 1,
        hire_date: "2018-09-01",
        salary: 95000,
        is_active: true,
        created_at: "2018-09-01T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  },
  {
    id: 6,
    student_id: 3,
    course_section_id: 7,
    status: "enrolled",
    enrollment_date: "2024-02-01",
    completion_date: null,
    grade: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    student: {
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
      updated_at: "2024-01-25T11:45:00Z"
    },
    course_section: {
      id: 7,
      course_id: 5,
      section_number: "001",
      term_id: 1,
      instructor_id: 6,
      max_enrollment: 20,
      current_enrollment: 18,
      status: "open",
      schedule: "TTh 1:00-2:30",
      room_id: 6,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      course: {
        id: 5,
        code: "ENG101",
        name: "English Composition",
        description: "Introduction to academic writing",
        credits: 3,
        level: "undergraduate",
        department_id: 3,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      instructor: {
        id: 6,
        user_id: 106,
        employee_id: "EMP006",
        first_name: "Prof. Emma",
        last_name: "Davis",
        title: "Lecturer",
        department_id: 3,
        hire_date: "2021-09-01",
        salary: 55000,
        is_active: true,
        created_at: "2021-09-01T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    }
  }
]

const mockTableData: TableData<Enrollment> = {
  data: mockEnrollments,
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
  { label: "Enrollments" }
]

export default function EnrollmentsPage() {
  const handleEnrollmentSelect = (enrollment: Enrollment) => {
    console.log("Selected enrollment:", enrollment.id)
  }

  const handleEnrollmentView = (enrollment: Enrollment) => {
    console.log("View enrollment:", enrollment.id)
  }

  const handleEnrollmentEdit = (enrollment: Enrollment) => {
    console.log("Edit enrollment:", enrollment.id)
  }

  const handleEnrollmentDelete = (enrollment: Enrollment) => {
    console.log("Delete enrollment:", enrollment.id)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EnrollmentsTable
          data={mockTableData}
          loading={false}
          onEnrollmentSelect={handleEnrollmentSelect}
          onEnrollmentView={handleEnrollmentView}
          onEnrollmentEdit={handleEnrollmentEdit}
          onEnrollmentDelete={handleEnrollmentDelete}
        />
      </div>
    </AppShell>
  )
}