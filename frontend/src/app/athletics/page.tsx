"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Activity,
  Dumbbell,
  Timer,
  Target,
  TrendingUp,
  Award,
  Ticket,
  Heart,
  AlertCircle,
  CheckCircle,
  Star,
  ChevronRight,
  Play,
  Zap,
  Medal,
  Flag
} from "lucide-react"

export default function AthleticsPage() {
  // Student athlete status
  const athleteProfile = {
    isAthlete: true,
    sport: "Track & Field",
    position: "Sprinter",
    eligibilityStatus: "eligible",
    gpa: 3.4,
    remainingEligibility: "3 years"
  }

  // Intramural registrations
  const intramurals = [
    {
      sport: "Basketball",
      league: "Co-Rec B League",
      team: "Court Kings",
      role: "Team Captain",
      schedule: "Tuesdays 7-9 PM",
      nextGame: "2024-12-21",
      opponent: "Hoop Dreams",
      record: "3-1"
    },
    {
      sport: "Volleyball",
      league: "Open A League",
      team: "Net Ninjas",
      role: "Player",
      schedule: "Thursdays 6-8 PM",
      nextGame: "2024-12-22",
      opponent: "Spike Force",
      record: "2-2"
    }
  ]

  // Recreation center memberships
  const memberships = {
    type: "Student All-Access",
    status: "active",
    validUntil: "2025-05-15",
    facilities: ["Main Rec Center", "Aquatic Center", "Tennis Courts", "Track"],
    guestPasses: 3
  }

  // Fitness classes
  const fitnessClasses = [
    {
      name: "Morning Yoga",
      instructor: "Sarah Chen",
      date: "2024-12-20",
      time: "7:00 AM - 8:00 AM",
      location: "Studio A",
      spots: "12/20",
      registered: true,
      difficulty: "All Levels"
    },
    {
      name: "HIIT Cardio",
      instructor: "Mike Johnson",
      date: "2024-12-21",
      time: "5:30 PM - 6:30 PM",
      location: "Studio B",
      spots: "18/25",
      registered: false,
      difficulty: "Intermediate"
    },
    {
      name: "Spin Class",
      instructor: "Lisa Martinez",
      date: "2024-12-22",
      time: "6:00 AM - 6:45 AM",
      location: "Cycling Studio",
      spots: "Full",
      registered: false,
      difficulty: "Advanced"
    }
  ]

  // Upcoming games
  const upcomingGames = [
    {
      sport: "Basketball",
      homeTeam: "University Eagles",
      awayTeam: "State University Lions",
      date: "2024-12-23",
      time: "7:00 PM",
      location: "University Arena",
      ticketStatus: "available",
      studentPrice: "Free with ID"
    },
    {
      sport: "Hockey",
      homeTeam: "University Eagles",
      awayTeam: "Northern College Bears",
      date: "2024-12-28",
      time: "6:00 PM",
      location: "Ice Arena",
      ticketStatus: "limited",
      studentPrice: "$5"
    },
    {
      sport: "Swimming",
      event: "Winter Invitational",
      date: "2025-01-06",
      time: "All Day",
      location: "Aquatic Center",
      ticketStatus: "available",
      studentPrice: "Free"
    }
  ]

  // Facility hours
  const facilities = [
    {
      name: "Main Recreation Center",
      currentStatus: "open",
      todayHours: "6:00 AM - 11:00 PM",
      occupancy: 65,
      amenities: ["Weight Room", "Cardio Floor", "Basketball Courts", "Indoor Track"]
    },
    {
      name: "Aquatic Center",
      currentStatus: "open",
      todayHours: "6:00 AM - 9:00 PM",
      occupancy: 40,
      amenities: ["50m Pool", "Diving Well", "Hot Tub", "Sauna"]
    },
    {
      name: "Outdoor Fields",
      currentStatus: "closed",
      todayHours: "Closed - Weather",
      occupancy: 0,
      amenities: ["Soccer Fields", "Softball Diamonds", "Sand Volleyball"]
    }
  ]

  // Personal records
  const personalRecords = [
    {
      exercise: "Bench Press",
      record: "185 lbs",
      date: "2024-11-15",
      improvement: "+15 lbs"
    },
    {
      exercise: "5K Run",
      record: "22:45",
      date: "2024-12-01",
      improvement: "-1:20"
    },
    {
      exercise: "Deadlift",
      record: "275 lbs",
      date: "2024-12-10",
      improvement: "+25 lbs"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Athletics & Recreation</h1>
            <p className="text-muted-foreground mt-1">Sports, fitness, and recreational activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Ticket className="h-4 w-4 mr-2" />
              Buy Tickets
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book Facility
            </Button>
          </div>
        </div>

        {/* Athlete Status Alert */}
        {athleteProfile.isAthlete && (
          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              You are registered as a student-athlete in <strong>{athleteProfile.sport}</strong>.
              Current GPA: {athleteProfile.gpa} • Eligibility: {athleteProfile.eligibilityStatus} • {athleteProfile.remainingEligibility} remaining
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Intramural Teams</p>
                  <p className="text-2xl font-bold">{intramurals.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes This Week</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Guest Passes</p>
                  <p className="text-2xl font-bold">{memberships.guestPasses}</p>
                </div>
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rec Center</p>
                  <p className="text-2xl font-bold">65%</p>
                </div>
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="facilities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="intramurals">Intramurals</TabsTrigger>
            <TabsTrigger value="fitness">Fitness Classes</TabsTrigger>
            <TabsTrigger value="varsity">Varsity Sports</TabsTrigger>
            <TabsTrigger value="personal">My Fitness</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recreation Facilities</CardTitle>
                <CardDescription>Current status and occupancy of campus facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facilities.map((facility, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{facility.name}</h4>
                            <Badge variant={facility.currentStatus === "open" ? "secondary" : "outline"}>
                              {facility.currentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {facility.todayHours}
                          </p>
                          {facility.currentStatus === "open" && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Current Occupancy</span>
                                <span className="font-medium">{facility.occupancy}%</span>
                              </div>
                              <Progress value={facility.occupancy} className="h-2" />
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {facility.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Status</CardTitle>
                <CardDescription>Your recreation center access and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Membership Type</span>
                    <span className="font-medium">{memberships.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="secondary">{memberships.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valid Until</span>
                    <span className="font-medium">{memberships.validUntil}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Guest Passes Available</span>
                    <span className="font-medium">{memberships.guestPasses}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Included Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {memberships.facilities.map((facility) => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intramurals" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Intramural Teams</CardTitle>
                    <CardDescription>Your current intramural registrations</CardDescription>
                  </div>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Join League
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {intramurals.map((team, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{team.sport} - {team.league}</h4>
                            {team.role === "Team Captain" && (
                              <Badge variant="default">Captain</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">Team: {team.team}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{team.schedule}</span>
                            <span>Record: {team.record}</span>
                          </div>
                          <div className="p-2 bg-muted rounded text-sm">
                            <p className="font-medium">Next Game:</p>
                            <p>{team.nextGame} vs {team.opponent}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">View Schedule</Button>
                          <Button size="sm" variant="outline">Team Roster</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fitness" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Group Fitness Classes</CardTitle>
                    <CardDescription>Register for upcoming fitness classes</CardDescription>
                  </div>
                  <Button variant="outline">
                    View Full Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fitnessClasses.map((cls, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{cls.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {cls.difficulty}
                            </Badge>
                            {cls.registered && (
                              <Badge variant="secondary">Registered</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Instructor: {cls.instructor}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {cls.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {cls.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cls.location}
                            </span>
                          </div>
                          <p className="text-sm">
                            <Users className="h-3 w-3 inline mr-1" />
                            Spots: {cls.spots}
                          </p>
                        </div>
                        {!cls.registered && cls.spots !== "Full" && (
                          <Button size="sm">Register</Button>
                        )}
                        {cls.registered && (
                          <Button size="sm" variant="outline">Cancel</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="varsity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Varsity Games</CardTitle>
                <CardDescription>Support your university teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingGames.map((game, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {game.sport} {game.event ? `- ${game.event}` : ''}
                            </h4>
                            <Badge variant={
                              game.ticketStatus === "available" ? "secondary" :
                              game.ticketStatus === "limited" ? "destructive" :
                              "outline"
                            }>
                              {game.ticketStatus === "limited" ? "Limited Tickets" : game.ticketStatus}
                            </Badge>
                          </div>
                          {game.homeTeam && (
                            <p className="text-sm font-medium">
                              {game.homeTeam} vs {game.awayTeam}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {game.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {game.time}
                            </span>
                          </div>
                          <p className="text-sm">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {game.location}
                          </p>
                          <p className="text-sm font-medium">
                            Student Price: {game.studentPrice}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm">Get Tickets</Button>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Stream Live
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Fitness Tracking</CardTitle>
                <CardDescription>Your fitness goals and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Recent Personal Records</h4>
                  <div className="space-y-2">
                    {personalRecords.map((pr, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Medal className="h-4 w-4 text-yellow-500" />
                          <div>
                            <p className="font-medium text-sm">{pr.exercise}</p>
                            <p className="text-xs text-muted-foreground">Set on {pr.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{pr.record}</p>
                          <p className="text-xs text-green-600">{pr.improvement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Fitness Goals</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Weekly Gym Visits</span>
                        <span className="text-sm font-medium">3/4</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Monthly Running Distance</span>
                        <span className="text-sm font-medium">18/30 miles</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Fitness Classes Attended</span>
                        <span className="text-sm font-medium">5/8</span>
                      </div>
                      <Progress value={62.5} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Update Goals
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
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