"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  CreditCard,
  FileText,
  Download,
  Navigation,
  ParkingCircle,
  AlertCircle,
  Timer,
  Receipt,
  ChevronRight,
  QrCode,
  Bike,
  Bus,
  Shield
} from "lucide-react"

export default function ParkingPage() {
  // Current permits
  const activePermits = [
    {
      type: "Student Commuter",
      permitNumber: "SC-2024-8934",
      vehicle: "2019 Honda Civic",
      licensePlate: "ABC 1234",
      zone: "Zone C - North Campus",
      validFrom: "2024-08-15",
      validTo: "2025-05-15",
      status: "active",
      annualCost: 450
    }
  ]

  // Registered vehicles
  const vehicles = [
    {
      make: "Honda",
      model: "Civic",
      year: "2019",
      color: "Silver",
      licensePlate: "ABC 1234",
      state: "CA",
      isPrimary: true,
      permitAssigned: true
    },
    {
      make: "Toyota",
      model: "Camry",
      year: "2017",
      color: "Blue",
      licensePlate: "XYZ 5678",
      state: "CA",
      isPrimary: false,
      permitAssigned: false
    }
  ]

  // Available parking zones
  const parkingZones = [
    {
      zone: "Zone A",
      name: "Faculty/Staff Reserved",
      availability: "Not Eligible",
      spots: 450,
      currentOccupancy: 78,
      annualCost: 850,
      eligible: false
    },
    {
      zone: "Zone B",
      name: "Resident Student",
      availability: "Limited",
      spots: 800,
      currentOccupancy: 95,
      annualCost: 650,
      eligible: true
    },
    {
      zone: "Zone C",
      name: "Commuter Student",
      availability: "Available",
      spots: 1200,
      currentOccupancy: 72,
      annualCost: 450,
      eligible: true
    },
    {
      zone: "Zone D",
      name: "Evening/Weekend",
      availability: "Open",
      spots: 600,
      currentOccupancy: 15,
      annualCost: 225,
      eligible: true
    }
  ]

  // Parking violations
  const violations = [
    {
      id: "V-2024-0892",
      date: "2024-11-15",
      location: "Lot B3",
      violation: "No Valid Permit Displayed",
      fine: 35,
      status: "paid",
      paidDate: "2024-11-20"
    },
    {
      id: "V-2024-0654",
      date: "2024-10-02",
      location: "Faculty Lot A",
      violation: "Parking in Reserved Space",
      fine: 50,
      status: "paid",
      paidDate: "2024-10-05"
    }
  ]

  // Parking lots status
  const parkingLots = [
    {
      name: "North Campus Garage",
      zone: "Zone C",
      totalSpots: 450,
      availableSpots: 127,
      distance: "0.2 mi",
      walkTime: "3 min",
      status: "open"
    },
    {
      name: "Student Center Lot",
      zone: "Zone C",
      totalSpots: 320,
      availableSpots: 45,
      distance: "0.3 mi",
      walkTime: "5 min",
      status: "open"
    },
    {
      name: "Athletic Complex Lot",
      zone: "Zone C",
      totalSpots: 280,
      availableSpots: 189,
      distance: "0.5 mi",
      walkTime: "8 min",
      status: "open"
    },
    {
      name: "Library West Garage",
      zone: "Zone B",
      totalSpots: 380,
      availableSpots: 12,
      distance: "0.4 mi",
      walkTime: "6 min",
      status: "restricted"
    }
  ]

  // Alternative transportation
  const transportation = [
    {
      type: "Campus Shuttle",
      icon: Bus,
      frequency: "Every 15 minutes",
      hours: "7:00 AM - 11:00 PM",
      cost: "Free with Student ID"
    },
    {
      type: "Bike Share",
      icon: Bike,
      availability: "24/7",
      locations: "12 stations campus-wide",
      cost: "$25/semester"
    },
    {
      type: "Carpool Program",
      icon: Car,
      benefit: "Priority parking spots",
      registration: "Required",
      cost: "Free to join"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parking & Transportation</h1>
            <p className="text-muted-foreground mt-1">Manage permits, view parking availability, and transportation options</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Digital Permit
            </Button>
            <Button>
              <Car className="h-4 w-4 mr-2" />
              Buy Permit
            </Button>
          </div>
        </div>

        {/* Active Permit Alert */}
        {activePermits.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your {activePermits[0].type} permit is active through {new Date(activePermits[0].validTo).toLocaleDateString()}.
              Remember to display your permit or use the mobile app when parking on campus.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Permits and Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ParkingCircle className="h-5 w-5" />
                Active Parking Permits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activePermits.map((permit, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{permit.type}</h3>
                      <p className="text-sm text-muted-foreground">Permit #{permit.permitNumber}</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{permit.vehicle}</p>
                      <p className="text-sm">{permit.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parking Zone</p>
                      <p className="font-medium">{permit.zone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Period</p>
                      <p className="text-sm">
                        {new Date(permit.validFrom).toLocaleDateString()} - {new Date(permit.validTo).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Cost</p>
                      <p className="font-medium">${permit.annualCost}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Permit
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Interactive Parking Map
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Timer className="h-4 w-4 mr-2" />
                Real-time Availability
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bus className="h-4 w-4 mr-2" />
                Shuttle Schedule
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                Payment History
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Appeal Citation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="availability" className="space-y-4">
          <TabsList>
            <TabsTrigger value="availability">Parking Availability</TabsTrigger>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="zones">Parking Zones</TabsTrigger>
            <TabsTrigger value="transport">Alternative Transport</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Parking Availability</CardTitle>
                <CardDescription>Current availability in your permitted zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parkingLots.map((lot, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{lot.name}</h4>
                            <Badge variant={lot.status === "open" ? "secondary" : "outline"}>
                              {lot.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{lot.zone}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lot.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lot.walkTime} walk
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Available Spots</span>
                              <span className="font-medium">
                                {lot.availableSpots} / {lot.totalSpots}
                              </span>
                            </div>
                            <Progress
                              value={((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Navigate
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Vehicles</CardTitle>
                    <CardDescription>Manage your registered vehicles and permits</CardDescription>
                  </div>
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicles.map((vehicle, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h4>
                            {vehicle.isPrimary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                            {vehicle.permitAssigned && (
                              <Badge>Permit Active</Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Color: {vehicle.color}</span>
                            <span>Plate: {vehicle.licensePlate} ({vehicle.state})</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!vehicle.permitAssigned && (
                            <Button size="sm">Assign Permit</Button>
                          )}
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parking Violations</CardTitle>
                <CardDescription>Your parking citation history and payments</CardDescription>
              </CardHeader>
              <CardContent>
                {violations.length > 0 ? (
                  <div className="space-y-3">
                    {violations.map((violation) => (
                      <div key={violation.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{violation.violation}</p>
                              <Badge variant={violation.status === "paid" ? "secondary" : "destructive"}>
                                {violation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Citation #{violation.id} • {violation.date} • {violation.location}
                            </p>
                            {violation.status === "paid" && (
                              <p className="text-sm text-green-600">
                                Paid on {violation.paidDate}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">${violation.fine}</p>
                            {violation.status !== "paid" && (
                              <Button size="sm" className="mt-1">Pay Now</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No outstanding violations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campus Parking Zones</CardTitle>
                <CardDescription>Available parking zones and eligibility requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parkingZones.map((zone, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{zone.zone} - {zone.name}</h4>
                            {!zone.eligible && (
                              <Badge variant="outline">Not Eligible</Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Total Spots: <span className="font-medium text-foreground">{zone.spots}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Occupancy: <span className="font-medium text-foreground">{zone.currentOccupancy}%</span>
                            </span>
                            <span className="text-muted-foreground">
                              Annual Cost: <span className="font-medium text-foreground">${zone.annualCost}</span>
                            </span>
                          </div>
                          <Progress value={zone.currentOccupancy} className="h-2" />
                        </div>
                        {zone.eligible && (
                          <Button size="sm" variant="outline">
                            Apply for Permit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Zone eligibility is based on your student status, residency, and class standing.
                    Priority is given to faculty, staff, and students with documented needs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alternative Transportation Options</CardTitle>
                <CardDescription>Sustainable and convenient ways to get around campus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {transportation.map((option, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <option.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold">{option.type}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {option.frequency && <p>Frequency: {option.frequency}</p>}
                            {option.hours && <p>Hours: {option.hours}</p>}
                            {option.availability && <p>Availability: {option.availability}</p>}
                            {option.locations && <p>Locations: {option.locations}</p>}
                            {option.benefit && <p>Benefit: {option.benefit}</p>}
                            {option.registration && <p>Registration: {option.registration}</p>}
                            <p className="font-medium text-foreground">Cost: {option.cost}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Learn More
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