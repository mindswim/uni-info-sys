"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Gift,
  Award,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Heart,
  TrendingUp,
  Building,
  Trophy,
  BookOpen,
  MessageSquare,
  Video,
  ChevronRight,
  Star,
  CheckCircle,
  DollarSign,
  Newspaper
} from "lucide-react"

export default function AlumniPage() {
  // Alumni profile
  const alumniProfile = {
    name: "Maria Rodriguez",
    classYear: "2024",
    degree: "B.S. Computer Science",
    currentRole: "Software Engineer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    memberSince: "2024-05-15",
    lifetimeMember: false,
    donorStatus: "annual",
    totalGiving: 500,
    volunteerHours: 12
  }

  // Upcoming events
  const alumniEvents = [
    {
      title: "Class of 2024 Reunion",
      date: "2025-05-15",
      time: "6:00 PM - 10:00 PM",
      location: "Campus Alumni Center",
      type: "reunion",
      attendees: 234,
      registered: true,
      cost: "Free"
    },
    {
      title: "Alumni Networking Night - San Francisco",
      date: "2025-01-20",
      time: "6:30 PM - 8:30 PM",
      location: "SF Tech Hub",
      type: "networking",
      attendees: 89,
      registered: false,
      cost: "$25"
    },
    {
      title: "Virtual Career Panel: AI & Machine Learning",
      date: "2024-12-28",
      time: "2:00 PM - 3:30 PM",
      location: "Online",
      type: "webinar",
      attendees: 156,
      registered: true,
      cost: "Free"
    }
  ]

  // Mentorship program
  const mentorshipProgram = {
    role: "mentor",
    mentees: [
      {
        name: "Alex Chen",
        year: "Junior",
        major: "Computer Science",
        meetingFrequency: "Bi-weekly",
        nextMeeting: "2024-12-22"
      }
    ],
    totalMentees: 2,
    hoursContributed: 18
  }

  // Giving history
  const givingHistory = [
    {
      date: "2024-11-01",
      amount: 100,
      designation: "Computer Science Department",
      campaign: "Annual Fund",
      status: "processed"
    },
    {
      date: "2024-09-15",
      amount: 250,
      designation: "Student Emergency Fund",
      campaign: "Special Appeal",
      status: "processed"
    },
    {
      date: "2024-06-01",
      amount: 150,
      designation: "Library Resources",
      campaign: "Graduation Gift",
      status: "processed"
    }
  ]

  // Benefits
  const benefits = [
    {
      title: "Library Access",
      description: "Full access to digital resources and on-campus libraries",
      status: "active",
      icon: BookOpen
    },
    {
      title: "Career Services",
      description: "Lifetime career counseling and job board access",
      status: "active",
      icon: Briefcase
    },
    {
      title: "Recreation Center",
      description: "Discounted membership to campus facilities",
      status: "available",
      icon: Trophy
    },
    {
      title: "Alumni Email",
      description: "Keep your .edu email address",
      status: "active",
      icon: Mail
    }
  ]

  // Alumni news
  const alumniNews = [
    {
      title: "Record Breaking Fundraising Year",
      date: "2024-12-15",
      category: "University News",
      excerpt: "Alumni giving reaches $50 million milestone"
    },
    {
      title: "New Alumni Center Opens Spring 2025",
      date: "2024-12-10",
      category: "Campus Updates",
      excerpt: "State-of-the-art facility to serve 100,000+ alumni"
    },
    {
      title: "Distinguished Alumni Awards 2024",
      date: "2024-12-01",
      category: "Recognition",
      excerpt: "Celebrating excellence in various fields"
    }
  ]

  // Volunteer opportunities
  const volunteerOpportunities = [
    {
      title: "Student Mock Interview Program",
      commitment: "2-4 hours/month",
      period: "Spring 2025",
      description: "Help students practice interview skills",
      spots: "15/20"
    },
    {
      title: "Alumni Admissions Ambassador",
      commitment: "5-10 hours/year",
      period: "Ongoing",
      description: "Represent the university at college fairs",
      spots: "48/50"
    },
    {
      title: "Class Reunion Committee",
      commitment: "10 hours total",
      period: "January - May 2025",
      description: "Help plan your class reunion events",
      spots: "8/10"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alumni Relations</h1>
            <p className="text-muted-foreground mt-1">Stay connected with your university community</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Make a Gift
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </div>

        {/* Alumni Profile Card */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{alumniProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">Class of {alumniProfile.classYear} • {alumniProfile.degree}</p>
                  </div>
                  <Badge variant="secondary">
                    {alumniProfile.donorStatus === "annual" ? "Annual Donor" : "Member"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Position</p>
                    <p className="font-medium">{alumniProfile.currentRole}</p>
                    <p className="text-xs">{alumniProfile.company}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{alumniProfile.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">{new Date(alumniProfile.memberSince).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volunteer Hours</p>
                    <p className="font-medium">{alumniProfile.volunteerHours} this year</p>
                  </div>
                </div>
              </div>
              <div className="border-l pl-4">
                <h4 className="font-medium mb-3">Lifetime Giving</h4>
                <p className="text-2xl font-bold mb-2">${alumniProfile.totalGiving}</p>
                <Button className="w-full mb-2" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Support Students
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Become Lifetime Member
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="giving">Giving</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Alumni Events</CardTitle>
                    <CardDescription>Reunions, networking, and educational programs</CardDescription>
                  </div>
                  <Button variant="outline">
                    View All Events
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alumniEvents.map((event, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {event.registered && (
                              <Badge variant="secondary">Registered</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                          </div>
                          <p className="text-sm">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {event.location}
                          </p>
                          <div className="flex items-center gap-3 text-sm">
                            <span>
                              <Users className="h-3 w-3 inline mr-1" />
                              {event.attendees} attending
                            </span>
                            <span className="font-medium">{event.cost}</span>
                          </div>
                        </div>
                        {!event.registered && (
                          <Button size="sm">Register</Button>
                        )}
                        {event.registered && event.location === "Online" && (
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alumni Mentorship Program</CardTitle>
                <CardDescription>Guide current students and recent graduates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Your Mentorship Status</h4>
                    <Badge variant="secondary">Active Mentor</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Mentees</p>
                      <p className="text-xl font-bold">{mentorshipProgram.totalMentees}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours Contributed</p>
                      <p className="text-xl font-bold">{mentorshipProgram.hoursContributed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Program Year</p>
                      <p className="text-xl font-bold">2024-25</p>
                    </div>
                  </div>
                </div>

                {mentorshipProgram.mentees.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Your Mentees</h4>
                    <div className="space-y-2">
                      {mentorshipProgram.mentees.map((mentee, index) => (
                        <div key={index} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{mentee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {mentee.year} • {mentee.major}
                              </p>
                              <p className="text-sm">
                                Meetings: {mentee.meetingFrequency} • Next: {mentee.nextMeeting}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Find New Mentee
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="giving" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Year</p>
                      <p className="text-2xl font-bold">${alumniProfile.totalGiving}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gifts Made</p>
                      <p className="text-2xl font-bold">{givingHistory.length}</p>
                    </div>
                    <Gift className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Donor Status</p>
                      <p className="text-2xl font-bold">Annual</p>
                    </div>
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Giving History</CardTitle>
                    <CardDescription>Your contributions to the university</CardDescription>
                  </div>
                  <Button>
                    <Heart className="h-4 w-4 mr-2" />
                    Make a Gift
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {givingHistory.map((gift, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{gift.designation}</p>
                          <p className="text-xs text-muted-foreground">
                            {gift.campaign} • {gift.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${gift.amount}</p>
                        <Badge variant="secondary" className="text-xs">
                          {gift.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Thank you for your continued support! Your gifts make a real difference in students' lives.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alumni Benefits</CardTitle>
                <CardDescription>Exclusive perks and services for alumni</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <benefit.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                          <Badge variant={benefit.status === "active" ? "secondary" : "outline"} className="mt-2 text-xs">
                            {benefit.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">Additional benefits available with lifetime membership:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Priority event registration</li>
                    <li>• Exclusive networking opportunities</li>
                    <li>• Special recognition at events</li>
                    <li>• Access to premium career resources</li>
                  </ul>
                  <Button className="w-full mt-3">
                    Upgrade to Lifetime Membership
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Opportunities</CardTitle>
                <CardDescription>Give back through your time and expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volunteerOpportunities.map((opp, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{opp.title}</h4>
                          <p className="text-sm text-muted-foreground">{opp.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {opp.commitment}
                            </span>
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {opp.period}
                            </span>
                            <span>
                              <Users className="h-3 w-3 inline mr-1" />
                              {opp.spots} volunteers
                            </span>
                          </div>
                        </div>
                        <Button size="sm">Sign Up</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alumni News & Updates</CardTitle>
                <CardDescription>Stay informed about university happenings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alumniNews.map((article, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{article.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.date}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Alumni Magazine
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe to Newsletter
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