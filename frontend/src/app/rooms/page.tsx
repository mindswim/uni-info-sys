"use client"

import { AppShell } from "@/components/layout/app-shell"
import { RoomsTable } from "@/components/data-table/rooms-table"
import { Room, TableData } from "@/types/university"

// Mock data for rooms (expanded from building mock data)
const mockRooms: Room[] = [
  // Science Building Rooms
  {
    id: 1,
    building_id: 1,
    room_number: "101",
    capacity: 35,
    type: "classroom",
    equipment: ["projector", "whiteboard", "computer"],
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 1, name: "Science Building", code: "SCI", address: "123 University Avenue", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 2,
    building_id: 1,
    room_number: "102",
    capacity: 30,
    type: "laboratory",
    equipment: ["computers", "network", "projector", "lab_equipment"],
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 1, name: "Science Building", code: "SCI", address: "123 University Avenue", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 3,
    building_id: 1,
    room_number: "103",
    capacity: 25,
    type: "laboratory",
    equipment: ["computers", "microscopes", "lab_benches"],
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 1, name: "Science Building", code: "SCI", address: "123 University Avenue", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 6,
    building_id: 1,
    room_number: "301",
    capacity: 80,
    type: "auditorium",
    equipment: ["projector", "microphone", "podium", "sound_system"],
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 1, name: "Science Building", code: "SCI", address: "123 University Avenue", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },

  // Engineering Building Rooms  
  {
    id: 9,
    building_id: 2,
    room_number: "101",
    capacity: 30,
    type: "classroom",
    equipment: ["projector", "whiteboard"],
    created_at: "2019-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 2, name: "Engineering Building", code: "ENG", address: "456 Campus Drive", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 10,
    building_id: 2,
    room_number: "102",
    capacity: 25,
    type: "laboratory",
    equipment: ["3d_printers", "computers", "tools", "workbenches"],
    created_at: "2019-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 2, name: "Engineering Building", code: "ENG", address: "456 Campus Drive", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 13,
    building_id: 2,
    room_number: "301",
    capacity: 60,
    type: "auditorium",
    equipment: ["projector", "microphone", "smart_board"],
    created_at: "2019-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 2, name: "Engineering Building", code: "ENG", address: "456 Campus Drive", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },

  // Humanities Building Rooms
  {
    id: 15,
    building_id: 3,
    room_number: "101",
    capacity: 25,
    type: "classroom",
    equipment: ["projector", "whiteboard"],
    created_at: "2021-03-20T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 3, name: "Humanities Building", code: "HUM", address: "789 Liberal Arts Way", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 17,
    building_id: 3,
    room_number: "150",
    capacity: 30,
    type: "classroom",
    equipment: ["projector", "sound_system"],
    created_at: "2021-03-20T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 3, name: "Humanities Building", code: "HUM", address: "789 Liberal Arts Way", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 19,
    building_id: 3,
    room_number: "250",
    capacity: 50,
    type: "auditorium",
    equipment: ["projector", "microphone", "stage"],
    created_at: "2021-03-20T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 3, name: "Humanities Building", code: "HUM", address: "789 Liberal Arts Way", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },

  // Business Center Rooms
  {
    id: 20,
    building_id: 4,
    room_number: "101",
    capacity: 40,
    type: "classroom",
    equipment: ["projector", "whiteboard", "laptop_hookups"],
    created_at: "2022-06-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 4, name: "Business Center", code: "BUS", address: "321 Commerce Street", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 22,
    building_id: 4,
    room_number: "201",
    capacity: 50,
    type: "auditorium",
    equipment: ["projector", "microphone", "teleconference", "smart_board"],
    created_at: "2022-06-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 4, name: "Business Center", code: "BUS", address: "321 Commerce Street", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },

  // Library Rooms
  {
    id: 24,
    building_id: 5,
    room_number: "101",
    capacity: 100,
    type: "library",
    equipment: ["computers", "printers", "study_carrels"],
    created_at: "2018-01-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 5, name: "University Library", code: "LIB", address: "555 Knowledge Boulevard", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 25,
    building_id: 5,
    room_number: "201",
    capacity: 80,
    type: "library",
    equipment: ["quiet_study", "group_tables", "computers"],
    created_at: "2018-01-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 5, name: "University Library", code: "LIB", address: "555 Knowledge Boulevard", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },

  // Office Rooms
  {
    id: 8,
    building_id: 1,
    room_number: "B02",
    capacity: 15,
    type: "office",
    equipment: ["desk", "computer", "phone"],
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 1, name: "Science Building", code: "SCI", address: "123 University Avenue", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  },
  {
    id: 14,
    building_id: 2,
    room_number: "A10",
    capacity: 12,
    type: "office",
    equipment: ["desk", "computer", "filing_cabinet"],
    created_at: "2019-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    building: { id: 2, name: "Engineering Building", code: "ENG", address: "456 Campus Drive", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
  }
]

const mockTableData: TableData<Room> = {
  data: mockRooms,
  total: 17,
  page: 1,
  per_page: 25,
  last_page: 1
}

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Rooms" }
]

export default function RoomsPage() {
  const handleRoomSelect = (room: Room) => {
    console.log("Selected room:", `${room.building?.code}-${room.room_number}`)
  }

  const handleRoomView = (room: Room) => {
    console.log("View room:", `${room.building?.code}-${room.room_number}`)
  }

  const handleRoomEdit = (room: Room) => {
    console.log("Edit room:", `${room.building?.code}-${room.room_number}`)
  }

  const handleRoomDelete = (room: Room) => {
    console.log("Delete room:", `${room.building?.code}-${room.room_number}`)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <RoomsTable
          data={mockTableData}
          loading={false}
          onRoomSelect={handleRoomSelect}
          onRoomView={handleRoomView}
          onRoomEdit={handleRoomEdit}
          onRoomDelete={handleRoomDelete}
        />
      </div>
    </AppShell>
  )
}