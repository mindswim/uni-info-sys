"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Building2, Plus, Search, DoorOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminService } from "@/services"
import type { Building, Room } from "@/types/api-types"

export function BuildingsTab() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [buildingsData, roomsData] = await Promise.all([
          adminService.getAllBuildings(),
          adminService.getAllRooms()
        ])
        setBuildings(buildingsData.data || [])
        setRooms(roomsData.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalBuildings = buildings.length
  const totalRooms = rooms.length
  const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)
  const avgRoomsPerBuilding = totalBuildings > 0 ? Math.round(totalRooms / totalBuildings) : 0

  // Filter functions
  const filteredBuildings = buildings.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRooms = rooms.filter(r =>
    r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.building?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Buildings"
          value={totalBuildings.toString()}
          description="Campus buildings"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="Total Rooms"
          value={totalRooms.toString()}
          description="Available rooms"
          icon={<DoorOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity.toString()}
          description="Combined seats"
          icon={<DoorOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Rooms/Building"
          value={avgRoomsPerBuilding.toString()}
          description="Average distribution"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings and rooms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs for Buildings and Rooms */}
      <Tabs defaultValue="buildings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buildings">Buildings ({filteredBuildings.length})</TabsTrigger>
          <TabsTrigger value="rooms">Rooms ({filteredRooms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Buildings ({filteredBuildings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBuildings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No buildings found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredBuildings.map((building) => (
                    <div key={building.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{building.name}</p>
                          <Badge variant="outline">{building.code}</Badge>
                        </div>
                        {building.address && (
                          <p className="text-sm text-muted-foreground mt-1">{building.address}</p>
                        )}
                        {building.description && (
                          <p className="text-sm text-muted-foreground mt-1">{building.description}</p>
                        )}
                        {building.rooms && building.rooms.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {building.rooms.length} rooms
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No rooms found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Room {room.room_number}</p>
                          <Badge variant="outline">{room.type}</Badge>
                          {room.capacity && (
                            <Badge variant="secondary">Capacity: {room.capacity}</Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {room.building && <span>Building: {room.building.name} ({room.building.code})</span>}
                        </div>
                        {room.features && room.features.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {room.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
