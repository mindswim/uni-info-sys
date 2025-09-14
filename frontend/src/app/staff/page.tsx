"use client"

import { AppShell } from "@/components/layout/app-shell"
import { StaffTable } from "@/components/data-table/staff-table"
import { Staff, TableData } from "@/types/university"

// Mock data for staff
const mockStaff: Staff[] = [
  {
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
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 101,
      name: "Dr. Sarah Thompson",
      email: "sarah.thompson@university.edu",
      created_at: "2020-08-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 2,
    user_id: 102,
    employee_id: "EMP002",
    first_name: "Dr. Michael",
    last_name: "Rodriguez",
    title: "Associate Professor",
    department_id: 1,
    hire_date: "2018-01-10",
    salary: 78000,
    is_active: true,
    created_at: "2018-01-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 102,
      name: "Dr. Michael Rodriguez",
      email: "michael.rodriguez@university.edu",
      created_at: "2018-01-10T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
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
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 103,
      name: "Dr. Michael Johnson",
      email: "michael.johnson@university.edu",
      created_at: "2019-01-10T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
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
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 104,
      name: "Dr. Lisa Wong",
      email: "lisa.wong@university.edu",
      created_at: "2022-08-20T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
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
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 105,
      name: "Dr. Robert Chen",
      email: "robert.chen@university.edu",
      created_at: "2018-09-01T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
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
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 106,
      name: "Prof. Emma Davis",
      email: "emma.davis@university.edu",
      created_at: "2021-09-01T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 3,
      name: "English Literature",
      code: "ENG",
      faculty_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 7,
    user_id: 107,
    employee_id: "EMP007",
    first_name: "Dr. James",
    last_name: "Wilson",
    title: "Department Head",
    department_id: 4,
    hire_date: "2015-08-15",
    salary: 110000,
    is_active: true,
    created_at: "2015-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 107,
      name: "Dr. James Wilson",
      email: "james.wilson@university.edu",
      created_at: "2015-08-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 4,
      name: "Physics",
      code: "PHYS",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 8,
    user_id: 108,
    employee_id: "EMP008",
    first_name: "Ms. Angela",
    last_name: "Martinez",
    title: "Administrative Assistant",
    department_id: 1,
    hire_date: "2020-03-01",
    salary: 42000,
    is_active: true,
    created_at: "2020-03-01T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 108,
      name: "Ms. Angela Martinez",
      email: "angela.martinez@university.edu",
      created_at: "2020-03-01T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  },
  {
    id: 9,
    user_id: 109,
    employee_id: "EMP009",
    first_name: "Dr. Patricia",
    last_name: "Lee",
    title: "Assistant Professor",
    department_id: 5,
    hire_date: "2023-01-15",
    salary: 68000,
    is_active: false,
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      id: 109,
      name: "Dr. Patricia Lee",
      email: "patricia.lee@university.edu",
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    department: {
      id: 5,
      name: "Business Administration",
      code: "BUS",
      faculty_id: 4,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  }
]

const mockTableData: TableData<Staff> = {
  data: mockStaff,
  total: 9,
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
  { label: "Staff" }
]

export default function StaffPage() {
  const handleStaffSelect = (staff: Staff) => {
    console.log("Selected staff:", staff.employee_id)
  }

  const handleStaffView = (staff: Staff) => {
    console.log("View staff:", staff.employee_id)
  }

  const handleStaffEdit = (staff: Staff) => {
    console.log("Edit staff:", staff.employee_id)
  }

  const handleStaffDelete = (staff: Staff) => {
    console.log("Delete staff:", staff.employee_id)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <StaffTable
          data={mockTableData}
          loading={false}
          onStaffSelect={handleStaffSelect}
          onStaffView={handleStaffView}
          onStaffEdit={handleStaffEdit}
          onStaffDelete={handleStaffDelete}
        />
      </div>
    </AppShell>
  )
}