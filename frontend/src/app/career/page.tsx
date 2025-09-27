"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Briefcase,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Upload,
  Search,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  MessageSquare,
  Video,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Linkedin,
  Globe,
  Mail
} from "lucide-react"

export default function CareerPage() {
  // Profile completion
  const profileCompletion = {
    overall: 75,
    sections: {
      basicInfo: 100,
      education: 100,
      experience: 60,
      skills: 80,
      documents: 50
    }
  }

  // Job applications
  const applications = [
    {
      position: "Software Engineering Intern",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      type: "Internship",
      applied: "2024-12-10",
      status: "under_review",
      deadline: "2025-01-15"
    },
    {
      position: "Data Analyst Intern",
      company: "DataInsights Inc",
      location: "Remote",
      type: "Internship",
      applied: "2024-12-05",
      status: "interview_scheduled",
      interviewDate: "2024-12-22",
      deadline: "2024-12-20"
    },
    {
      position: "Junior Developer",
      company: "StartupXYZ",
      location: "Austin, TX",
      type: "Full-time",
      applied: "2024-11-28",
      status: "rejected",
      deadline: "2024-12-01"
    }
  ]

  // Upcoming events
  const careerEvents = [
    {
      title: "Spring Career Fair",
      date: "2025-02-15",
      time: "10:00 AM - 3:00 PM",
      location: "Student Union Ballroom",
      type: "career_fair",
      companies: 120,
      registered: true
    },
    {
      title: "Resume Workshop",
      date: "2024-12-21",
      time: "2:00 PM - 3:30 PM",
      location: "Career Center Room 201",
      type: "workshop",
      spots: "12/20",
      registered: false
    },
    {
      title: "Mock Interview Day",
      date: "2025-01-10",
      time: "9:00 AM - 5:00 PM",
      location: "Career Center",
      type: "practice",
      spots: "Full",
      registered: true
    }
  ]

  // Job recommendations
  const jobRecommendations = [
    {
      position: "Software Development Intern",
      company: "Microsoft",
      location: "Redmond, WA",
      salary: "$40-45/hour",
      match: 92,
      posted: "2 days ago",
      deadline: "2025-01-31"
    },
    {
      position: "Full Stack Developer Intern",
      company: "Amazon Web Services",
      location: "Seattle, WA",
      salary: "$42-48/hour",
      match: 88,
      posted: "5 days ago",
      deadline: "2025-02-01"
    },
    {
      position: "Frontend Engineer Intern",
      company: "Meta",
      location: "Menlo Park, CA",
      salary: "$45-50/hour",
      match: 85,
      posted: "1 week ago",
      deadline: "2025-01-25"
    }
  ]

  // Career resources
  const resources = [
    {
      title: "Resume Templates",
      category: "Documents",
      downloads: 3420,
      updated: "2024-12-01"
    },
    {
      title: "Interview Prep Guide",
      category: "Preparation",
      downloads: 2891,
      updated: "2024-11-20"
    },
    {
      title: "Salary Negotiation Tips",
      category: "Career Development",
      downloads: 1567,
      updated: "2024-11-15"
    },
    {
      title: "Networking Strategies",
      category: "Professional Development",
      downloads: 1234,
      updated: "2024-12-05"
    }
  ]

  // Advisor appointments
  const advisorAppointments = [
    {
      advisor: "Sarah Martinez",
      role: "Career Counselor",
      date: "2024-12-20",
      time: "3:00 PM",
      type: "Career Planning",
      location: "Career Center Office 305"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Career Services</h1>
            <p className="text-muted-foreground mt-1">Job search, career planning, and professional development</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search Jobs
            </Button>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion.overall < 100 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your career profile is {profileCompletion.overall}% complete.
              Complete your profile to get better job recommendations and increase visibility to employers.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Events Registered</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Score</p>
                  <p className="text-2xl font-bold">{profileCompletion.overall}%</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Job Board</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="events">Career Events</TabsTrigger>
            <TabsTrigger value="profile">Career Profile</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Based on your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobRecommendations.map((job, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{job.position}</h4>
                            <Badge variant="secondary">
                              {job.match}% Match
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{job.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {job.salary}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Posted {job.posted}</span>
                            <span>Deadline: {job.deadline}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm">Apply Now</Button>
                          <Button size="sm" variant="outline">Save</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    View All Jobs
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Tracker</CardTitle>
                <CardDescription>Track your job applications and interview status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.map((app, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{app.position}</h4>
                            <Badge variant={
                              app.status === "interview_scheduled" ? "default" :
                              app.status === "under_review" ? "secondary" :
                              app.status === "rejected" ? "destructive" :
                              "outline"
                            }>
                              {app.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{app.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </span>
                            <span>{app.type}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Applied: {app.applied}</span>
                            <span>Deadline: {app.deadline}</span>
                          </div>
                          {app.interviewDate && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Interview scheduled: {app.interviewDate}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Career Events</CardTitle>
                    <CardDescription>Workshops, career fairs, and networking events</CardDescription>
                  </div>
                  <Button variant="outline">
                    View Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {careerEvents.map((event, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {event.registered && (
                              <Badge variant="secondary">Registered</Badge>
                            )}
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
                          {event.companies && (
                            <p className="text-sm">
                              <Building className="h-3 w-3 inline mr-1" />
                              {event.companies} companies attending
                            </p>
                          )}
                          {event.spots && (
                            <p className="text-sm">
                              <Users className="h-3 w-3 inline mr-1" />
                              Spots: {event.spots}
                            </p>
                          )}
                        </div>
                        {!event.registered && event.spots !== "Full" && (
                          <Button size="sm">Register</Button>
                        )}
                        {event.registered && (
                          <Button size="sm" variant="outline">Cancel Registration</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {advisorAppointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Appointments</CardTitle>
                  <CardDescription>Your upcoming career advising sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {advisorAppointments.map((apt, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{apt.type}</h4>
                          <p className="text-sm">{apt.advisor} - {apt.role}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{apt.date} at {apt.time}</span>
                            <span>{apt.location}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">Reschedule</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Career Profile Completion</CardTitle>
                <CardDescription>Complete your profile to improve job matching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm font-medium">{profileCompletion.overall}%</span>
                    </div>
                    <Progress value={profileCompletion.overall} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    {Object.entries(profileCompletion.sections).map(([section, completion]) => (
                      <div key={section} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {completion === 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={completion} className="w-24 h-2" />
                          <span className="text-sm font-medium">{completion}%</span>
                          {completion < 100 && (
                            <Button size="sm" variant="outline">Edit</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Update Cover Letter
                      </Button>
                      <Button variant="outline">
                        <Linkedin className="h-4 w-4 mr-2" />
                        Connect LinkedIn
                      </Button>
                      <Button variant="outline">
                        <Globe className="h-4 w-4 mr-2" />
                        Add Portfolio
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Career Resources</CardTitle>
                <CardDescription>Guides, templates, and tools for your career development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{resource.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {resource.category}
                            </Badge>
                            <span>{resource.downloads} downloads</span>
                            <span>Updated {resource.updated}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Download
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">Additional Services</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Career Coaching
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Mock Interviews
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Award className="h-4 w-4 mr-2" />
                      Skills Assessment
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Career Planning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}