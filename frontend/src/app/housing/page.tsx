"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Home,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Wifi,
  Car,
  Shield,
  Coffee,
  Dumbbell,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  Phone,
  Mail,
  FileText,
  Download,
  ChevronRight,
  Info
} from "lucide-react"

export default function HousingPage() {
  // Current assignment
  const currentAssignment = {
    building: "Wilson Hall",
    room: "324B",
    type: "Double Occupancy",
    floor: "3rd Floor",
    wing: "East Wing",
    moveInDate: "2024-08-22",
    leaseEnd: "2025-05-15",
    monthlyRate: 875,
    status: "active"
  }

  // Roommate info
  const roommate = {
    name: "Alex Chen",
    major: "Computer Science",
    year: "Sophomore",
    email: "alex.chen@university.edu",
    phone: "(555) 123-4567",
    moveInDate: "2024-08-22"
  }

  // Available rooms for room change
  const availableRooms = [
    {
      building: "Harper Hall",
      room: "215A",
      type: "Single",
      monthlyRate: 1250,
      available: "2025-01-15",
      features: ["Private Bathroom", "AC", "Corner Room"]
    },
    {
      building: "Madison Tower",
      room: "812",
      type: "Studio",
      monthlyRate: 1450,
      available: "2025-02-01",
      features: ["Kitchenette", "City View", "24/7 Security"]
    },
    {
      building: "Oak Grove",
      room: "102",
      type: "Double",
      monthlyRate: 825,
      available: "Immediately",
      features: ["Ground Floor", "Garden View", "Large Windows"]
    }
  ]

  // Maintenance requests
  const maintenanceRequests = [
    {
      id: "MNT-2024-089",
      issue: "Heater not working properly",
      submitted: "2024-12-15",
      status: "in_progress",
      priority: "high",
      technician: "John Smith",
      estimatedCompletion: "2024-12-20"
    },
    {
      id: "MNT-2024-076",
      issue: "Loose door handle",
      submitted: "2024-12-01",
      status: "completed",
      priority: "low",
      completedDate: "2024-12-03"
    }
  ]

  // Housing charges
  const charges = [
    { month: "December 2024", amount: 875, status: "paid", paidDate: "2024-12-01" },
    { month: "January 2025", amount: 875, status: "due", dueDate: "2025-01-01" },
    { month: "February 2025", amount: 875, status: "upcoming", dueDate: "2025-02-01" }
  ]

  // Building amenities
  const amenities = [
    { icon: Wifi, name: "High-Speed WiFi", description: "Gigabit internet in all rooms" },
    { icon: Shield, name: "24/7 Security", description: "Card access and security desk" },
    { icon: Coffee, name: "Common Kitchen", description: "Shared kitchen on each floor" },
    { icon: BookOpen, name: "Study Rooms", description: "Quiet study spaces available" },
    { icon: Dumbbell, name: "Fitness Center", description: "On-site gym facilities" },
    { icon: Car, name: "Parking", description: "Resident parking permits available" }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Housing</h1>
            <p className="text-muted-foreground mt-1">Manage your campus housing and residence life</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Housing Agreement
            </Button>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Request Room Change
            </Button>
          </div>
        </div>

        {/* Current Assignment Alert */}
        {currentAssignment.status === "active" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently assigned to <strong>{currentAssignment.building} Room {currentAssignment.room}</strong>.
              Your lease runs through {new Date(currentAssignment.leaseEnd).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Housing Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Current Housing Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Building</p>
                  <p className="font-medium">{currentAssignment.building}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{currentAssignment.room}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">{currentAssignment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rate</p>
                  <p className="font-medium">${currentAssignment.monthlyRate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor/Wing</p>
                  <p className="font-medium">{currentAssignment.floor}, {currentAssignment.wing}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lease Period</p>
                  <p className="font-medium">
                    {new Date(currentAssignment.moveInDate).toLocaleDateString()} - {new Date(currentAssignment.leaseEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Building Amenities
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <amenity.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{amenity.name}</p>
                        <p className="text-xs text-muted-foreground">{amenity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roommate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{roommate.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Major / Year</p>
                <p className="font-medium">{roommate.major} / {roommate.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium text-sm">{roommate.email}</p>
                <p className="font-medium text-sm">{roommate.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Move-in Date</p>
                <p className="font-medium">{new Date(roommate.moveInDate).toLocaleDateString()}</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Message Roommate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Housing Payments</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="available">Available Rooms</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Housing Charges</CardTitle>
                <CardDescription>Your monthly housing payments and balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {charges.map((charge, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{charge.month}</p>
                          {charge.status === "paid" && (
                            <p className="text-sm text-muted-foreground">Paid on {charge.paidDate}</p>
                          )}
                          {charge.status === "due" && (
                            <p className="text-sm text-muted-foreground">Due {charge.dueDate}</p>
                          )}
                          {charge.status === "upcoming" && (
                            <p className="text-sm text-muted-foreground">Due {charge.dueDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${charge.amount}</span>
                        <Badge variant={
                          charge.status === "paid" ? "secondary" :
                          charge.status === "due" ? "destructive" :
                          "outline"
                        }>
                          {charge.status}
                        </Badge>
                        {charge.status === "due" && (
                          <Button size="sm">Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="text-xl font-bold">$875.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>Track your maintenance and repair requests</CardDescription>
                  </div>
                  <Button>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{request.issue}</p>
                            <Badge variant={
                              request.priority === "high" ? "destructive" :
                              request.priority === "medium" ? "default" :
                              "secondary"
                            } className="text-xs">
                              {request.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Request #{request.id} • Submitted {request.submitted}
                          </p>
                          {request.status === "in_progress" && (
                            <p className="text-sm">
                              Assigned to: {request.technician} • Est. completion: {request.estimatedCompletion}
                            </p>
                          )}
                          {request.status === "completed" && (
                            <p className="text-sm text-green-600">
                              Completed on {request.completedDate}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          request.status === "completed" ? "secondary" :
                          request.status === "in_progress" ? "default" :
                          "outline"
                        }>
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription>Browse available rooms for room change requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableRooms.map((room, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">{room.building} - Room {room.room}</h4>
                            <p className="text-sm text-muted-foreground">{room.type}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {room.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm">
                            Available: <span className="font-medium">{room.available}</span>
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-xl font-bold">${room.monthlyRate}/mo</p>
                          <Button size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Housing Policies & Guidelines</CardTitle>
                <CardDescription>Important information about campus housing rules and regulations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Guest Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Overnight guests are permitted for up to 3 consecutive nights with roommate consent.
                      All guests must be registered at the front desk.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Quiet Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Sunday-Thursday: 10:00 PM - 8:00 AM<br />
                      Friday-Saturday: 12:00 AM - 10:00 AM<br />
                      24-hour quiet hours during finals week.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Room Inspections</h4>
                    <p className="text-sm text-muted-foreground">
                      Health and safety inspections are conducted once per semester with 48-hour notice.
                      Maintenance staff may enter for emergency repairs.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Move-Out Procedures</h4>
                    <p className="text-sm text-muted-foreground">
                      Rooms must be vacated within 24 hours of last final exam.
                      Check-out inspection required. Improper check-out results in $50 fee.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Handbook
                  </Button>
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-2" />
                    Contact Housing Office
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}