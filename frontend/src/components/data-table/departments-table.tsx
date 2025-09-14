"use client"

import { Department, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface DepartmentsTableProps {
  data: TableData<Department>
  loading?: boolean
  onDepartmentSelect?: (department: Department) => void
  onDepartmentEdit?: (department: Department) => void
  onDepartmentView?: (department: Department) => void
  onDepartmentDelete?: (department: Department) => void
}

export function DepartmentsTable({ 
  data, 
  loading, 
  onDepartmentSelect,
  onDepartmentEdit,
  onDepartmentView,
  onDepartmentDelete
}: DepartmentsTableProps) {

  const columns: TableColumn<Department>[] = [
    {
      key: 'code',
      title: 'Code',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      title: 'Department Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'faculty',
      title: 'Faculty',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.faculty?.name}</div>
          <div className="text-muted-foreground text-xs">{row.faculty?.code}</div>
        </div>
      )
    },
    {
      key: 'staff',
      title: 'Staff Count',
      render: (staff) => {
        const count = staff?.length || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{count} members</Badge>
          </div>
        )
      }
    },
    {
      key: 'programs',
      title: 'Programs',
      render: (programs) => {
        const count = programs?.length || 0
        const activeCount = programs?.filter((p: any) => p.is_active).length || 0
        return (
          <div className="text-sm text-center">
            <div className="font-medium">{activeCount} active</div>
            <div className="text-muted-foreground text-xs">{count} total</div>
          </div>
        )
      }
    },
    {
      key: 'courses',
      title: 'Courses',
      render: (courses) => {
        const count = courses?.length || 0
        const activeCount = courses?.filter((c: any) => c.is_active).length || 0
        return (
          <div className="text-sm text-center">
            <div className="font-medium">{activeCount} active</div>
            <div className="text-muted-foreground text-xs">{count} total</div>
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Established'),
    buildActionsColumn<Department>((department) => (
      <TableActions
        onView={() => onDepartmentView?.(department)}
        onEdit={() => onDepartmentEdit?.(department)}
        onDelete={() => onDepartmentDelete?.(department)}
        customActions={[
          {
            label: "View Staff",
            onClick: () => console.log("View staff for", department.code)
          },
          {
            label: "View Programs",
            onClick: () => console.log("View programs for", department.code)
          },
          {
            label: "View Courses",
            onClick: () => console.log("View courses for", department.code)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage academic departments and organizational structure
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onDepartmentSelect}
        selectable={true}
      />
    </div>
  )
}