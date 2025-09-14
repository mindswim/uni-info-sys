"use client"

import { Course, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn, getStatusConfig, courseSectionStatuses } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface CoursesTableProps {
  data: TableData<Course>
  loading?: boolean
  onCourseSelect?: (course: Course) => void
  onCourseEdit?: (course: Course) => void
  onCourseView?: (course: Course) => void
  onCourseDelete?: (course: Course) => void
}

export function CoursesTable({ 
  data, 
  loading, 
  onCourseSelect,
  onCourseEdit,
  onCourseView,
  onCourseDelete
}: CoursesTableProps) {

  const columns: TableColumn<Course>[] = [
    {
      key: 'code',
      title: 'Course Code',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      title: 'Course Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'credits',
      title: 'Credits',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <Badge variant="outline" className="font-mono">{value}</Badge>
        </div>
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
      key: 'level',
      title: 'Level',
      sortable: true,
      filterable: true,
      render: (value) => {
        const levelColors = {
          'undergraduate': 'default',
          'graduate': 'secondary',
          'doctoral': 'outline'
        } as const
        return (
          <Badge variant={levelColors[value as keyof typeof levelColors] || 'outline'} className="capitalize">
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'prerequisites',
      title: 'Prerequisites',
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-muted-foreground text-xs">None</span>
        }
        return (
          <div className="text-xs space-y-1">
            {value.slice(0, 2).map((prereq: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs mr-1">
                {prereq.code}
              </Badge>
            ))}
            {value.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{value.length - 2} more
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'course_sections',
      title: 'Sections',
      render: (sections) => {
        const count = sections?.length || 0
        const activeCount = sections?.filter((s: any) => s.status === 'open').length || 0
        return (
          <div className="text-sm text-center">
            <div className="font-medium">{activeCount} open</div>
            <div className="text-muted-foreground text-xs">{count} total</div>
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
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<Course>((course) => (
      <TableActions
        onView={() => onCourseView?.(course)}
        onEdit={() => onCourseEdit?.(course)}
        onDelete={() => onCourseDelete?.(course)}
        customActions={[
          {
            label: "View Sections",
            onClick: () => console.log("View sections for", course.code)
          },
          {
            label: "Manage Prerequisites",
            onClick: () => console.log("Manage prerequisites for", course.code)
          },
          {
            label: "Clone Course",
            onClick: () => console.log("Clone course", course.code)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Manage course catalog and curriculum
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onCourseSelect}
        selectable={true}
      />
    </div>
  )
}