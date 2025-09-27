'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building, Wrench, Calendar, AlertCircle, Activity,
  MapPin, Car, Package, Shield, AlertTriangle,
  Clock, CheckCircle, XCircle, Thermometer, Zap,
  Droplets, Users, DollarSign, BarChart3, Settings
} from 'lucide-react'

export default function OperationsDashboardPage() {
  const facilities = {
    totalBuildings: 47,
    totalSqFt: 3200000,
    classrooms: 285,
    labs: 92,
    offices: 520,
    parkingSpaces: 8500,
    occupancy: 82
  }

  const workOrders = [
    {
      id: 'WO-2024-1234',
      type: 'HVAC',
      location: 'Science Building - Room 301',
      priority: 'high',
      status: 'in-progress',
      created: '2024-12-25',
      assigned: 'John Smith',
      description: 'AC unit not cooling'
    },
    {
      id: 'WO-2024-1235',
      type: 'Electrical',
      location: 'Library - 2nd Floor',
      priority: 'medium',
      status: 'pending',
      created: '2024-12-26',
      assigned: 'Mike Johnson',
      description: 'Flickering lights in study area'
    },
    {
      id: 'WO-2024-1236',
      type: 'Plumbing',
      location: 'Student Center - Restroom',
      priority: 'high',
      status: 'pending',
      created: '2024-12-26',
      assigned: 'Not assigned',
      description: 'Leak in mens restroom'
    },
    {
      id: 'WO-2024-1237',
      type: 'Custodial',
      location: 'Engineering Hall - Lobby',
      priority: 'low',
      status: 'completed',
      created: '2024-12-24',
      assigned: 'Cleaning Crew A',
      description: 'Deep clean after event'
    },
    {
      id: 'WO-2024-1238',
      type: 'Safety',
      location: 'Parking Lot C',
      priority: 'critical',
      status: 'in-progress',
      created: '2024-12-26',
      assigned: 'Security Team',
      description: 'Broken light pole - safety hazard'
    }
  ]

  const buildings = [
    {
      name: 'Science Building',
      code: 'SCI',
      sqft: 125000,
      floors: 5,
      occupancy: 450,
      condition: 'good',
      energyRating: 'B',
      lastInspection: '2024-11-15'
    },
    {
      name: 'Engineering Hall',
      code: 'ENG',
      sqft: 98000,
      floors: 4,
      occupancy: 380,
      condition: 'excellent',
      energyRating: 'A',
      lastInspection: '2024-10-20'
    },
    {
      name: 'Student Center',
      code: 'STU',
      sqft: 87000,
      floors: 3,
      occupancy: 1200,
      condition: 'fair',
      energyRating: 'C',
      lastInspection: '2024-09-10'
    },
    {
      name: 'Library',
      code: 'LIB',
      sqft: 145000,
      floors: 6,
      occupancy: 800,
      condition: 'good',
      energyRating: 'B',
      lastInspection: '2024-12-01'
    }
  ]

  const campusServices = {
    dining: {
      locations: 12,
      dailyMeals: 15000,
      satisfaction: 4.2
    },
    transportation: {
      buses: 18,
      routes: 6,
      dailyRiders: 8500
    },
    parking: {
      totalSpaces: 8500,
      occupied: 6800,
      permits: 9200
    },
    mail: {
      packagesDaily: 450,
      lettersDaily: 1200,
      pendingPickup: 87
    }
  }

  const utilities = {
    electricity: {
      usage: 2450,
      unit: 'MWh',
      cost: 245000,
      trend: 'up',
      change: '+5%'
    },
    water: {
      usage: 12.5,
      unit: 'MGal',
      cost: 42000,
      trend: 'down',
      change: '-3%'
    },
    gas: {
      usage: 850,
      unit: 'MCF',
      cost: 28000,
      trend: 'stable',
      change: '0%'
    }
  }

  const events = [
    {
      name: 'Winter Graduation Ceremony',
      date: '2024-12-28',
      location: 'Arena',
      attendees: 5000,
      status: 'setup',
      coordinator: 'Events Team'
    },
    {
      name: 'Basketball Game',
      date: '2024-12-29',
      location: 'Sports Complex',
      attendees: 8000,
      status: 'planning',
      coordinator: 'Athletics'
    },
    {
      name: 'New Student Orientation',
      date: '2025-01-15',
      location: 'Multiple',
      attendees: 1200,
      status: 'planning',
      coordinator: 'Student Affairs'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Operations Dashboard' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" />
              Campus Operations
            </h1>
            <p className="text-muted-foreground">
              Facilities, maintenance, and campus services management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Wrench className="h-4 w-4 mr-2" />
              New Work Order
            </Button>
          </div>
        </div>

        {/* Critical Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Safety Issue:</strong> Broken light pole in Parking Lot C creating safety hazard.
            Security team on site. Estimated repair: 4 hours.
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Buildings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilities.totalBuildings}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Square Feet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(facilities.totalSqFt / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Total area</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilities.occupancy}%</div>
              <p className="text-xs text-muted-foreground">Current</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {workOrders.filter(w => w.status !== 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Parking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((campusServices.parking.occupied / campusServices.parking.totalSpaces) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Occupied</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daily Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(campusServices.dining.dailyMeals / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Served</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bus Riders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(campusServices.transportation.dailyRiders / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground">Daily</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Energy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">B</div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workorders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workorders">
              Work Orders
              <Badge className="ml-2" variant="secondary">
                {workOrders.filter(w => w.status !== 'completed').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
            <TabsTrigger value="services">Campus Services</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="workorders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Work Orders</CardTitle>
                    <CardDescription>
                      Maintenance and repair requests
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    View All Orders
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="font-medium">{order.location}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.description}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.assigned}</TableCell>
                        <TableCell>{order.created}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buildings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Building Inventory</CardTitle>
                <CardDescription>
                  Campus facilities overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Building</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Floors</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Energy</TableHead>
                      <TableHead>Last Inspection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildings.map((building, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{building.name}</TableCell>
                        <TableCell>{building.code}</TableCell>
                        <TableCell>{(building.sqft / 1000).toFixed(0)}K sq ft</TableCell>
                        <TableCell>{building.floors}</TableCell>
                        <TableCell>{building.occupancy}</TableCell>
                        <TableCell>
                          <Badge className={getConditionColor(building.condition)}>
                            {building.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{building.energyRating}</Badge>
                        </TableCell>
                        <TableCell>{building.lastInspection}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utility Usage & Costs</CardTitle>
                <CardDescription>
                  Monthly consumption and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Electricity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold">
                        {utilities.electricity.usage} {utilities.electricity.unit}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${(utilities.electricity.cost / 1000).toFixed(0)}K this month
                      </p>
                      <Badge className={utilities.electricity.trend === 'up' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {utilities.electricity.change} from last month
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        Water
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold">
                        {utilities.water.usage} {utilities.water.unit}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${(utilities.water.cost / 1000).toFixed(0)}K this month
                      </p>
                      <Badge className="bg-green-100 text-green-800">
                        {utilities.water.change} from last month
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Thermometer className="h-5 w-5 text-orange-600" />
                        Natural Gas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold">
                        {utilities.gas.usage} {utilities.gas.unit}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${(utilities.gas.cost / 1000).toFixed(0)}K this month
                      </p>
                      <Badge>
                        {utilities.gas.change} from last month
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dining Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Locations</span>
                    <span className="font-medium">{campusServices.dining.locations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Meals Served</span>
                    <span className="font-medium">{campusServices.dining.dailyMeals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfaction Rating</span>
                    <span className="font-medium">{campusServices.dining.satisfaction}/5.0</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transportation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Buses</span>
                    <span className="font-medium">{campusServices.transportation.buses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Routes</span>
                    <span className="font-medium">{campusServices.transportation.routes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Riders</span>
                    <span className="font-medium">{campusServices.transportation.dailyRiders.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parking Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Spaces</span>
                    <span className="font-medium">{campusServices.parking.totalSpaces.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently Occupied</span>
                    <span className="font-medium">{campusServices.parking.occupied.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Permits</span>
                    <span className="font-medium">{campusServices.parking.permits.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={(campusServices.parking.occupied / campusServices.parking.totalSpaces) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mail Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Packages Daily</span>
                    <span className="font-medium">{campusServices.mail.packagesDaily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Letters Daily</span>
                    <span className="font-medium">{campusServices.mail.lettersDaily.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Pickup</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {campusServices.mail.pendingPickup}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Major campus events requiring operational support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-semibold">{event.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.toLocaleString()} expected
                          </span>
                        </div>
                        <p className="text-sm">Coordinator: {event.coordinator}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{event.status}</Badge>
                        <Button size="sm" variant="outline">
                          Setup Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}