'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { SettingsAPI } from '@/lib/api-client'
import {
  Shield, Key, Bell, Globe, Moon, Sun,
  Monitor, Mail, MessageSquare, CheckCircle,
  AlertCircle, Lock, Eye, EyeOff
} from 'lucide-react'

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settings' }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    emailGrades: true,
    emailCourses: true,
    emailAnnouncements: false,
    pushNotifications: true,
    smsAlerts: false
  })
  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    compactMode: false,
    animations: true
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Fetch user settings from API
  const fetchSettings = useCallback(async () => {
    try {
      const response = await SettingsAPI.getMySettings()
      const data = response.data

      if (data) {
        setNotifications({
          emailGrades: data.email_grades ?? true,
          emailCourses: data.email_courses ?? true,
          emailAnnouncements: data.email_announcements ?? false,
          pushNotifications: data.push_notifications ?? true,
          smsAlerts: data.sms_alerts ?? false,
        })
        setAppearance({
          theme: data.theme || 'system',
          compactMode: data.compact_mode ?? false,
          animations: data.animations ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSaveNotifications = async () => {
    setSaveStatus('saving')
    try {
      await SettingsAPI.updateNotifications({
        email_grades: notifications.emailGrades,
        email_courses: notifications.emailCourses,
        email_announcements: notifications.emailAnnouncements,
        push_notifications: notifications.pushNotifications,
        sms_alerts: notifications.smsAlerts,
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save notifications:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleSaveAppearance = async (newAppearance: typeof appearance) => {
    setAppearance(newAppearance)
    try {
      await SettingsAPI.updateAppearance({
        theme: newAppearance.theme,
        compact_mode: newAppearance.compactMode,
        animations: newAppearance.animations,
      })
    } catch (error) {
      console.error('Failed to save appearance:', error)
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <PageSkeleton type="form" />
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security</p>
        </div>

        {saveStatus === 'saved' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to save settings. Please try again.</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language and timezone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" defaultValue="English (US)" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="America/New_York" disabled />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Language and timezone settings coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                  />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button>
                    <Key className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label>Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with an additional verification step
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Monitor className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">Browser on macOS</p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Sign Out of All Other Sessions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-grades">Grade Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive emails when grades are posted</p>
                  </div>
                  <Switch
                    id="email-grades"
                    checked={notifications.emailGrades}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailGrades: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-courses">Course Announcements</Label>
                    <p className="text-sm text-muted-foreground">Updates from your enrolled courses</p>
                  </div>
                  <Switch
                    id="email-courses"
                    checked={notifications.emailCourses}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailCourses: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-announcements">System Announcements</Label>
                    <p className="text-sm text-muted-foreground">Important system-wide notifications</p>
                  </div>
                  <Switch
                    id="email-announcements"
                    checked={notifications.emailAnnouncements}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailAnnouncements: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Manage browser and mobile push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get instant updates on your device</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive urgent notifications via text</p>
                  </div>
                  <Switch
                    id="sms-alerts"
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsAlerts: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={saveStatus === 'saving'}>
                <Bell className="mr-2 h-4 w-4" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    variant={appearance.theme === 'light' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleSaveAppearance({ ...appearance, theme: 'light' })}
                  >
                    <Sun className="h-6 w-6" />
                    Light
                  </Button>
                  <Button
                    variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleSaveAppearance({ ...appearance, theme: 'dark' })}
                  >
                    <Moon className="h-6 w-6" />
                    Dark
                  </Button>
                  <Button
                    variant={appearance.theme === 'system' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleSaveAppearance({ ...appearance, theme: 'system' })}
                  >
                    <Monitor className="h-6 w-6" />
                    System
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Theme preference is saved automatically and syncs across your devices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Adjust how content is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Show more content with reduced spacing</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) =>
                      handleSaveAppearance({ ...appearance, compactMode: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable interface animations</p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) =>
                      handleSaveAppearance({ ...appearance, animations: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
