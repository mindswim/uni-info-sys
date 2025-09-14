"use client"

import { Staff, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StaffTableProps {
  data: TableData<Staff>
  loading?: boolean
  onStaffSelect?: (staff: Staff) => void
  onStaffEdit?: (staff: Staff) => void
  onStaffView?: (staff: Staff) => void
  onStaffDelete?: (staff: Staff) => void
}

export function StaffTable({ 
  data, 
  loading, 
  onStaffSelect,
  onStaffEdit,
  onStaffView,
  onStaffDelete
}: StaffTableProps) {

  const columns: TableColumn<Staff>[] = [
    {
      key: 'employee_id',
      title: 'Employee ID',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'first_name',
      title: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.employee_id}`} />
            <AvatarFallback>
              {row.first_name[0]}{row.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-muted-foreground">{row.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'title',
      title: 'Position',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
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
      key: 'hire_date',
      title: 'Hire Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'hire_date',
      title: 'Years of Service',
      sortable: true,
      render: (value) => {
        const years = Math.floor((Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        return (
          <div className="text-sm">
            <Badge variant={years >= 10 ? "default" : years >= 5 ? "secondary" : "outline"}>
              {years} years
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'salary',
      title: 'Salary',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-mono">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value)}
        </div>
      )
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
    buildDateColumn('created_at', 'Added'),
    buildActionsColumn<Staff>((staff) => (
      <TableActions
        onView={() => onStaffView?.(staff)}
        onEdit={() => onStaffEdit?.(staff)}
        onDelete={() => onStaffDelete?.(staff)}
        customActions={[
          {
            label: "View Profile",
            onClick: () => console.log("View profile", staff.employee_id)
          },
          {
            label: "Manage Courses",
            onClick: () => console.log("Manage courses for", staff.employee_id)
          },
          {
            label: "Performance Review",
            onClick: () => console.log("Performance review for", staff.employee_id)
          },
          {
            label: staff.is_active ? "Deactivate" : "Activate",
            onClick: () => console.log(staff.is_active ? "Deactivate" : "Activate", staff.employee_id),
            destructive: staff.is_active
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff & Faculty</h2>
          <p className="text-muted-foreground">
            Manage faculty and staff directory
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onStaffSelect}
        selectable={true}
      />
    </div>
  )
}