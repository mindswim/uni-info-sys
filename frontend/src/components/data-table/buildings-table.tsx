"use client"

import { Building, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface BuildingsTableProps {
  data: TableData<Building>
  loading?: boolean
  onBuildingSelect?: (building: Building) => void
  onBuildingEdit?: (building: Building) => void
  onBuildingView?: (building: Building) => void
  onBuildingDelete?: (building: Building) => void
}

export function BuildingsTable({ 
  data, 
  loading, 
  onBuildingSelect,
  onBuildingEdit,
  onBuildingView,
  onBuildingDelete
}: BuildingsTableProps) {

  const columns: TableColumn<Building>[] = [
    {
      key: 'code',
      title: 'Building Code',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'name',
      title: 'Building Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium text-lg">{value}</div>
      )
    },
    {
      key: 'address',
      title: 'Address',
      render: (value) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'rooms',
      title: 'Total Rooms',
      render: (rooms) => {
        const count = rooms?.length || 0
        return (
          <div className="text-center">
            <Badge variant="outline">{count} rooms</Badge>
          </div>
        )
      }
    },
    {
      key: 'address',
      title: 'Room Types',
      render: (_, row) => {
        const rooms = row.rooms || []
        const types = [...new Set(rooms.map((r: any) => r.type))]
        return (
          <div className="flex flex-wrap gap-1">
            {types.slice(0, 3).map((type: string) => (
              <Badge key={type} variant="secondary" className="text-xs capitalize">
                {type}
              </Badge>
            ))}
            {types.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{types.length - 3}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Total Capacity',
      render: (_, row) => {
        const rooms = row.rooms || []
        const totalCapacity = rooms.reduce((sum: number, room: any) => sum + (room.capacity || 0), 0)
        return (
          <div className="text-center font-medium">
            {totalCapacity > 0 ? totalCapacity : 'N/A'}
          </div>
        )
      }
    },
    {
      key: 'updated_at',
      title: 'Active Sections',
      render: (_, row) => {
        // Mock active section count - would come from API in real app
        const sectionCount = row.id === 1 ? 28 : row.id === 2 ? 15 : row.id === 3 ? 12 : row.id === 4 ? 8 : 3
        return (
          <div className="text-center">
            <Badge variant={sectionCount > 20 ? "default" : sectionCount > 10 ? "secondary" : "outline"}>
              {sectionCount} active
            </Badge>
          </div>
        )
      }
    },
    buildDateColumn('created_at', 'Added'),
    buildActionsColumn<Building>((building) => (
      <TableActions
        onView={() => onBuildingView?.(building)}
        onEdit={() => onBuildingEdit?.(building)}
        onDelete={() => onBuildingDelete?.(building)}
        customActions={[
          {
            label: "View Rooms",
            onClick: () => console.log("View rooms in", building.name)
          },
          {
            label: "Room Schedule",
            onClick: () => console.log("View room schedule for", building.name)
          },
          {
            label: "Maintenance Log",
            onClick: () => console.log("View maintenance log for", building.name)
          },
          {
            label: "Utilization Report",
            onClick: () => console.log("Generate utilization report for", building.name)
          },
          {
            label: "Add New Room",
            onClick: () => console.log("Add new room to", building.name)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campus Buildings</h2>
          <p className="text-muted-foreground">
            Manage campus infrastructure and room allocation
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onBuildingSelect}
        selectable={true}
      />
    </div>
  )
}