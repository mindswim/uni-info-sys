"use client"

import { Program, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn, degreeTypes, getStatusConfig } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface ProgramsTableProps {
  data: TableData<Program>
  loading?: boolean
  onProgramSelect?: (program: Program) => void
  onProgramEdit?: (program: Program) => void
  onProgramView?: (program: Program) => void
  onProgramDelete?: (program: Program) => void
}

export function ProgramsTable({ 
  data, 
  loading, 
  onProgramSelect,
  onProgramEdit,
  onProgramView,
  onProgramDelete
}: ProgramsTableProps) {

  const columns: TableColumn<Program>[] = [
    {
      key: 'name',
      title: 'Program Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'degree_type',
      title: 'Degree Type',
      sortable: true,
      filterable: true,
      render: (value) => {
        const config = getStatusConfig(value, degreeTypes)
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.department?.name}</div>
          <div className="text-muted-foreground text-xs">{row.department?.code}</div>
        </div>
      )
    },
    {
      key: 'duration_years',
      title: 'Duration',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <Badge variant="outline">{value} years</Badge>
        </div>
      )
    },
    {
      key: 'total_credits',
      title: 'Credits Required',
      sortable: true,
      render: (value) => (
        <div className="text-center font-mono">{value}</div>
      )
    },
    {
      key: 'admission_applications',
      title: 'Applications',
      render: (applications) => {
        const total = applications?.length || 0
        const pending = applications?.filter((app: any) => app.status === 'pending').length || 0
        return (
          <div className="text-sm text-center">
            <div className="font-medium">{pending} pending</div>
            <div className="text-muted-foreground text-xs">{total} total</div>
          </div>
        )
      }
    },
    {
      key: 'students',
      title: 'Enrolled Students',
      render: (students) => {
        const count = students?.length || 0
        return (
          <div className="text-center">
            <Badge variant={count > 50 ? "default" : count > 20 ? "secondary" : "outline"}>
              {count} students
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    },
    buildDateColumn('created_at', 'Established'),
    buildActionsColumn<Program>((program) => (
      <TableActions
        onView={() => onProgramView?.(program)}
        onEdit={() => onProgramEdit?.(program)}
        onDelete={() => onProgramDelete?.(program)}
        customActions={[
          {
            label: "View Curriculum",
            onClick: () => console.log("View curriculum for", program.name)
          },
          {
            label: "View Students",
            onClick: () => console.log("View students in", program.name)
          },
          {
            label: "View Applications",
            onClick: () => console.log("View applications for", program.name)
          },
          {
            label: program.is_active ? "Deactivate" : "Activate",
            onClick: () => console.log(program.is_active ? "Deactivate" : "Activate", program.name),
            destructive: program.is_active
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Programs</h2>
          <p className="text-muted-foreground">
            Manage degree programs and curriculum
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onProgramSelect}
        selectable={true}
      />
    </div>
  )
}