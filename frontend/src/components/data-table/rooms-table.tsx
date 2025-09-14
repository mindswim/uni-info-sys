"use client"

import { Room, TableColumn, TableData } from "@/types/university"
import { DataTable } from "./data-table"
import { buildDateColumn, buildActionsColumn } from "@/lib/table-utils"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

interface RoomsTableProps {
  data: TableData<Room>
  loading?: boolean
  onRoomSelect?: (room: Room) => void
  onRoomEdit?: (room: Room) => void
  onRoomView?: (room: Room) => void
  onRoomDelete?: (room: Room) => void
}

export function RoomsTable({ 
  data, 
  loading, 
  onRoomSelect,
  onRoomEdit,
  onRoomView,
  onRoomDelete
}: RoomsTableProps) {

  const getRoomTypeColor = (type: string) => {
    const colors = {
      classroom: 'default',
      laboratory: 'secondary', 
      office: 'outline',
      auditorium: 'destructive',
      library: 'default'
    } as const
    return colors[type as keyof typeof colors] || 'outline'
  }

  const getCapacityVariant = (capacity: number, type: string) => {
    if (type === 'auditorium' && capacity >= 50) return 'default'
    if (type === 'classroom' && capacity >= 30) return 'default'
    if (type === 'laboratory' && capacity >= 25) return 'secondary'
    if (type === 'library' && capacity >= 50) return 'default'
    return 'outline'
  }

  const columns: TableColumn<Room>[] = [
    {
      key: 'room_identifier',
      title: 'Room',
      sortable: true,
      render: (_, row) => (
        <div className="font-mono text-sm">
          <div className="font-semibold text-blue-600">{row.building?.code}-{row.room_number}</div>
          <div className="text-xs text-muted-foreground">{row.building?.name}</div>
        </div>
      )
    },
    {
      key: 'room_number',
      title: 'Room Number',
      sortable: true,
      render: (value) => (
        <div className="font-mono font-medium">{value}</div>
      )
    },
    {
      key: 'building',
      title: 'Building',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.building?.name}</div>
          <div className="text-muted-foreground text-xs">{row.building?.address}</div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Room Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getRoomTypeColor(value)} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'capacity',
      title: 'Capacity',
      sortable: true,
      render: (value, row) => (
        <div className="text-center">
          <Badge variant={getCapacityVariant(value, row.type)}>
            {value} seats
          </Badge>
        </div>
      )
    },
    {
      key: 'equipment',
      title: 'Equipment',
      render: (equipment) => {
        if (!equipment || equipment.length === 0) {
          return <span className="text-muted-foreground text-xs">None</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {equipment.slice(0, 2).map((item: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs capitalize">
                {item}
              </Badge>
            ))}
            {equipment.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{equipment.length - 2}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'current_sections',
      title: 'Current Usage',
      render: (_, row) => {
        // Mock current section usage - would come from API in real app
        const sectionCount = Math.floor(Math.random() * 5)
        const utilizationRate = sectionCount === 0 ? 0 : Math.floor(Math.random() * 80) + 20
        
        if (sectionCount === 0) {
          return <Badge variant="outline">Available</Badge>
        }
        
        return (
          <div className="text-sm text-center">
            <Badge variant="secondary">{sectionCount} sections</Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {utilizationRate}% utilized
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => {
        // Mock room status - would come from maintenance system
        const statuses = ['available', 'occupied', 'maintenance', 'reserved']
        const status = statuses[row.id % 4] || 'available'
        const variants = {
          available: 'default',
          occupied: 'secondary', 
          maintenance: 'destructive',
          reserved: 'outline'
        } as const
        
        return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
      }
    },
    buildDateColumn('created_at', 'Added'),
    buildActionsColumn<Room>((room) => (
      <TableActions
        onView={() => onRoomView?.(room)}
        onEdit={() => onRoomEdit?.(room)}
        onDelete={() => onRoomDelete?.(room)}
        customActions={[
          {
            label: "View Schedule",
            onClick: () => console.log("View schedule for", `${room.building?.code}-${room.room_number}`)
          },
          {
            label: "Book Room",
            onClick: () => console.log("Book room", `${room.building?.code}-${room.room_number}`)
          },
          {
            label: "Maintenance Request",
            onClick: () => console.log("Submit maintenance request for", `${room.building?.code}-${room.room_number}`)
          },
          {
            label: "Update Equipment",
            onClick: () => console.log("Update equipment for", `${room.building?.code}-${room.room_number}`)
          },
          {
            label: "Room Report",
            onClick: () => console.log("Generate report for", `${room.building?.code}-${room.room_number}`)
          }
        ]}
      />
    ))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campus Rooms</h2>
          <p className="text-muted-foreground">
            Manage individual rooms, equipment, and scheduling
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRowSelect={onRoomSelect}
        selectable={true}
      />
    </div>
  )
}