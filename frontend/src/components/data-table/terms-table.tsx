"use client"

import { Term, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface TermsTableProps {
  data: TableData<Term>
  loading?: boolean
  onTermSelect?: (term: Term) => void
  onTermEdit?: (term: Term) => void
  onTermView?: (term: Term) => void
  onTermDelete?: (term: Term) => void
}

export function TermsTable({ 
  data, 
  loading, 
  onTermSelect,
  onTermEdit,
  onTermView,
  onTermDelete
}: TermsTableProps) {

  const getTermStatus = (term: Term) => {
    const now = new Date()
    const startDate = new Date(term.start_date)
    const endDate = new Date(term.end_date)
    const registrationStart = new Date(term.registration_start)
    const addDropDeadline = new Date(term.add_drop_deadline)

    if (now < registrationStart) {
      return { status: 'upcoming', label: 'Upcoming', variant: 'outline' as const }
    } else if (now < startDate) {
      return { status: 'registration', label: 'Registration Open', variant: 'secondary' as const }
    } else if (now < addDropDeadline) {
      return { status: 'add_drop', label: 'Add/Drop Period', variant: 'default' as const }
    } else if (now < endDate) {
      return { status: 'active', label: 'Active', variant: 'default' as const }
    } else {
      return { status: 'completed', label: 'Completed', variant: 'outline' as const }
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    return `${start} - ${end}`
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return `${diffWeeks} weeks`
  }

  const columns: TableColumn<Term>[] = [
    {
      key: 'name',
      title: 'Term Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium text-lg">{value}</div>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{formatDateRange(row.start_date, row.end_date)}</div>
          <div className="text-muted-foreground text-xs">{getDuration(row.start_date, row.end_date)}</div>
        </div>
      )
    },
    {
      key: 'registration_start',
      title: 'Registration Opens',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium">
            {new Date(value).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(value).toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
        </div>
      )
    },
    {
      key: 'add_drop_deadline',
      title: 'Add/Drop Deadline',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium">
            {new Date(value).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(value).toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (_, row) => {
        const { label, variant } = getTermStatus(row)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'sections_count',
      title: 'Course Sections',
      render: (_, row) => {
        // Mock section counts - would come from API in real app
        const sectionCount = row.id === 1 ? 45 : row.id === 2 ? 38 : row.id === 3 ? 42 : 15
        return (
          <div className="text-center">
            <Badge variant="outline">{sectionCount} sections</Badge>
          </div>
        )
      }
    },
    {
      key: 'applications_count', 
      title: 'Applications',
      render: (_, row) => {
        // Mock application counts - would come from API
        const appCount = row.id === 1 ? 234 : row.id === 2 ? 189 : row.id === 3 ? 156 : 45
        return (
          <div className="text-center">
            <Badge variant="secondary">{appCount} apps</Badge>
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<Term>((term) => (
      <TableActions
        onView={() => onTermView?.(term)}
        onEdit={() => onTermEdit?.(term)}
        onDelete={() => onTermDelete?.(term)}
        customActions={[
          {
            label: "View Course Sections",
            onClick: () => console.log("View sections for", term.name)
          },
          {
            label: "Manage Applications", 
            onClick: () => console.log("Manage applications for", term.name)
          },
          {
            label: "Registration Report",
            onClick: () => console.log("Generate registration report for", term.name)
          },
          {
            label: "Academic Calendar",
            onClick: () => console.log("View academic calendar for", term.name)
          },
          {
            label: "Copy Term Settings",
            onClick: () => console.log("Copy settings from", term.name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Terms</h2>
          <p className="text-muted-foreground">
            Manage academic calendar and term scheduling
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onTermSelect}
        selectable={true}
      />
    </div>
  )
}