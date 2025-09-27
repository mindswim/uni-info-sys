"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FlaskConical,
  DollarSign,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Award,
  Building,
  Globe,
  BookOpen,
  Microscope,
  Brain,
  Activity,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Upload,
  Download,
  ExternalLink,
  Star
} from "lucide-react"

export default function ResearchPage() {
  // Research profile
  const researchProfile = {
    role: "Graduate Research Assistant",
    department: "Computer Science",
    lab: "AI & Machine Learning Lab",
    advisor: "Dr. Jennifer Chen",
    fundingStatus: "funded",
    publications: 3,
    citations: 27
  }

  // Active grants
  const activeGrants = [
    {
      title: "Deep Learning for Medical Image Analysis",
      agency: "National Science Foundation",
      amount: 250000,
      role: "Research Assistant",
      pi: "Dr. Jennifer Chen",
      startDate: "2024-01-01",
      endDate: "2026-12-31",
      status: "active",
      budget: {
        spent: 87500,
        remaining: 162500
      }
    },
    {
      title: "Quantum Computing Applications",
      agency: "Department of Energy",
      amount: 150000,
      role: "Co-Investigator",
      pi: "Dr. Michael Roberts",
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      status: "active",
      budget: {
        spent: 45000,
        remaining: 105000
      }
    }
  ]

  // Research projects
  const projects = [
    {
      title: "Neural Network Optimization for Edge Devices",
      status: "in_progress",
      progress: 65,
      deadline: "2025-03-15",
      team: 4,
      milestone: "Data Collection Phase"
    },
    {
      title: "Federated Learning Framework",
      status: "completed",
      progress: 100,
      completedDate: "2024-11-30",
      team: 6,
      outcome: "Published in ICML 2024"
    },
    {
      title: "Computer Vision for Autonomous Navigation",
      status: "planning",
      progress: 15,
      startDate: "2025-01-15",
      team: 3,
      milestone: "Literature Review"
    }
  ]

  // Publications
  const publications = [
    {
      title: "Efficient Deep Learning on Resource-Constrained Devices",
      journal: "IEEE Transactions on Neural Networks",
      year: 2024,
      authors: "Chen J., Smith A., Rodriguez M.",
      citations: 15,
      status: "published",
      doi: "10.1109/TNN.2024.123456"
    },
    {
      title: "Privacy-Preserving Machine Learning Techniques",
      conference: "NeurIPS 2024",
      year: 2024,
      authors: "Rodriguez M., Chen J.",
      citations: 8,
      status: "published",
      link: "https://papers.nips.cc/2024"
    },
    {
      title: "Adaptive Learning Algorithms for Dynamic Environments",
      journal: "Machine Learning Journal",
      year: 2024,
      authors: "Smith A., Rodriguez M., Chen J.",
      citations: 4,
      status: "in_review",
      submitted: "2024-10-15"
    }
  ]

  // Lab resources
  const labResources = [
    {
      name: "GPU Cluster",
      type: "Computing",
      availability: "available",
      specs: "8x NVIDIA A100",
      usage: 72,
      bookedBy: null
    },
    {
      name: "3D Printer Lab",
      type: "Equipment",
      availability: "busy",
      specs: "5x Prusa MK3S+",
      usage: 100,
      bookedBy: "Engineering Team"
    },
    {
      name: "Clean Room",
      type: "Facility",
      availability: "maintenance",
      specs: "Class 100",
      usage: 0,
      nextAvailable: "2024-12-22"
    },
    {
      name: "Data Storage Server",
      type: "Computing",
      availability: "available",
      specs: "500TB NAS",
      usage: 45,
      bookedBy: null
    }
  ]

  // Funding opportunities
  const fundingOpportunities = [
    {
      title: "NSF Graduate Research Fellowship",
      agency: "National Science Foundation",
      amount: "Up to $138,000",
      deadline: "2025-01-15",
      eligibility: "Graduate Students",
      match: 95
    },
    {
      title: "NIH R01 Research Grant",
      agency: "National Institutes of Health",
      amount: "Up to $500,000/year",
      deadline: "2025-02-05",
      eligibility: "Faculty & Postdocs",
      match: 78
    },
    {
      title: "Industry Partnership Grant",
      agency: "Tech Innovation Fund",
      amount: "$50,000 - $200,000",
      deadline: "2025-01-31",
      eligibility: "All Researchers",
      match: 82
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Research & Grants</h1>
            <p className="text-muted-foreground mt-1">Manage research projects, grants, and publications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Submit Proposal
            </Button>
            <Button>
              <FlaskConical className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Research Profile Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-3">Research Profile</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium">{researchProfile.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium">{researchProfile.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Research Lab</p>
                    <p className="font-medium">{researchProfile.lab}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Advisor</p>
                    <p className="font-medium">{researchProfile.advisor}</p>
                  </div>
                </div>
              </div>
              <div className="border-l pl-4">
                <h4 className="font-medium mb-2">Research Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publications</span>
                    <span className="font-medium">{researchProfile.publications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Citations</span>
                    <span className="font-medium">{researchProfile.citations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funding Status</span>
                    <Badge variant="secondary">{researchProfile.fundingStatus}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="resources">Lab Resources</TabsTrigger>
            <TabsTrigger value="opportunities">Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Research Projects</CardTitle>
                <CardDescription>Your active and completed research projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map((project, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{project.title}</h4>
                            <Badge variant={
                              project.status === "completed" ? "secondary" :
                              project.status === "in_progress" ? "default" :
                              "outline"
                            }>
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {project.team} team members
                            </span>
                            {project.deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {project.deadline}
                              </span>
                            )}
                            {project.completedDate && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed: {project.completedDate}
                              </span>
                            )}
                          </div>
                          {project.milestone && (
                            <p className="text-sm">Current Phase: <span className="font-medium">{project.milestone}</span></p>
                          )}
                          {project.outcome && (
                            <p className="text-sm text-green-600">{project.outcome}</p>
                          )}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
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

          <TabsContent value="grants" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Funding</p>
                      <p className="text-2xl font-bold">$400K</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Grants</p>
                      <p className="text-2xl font-bold">{activeGrants.length}</p>
                    </div>
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Used</p>
                      <p className="text-2xl font-bold">33%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Grants</CardTitle>
                <CardDescription>Currently funded research grants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeGrants.map((grant, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{grant.title}</h4>
                            <p className="text-sm text-muted-foreground">{grant.agency}</p>
                          </div>
                          <Badge variant="secondary">{grant.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Award</p>
                            <p className="font-medium">${grant.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Your Role</p>
                            <p className="font-medium">{grant.role}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">PI</p>
                            <p className="font-medium">{grant.pi}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Period</p>
                            <p className="font-medium text-xs">{grant.startDate} to {grant.endDate}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Budget Utilization</span>
                            <span className="font-medium">
                              ${grant.budget.spent.toLocaleString()} / ${grant.amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={(grant.budget.spent / grant.amount) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Publications</CardTitle>
                    <CardDescription>Your research publications and submissions</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Add Publication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {publications.map((pub, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium">{pub.title}</h4>
                          <p className="text-sm text-muted-foreground">{pub.authors}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">
                              {pub.journal || pub.conference} ({pub.year})
                            </span>
                            <Badge variant={pub.status === "published" ? "secondary" : "outline"}>
                              {pub.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {pub.citations} citations
                            </span>
                            {pub.doi && (
                              <span>DOI: {pub.doi}</span>
                            )}
                            {pub.submitted && (
                              <span>Submitted: {pub.submitted}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {pub.status === "published" && (
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lab Resources</CardTitle>
                <CardDescription>Equipment and facilities available for research</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {labResources.map((resource, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{resource.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                            <Badge variant={
                              resource.availability === "available" ? "secondary" :
                              resource.availability === "busy" ? "destructive" :
                              "outline"
                            }>
                              {resource.availability}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{resource.specs}</p>
                          {resource.availability === "available" && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Current Usage</span>
                                <span className="font-medium">{resource.usage}%</span>
                              </div>
                              <Progress value={resource.usage} className="h-2" />
                            </div>
                          )}
                          {resource.bookedBy && (
                            <p className="text-sm">Currently used by: <span className="font-medium">{resource.bookedBy}</span></p>
                          )}
                          {resource.nextAvailable && (
                            <p className="text-sm">Next available: <span className="font-medium">{resource.nextAvailable}</span></p>
                          )}
                        </div>
                        {resource.availability === "available" && (
                          <Button size="sm">Reserve</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Funding Opportunities</CardTitle>
                <CardDescription>Grants and fellowships matching your research area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fundingOpportunities.map((opp, index) => (
                    <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{opp.title}</h4>
                            <Badge variant="secondary">
                              {opp.match}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{opp.agency}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {opp.amount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Deadline: {opp.deadline}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Eligibility: {opp.eligibility}</p>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm">View Details</Button>
                          <Button size="sm" variant="outline">Save</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Subscribe to funding alerts to receive notifications about new opportunities matching your research interests.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}