"use client"

import { CourseSection, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CourseSectionsTableProps {
  data: TableData<CourseSection>
  loading?: boolean
  onSectionSelect?: (section: CourseSection) => void
  onSectionEdit?: (section: CourseSection) => void
  onSectionView?: (section: CourseSection) => void
  onSectionDelete?: (section: CourseSection) => void
}

export function CourseSectionsTable({ 
  data, 
  loading, 
  onSectionSelect,
  onSectionEdit,
  onSectionView,
  onSectionDelete
}: CourseSectionsTableProps) {

  const formatSchedule = (section: CourseSection) => {
    const days = section.schedule_days?.join('') || 'TBA'
    const time = section.start_time && section.end_time 
      ? `${section.start_time}-${section.end_time}`
      : 'TBA'
    return `${days} ${time}`
  }

  const getCapacityVariant = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity
    if (ratio >= 1) return 'destructive'
    if (ratio >= 0.8) return 'default' 
    return 'secondary'
  }

  const columns: TableColumn<CourseSection>[] = [
    {
      key: 'section_number',
      title: 'Section',
      sortable: true,
      render: (value, row) => (
        <div className="font-mono text-sm">
          <div className="font-semibold text-blue-600">{row.course?.course_code}-{value}</div>
          <div className="text-xs text-muted-foreground">{row.course?.title}</div>
        </div>
      )
    },
    {
      key: 'course',
      title: 'Course',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.course?.title}</div>
          <div className="text-muted-foreground text-xs">{row.course?.credits} credits</div>
        </div>
      )
    },
    {
      key: 'instructor',
      title: 'Instructor',
      render: (_, row) => {
        if (!row.instructor) return <span className="text-muted-foreground text-xs">Not assigned</span>
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.instructor.employee_id}`} />
              <AvatarFallback className="text-xs">
                {row.instructor.first_name[0]}{row.instructor.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{row.instructor.first_name} {row.instructor.last_name}</div>
              <div className="text-xs text-muted-foreground">{row.instructor.title}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'schedule',
      title: 'Schedule',
      render: (_, row) => (
        <div className="text-sm font-mono">
          <div className="font-medium">{formatSchedule(row)}</div>
        </div>
      )
    },
    {
      key: 'room',
      title: 'Location',
      render: (_, row) => {
        if (!row.room) return <span className="text-muted-foreground text-xs">TBA</span>
        return (
          <div className="text-sm">
            <div className="font-medium">{row.room.building?.code}-{row.room.room_number}</div>
            <div className="text-xs text-muted-foreground capitalize">{row.room.type}</div>
          </div>
        )
      }
    },
    {
      key: 'term',
      title: 'Term',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.term?.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.term?.start_date ? new Date(row.term.start_date).toLocaleDateString() : ''}
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      title: 'Enrollment',
      render: (_, row) => {
        const enrolled = row.enrolled_count || 0
        const capacity = row.capacity
        const waitlist = row.waitlist_count || 0
        return (
          <div className="text-center">
            <Badge variant={getCapacityVariant(enrolled, capacity)}>
              {enrolled}/{capacity}
            </Badge>
            {waitlist > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                {waitlist} waitlisted
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const config = {
          active: { label: "Active", variant: "default" as const },
          cancelled: { label: "Cancelled", variant: "destructive" as const },
          full: { label: "Full", variant: "secondary" as const }
        }[value] || { label: value, variant: "outline" as const }
        
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    buildDateColumn('created_at', 'Created'),
    buildActionsColumn<CourseSection>((section) => (
      <TableActions
        onView={() => onSectionView?.(section)}
        onEdit={() => onSectionEdit?.(section)}
        onDelete={() => onSectionDelete?.(section)}
        customActions={[
          {
            label: "View Roster",
            onClick: () => console.log("View roster for", section.section_number)
          },
          {
            label: "Manage Waitlist",
            onClick: () => console.log("Manage waitlist for", section.section_number)
          },
          {
            label: "Take Attendance",
            onClick: () => console.log("Take attendance for", section.section_number)
          },
          {
            label: "Enter Grades",
            onClick: () => console.log("Enter grades for", section.section_number)
          },
          {
            label: section.status === 'active' ? "Cancel Section" : "Reactivate Section",
            onClick: () => console.log(section.status === 'active' ? "Cancel" : "Reactivate", section.section_number),
            destructive: section.status === 'active'
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Sections</h2>
          <p className="text-muted-foreground">
            Manage specific course offerings with schedules and enrollment
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onSectionSelect}
        selectable={true}
      />
    </div>
  )
}