"use client"

import { AppShell } from "@/components/layout/app-shell"
import { DocumentsTable } from "@/components/data-table/documents-table"
import { Document, TableData } from "@/types/university"

// Mock data for documents
const mockDocuments: Document[] = [
  {
    id: 1,
    student_id: 1,
    document_type: "transcript",
    file_name: "maria_rodriguez_transcript.pdf",
    file_path: "/uploads/documents/maria_rodriguez_transcript.pdf",
    file_size: 2456789,
    mime_type: "application/pdf",
    is_verified: true,
    version: 1,
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
    student_id: 1,
    document_type: "personal_statement",
    file_name: "maria_personal_statement.docx",
    file_path: "/uploads/documents/maria_personal_statement.docx",
    file_size: 1234567,
    mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    is_verified: true,
    version: 2,
    created_at: "2024-01-21T10:15:00Z",
    updated_at: "2024-01-22T08:30:00Z",
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
    student_id: 2,
    document_type: "recommendation",
    file_name: "david_park_recommendation_prof_kim.pdf",
    file_path: "/uploads/documents/david_park_recommendation_prof_kim.pdf",
    file_size: 987654,
    mime_type: "application/pdf",
    is_verified: true,
    version: 1,
    created_at: "2023-09-10T11:15:00Z",
    updated_at: "2023-09-12T09:20:00Z",
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
    id: 4,
    student_id: 3,
    document_type: "test_scores",
    file_name: "sophie_turner_sat_scores.pdf",
    file_path: "/uploads/documents/sophie_turner_sat_scores.pdf",
    file_size: 567890,
    mime_type: "application/pdf",
    is_verified: false,
    version: 1,
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
  },
  {
    id: 5,
    student_id: 2,
    document_type: "id_document",
    file_name: "david_park_passport.jpg",
    file_path: "/uploads/documents/david_park_passport.jpg",
    file_size: 3456789,
    mime_type: "image/jpeg",
    is_verified: true,
    version: 1,
    created_at: "2023-09-11T14:30:00Z",
    updated_at: "2023-09-13T10:45:00Z",
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
  }
]

const mockTableData: TableData<Document> = {
  data: mockDocuments,
  total: 5,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Documents" }
]

export default function DocumentsPage() {
  const handleDocumentSelect = (document: Document) => {
    console.log("Selected document:", document.file_name)
  }

  const handleDocumentView = (document: Document) => {
    console.log("View document:", document.file_name)
  }

  const handleDocumentEdit = (document: Document) => {
    console.log("Edit document:", document.file_name)
  }

  const handleDocumentDelete = (document: Document) => {
    console.log("Delete document:", document.file_name)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DocumentsTable
          data={mockTableData}
          loading={false}
          onDocumentSelect={handleDocumentSelect}
          onDocumentView={handleDocumentView}
          onDocumentEdit={handleDocumentEdit}
          onDocumentDelete={handleDocumentDelete}
        />
      </div>
    </AppShell>
  )
}