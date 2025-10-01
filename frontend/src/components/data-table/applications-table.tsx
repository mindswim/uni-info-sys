"use client"

import { AdmissionApplication, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn, getStatusConfig, applicationStatuses } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ApplicationsTableProps {
  data: TableData<AdmissionApplication>
  loading?: boolean
  onApplicationSelect?: (application: AdmissionApplication) => void
  onApplicationEdit?: (application: AdmissionApplication) => void
  onApplicationView?: (application: AdmissionApplication) => void
  onApplicationDelete?: (application: AdmissionApplication) => void
}

export function ApplicationsTable({ 
  data, 
  loading, 
  onApplicationSelect,
  onApplicationEdit,
  onApplicationView,
  onApplicationDelete
}: ApplicationsTableProps) {

  const columns: TableColumn<AdmissionApplication>[] = [
    {
      key: 'id',
      title: 'Application #',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'student_id',
      title: 'Applicant',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id}`} />
            <AvatarFallback>
              {row.student?.first_name?.[0]}{row.student?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.student?.first_name} {row.student?.last_name}</div>
            <div className="text-sm text-muted-foreground">ID: {row.student?.student_number}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const config = getStatusConfig(value, applicationStatuses)
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      key: 'program_choices',
      title: 'Program Choices',
      render: (choices) => {
        if (!choices || choices.length === 0) {
          return <span className="text-muted-foreground text-xs">No programs selected</span>
        }
        return (
          <div className="text-xs space-y-1">
            {choices.slice(0, 2).map((choice: any, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  #{choice.preference_order}
                </Badge>
                <span className="text-sm">{choice.program?.name}</span>
              </div>
            ))}
            {choices.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{choices.length - 2} more
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'application_date',
      title: 'Application Date',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>
        return (
          <div className="text-sm">
            {new Date(value).toLocaleDateString()}
          </div>
        )
      }
    },
    {
      key: 'decision_date',
      title: 'Decision Date',
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="text-sm">
            {new Date(value).toLocaleDateString()}
          </div>
        )
      }
    },
    {
      key: 'notes',
      title: 'Notes',
      render: (value) => {
        if (!value) {
          return <span className="text-muted-foreground text-xs">—</span>
        }

        return (
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {value}
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Created'),
    {
      key: 'updated_at',
      title: 'Updated',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">Pending</span>
        return <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      }
    },
    buildActionsColumn<AdmissionApplication>((application) => (
      <TableActions
        onView={() => onApplicationView?.(application)}
        onEdit={() => onApplicationEdit?.(application)}
        onDelete={() => onApplicationDelete?.(application)}
        customActions={[
          {
            label: "Review Application",
            onClick: () => console.log("Review application", application.id)
          },
          {
            label: "View Documents",
            onClick: () => console.log("View documents for", application.id)
          },
          {
            label: "Send Message",
            onClick: () => console.log("Send message to", application.id)
          },
          {
            label: application.status === 'pending' ? "Make Decision" : "Update Decision",
            onClick: () => console.log("Make decision for", application.id),
            destructive: false
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admission Applications</h2>
          <p className="text-muted-foreground">
            Review and process student applications
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onApplicationSelect}
        selectable={true}
      />
    </div>
  )
}