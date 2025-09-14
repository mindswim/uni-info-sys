"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ApplicationsTable } from "@/components/data-table/applications-table"
import { AdmissionApplication, TableData } from "@/types/university"

// Mock data for admission applications
const mockApplications: AdmissionApplication[] = [
  {
    id: 1,
    application_number: "APP2024001",
    first_name: "Emily",
    last_name: "Johnson",
    email: "emily.johnson@email.com",
    phone: "+1-555-0234",
    date_of_birth: "2005-06-15",
    address: "456 Elm Street",
    city: "Portland",
    state: "OR",
    postal_code: "97201",
    country: "USA",
    status: "under_review",
    submitted_at: "2024-02-01T14:30:00Z",
    decision_date: null,
    decision_notes: null,
    high_school_name: "Portland High School",
    graduation_year: 2023,
    gpa: 3.85,
    sat_score: 1420,
    act_score: null,
    gre_score: null,
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-10T09:15:00Z",
    program_choices: [
      {
        id: 1,
        application_id: 1,
        program_id: 1,
        preference_order: 1,
        created_at: "2024-02-01T14:30:00Z",
        updated_at: "2024-02-01T14:30:00Z",
        program: {
          id: 1,
          name: "Computer Science",
          degree_type: "bachelor",
          department_id: 1,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      },
      {
        id: 2,
        application_id: 1,
        program_id: 2,
        preference_order: 2,
        created_at: "2024-02-01T14:30:00Z",
        updated_at: "2024-02-01T14:30:00Z",
        program: {
          id: 2,
          name: "Data Science",
          degree_type: "bachelor",
          department_id: 1,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      }
    ],
    documents: [
      {
        id: 1,
        application_id: 1,
        type: "transcript",
        file_name: "emily_transcript.pdf",
        file_path: "/documents/transcripts/emily_transcript.pdf",
        uploaded_at: "2024-02-01T14:35:00Z",
        verified: true,
        created_at: "2024-02-01T14:35:00Z",
        updated_at: "2024-02-01T14:35:00Z"
      },
      {
        id: 2,
        application_id: 1,
        type: "personal_statement",
        file_name: "emily_essay.pdf",
        file_path: "/documents/essays/emily_essay.pdf",
        uploaded_at: "2024-02-01T14:40:00Z",
        verified: true,
        created_at: "2024-02-01T14:40:00Z",
        updated_at: "2024-02-01T14:40:00Z"
      }
    ]
  },
  {
    id: 2,
    application_number: "APP2024002",
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0235",
    date_of_birth: "2005-09-22",
    address: "789 Oak Avenue",
    city: "San Francisco",
    state: "CA",
    postal_code: "94102",
    country: "USA",
    status: "accepted",
    submitted_at: "2024-01-15T10:00:00Z",
    decision_date: "2024-02-15T16:30:00Z",
    decision_notes: "Excellent academic record and strong test scores.",
    high_school_name: "San Francisco Academy",
    graduation_year: 2023,
    gpa: 3.92,
    sat_score: 1520,
    act_score: 34,
    gre_score: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-02-15T16:30:00Z",
    program_choices: [
      {
        id: 3,
        application_id: 2,
        program_id: 3,
        preference_order: 1,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        program: {
          id: 3,
          name: "Engineering",
          degree_type: "bachelor",
          department_id: 2,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      }
    ],
    documents: [
      {
        id: 3,
        application_id: 2,
        type: "transcript",
        file_name: "michael_transcript.pdf",
        file_path: "/documents/transcripts/michael_transcript.pdf",
        uploaded_at: "2024-01-15T10:05:00Z",
        verified: true,
        created_at: "2024-01-15T10:05:00Z",
        updated_at: "2024-01-15T10:05:00Z"
      },
      {
        id: 4,
        application_id: 2,
        type: "personal_statement",
        file_name: "michael_essay.pdf",
        file_path: "/documents/essays/michael_essay.pdf",
        uploaded_at: "2024-01-15T10:10:00Z",
        verified: true,
        created_at: "2024-01-15T10:10:00Z",
        updated_at: "2024-01-15T10:10:00Z"
      },
      {
        id: 5,
        application_id: 2,
        type: "letters_of_recommendation",
        file_name: "michael_recommendations.pdf",
        file_path: "/documents/recommendations/michael_recommendations.pdf",
        uploaded_at: "2024-01-15T10:15:00Z",
        verified: true,
        created_at: "2024-01-15T10:15:00Z",
        updated_at: "2024-01-15T10:15:00Z"
      }
    ]
  },
  {
    id: 3,
    application_number: "APP2024003",
    first_name: "Sarah",
    last_name: "Williams",
    email: "sarah.williams@email.com",
    phone: "+1-555-0236",
    date_of_birth: "2004-12-03",
    address: "321 Pine Road",
    city: "Seattle",
    state: "WA",
    postal_code: "98101",
    country: "USA",
    status: "rejected",
    submitted_at: "2024-02-05T09:15:00Z",
    decision_date: "2024-02-20T11:45:00Z",
    decision_notes: "Application incomplete - missing required documents.",
    high_school_name: "Seattle Central High",
    graduation_year: 2023,
    gpa: 2.95,
    sat_score: 1180,
    act_score: null,
    gre_score: null,
    created_at: "2024-02-05T09:15:00Z",
    updated_at: "2024-02-20T11:45:00Z",
    program_choices: [
      {
        id: 4,
        application_id: 3,
        program_id: 4,
        preference_order: 1,
        created_at: "2024-02-05T09:15:00Z",
        updated_at: "2024-02-05T09:15:00Z",
        program: {
          id: 4,
          name: "Business Administration",
          degree_type: "bachelor",
          department_id: 3,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      }
    ],
    documents: [
      {
        id: 6,
        application_id: 3,
        type: "transcript",
        file_name: "sarah_transcript.pdf",
        file_path: "/documents/transcripts/sarah_transcript.pdf",
        uploaded_at: "2024-02-05T09:20:00Z",
        verified: false,
        created_at: "2024-02-05T09:20:00Z",
        updated_at: "2024-02-05T09:20:00Z"
      }
    ]
  },
  {
    id: 4,
    application_number: "APP2024004",
    first_name: "Alex",
    last_name: "Rodriguez",
    email: "alex.rodriguez@email.com",
    phone: "+1-555-0237",
    date_of_birth: "2000-03-18",
    address: "654 Maple Drive",
    city: "Austin",
    state: "TX",
    postal_code: "73301",
    country: "USA",
    status: "pending",
    submitted_at: "2024-02-25T16:45:00Z",
    decision_date: null,
    decision_notes: null,
    high_school_name: "Austin Community College",
    graduation_year: 2018,
    gpa: 3.67,
    sat_score: null,
    act_score: null,
    gre_score: 325,
    created_at: "2024-02-25T16:45:00Z",
    updated_at: "2024-02-25T16:45:00Z",
    program_choices: [
      {
        id: 5,
        application_id: 4,
        program_id: 5,
        preference_order: 1,
        created_at: "2024-02-25T16:45:00Z",
        updated_at: "2024-02-25T16:45:00Z",
        program: {
          id: 5,
          name: "Master of Computer Science",
          degree_type: "master",
          department_id: 1,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        }
      }
    ],
    documents: [
      {
        id: 7,
        application_id: 4,
        type: "transcript",
        file_name: "alex_transcript.pdf",
        file_path: "/documents/transcripts/alex_transcript.pdf",
        uploaded_at: "2024-02-25T16:50:00Z",
        verified: true,
        created_at: "2024-02-25T16:50:00Z",
        updated_at: "2024-02-25T16:50:00Z"
      },
      {
        id: 8,
        application_id: 4,
        type: "personal_statement",
        file_name: "alex_statement.pdf",
        file_path: "/documents/statements/alex_statement.pdf",
        uploaded_at: "2024-02-25T16:55:00Z",
        verified: true,
        created_at: "2024-02-25T16:55:00Z",
        updated_at: "2024-02-25T16:55:00Z"
      },
      {
        id: 9,
        application_id: 4,
        type: "letters_of_recommendation",
        file_name: "alex_recommendations.pdf",
        file_path: "/documents/recommendations/alex_recommendations.pdf",
        uploaded_at: "2024-02-25T17:00:00Z",
        verified: true,
        created_at: "2024-02-25T17:00:00Z",
        updated_at: "2024-02-25T17:00:00Z"
      }
    ]
  }
]

const mockTableData: TableData<AdmissionApplication> = {
  data: mockApplications,
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
  { label: "Admissions" }
]

export default function AdmissionsPage() {
  const handleApplicationSelect = (application: AdmissionApplication) => {
    console.log("Selected application:", application.application_number)
  }

  const handleApplicationView = (application: AdmissionApplication) => {
    console.log("View application:", application.application_number)
  }

  const handleApplicationEdit = (application: AdmissionApplication) => {
    console.log("Edit application:", application.application_number)
  }

  const handleApplicationDelete = (application: AdmissionApplication) => {
    console.log("Delete application:", application.application_number)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ApplicationsTable
          data={mockTableData}
          loading={false}
          onApplicationSelect={handleApplicationSelect}
          onApplicationView={handleApplicationView}
          onApplicationEdit={handleApplicationEdit}
          onApplicationDelete={handleApplicationDelete}
        />
      </div>
    </AppShell>
  )
}