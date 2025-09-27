"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  MapPin,
  Users,
  Laptop,
  Printer,
  Coffee,
  Wifi,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  BookMarked,
  FileText,
  Database,
  Globe,
  RefreshCw,
  Star,
  ChevronRight,
  Volume2
} from "lucide-react"

export default function LibraryPage() {
  // Current checkouts
  const checkouts = [
    {
      title: "Data Structures and Algorithms",
      author: "Cormen, Thomas H.",
      callNumber: "QA76.9.D35 C67",
      dueDate: "2025-01-08",
      daysLeft: 20,
      renewable: true,
      format: "Book"
    },
    {
      title: "Introduction to Machine Learning",
      author: "Mitchell, Tom",
      callNumber: "Q325.5 .M58",
      dueDate: "2025-01-15",
      daysLeft: 27,
      renewable: true,
      format: "Book"
    },
    {
      title: "Scientific American",
      author: "Various",
      issn: "0036-8733",
      dueDate: "2024-12-22",
      daysLeft: 3,
      renewable: false,
      format: "Magazine"
    }
  ]

  // Study room reservations
  const studyRooms = [
    {
      room: "Group Study Room 204",
      date: "2024-12-20",
      time: "2:00 PM - 4:00 PM",
      capacity: 6,
      building: "Main Library",
      status: "upcoming"
    },
    {
      room: "Silent Study Pod 3",
      date: "2024-12-19",
      time: "10:00 AM - 12:00 PM",
      capacity: 1,
      building: "Science Library",
      status: "today"
    }
  ]

  // Library locations
  const libraries = [
    {
      name: "Main Library",
      hours: "24/7 During Finals",
      regularHours: "7:00 AM - 12:00 AM",
      floors: 6,
      seats: 1200,
      computers: 150,
      features: ["24/7 Study Area", "Café", "Print Center", "Tech Hub"],
      currentOccupancy: 68
    },
    {
      name: "Science Library",
      hours: "8:00 AM - 10:00 PM",
      regularHours: "8:00 AM - 10:00 PM",
      floors: 3,
      seats: 450,
      computers: 80,
      features: ["Research Support", "3D Printing", "VR Lab"],
      currentOccupancy: 45
    },
    {
      name: "Law Library",
      hours: "7:00 AM - 11:00 PM",
      regularHours: "7:00 AM - 11:00 PM",
      floors: 4,
      seats: 380,
      computers: 60,
      features: ["Westlaw Access", "Private Study Rooms"],
      currentOccupancy: 72
    }
  ]

  // Database access
  const databases = [
    {
      name: "IEEE Xplore",
      category: "Engineering & Technology",
      description: "Full-text access to IEEE journals and conferences",
      access: "On-Campus + VPN"
    },
    {
      name: "JSTOR",
      category: "Multidisciplinary",
      description: "Academic journals, books, and primary sources",
      access: "SSO Login"
    },
    {
      name: "PubMed",
      category: "Medicine & Life Sciences",
      description: "Biomedical literature from MEDLINE",
      access: "Open Access"
    },
    {
      name: "Web of Science",
      category: "Citation Database",
      description: "Citation indexing and research analytics",
      access: "On-Campus + VPN"
    }
  ]

  // Research guides
  const researchGuides = [
    {
      title: "APA Citation Guide",
      category: "Citation",
      views: 15234,
      updated: "2024-12-01"
    },
    {
      title: "Finding Peer-Reviewed Articles",
      category: "Research",
      views: 8921,
      updated: "2024-11-15"
    },
    {
      title: "Thesis & Dissertation Formatting",
      category: "Writing",
      views: 5432,
      updated: "2024-12-10"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">University Library</h1>
            <p className="text-muted-foreground mt-1">Access resources, reserve study spaces, and manage checkouts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Research Databases
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search Catalog
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books, articles, databases..."
                  className="pl-9"
                />
              </div>
              <Button>Search</Button>
              <Button variant="outline">Advanced Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Checked Out</p>
                  <p className="text-2xl font-bold">{checkouts.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Due Soon</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Room Reservations</p>
                  <p className="text-2xl font-bold">{studyRooms.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved Items</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <BookMarked className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checkouts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checkouts">My Checkouts</TabsTrigger>
            <TabsTrigger value="locations">Locations & Hours</TabsTrigger>
            <TabsTrigger value="rooms">Study Rooms</TabsTrigger>
            <TabsTrigger value="databases">Databases</TabsTrigger>
            <TabsTrigger value="guides">Research Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="checkouts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Checkouts</CardTitle>
                    <CardDescription>Items you have checked out from the library</CardDescription>
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkouts.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.author}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {item.callNumber || item.issn}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.format}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                            {item.daysLeft <= 3 ? (
                              <Badge variant="destructive" className="text-xs">
                                Due in {item.daysLeft} days
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {item.daysLeft} days left
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {item.renewable ? (
                            <Button size="sm">Renew</Button>
                          ) : (
                            <Button size="sm" disabled>
                              Cannot Renew
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4">
              {libraries.map((library, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{library.name}</CardTitle>
                      <Badge variant="secondary">
                        {library.currentOccupancy}% Full
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Current Hours</p>
                            <p className="text-sm text-muted-foreground">{library.hours}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{library.floors} Floors</p>
                            <p className="text-sm text-muted-foreground">
                              {library.seats} seats • {library.computers} computers
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {library.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Progress value={library.currentOccupancy} className="h-2" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Live Occupancy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Study Room Reservations</CardTitle>
                    <CardDescription>Your upcoming study room bookings</CardDescription>
                  </div>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reserve Room
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studyRooms.map((reservation, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{reservation.room}</h4>
                            {reservation.status === "today" && (
                              <Badge variant="destructive">Today</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {reservation.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {reservation.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Capacity: {reservation.capacity}
                            </span>
                          </div>
                          <p className="text-sm">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {reservation.building}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">Modify</Button>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Study rooms can be reserved up to 2 weeks in advance for up to 4 hours per day.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="databases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Research Databases</CardTitle>
                <CardDescription>Access academic journals, articles, and research materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {databases.map((db, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{db.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {db.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{db.description}</p>
                          <p className="text-xs text-muted-foreground">Access: {db.access}</p>
                        </div>
                        <Button size="sm">
                          Access
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Research & Citation Guides</CardTitle>
                <CardDescription>Helpful guides for research and academic writing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {researchGuides.map((guide, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{guide.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {guide.category}
                            </Badge>
                            <span>{guide.views.toLocaleString()} views</span>
                            <span>Updated {guide.updated}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Guides
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Schedule Research Consultation
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