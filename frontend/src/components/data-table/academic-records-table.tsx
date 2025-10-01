"use client"

import { AcademicRecord, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AcademicRecordsTableProps {
  data: TableData<AcademicRecord>
  loading?: boolean
  onRecordSelect?: (record: AcademicRecord) => void
  onRecordEdit?: (record: AcademicRecord) => void
  onRecordView?: (record: AcademicRecord) => void
  onRecordDelete?: (record: AcademicRecord) => void
}

export function AcademicRecordsTable({ 
  data, 
  loading, 
  onRecordSelect,
  onRecordEdit,
  onRecordView,
  onRecordDelete
}: AcademicRecordsTableProps) {

  const getQualificationVariant = (type: string) => {
    const variants = {
      'high_school': 'outline',
      'bachelor': 'secondary',
      'master': 'default',
      'phd': 'destructive',
      'diploma': 'outline',
      'certificate': 'outline'
    } as const
    return variants[type as keyof typeof variants] || 'outline'
  }

  const getGPAVariant = (gpa: number, maxGpa: number) => {
    const percentage = (gpa / maxGpa) * 100
    if (percentage >= 90) return 'default'
    if (percentage >= 80) return 'secondary'
    return 'outline'
  }

  const columns: TableColumn<AcademicRecord>[] = [
    {
      key: 'student',
      title: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student?.student_number}`} />
            <AvatarFallback className="text-xs">
              {row.student?.first_name?.[0]}{row.student?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{row.student?.first_name} {row.student?.last_name}</div>
            <div className="text-xs text-muted-foreground">{row.student?.student_number}</div>
          </div>
        </div>
      )
    },
    {
      key: 'institution_name',
      title: 'Institution',
      sortable: true,
      render: (value) => (
        <div className="font-medium max-w-48 truncate">{value}</div>
      )
    },
    {
      key: 'qualification_type',
      title: 'Qualification',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getQualificationVariant(value)} className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'gpa',
      title: 'GPA',
      sortable: true,
      render: (_, row) => (
        <div className="text-center">
          <Badge variant={getGPAVariant(row.gpa, row.max_gpa)}>
            {row.gpa}/{row.max_gpa}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">
            {((row.gpa / row.max_gpa) * 100).toFixed(1)}%
          </div>
        </div>
      )
    },
    {
      key: 'graduation_date',
      title: 'Graduation',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">In Progress</span>
        return (
          <div className="text-sm">
            {new Date(value).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            })}
          </div>
        )
      }
    },
    {
      key: 'is_verified',
      title: 'Verification',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="text-center">
          <Badge variant={value ? "default" : "destructive"}>
            {value ? "Verified" : "Pending"}
          </Badge>
          {value && row.verification_date && (
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(row.verification_date).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'is_verified',
      title: 'Standing',
      render: (_, row) => {
        const percentage = (row.gpa / row.max_gpa) * 100
        const standing = percentage >= 90 ? 'Excellent' : 
                        percentage >= 80 ? 'Good' : 
                        percentage >= 70 ? 'Satisfactory' : 'Needs Improvement'
        const variant = percentage >= 90 ? 'default' : 
                       percentage >= 80 ? 'secondary' : 
                       percentage >= 70 ? 'outline' : 'destructive'
        return <Badge variant={variant}>{standing}</Badge>
      }
    },
    buildDateColumn('created_at', 'Added'),
    buildActionsColumn<AcademicRecord>((record) => (
      <TableActions
        onView={() => onRecordView?.(record)}
        onEdit={() => onRecordEdit?.(record)}
        onDelete={() => onRecordDelete?.(record)}
        customActions={[
          {
            label: record.is_verified ? "Re-verify" : "Verify Record",
            onClick: () => console.log(record.is_verified ? "Re-verify" : "Verify", "record for", record.student?.first_name)
          },
          {
            label: "View Transcript",
            onClick: () => console.log("View transcript for", record.student?.first_name)
          },
          {
            label: "Generate Report",
            onClick: () => console.log("Generate academic report for", record.student?.first_name)
          },
          {
            label: "Credit Transfer",
            onClick: () => console.log("Process credit transfer for", record.student?.first_name)
          },
          {
            label: "Equivalency Review",
            onClick: () => console.log("Review equivalency for", record.institution_name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Records</h2>
          <p className="text-muted-foreground">
            Manage student academic history and transcript verification
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onRecordSelect}
        selectable={true}
      />
    </div>
  )
}