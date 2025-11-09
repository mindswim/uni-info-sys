"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Building2, DoorOpen, Users, Pencil, Trash2 } from 'lucide-react'
import { CsvImportExport } from '@/components/admin/csv-import-export'

interface Building {
  id: number
  name: string
  code: string
  address?: string
  description?: string
  created_at: string
  updated_at: string
  rooms?: Room[]
}

interface Room {
  id: number
  building_id: number
  room_number: string
  type: string
  capacity: number
  features?: string[]
  created_at: string
  updated_at: string
  building?: Building
}

export function BuildingsTab() {
  const { toast } = useToast()

  const [buildings, setBuildings] = useState<Building[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Building CRUD state
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [buildingFormData, setBuildingFormData] = useState({
    name: '',
    code: '',
    address: '',
    description: ''
  })

  const [deleteBuildingDialogOpen, setDeleteBuildingDialogOpen] = useState(false)
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null)

  // Room CRUD state
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomFormData, setRoomFormData] = useState({
    building_id: '',
    room_number: '',
    type: 'classroom',
    capacity: '',
    features: ''
  })

  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = useState(false)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const [buildingsResponse, roomsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/buildings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ])

      if (!buildingsResponse.ok || !roomsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const buildingsData = await buildingsResponse.json()
      const roomsData = await roomsResponse.json()

      setBuildings(buildingsData.data || buildingsData)
      setRooms(roomsData.data || roomsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch buildings and rooms',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Building handlers
  const openBuildingDialog = (building?: Building) => {
    if (building) {
      setEditingBuilding(building)
      setBuildingFormData({
        name: building.name,
        code: building.code,
        address: building.address || '',
        description: building.description || ''
      })
    } else {
      setEditingBuilding(null)
      setBuildingFormData({
        name: '',
        code: '',
        address: '',
        description: ''
      })
    }
    setBuildingDialogOpen(true)
  }

  const handleSaveBuilding = async () => {
    if (!buildingFormData.name || !buildingFormData.code) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingBuilding
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/buildings/${editingBuilding.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/buildings`

      const response = await fetch(url, {
        method: editingBuilding ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: buildingFormData.name,
          code: buildingFormData.code,
          address: buildingFormData.address || undefined,
          description: buildingFormData.description || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save building')
      }

      toast({
        title: 'Success',
        description: `Building ${editingBuilding ? 'updated' : 'created'} successfully`
      })

      setBuildingDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save building',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBuilding = async () => {
    if (!deletingBuilding) return

    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/buildings/${deletingBuilding.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete building')
      }

      toast({
        title: 'Success',
        description: 'Building deleted successfully'
      })

      setDeleteBuildingDialogOpen(false)
      setDeletingBuilding(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete building',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  // Room handlers
  const openRoomDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setRoomFormData({
        building_id: room.building_id.toString(),
        room_number: room.room_number,
        type: room.type,
        capacity: room.capacity.toString(),
        features: room.features?.join(', ') || ''
      })
    } else {
      setEditingRoom(null)
      setRoomFormData({
        building_id: '',
        room_number: '',
        type: 'classroom',
        capacity: '',
        features: ''
      })
    }
    setRoomDialogOpen(true)
  }

  const handleSaveRoom = async () => {
    if (!roomFormData.building_id || !roomFormData.room_number || !roomFormData.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingRoom
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/${editingRoom.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms`

      const features = roomFormData.features
        ? roomFormData.features.split(',').map(f => f.trim()).filter(f => f)
        : []

      const response = await fetch(url, {
        method: editingRoom ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          building_id: parseInt(roomFormData.building_id),
          room_number: roomFormData.room_number,
          type: roomFormData.type,
          capacity: parseInt(roomFormData.capacity),
          features: features.length > 0 ? features : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save room')
      }

      toast({
        title: 'Success',
        description: `Room ${editingRoom ? 'updated' : 'created'} successfully`
      })

      setRoomDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save room',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return

    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/${deletingRoom.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete room')
      }

      toast({
        title: 'Success',
        description: 'Room deleted successfully'
      })

      setDeleteRoomDialogOpen(false)
      setDeletingRoom(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete room',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRooms = rooms.filter(room =>
    room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.building?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    totalBuildings: buildings.length,
    totalRooms: rooms.length,
    totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
    avgRoomsPerBuilding: buildings.length > 0 ? Math.round(rooms.length / buildings.length) : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buildings & Rooms Management</h1>
          <p className="text-muted-foreground">Manage campus facilities and classroom spaces</p>
        </div>
        <CsvImportExport
          entityName="buildings"
          entityDisplayName="Buildings"
          importEndpoint="/api/v1/buildings/csv/import"
          exportEndpoint="/api/v1/buildings/csv/export"
          templateEndpoint="/api/v1/buildings/csv/template"
          onImportComplete={fetchBuildings}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuildings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rooms/Building</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRoomsPerBuilding}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings and rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="buildings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buildings">Buildings ({filteredBuildings.length})</TabsTrigger>
          <TabsTrigger value="rooms">Rooms ({filteredRooms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Buildings</CardTitle>
                  <CardDescription>Manage campus buildings</CardDescription>
                </div>
                <Button onClick={() => openBuildingDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Building
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredBuildings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No buildings found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBuildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{building.name}</h3>
                          <Badge variant="outline">{building.code}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {building.address || 'No address'}
                        </div>
                        {building.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {building.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBuildingDialog(building)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingBuilding(building)
                            setDeleteBuildingDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rooms</CardTitle>
                  <CardDescription>Manage classroom and facility spaces</CardDescription>
                </div>
                <Button onClick={() => openRoomDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rooms found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{room.room_number}</h3>
                          <Badge>{room.type}</Badge>
                          <Badge variant="outline">Capacity: {room.capacity}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {room.building?.name || `Building ID: ${room.building_id}`}
                        </div>
                        {room.features && room.features.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {room.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoomDialog(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingRoom(room)
                            setDeleteRoomDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Building Dialog */}
      <Dialog open={buildingDialogOpen} onOpenChange={setBuildingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBuilding ? 'Edit Building' : 'Create New Building'}</DialogTitle>
            <DialogDescription>
              {editingBuilding ? 'Update building information' : 'Add a new building to the campus'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building-name">Building Name *</Label>
                <Input
                  id="building-name"
                  value={buildingFormData.name}
                  onChange={(e) => setBuildingFormData({ ...buildingFormData, name: e.target.value })}
                  placeholder="e.g., Science Building"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building-code">Building Code *</Label>
                <Input
                  id="building-code"
                  value={buildingFormData.code}
                  onChange={(e) => setBuildingFormData({ ...buildingFormData, code: e.target.value })}
                  placeholder="e.g., SCI"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="building-address">Address</Label>
              <Input
                id="building-address"
                value={buildingFormData.address}
                onChange={(e) => setBuildingFormData({ ...buildingFormData, address: e.target.value })}
                placeholder="e.g., 123 Campus Drive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building-description">Description</Label>
              <Textarea
                id="building-description"
                value={buildingFormData.description}
                onChange={(e) => setBuildingFormData({ ...buildingFormData, description: e.target.value })}
                placeholder="Brief description of the building..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuildingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBuilding} disabled={submitting}>
              {submitting ? 'Saving...' : editingBuilding ? 'Update Building' : 'Create Building'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Create New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room information' : 'Add a new room to a building'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-building">Building *</Label>
                <Select
                  value={roomFormData.building_id}
                  onValueChange={(value) => setRoomFormData({ ...roomFormData, building_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id.toString()}>
                        {building.name} ({building.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-number">Room Number *</Label>
                <Input
                  id="room-number"
                  value={roomFormData.room_number}
                  onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
                  placeholder="e.g., 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type *</Label>
                <Select
                  value={roomFormData.type}
                  onValueChange={(value) => setRoomFormData({ ...roomFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="conference_room">Conference Room</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Capacity *</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min="1"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-features">Features (comma-separated)</Label>
              <Input
                id="room-features"
                value={roomFormData.features}
                onChange={(e) => setRoomFormData({ ...roomFormData, features: e.target.value })}
                placeholder="e.g., Projector, Whiteboard, Computer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} disabled={submitting}>
              {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Building Dialog */}
      <AlertDialog open={deleteBuildingDialogOpen} onOpenChange={setDeleteBuildingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the building "{deletingBuilding?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBuilding} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Room Dialog */}
      <AlertDialog open={deleteRoomDialogOpen} onOpenChange={setDeleteRoomDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete room "{deletingRoom?.room_number}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
