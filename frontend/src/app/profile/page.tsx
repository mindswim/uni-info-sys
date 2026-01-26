'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AppShell } from '@/components/layout/app-shell'
import { studentService } from '@/services'
import type { Student } from '@/types/api-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User, Mail, Phone, MapPin, Calendar,
  GraduationCap, Building, BookOpen, Save,
  Edit2, Camera, AlertCircle, Globe,
  Shield, Key, Bell, Settings
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Profile' }
]

interface StudentProfile {
  id: number
  student_id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  country: string
  postal_code: string
  program: string
  department: string
  faculty: string
  year_of_study: number
  gpa: number
  credits_earned: number
  credits_required: number
  enrollment_date: string
  expected_graduation: string
  status: 'active' | 'inactive' | 'graduated' | 'suspended'
  emergency_contact: {
    name: string
    relationship: string
    phone: string
    email: string
  }
}

// Transform API Student to StudentProfile format
const transformStudentToProfile = (student: Student): StudentProfile => ({
  id: student.id,
  student_id: student.student_number,
  name: `${student.first_name} ${student.last_name}`,
  email: student.email || '',
  phone: student.phone || '',
  date_of_birth: student.date_of_birth || '',
  gender: student.gender || '',
  address: student.address || '',
  city: student.city || '',
  country: student.country || '',
  postal_code: student.postal_code || '',
  program: student.major_program?.name || '',
  department: student.major_program?.department?.name || '',
  faculty: student.major_program?.department?.faculty?.name || '',
  year_of_study: 1, // Not available in Student type, using default
  gpa: student.gpa || 0,
  credits_earned: student.total_credits_earned || 0,
  credits_required: student.major_program?.credits_required || 120,
  enrollment_date: student.admission_date || '',
  expected_graduation: student.expected_graduation_date || '',
  status: student.enrollment_status as 'active' | 'inactive' | 'graduated' | 'suspended',
  emergency_contact: {
    name: student.emergency_contact_name || '',
    relationship: '', // Not available in Student type
    phone: student.emergency_contact_phone || '',
    email: '' // Not available in Student type
  }
})

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const loadProfile = async () => {
      // Don't load if not authenticated
      if (!isAuthenticated || authLoading) {
        setLoading(false)
        return
      }

      // Check if user is a student
      const isStudent = user?.roles?.some(r => r.name === 'student') || user?.role === 'student'

      if (!isStudent) {
        // For non-student users, show a message
        setError('Profile page is only available for student accounts. You are logged in as a staff/admin user.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const studentData = await studentService.getCurrentProfile()
        const transformedProfile = transformStudentToProfile(studentData)
        setProfile(transformedProfile)
        setEditedProfile(transformedProfile)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, authLoading, user])

  const handleSave = async () => {
    if (!editedProfile || !profile) return

    setSaveStatus('saving')
    try {
      // Use the update method with the current student's ID
      await studentService.update(profile.id, {
        phone: editedProfile.phone,
        address: editedProfile.address,
        city: editedProfile.city,
        country: editedProfile.country,
        postal_code: editedProfile.postal_code,
        emergency_contact_name: editedProfile.emergency_contact.name,
        emergency_contact_phone: editedProfile.emergency_contact.phone
      })
      setProfile(editedProfile)
      setEditing(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setEditing(false)
  }

  if (loading || authLoading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view your profile.
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }

  if (error) {
    const isNotStudentError = error.includes('staff/admin')

    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {isNotStudentError && user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>Your current account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <Badge variant="secondary">
                      {user.roles?.[0]?.name || 'User'}
                    </Badge>
                  </div>
                </div>
                {user.roles && user.roles.length > 1 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">All Roles</Label>
                    <div className="flex gap-2 flex-wrap">
                      {user.roles.map((role, idx) => (
                        <Badge key={idx} variant="outline">{role.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    )
  }

  if (!profile || !editedProfile) return null

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and settings</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {saveStatus === 'saved' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/api/placeholder/150/150" alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-2xl font-semibold">{profile.name}</h3>
                    <p className="text-muted-foreground">Student ID: {profile.student_id}</p>
                    <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                      {profile.status}
                    </Badge>
                  </div>
                  {editing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={editedProfile.date_of_birth}
                      onChange={(e) => setEditedProfile({...editedProfile, date_of_birth: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={editedProfile.gender}
                      onValueChange={(value) => setEditedProfile({...editedProfile, gender: value})}
                      disabled={!editing}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editedProfile.country}
                      onChange={(e) => setEditedProfile({...editedProfile, country: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your academic details and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <Label>Program</Label>
                      </div>
                      <span className="text-sm font-medium">{profile.program}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Label>Department</Label>
                      </div>
                      <span className="text-sm font-medium">{profile.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Label>Faculty</Label>
                      </div>
                      <span className="text-sm font-medium">{profile.faculty}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <Label>Year of Study</Label>
                      </div>
                      <Badge>Year {profile.year_of_study}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>GPA</Label>
                      <span className="text-2xl font-bold">{profile.gpa.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Credits Earned</Label>
                      <span className="text-lg font-medium">{profile.credits_earned} / {profile.credits_required}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label>Enrollment Date</Label>
                      </div>
                      <span className="text-sm">{new Date(profile.enrollment_date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label>Expected Graduation</Label>
                      </div>
                      <span className="text-sm">{new Date(profile.expected_graduation).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Your address and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editedProfile.address}
                      onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editedProfile.city}
                      onChange={(e) => setEditedProfile({...editedProfile, city: e.target.value})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input
                      id="postal"
                      value={editedProfile.postal_code}
                      onChange={(e) => setEditedProfile({...editedProfile, postal_code: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Contact person in case of emergency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ec-name">Contact Name</Label>
                    <Input
                      id="ec-name"
                      value={editedProfile.emergency_contact.name}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergency_contact: {...editedProfile.emergency_contact, name: e.target.value}
                      })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ec-relationship">Relationship</Label>
                    <Input
                      id="ec-relationship"
                      value={editedProfile.emergency_contact.relationship}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergency_contact: {...editedProfile.emergency_contact, relationship: e.target.value}
                      })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ec-phone">Phone</Label>
                    <Input
                      id="ec-phone"
                      value={editedProfile.emergency_contact.phone}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergency_contact: {...editedProfile.emergency_contact, phone: e.target.value}
                      })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ec-email">Email</Label>
                    <Input
                      id="ec-email"
                      type="email"
                      value={editedProfile.emergency_contact.email}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        emergency_contact: {...editedProfile.emergency_contact, email: e.target.value}
                      })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label>Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <Label>Change Password</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label>Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive updates about courses and grades</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Label>Language & Region</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">English (US)</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}