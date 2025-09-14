"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BuildingsTable } from "@/components/data-table/buildings-table"
import { Building, TableData } from "@/types/university"

// Mock data for buildings
const mockBuildings: Building[] = [
  {
    id: 1,
    name: "Science Building",
    code: "SCI",
    address: "123 University Avenue, Campus North",
    created_at: "2020-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    rooms: [
      { id: 1, building_id: 1, room_number: "101", capacity: 35, type: "classroom", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 2, building_id: 1, room_number: "102", capacity: 30, type: "laboratory", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 3, building_id: 1, room_number: "103", capacity: 25, type: "laboratory", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 4, building_id: 1, room_number: "201", capacity: 40, type: "classroom", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 5, building_id: 1, room_number: "202", capacity: 35, type: "classroom", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 6, building_id: 1, room_number: "301", capacity: 80, type: "auditorium", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 7, building_id: 1, room_number: "B01", capacity: 20, type: "laboratory", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 8, building_id: 1, room_number: "B02", capacity: 15, type: "office", created_at: "2020-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
    ]
  },
  {
    id: 2,
    name: "Engineering Building",
    code: "ENG",
    address: "456 Campus Drive, Campus Central",
    created_at: "2019-08-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    rooms: [
      { id: 9, building_id: 2, room_number: "101", capacity: 30, type: "classroom", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 10, building_id: 2, room_number: "102", capacity: 25, type: "laboratory", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 11, building_id: 2, room_number: "201", capacity: 45, type: "classroom", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 12, building_id: 2, room_number: "202", capacity: 35, type: "laboratory", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 13, building_id: 2, room_number: "301", capacity: 60, type: "auditorium", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 14, building_id: 2, room_number: "A10", capacity: 12, type: "office", created_at: "2019-08-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
    ]
  },
  {
    id: 3,
    name: "Humanities Building",
    code: "HUM",
    address: "789 Liberal Arts Way, Campus South",
    created_at: "2021-03-20T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    rooms: [
      { id: 15, building_id: 3, room_number: "101", capacity: 25, type: "classroom", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 16, building_id: 3, room_number: "102", capacity: 20, type: "classroom", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 17, building_id: 3, room_number: "150", capacity: 30, type: "classroom", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 18, building_id: 3, room_number: "201", capacity: 35, type: "classroom", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 19, building_id: 3, room_number: "250", capacity: 50, type: "auditorium", created_at: "2021-03-20T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
    ]
  },
  {
    id: 4,
    name: "Business Center",
    code: "BUS",
    address: "321 Commerce Street, Campus West",
    created_at: "2022-06-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    rooms: [
      { id: 20, building_id: 4, room_number: "101", capacity: 40, type: "classroom", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 21, building_id: 4, room_number: "102", capacity: 25, type: "classroom", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 22, building_id: 4, room_number: "201", capacity: 50, type: "auditorium", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 23, building_id: 4, room_number: "301", capacity: 15, type: "office", created_at: "2022-06-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
    ]
  },
  {
    id: 5,
    name: "University Library",
    code: "LIB",
    address: "555 Knowledge Boulevard, Campus Central",
    created_at: "2018-01-10T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    rooms: [
      { id: 24, building_id: 5, room_number: "101", capacity: 100, type: "library", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 25, building_id: 5, room_number: "201", capacity: 80, type: "library", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 26, building_id: 5, room_number: "301", capacity: 60, type: "library", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },
      { id: 27, building_id: 5, room_number: "A01", capacity: 12, type: "office", created_at: "2018-01-10T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" }
    ]
  }
]

const mockTableData: TableData<Building> = {
  data: mockBuildings,
  total: 5,
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
  { label: "Buildings" }
]

export default function BuildingsPage() {
  const handleBuildingSelect = (building: Building) => {
    console.log("Selected building:", building.code)
  }

  const handleBuildingView = (building: Building) => {
    console.log("View building:", building.code)
  }

  const handleBuildingEdit = (building: Building) => {
    console.log("Edit building:", building.code)
  }

  const handleBuildingDelete = (building: Building) => {
    console.log("Delete building:", building.code)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BuildingsTable
          data={mockTableData}
          loading={false}
          onBuildingSelect={handleBuildingSelect}
          onBuildingView={handleBuildingView}
          onBuildingEdit={handleBuildingEdit}
          onBuildingDelete={handleBuildingDelete}
        />
      </div>
    </AppShell>
  )
}