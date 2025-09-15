"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Plus,
  Search,
  Filter,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Upload,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react"
import UniversityAPI, { AdmissionApplication, Program, Student } from "@/lib/university-api"

const statusColors = {
  pending: { color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  under_review: { color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" },
  accepted: { color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
  rejected: { color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
  withdrawn: { color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" }
}

interface ApplicationStats {
  total: number
  pending: number
  under_review: number
  accepted: number
  rejected: number
  acceptance_rate: number
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Admissions" }
]

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<AdmissionApplication[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [programFilter, setProgramFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null)
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    acceptance_rate: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter, programFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use demo applications API for real data
      const applicationsResponse = await fetch('http://localhost:8001/api/demo/applications')

      if (!applicationsResponse.ok) {
        throw new Error(`Failed to fetch applications: ${applicationsResponse.statusText}`)
      }

      const applicationsData = await applicationsResponse.json()

      // Transform demo data to match expected AdmissionApplication format
      const transformedApplications = applicationsData.data.map((app: any) => ({
        id: app.id,
        student_id: app.student_id,
        application_date: app.application_date,
        status: app.status === 'submitted' ? 'pending' : app.status, // Convert submitted to pending for display
        decision_date: app.decision_date,
        student: {
          id: app.student_id,
          user: {
            name: app.student_name,
            email: app.student_email
          },
          user_id: 0,
          student_number: `STU202500${app.student_id}`,
          date_of_birth: '',
          gender: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: app.country,
          postal_code: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          enrollment_status: 'active' as const,
          created_at: '',
          updated_at: '',
        },
        program: {
          id: 1,
          name: app.program,
          degree_type: 'bachelor',
          duration_years: 4,
          total_credits: 120,
          is_active: true,
          created_at: '',
          updated_at: '',
          department: {
            id: 1,
            name: 'Computer Science',
            abbreviation: 'CS',
            description: '',
            is_active: true,
            created_at: '',
            updated_at: '',
            faculty: {
              id: 1,
              name: 'Engineering and Technology',
              abbreviation: 'ET',
              description: '',
              is_active: true,
              created_at: '',
              updated_at: ''
            }
          }
        },
        gpa: app.gpa,
        created_at: app.application_date,
        updated_at: app.decision_date || app.application_date
      }))

      setApplications(transformedApplications)

      // Set mock programs data for filtering
      setPrograms([
        {
          id: 1,
          name: 'Bachelor of Science in Computer Science',
          degree_type: 'bachelor',
          duration_years: 4,
          total_credits: 120,
          is_active: true,
          created_at: '',
          updated_at: '',
          department: {
            id: 1,
            name: 'Computer Science',
            abbreviation: 'CS',
            description: '',
            is_active: true,
            created_at: '',
            updated_at: '',
            faculty: {
              id: 1,
              name: 'Engineering and Technology',
              abbreviation: 'ET',
              description: '',
              is_active: true,
              created_at: '',
              updated_at: ''
            }
          }
        }
      ])

      // Calculate stats
      calculateStats(transformedApplications)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admission data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (apps: AdmissionApplication[]) => {
    const total = apps.length
    const pending = apps.filter(app => app.status === 'pending').length
    const under_review = apps.filter(app => app.status === 'under_review').length
    const accepted = apps.filter(app => app.status === 'accepted').length
    const rejected = apps.filter(app => app.status === 'rejected').length
    const acceptance_rate = total > 0 ? Math.round((accepted / (accepted + rejected)) * 100) : 0

    setStats({
      total,
      pending,
      under_review,
      accepted,
      rejected,
      acceptance_rate
    })
  }

  const filterApplications = () => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Program filter (via program_choices)
    if (programFilter !== "all") {
      filtered = filtered.filter(app =>
        app.program_choices?.some(choice => choice.program_id === parseInt(programFilter))
      )
    }

    setFilteredApplications(filtered)
  }

  const getStatusBadge = (status: string) => {
    const config = statusColors[status as keyof typeof statusColors] || statusColors.pending
    return (
      <Badge variant="outline" className={`${config.textColor} border-current`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getApplicationProgress = (app: AdmissionApplication) => {
    const stages = ['pending', 'under_review', 'accepted']
    const currentIndex = stages.indexOf(app.status)
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0
  }

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    // This would be implemented with a real API endpoint
    console.log(`Updating application ${applicationId} to status: ${newStatus}`)
    // For demo purposes, we'll just update locally
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus as any, decision_date: new Date().toISOString() }
          : app
      )
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admission Applications</h1>
            <p className="text-muted-foreground">
              Manage and review student admission applications
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.acceptance_rate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or student number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-48">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.slice(0, 10).map(program => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadData} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-muted-foreground">Loading applications...</span>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {application.student.user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{application.student.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{application.student.user.email}</p>
                        <p className="text-sm text-muted-foreground">ID: {application.student.student_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(application.status)}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Application Details - {application.student.user.name}</DialogTitle>
                            <DialogDescription>
                              Application #{application.id} submitted on {new Date(application.application_date).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList>
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="programs">Program Choices</TabsTrigger>
                              <TabsTrigger value="documents">Documents</TabsTrigger>
                              <TabsTrigger value="status">Status & Actions</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Application Date</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(application.application_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Current Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(application.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Student Number</Label>
                                  <p className="text-sm text-muted-foreground">{application.student.student_number}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <p className="text-sm text-muted-foreground">{application.student.user.email}</p>
                                </div>
                                {application.decision_date && (
                                  <div>
                                    <Label className="text-sm font-medium">Decision Date</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(application.decision_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {application.comments && (
                                <div>
                                  <Label className="text-sm font-medium">Comments</Label>
                                  <p className="text-sm text-muted-foreground mt-1">{application.comments}</p>
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="programs" className="space-y-4">
                              {application.program_choices?.map((choice, index) => (
                                <div key={choice.id} className="border rounded p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">Priority #{choice.priority}</h4>
                                      <p className="text-sm text-muted-foreground">{choice.program.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {choice.program.department.name} • {choice.program.degree_type}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{choice.program.degree_type}</Badge>
                                  </div>
                                </div>
                              )) || (
                                <p className="text-sm text-muted-foreground">No program choices recorded</p>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="documents">
                              <div className="text-sm text-muted-foreground">
                                Document management would be implemented here
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="status" className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Update Status</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Select 
                                    value={application.status} 
                                    onValueChange={(newStatus) => handleStatusUpdate(application.id, newStatus)}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="under_review">Under Review</SelectItem>
                                      <SelectItem value="accepted">Accepted</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button size="sm">Update</Button>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Progress</Label>
                                <Progress value={getApplicationProgress(application)} className="mt-2" />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Applied:</strong> {new Date(application.application_date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Programs:</strong> {application.program_choices?.length || 0} selected
                    </div>
                    {application.decision_date && (
                      <div>
                        <strong>Decision:</strong> {new Date(application.decision_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {application.program_choices && application.program_choices.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-2">
                        {application.program_choices.slice(0, 2).map(choice => (
                          <Badge key={choice.id} variant="secondary" className="text-xs">
                            {choice.program.name}
                          </Badge>
                        ))}
                        {application.program_choices.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.program_choices.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}