"use client"

import { Enrollment, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn, getStatusConfig, enrollmentStatuses, getGradeConfig } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EnrollmentsTableProps {
  data: TableData<Enrollment>
  loading?: boolean
  onEnrollmentSelect?: (enrollment: Enrollment) => void
  onEnrollmentEdit?: (enrollment: Enrollment) => void
  onEnrollmentView?: (enrollment: Enrollment) => void
  onEnrollmentDelete?: (enrollment: Enrollment) => void
}

export function EnrollmentsTable({ 
  data, 
  loading, 
  onEnrollmentSelect,
  onEnrollmentEdit,
  onEnrollmentView,
  onEnrollmentDelete
}: EnrollmentsTableProps) {

  const columns: TableColumn<Enrollment>[] = [
    {
      key: 'student',
      title: 'Student',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student?.student_number}`} />
            <AvatarFallback>
              {row.student?.first_name[0]}{row.student?.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.student?.first_name} {row.student?.last_name}</div>
            <div className="text-sm text-muted-foreground font-mono">{row.student?.student_number}</div>
          </div>
        </div>
      )
    },
    {
      key: 'course_section',
      title: 'Course',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium">
            <span className="font-mono text-blue-600">{row.course_section?.course?.code}</span>
            <span className="ml-2">{row.course_section?.course?.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Section {row.course_section?.section_number} • {row.course_section?.course?.credits} credits
          </div>
          {row.course_section?.schedule && (
            <div className="text-xs text-muted-foreground">{row.course_section?.schedule}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const config = getStatusConfig(value, enrollmentStatuses)
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'grade',
      title: 'Grade',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">Not graded</span>
        const config = getGradeConfig(value)
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'enrollment_date',
      title: 'Enrolled',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'completion_date',
      title: 'Completed',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">In progress</span>
        return <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      }
    },
    {
      key: 'course_section',
      title: 'Instructor',
      render: (_, row) => {
        const instructor = row.course_section?.instructor
        if (!instructor) return <span className="text-muted-foreground text-xs">TBA</span>
        return (
          <div className="text-sm">
            <div className="font-medium">{instructor.first_name} {instructor.last_name}</div>
            <div className="text-xs text-muted-foreground">{instructor.title}</div>
          </div>
        )
      }
    },
    {
      key: 'course_section',
      title: 'Capacity',
      render: (_, row) => {
        const section = row.course_section
        if (!section) return <span className="text-muted-foreground">—</span>
        
        const enrolled = section.current_enrollment || 0
        const capacity = section.max_enrollment || 0
        const percentage = capacity > 0 ? (enrolled / capacity) * 100 : 0
        const variant = percentage >= 100 ? "destructive" : percentage >= 80 ? "secondary" : "default"
        
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span>{enrolled}/{capacity}</span>
              <Badge variant={variant} className="text-xs">
                {percentage.toFixed(0)}%
              </Badge>
            </div>
          </div>
        )
      }
    },
    buildActionsColumn<Enrollment>((enrollment) => (
      <TableActions
        onView={() => onEnrollmentView?.(enrollment)}
        onEdit={() => onEnrollmentEdit?.(enrollment)}
        onDelete={() => onEnrollmentDelete?.(enrollment)}
        customActions={[
          {
            label: enrollment.status === 'enrolled' ? "Drop Course" : "Re-enroll",
            onClick: () => console.log(enrollment.status === 'enrolled' ? "Drop" : "Re-enroll", enrollment.id),
            destructive: enrollment.status === 'enrolled'
          },
          {
            label: "View Student Profile",
            onClick: () => console.log("View student profile", enrollment.student?.student_number)
          },
          {
            label: "View Course Details",
            onClick: () => console.log("View course details", enrollment.course_section?.course?.code)
          },
          {
            label: enrollment.grade ? "Update Grade" : "Assign Grade",
            onClick: () => console.log("Grade enrollment", enrollment.id)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Enrollments</h2>
          <p className="text-muted-foreground">
            Manage student course enrollments and grades
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onEnrollmentSelect}
        selectable={true}
      />
    </div>
  )
}