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
      key: 'application_number',
      title: 'Application #',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'first_name',
      title: 'Applicant',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.application_number}`} />
            <AvatarFallback>
              {row.first_name[0]}{row.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
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
      key: 'gpa',
      title: 'GPA',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>
        const gradeColor = value >= 3.5 ? "text-green-600" : value >= 3.0 ? "text-yellow-600" : "text-red-600"
        return (
          <div className={`text-sm font-semibold ${gradeColor}`}>
            {value.toFixed(2)}
          </div>
        )
      }
    },
    {
      key: 'test_scores',
      title: 'Test Scores',
      render: (_, row) => {
        const scores = []
        if (row.sat_score) scores.push(`SAT: ${row.sat_score}`)
        if (row.act_score) scores.push(`ACT: ${row.act_score}`)
        if (row.gre_score) scores.push(`GRE: ${row.gre_score}`)
        
        if (scores.length === 0) {
          return <span className="text-muted-foreground text-xs">No scores</span>
        }
        
        return (
          <div className="text-xs space-y-1">
            {scores.slice(0, 2).map((score, index) => (
              <Badge key={index} variant="outline" className="text-xs mr-1">
                {score}
              </Badge>
            ))}
            {scores.length > 2 && (
              <div className="text-xs text-muted-foreground">+{scores.length - 2} more</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'documents',
      title: 'Documents',
      render: (documents) => {
        if (!documents || documents.length === 0) {
          return <Badge variant="destructive" className="text-xs">Missing</Badge>
        }
        
        const requiredDocs = ['transcript', 'personal_statement', 'letters_of_recommendation']
        const submittedDocs = documents.map((d: any) => d.type)
        const missing = requiredDocs.filter(doc => !submittedDocs.includes(doc))
        
        if (missing.length === 0) {
          return <Badge variant="default" className="text-xs">✅ Complete</Badge>
        } else {
          return (
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs">
                {documents.length}/{requiredDocs.length} docs
              </Badge>
              {missing.length > 0 && (
                <div className="text-xs text-red-600">Missing {missing.length}</div>
              )}
            </div>
          )
        }
      }
    },
    buildDateColumn('submitted_at', 'Submitted'),
    {
      key: 'decision_date',
      title: 'Decision Date',
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
            onClick: () => console.log("Review application", application.application_number)
          },
          {
            label: "View Documents",
            onClick: () => console.log("View documents for", application.application_number)
          },
          {
            label: "Send Message",
            onClick: () => console.log("Send message to", application.application_number)
          },
          {
            label: application.status === 'pending' ? "Make Decision" : "Update Decision",
            onClick: () => console.log("Make decision for", application.application_number),
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