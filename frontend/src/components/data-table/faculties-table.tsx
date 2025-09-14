"use client"

import { Faculty, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FacultiesTableProps {
  data: TableData<Faculty>
  loading?: boolean
  onFacultySelect?: (faculty: Faculty) => void
  onFacultyEdit?: (faculty: Faculty) => void
  onFacultyView?: (faculty: Faculty) => void
  onFacultyDelete?: (faculty: Faculty) => void
}

export function FacultiesTable({ 
  data, 
  loading, 
  onFacultySelect,
  onFacultyEdit,
  onFacultyView,
  onFacultyDelete
}: FacultiesTableProps) {

  const columns: TableColumn<Faculty>[] = [
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
      title: 'Faculty Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'dean',
      title: 'Dean',
      render: (_, row) => {
        if (!row.dean) return <span className="text-muted-foreground text-xs">Vacant</span>
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.dean.employee_id}`} />
              <AvatarFallback className="text-xs">
                {row.dean.first_name[0]}{row.dean.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{row.dean.first_name} {row.dean.last_name}</div>
              <div className="text-xs text-muted-foreground">{row.dean.title}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'departments',
      title: 'Departments',
      render: (departments) => {
        const count = departments?.length || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{count} departments</Badge>
          </div>
        )
      }
    },
    {
      key: 'departments',
      title: 'Total Programs',
      render: (departments) => {
        const totalPrograms = departments?.reduce((sum: number, dept: any) => 
          sum + (dept.programs?.length || 0), 0) || 0
        return (
          <div className="text-center">
            <Badge variant="secondary">{totalPrograms} programs</Badge>
          </div>
        )
      }
    },
    {
      key: 'departments',
      title: 'Total Students',
      render: (departments) => {
        const totalStudents = departments?.reduce((sum: number, dept: any) => 
          sum + (dept.programs?.reduce((pSum: number, prog: any) => 
            pSum + (prog.students?.length || 0), 0) || 0), 0) || 0
        return (
          <div className="text-center">
            <Badge variant={totalStudents > 500 ? "default" : totalStudents > 200 ? "secondary" : "outline"}>
              {totalStudents} students
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'departments',
      title: 'Faculty Staff',
      render: (departments) => {
        const totalStaff = departments?.reduce((sum: number, dept: any) => 
          sum + (dept.staff?.length || 0), 0) || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{totalStaff} staff</Badge>
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Established'),
    buildActionsColumn<Faculty>((faculty) => (
      <TableActions
        onView={() => onFacultyView?.(faculty)}
        onEdit={() => onFacultyEdit?.(faculty)}
        onDelete={() => onFacultyDelete?.(faculty)}
        customActions={[
          {
            label: "View Departments",
            onClick: () => console.log("View departments for", faculty.code)
          },
          {
            label: "View Programs",
            onClick: () => console.log("View programs for", faculty.code)
          },
          {
            label: "Faculty Report",
            onClick: () => console.log("Generate report for", faculty.code)
          },
          {
            label: faculty.dean ? "Change Dean" : "Assign Dean",
            onClick: () => console.log("Manage dean for", faculty.code)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculties</h2>
          <p className="text-muted-foreground">
            Manage university faculties and academic divisions
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onFacultySelect}
        selectable={true}
      />
    </div>
  )
}