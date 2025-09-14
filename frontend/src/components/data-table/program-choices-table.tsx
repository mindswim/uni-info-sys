"use client"

import { ProgramChoice, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface ProgramChoicesTableProps {
  data: TableData<ProgramChoice>
  loading?: boolean
  onChoiceSelect?: (choice: ProgramChoice) => void
  onChoiceEdit?: (choice: ProgramChoice) => void
  onChoiceView?: (choice: ProgramChoice) => void
  onChoiceDelete?: (choice: ProgramChoice) => void
}

export function ProgramChoicesTable({ 
  data, 
  loading, 
  onChoiceSelect,
  onChoiceEdit,
  onChoiceView,
  onChoiceDelete
}: ProgramChoicesTableProps) {

  const getStatusVariant = (status: string) => {
    const variants = {
      'pending': 'outline',
      'accepted': 'default',
      'rejected': 'destructive',
      'waitlisted': 'secondary'
    } as const
    return variants[status as keyof typeof variants] || 'outline'
  }

  const getPreferenceVariant = (order: number) => {
    if (order === 1) return 'default'
    if (order === 2) return 'secondary'
    return 'outline'
  }

  const columns: TableColumn<ProgramChoice>[] = [
    {
      key: 'admission_application',
      title: 'Application',
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">App #{row.admission_application_id}</div>
          <div className="text-xs text-muted-foreground">
            {row.admission_application?.student?.first_name} {row.admission_application?.student?.last_name}
          </div>
        </div>
      )
    },
    {
      key: 'preference_order',
      title: 'Preference',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <Badge variant={getPreferenceVariant(value)}>
            {value === 1 ? '1st Choice' : value === 2 ? '2nd Choice' : `${value}${value === 3 ? 'rd' : 'th'} Choice`}
          </Badge>
        </div>
      )
    },
    {
      key: 'program',
      title: 'Program',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.program?.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.program?.department?.name} • {row.program?.degree_type}
          </div>
        </div>
      )
    },
    {
      key: 'program_details',
      title: 'Program Info',
      render: (_, row) => (
        <div className="text-sm space-y-1">
          <Badge variant="outline" className="capitalize">
            {row.program?.degree_type}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {row.program?.duration_years} years • {row.program?.total_credits} credits
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Decision Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'application_strength',
      title: 'Application Strength',
      render: (_, row) => {
        // Mock application strength based on preference order and program competitiveness
        const strength = row.preference_order === 1 ? 'High' : 
                        row.preference_order === 2 ? 'Medium' : 'Low'
        const variant = strength === 'High' ? 'default' : 
                       strength === 'Medium' ? 'secondary' : 'outline'
        return <Badge variant={variant}>{strength}</Badge>
      }
    },
    {
      key: 'competitiveness',
      title: 'Program Demand',
      render: (_, row) => {
        // Mock program competitiveness
        const competitive = ['Computer Science', 'Medicine', 'Business Administration']
        const isCompetitive = competitive.some(prog => row.program?.name?.includes(prog))
        return (
          <Badge variant={isCompetitive ? "destructive" : "secondary"}>
            {isCompetitive ? "High Demand" : "Standard"}
          </Badge>
        )
      }
    },
    buildDateColumn('created_at', 'Submitted'),
    buildActionsColumn<ProgramChoice>((choice) => (
      <TableActions
        onView={() => onChoiceView?.(choice)}
        onEdit={() => onChoiceEdit?.(choice)}
        onDelete={() => onChoiceDelete?.(choice)}
        customActions={[
          {
            label: "View Application",
            onClick: () => console.log("View full application for choice", choice.id)
          },
          {
            label: "Update Status",
            onClick: () => console.log("Update status for program choice", choice.id)
          },
          {
            label: "Compare Programs",
            onClick: () => console.log("Compare with other program choices")
          },
          {
            label: "Requirements Check",
            onClick: () => console.log("Check requirements for", choice.program?.name)
          },
          {
            label: "Decision History",
            onClick: () => console.log("View decision history for choice", choice.id)
          },
          {
            label: choice.status === 'pending' ? "Make Decision" : "Revise Decision",
            onClick: () => console.log(choice.status === 'pending' ? "Make decision" : "Revise decision", "for choice", choice.id),
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
          <h2 className="text-2xl font-bold tracking-tight">Program Choices</h2>
          <p className="text-muted-foreground">
            Manage student program preferences and admission decisions
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onChoiceSelect}
        selectable={true}
      />
    </div>
  )
}