"use client"

import { AppShell } from "@/components/layout/app-shell"
import { TermsTable } from "@/components/data-table/terms-table"
import { Term, TableData } from "@/types/university"

// Mock data for terms
const mockTerms: Term[] = [
  {
    id: 1,
    name: "Fall 2025",
    start_date: "2025-08-25",
    end_date: "2025-12-15",
    add_drop_deadline: "2025-09-08",
    registration_start: "2025-07-01",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Spring 2026",
    start_date: "2026-01-15",
    end_date: "2026-05-15",
    add_drop_deadline: "2026-01-28",
    registration_start: "2025-11-01",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 3,
    name: "Summer 2026",
    start_date: "2026-06-01",
    end_date: "2026-08-10",
    add_drop_deadline: "2026-06-10",
    registration_start: "2026-03-15",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 4,
    name: "Fall 2026",
    start_date: "2026-08-24",
    end_date: "2026-12-14",
    add_drop_deadline: "2026-09-07",
    registration_start: "2026-06-30",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 5,
    name: "Spring 2027",
    start_date: "2027-01-14",
    end_date: "2027-05-14",
    add_drop_deadline: "2027-01-27",
    registration_start: "2026-10-30",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 6,
    name: "Winter Session 2026",
    start_date: "2025-12-16",
    end_date: "2026-01-12",
    add_drop_deadline: "2025-12-20",
    registration_start: "2025-10-15",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  }
]

const mockTableData: TableData<Term> = {
  data: mockTerms,
  total: 6,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Academic Terms" }
]

export default function TermsPage() {
  const handleTermSelect = (term: Term) => {
    console.log("Selected term:", term.name)
  }

  const handleTermView = (term: Term) => {
    console.log("View term:", term.name)
  }

  const handleTermEdit = (term: Term) => {
    console.log("Edit term:", term.name)
  }

  const handleTermDelete = (term: Term) => {
    console.log("Delete term:", term.name)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <TermsTable
          data={mockTableData}
          loading={false}
          onTermSelect={handleTermSelect}
          onTermView={handleTermView}
          onTermEdit={handleTermEdit}
          onTermDelete={handleTermDelete}
        />
      </div>
    </AppShell>
  )
}