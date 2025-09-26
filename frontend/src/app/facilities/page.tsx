'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG, apiRequest } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import {
  Building, Users, Clock, MapPin, Wifi,
  Monitor, Projector2, Video, Volume2, Zap,
  AlertCircle, CheckCircle, Calendar as CalendarIcon,
  Search, Filter, Settings, ChevronRight
} from 'lucide-react'

interface Building {
  id: number
  code: string
  name: string
  address: string
  floors: number
  total_rooms: number
  available_rooms: number
  facilities: string[]
  status: 'operational' | 'maintenance' | 'closed'
}

interface Room {
  id: number
  building_id: number
  building_name: string
  room_number: string
  name: string
  capacity: number
  type: 'classroom' | 'lab' | 'lecture_hall' | 'office' | 'meeting_room' | 'auditorium'
  features: string[]
  current_occupancy: number
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  next_available?: string
  current_class?: {
    course_code: string
    course_name: string
    instructor: string
    time_slot: string
  }
}

interface RoomSchedule {
  room_id: number
  date: string
  time_slots: Array<{
    time: string
    status: 'available' | 'occupied' | 'reserved'
    course?: string
    instructor?: string
  }>
}

// Mock data generator
const generateMockData = () => {
  const buildings: Building[] = [
    {
      id: 1,
      code: 'SB',
      name: 'Science Building',
      address: '123 University Ave',
      floors: 5,
      total_rooms: 45,
      available_rooms: 12,
      facilities: ['WiFi', 'Elevators', 'Cafeteria', 'Study Areas'],
      status: 'operational'
    },
    {
      id: 2,
      code: 'MB',
      name: 'Mathematics Building',
      address: '456 Campus Dr',
      floors: 3,
      total_rooms: 30,
      available_rooms: 8,
      facilities: ['WiFi', 'Computer Labs', 'Elevators'],
      status: 'operational'
    },
    {
      id: 3,
      code: 'LA',
      name: 'Liberal Arts Hall',
      address: '789 Academic Blvd',
      floors: 4,
      total_rooms: 35,
      available_rooms: 5,
      facilities: ['WiFi', 'Library', 'Theater', 'Art Studios'],
      status: 'operational'
    },
    {
      id: 4,
      code: 'EC',
      name: 'Engineering Complex',
      address: '321 Tech Way',
      floors: 6,
      total_rooms: 60,
      available_rooms: 3,
      facilities: ['WiFi', 'Labs', 'Workshop', '3D Printing'],
      status: 'maintenance'
    }
  ]

  const roomTypes = ['classroom', 'lab', 'lecture_hall', 'office', 'meeting_room', 'auditorium'] as const
  const features = [
    ['Projector', 'Whiteboard', 'WiFi'],
    ['Projector', 'Smart Board', 'WiFi', 'Video Conferencing'],
    ['Computer Stations', 'Projector', 'WiFi'],
    ['Microphone System', 'Recording Equipment', 'WiFi']
  ]

  const rooms: Room[] = []
  buildings.forEach(building => {
    for (let floor = 1; floor <= building.floors; floor++) {
      for (let room = 1; room <= Math.floor(building.total_rooms / building.floors); room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`
        const isOccupied = Math.random() > 0.3
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)]

        rooms.push({
          id: rooms.length + 1,
          building_id: building.id,
          building_name: building.name,
          room_number: roomNumber,
          name: `${building.code} ${roomNumber}`,
          capacity: roomType === 'auditorium' ? 200 : roomType === 'lecture_hall' ? 100 : roomType === 'lab' ? 30 : 40,
          type: roomType,
          features: features[Math.floor(Math.random() * features.length)],
          current_occupancy: isOccupied ? Math.floor(Math.random() * 30) + 10 : 0,
          status: isOccupied ? 'occupied' : Math.random() > 0.9 ? 'maintenance' : 'available',
          next_available: isOccupied ? '3:00 PM' : undefined,
          current_class: isOccupied ? {
            course_code: `CS ${Math.floor(Math.random() * 400) + 100}`,
            course_name: 'Computer Science Course',
            instructor: 'Dr. Smith',
            time_slot: '2:00 PM - 3:00 PM'
          } : undefined
        })
      }
    }
  })

  return { buildings, rooms }
}

export default function FacilitiesPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try authenticated endpoint
        const buildingsResponse = await apiRequest(`${API_CONFIG.V1.BASE}/buildings`)
        const roomsResponse = await apiRequest(`${API_CONFIG.V1.BASE}/rooms`)

        if (buildingsResponse.ok && roomsResponse.ok) {
          const buildingsData = await buildingsResponse.json()
          const roomsData = await roomsResponse.json()
          setBuildings(buildingsData)
          setRooms(roomsData)
          if (buildingsData.length > 0) {
            setSelectedBuilding(buildingsData[0])
          }
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data
        const mockData = generateMockData()
        setBuildings(mockData.buildings)
        setRooms(mockData.rooms)
        setSelectedBuilding(mockData.buildings[0])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateOccupancyRate = (building: Building) => {
    const occupiedRooms = building.total_rooms - building.available_rooms
    return Math.round((occupiedRooms / building.total_rooms) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'operational':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'reserved':
        return 'bg-purple-100 text-purple-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'lab':
        return <Monitor className="h-4 w-4" />
      case 'lecture_hall':
        return <Projector2 className="h-4 w-4" />
      case 'auditorium':
        return <Volume2 className="h-4 w-4" />
      case 'meeting_room':
        return <Video className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_number.includes(searchTerm)
    const matchesType = filterType === 'all' || room.type === filterType
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesBuilding = !selectedBuilding || room.building_id === selectedBuilding.id

    return matchesSearch && matchesType && matchesStatus && matchesBuilding
  })

  const availableRoomsCount = rooms.filter(r => r.status === 'available').length
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const currentOccupancy = rooms.reduce((sum, room) => sum + room.current_occupancy, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading facilities...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facilities Management</h1>
          <p className="text-muted-foreground">Manage buildings and room scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule View
          </Button>
          <Button className="gap-2">
            <Building className="h-4 w-4" />
            Add Building
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildings.length}</div>
            <p className="text-xs text-muted-foreground">
              {buildings.filter(b => b.status === 'operational').length} operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">{availableRoomsCount} available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{currentOccupancy.toLocaleString()} occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((currentOccupancy / totalCapacity) * 100)}%
            </div>
            <Progress value={(currentOccupancy / totalCapacity) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="buildings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Buildings Tab */}
        <TabsContent value="buildings">
          <Card>
            <CardHeader>
              <CardTitle>Campus Buildings</CardTitle>
              <CardDescription>Overview of all campus buildings and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {buildings.map(building => (
                  <Card key={building.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedBuilding(building)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          <CardTitle className="text-base">{building.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(building.status)}>
                          {building.status}
                        </Badge>
                      </div>
                      <CardDescription>{building.code} • {building.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Floors:</span>
                          <span className="font-medium">{building.floors}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Rooms:</span>
                          <span className="font-medium">{building.total_rooms}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium text-green-600">{building.available_rooms}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Occupancy:</span>
                            <span className="font-medium">{calculateOccupancyRate(building)}%</span>
                          </div>
                          <Progress value={calculateOccupancyRate(building)} />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {building.facilities.map((facility, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {facility === 'WiFi' && <Wifi className="h-3 w-3 mr-1" />}
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Directory</CardTitle>
                  <CardDescription>
                    {selectedBuilding ? `${selectedBuilding.name} - ` : 'All Buildings - '}
                    {filteredRooms.length} rooms
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="classroom">Classrooms</SelectItem>
                      <SelectItem value="lab">Labs</SelectItem>
                      <SelectItem value="lecture_hall">Lecture Halls</SelectItem>
                      <SelectItem value="auditorium">Auditoriums</SelectItem>
                      <SelectItem value="meeting_room">Meeting Rooms</SelectItem>
                      <SelectItem value="office">Offices</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Use</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.slice(0, 20).map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRoomTypeIcon(room.type)}
                          {room.name}
                        </div>
                      </TableCell>
                      <TableCell>{room.building_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {room.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.features.slice(0, 2).map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {room.features.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {room.current_class ? (
                          <div className="text-sm">
                            <p className="font-medium">{room.current_class.course_code}</p>
                            <p className="text-muted-foreground">{room.current_class.time_slot}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Schedule</CardTitle>
                <CardDescription>
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-9 gap-2 text-sm font-medium">
                    <div>Room</div>
                    {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'].map(time => (
                      <div key={time} className="text-center">{time}</div>
                    ))}
                  </div>
                  {filteredRooms.slice(0, 10).map(room => (
                    <div key={room.id} className="grid grid-cols-9 gap-2 text-sm">
                      <div className="font-medium">{room.name}</div>
                      {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'].map((time, i) => {
                        const isOccupied = Math.random() > 0.5
                        return (
                          <div
                            key={time}
                            className={`h-8 rounded flex items-center justify-center text-xs ${
                              isOccupied
                                ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200'
                                : 'bg-green-50 text-green-600 cursor-pointer hover:bg-green-100'
                            }`}
                          >
                            {isOccupied ? 'CS' + (100 + i * 50) : '-'}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}