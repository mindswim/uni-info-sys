"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AcademicRecordsTable } from "@/components/data-table/academic-records-table"
import { AcademicRecord, TableData } from "@/types/university"

// Mock data for academic records
const mockAcademicRecords: AcademicRecord[] = [
  {
    id: 1,
    student_id: 1,
    institution_name: "Instituto Tecnológico de México",
    qualification_type: "high_school",
    gpa: 9.8,
    max_gpa: 10.0,
    graduation_date: "2023-06-15",
    is_verified: true,
    verification_date: "2024-01-20T14:20:00Z",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
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
    id: 2,
    student_id: 2,
    institution_name: "Seoul National University",
    qualification_type: "bachelor",
    gpa: 3.85,
    max_gpa: 4.0,
    graduation_date: "2023-08-20",
    is_verified: true,
    verification_date: "2023-09-10T11:15:00Z",
    created_at: "2023-09-10T11:15:00Z",
    updated_at: "2024-01-15T10:30:00Z",
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
    id: 3,
    student_id: 3,
    institution_name: "New York High School",
    qualification_type: "high_school",
    gpa: 3.92,
    max_gpa: 4.0,
    graduation_date: "2024-06-10",
    is_verified: false,
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
]

const mockTableData: TableData<AcademicRecord> = {
  data: mockAcademicRecords,
  total: 3,
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
  { label: "Academic Records" }
]

export default function AcademicRecordsPage() {
  const handleRecordSelect = (record: AcademicRecord) => {
    console.log("Selected record:", record.id)
  }

  const handleRecordView = (record: AcademicRecord) => {
    console.log("View record:", record.id)
  }

  const handleRecordEdit = (record: AcademicRecord) => {
    console.log("Edit record:", record.id)
  }

  const handleRecordDelete = (record: AcademicRecord) => {
    console.log("Delete record:", record.id)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <AcademicRecordsTable
          data={mockTableData}
          loading={false}
          onRecordSelect={handleRecordSelect}
          onRecordView={handleRecordView}
          onRecordEdit={handleRecordEdit}
          onRecordDelete={handleRecordDelete}
        />
      </div>
    </AppShell>
  )
}