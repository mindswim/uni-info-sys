'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  BookOpen,
  Building2,
  GraduationCap,
  KeyRound,
  Activity,
  LogIn,
  Search,
  RefreshCcw
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  roles: string[]
  type: string
  details: any
}

interface Statistics {
  users: {
    total: number
    students: number
    faculty: number
    staff: number
    admins: number
  }
  applications: {
    total: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
  }
  enrollments: {
    total: number
    enrolled: number
    waitlisted: number
    dropped: number
  }
  courses: {
    total: number
    sections: number
    open_sections: number
  }
  infrastructure: {
    faculties: number
    departments: number
    programs: number
    buildings: number
    rooms: number
  }
}

export default function GodModePage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have a stored token
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      fetchCurrentUser(storedToken)
    }
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost/api/v1/auth/user', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser({
          id: data.id,
          name: data.name,
          email: data.email,
          roles: data.roles?.map((r: any) => r.name) || [],
          type: 'user',
          details: null
        })
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const quickLogin = async (email: string) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost/api/v1/quick-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        setToken(data.token)
        setCurrentUser(data.user)

        // Fetch god mode data if admin
        if (data.user.roles.includes('Admin')) {
          await fetchGodModeData(data.token)
        }
      }
    } catch (error) {
      console.error('Quick login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGodModeData = async (authToken: string) => {
    try {
      // Fetch users
      const usersResponse = await fetch('http://localhost/api/v1/god-mode/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
        setFilteredUsers(usersData.users)
      }

      // Fetch statistics
      const statsResponse = await fetch('http://localhost/api/v1/god-mode/statistics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStatistics(statsData.statistics)
      }
    } catch (error) {
      console.error('Error fetching god mode data:', error)
    }
  }

  const impersonateUser = async (user: User) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost/api/v1/god-mode/impersonate/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('original_token', token)
        setToken(data.token)
        setCurrentUser(data.user)

        // Redirect to appropriate dashboard
        if (data.user.type === 'student') {
          window.location.href = '/enhanced-students'
        } else if (data.user.type === 'staff') {
          window.location.href = '/system-overview'
        } else {
          window.location.href = '/demo'
        }
      }
    } catch (error) {
      console.error('Impersonation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('original_token')
    setToken(null)
    setCurrentUser(null)
    setUsers([])
    setStatistics(null)
  }

  // Quick access buttons for demo accounts
  const demoAccounts = [
    { email: 'god@admin.com', label: 'God Mode Admin', icon: KeyRound, color: 'bg-purple-500' },
    { email: 'admin@demo.com', label: 'System Admin', icon: Building2, color: 'bg-blue-500' },
    { email: 'maria@demo.com', label: 'Maria (Applicant)', icon: Users, color: 'bg-green-500' },
    { email: 'david@demo.com', label: 'David (Enrolled)', icon: GraduationCap, color: 'bg-orange-500' },
    { email: 'sophie@demo.com', label: 'Sophie (Waitlisted)', icon: BookOpen, color: 'bg-yellow-500' },
  ]

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-6 w-6" />
              University System - Quick Access
            </CardTitle>
            <CardDescription>
              Select an account to log in instantly (development mode)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => quickLogin(account.email)}
                  disabled={loading}
                >
                  <div className={`${account.color} p-2 rounded-lg mr-3`}>
                    <account.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{account.label}</div>
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">Or use any student account:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="student1@demo.com to student100@demo.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      quickLogin((e.target as HTMLInputElement).value)
                    }
                  }}
                />
                <Button onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement
                  if (input?.value) quickLogin(input.value)
                }}>
                  <LogIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = currentUser?.roles?.includes('Admin')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">God Mode Dashboard</h1>
          <p className="text-muted-foreground">
            Logged in as: {currentUser.name} ({currentUser.email})
            {currentUser.roles.map(role => (
              <Badge key={role} className="ml-2" variant="secondary">{role}</Badge>
            ))}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => fetchGodModeData(token!)} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>User Dashboard</CardTitle>
            <CardDescription>
              You are logged in as a {currentUser.type}. Switch to an admin account to access God Mode features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button onClick={() => window.location.href = '/enhanced-students'}>
                Go to Student Portal
              </Button>
              <Button onClick={() => window.location.href = '/course-catalog'}>
                Browse Course Catalog
              </Button>
              <Button onClick={() => window.location.href = '/demo'}>
                View Demo Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="statistics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statistics">
              <Activity className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="quick-actions">
              <KeyRound className="h-4 w-4 mr-2" />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            {statistics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Users Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{statistics.users.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span>{statistics.users.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Faculty:</span>
                        <span>{statistics.users.faculty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staff:</span>
                        <span>{statistics.users.staff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admins:</span>
                        <span>{statistics.users.admins}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{statistics.applications.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span>{statistics.applications.submitted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Under Review:</span>
                        <span>{statistics.applications.under_review}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accepted:</span>
                        <span className="text-green-600">{statistics.applications.accepted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejected:</span>
                        <span className="text-red-600">{statistics.applications.rejected}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enrollments Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{statistics.enrollments.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enrolled:</span>
                        <span className="text-green-600">{statistics.enrollments.enrolled}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waitlisted:</span>
                        <span className="text-yellow-600">{statistics.enrollments.waitlisted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dropped:</span>
                        <span className="text-gray-600">{statistics.enrollments.dropped}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Courses Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Courses:</span>
                        <span className="font-semibold">{statistics.courses.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Course Sections:</span>
                        <span>{statistics.courses.sections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Open Sections:</span>
                        <span className="text-green-600">{statistics.courses.open_sections}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Infrastructure Stats */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Infrastructure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Faculties:</span>
                          <span>{statistics.infrastructure.faculties}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Departments:</span>
                          <span>{statistics.infrastructure.departments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Programs:</span>
                          <span>{statistics.infrastructure.programs}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Buildings:</span>
                          <span>{statistics.infrastructure.buildings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span>{statistics.infrastructure.rooms}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Users</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex gap-1 mt-1">
                            {user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                          {user.details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.details.student_number && `Student #${user.details.student_number}`}
                              {user.details.job_title && user.details.job_title}
                              {user.details.department && ` • ${user.details.department}`}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => impersonateUser(user)}
                          disabled={loading || user.id === currentUser.id}
                        >
                          Impersonate
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="quick-actions">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Navigation</CardTitle>
                  <CardDescription>Quick access to all system modules</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="outline" onClick={() => window.location.href = '/demo'}>
                    Demo Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/pipeline'}>
                    Student Pipeline
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/course-catalog'}>
                    Course Catalog
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/enhanced-students'}>
                    Student Portal
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/system-overview'}>
                    System Overview
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>View and manage system data</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="outline" onClick={() => window.location.href = '/faculties'}>
                    Faculties & Departments
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/courses'}>
                    Courses
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/enrollments'}>
                    Enrollments
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/buildings'}>
                    Buildings & Rooms
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/academic-records'}>
                    Academic Records
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}