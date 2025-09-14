"use client"

import { Student, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildNameColumn, buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentsTableProps {
  data: TableData<Student>
  loading?: boolean
  onStudentSelect?: (student: Student) => void
  onStudentEdit?: (student: Student) => void
  onStudentView?: (student: Student) => void
  onStudentDelete?: (student: Student) => void
}

export function StudentsTable({ 
  data, 
  loading, 
  onStudentSelect,
  onStudentEdit,
  onStudentView,
  onStudentDelete
}: StudentsTableProps) {

  const columns: TableColumn<Student>[] = [
    {
      key: 'student_number',
      title: 'Student ID',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'first_name',
      title: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student_number}`} />
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
      key: 'gender',
      title: 'Gender',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'city',
      title: 'Location',
      sortable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div>{row.city}, {row.state}</div>
          <div className="text-muted-foreground">{row.country}</div>
        </div>
      )
    },
    {
      key: 'date_of_birth',
      title: 'Age',
      sortable: true,
      render: (value) => {
        const age = Math.floor((Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        return <div className="text-sm">{age} years</div>
      }
    },
    {
      key: 'enrollments',
      title: 'Enrollments',
      render: (enrollments) => {
        const count = enrollments?.length || 0
        const activeCount = enrollments?.filter((e: any) => e.status === 'enrolled').length || 0
        return (
          <div className="text-sm">
            <div className="font-medium">{activeCount} active</div>
            <div className="text-muted-foreground">{count} total</div>
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Registered'),
    buildActionsColumn<Student>((student) => (
      <TableActions
        onView={() => onStudentView?.(student)}
        onEdit={() => onStudentEdit?.(student)}
        onDelete={() => onStudentDelete?.(student)}
        customActions={[
          {
            label: "View Enrollments",
            onClick: () => console.log("View enrollments for", student.student_number)
          },
          {
            label: "Send Message",
            onClick: () => console.log("Send message to", student.student_number)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onStudentSelect}
        selectable={true}
      />
    </div>
  )
}