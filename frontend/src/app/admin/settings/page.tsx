"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { SettingsAPI } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings, Bell, Shield, Database, Mail, Calendar,
  Clock, Save, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearingCache, setClearingCache] = useState(false)
  const [systemInfo, setSystemInfo] = useState({
    version: '2.5.1',
    environment: 'production',
    database_connected: true,
    maintenance_mode: false,
  })
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    registration: {
      enabled: true,
      add_drop_enabled: true,
      waitlist_enabled: true,
      max_credits: 18,
      max_waitlist_per_student: 3,
    },
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      registration_alerts: true,
      payment_reminders: true,
      grade_notifications: true,
    },
    academic: {
      current_term: 'Spring 2025',
      grading_open: true,
      transcript_requests: true,
    },
  })

  // Fetch all system settings
  const fetchSettings = useCallback(async () => {
    try {
      const [settingsRes, infoRes] = await Promise.all([
        SettingsAPI.getSystemSettings(),
        SettingsAPI.getSystemInfo(),
      ])

      const data = settingsRes.data || {}

      setSettings({
        registration: {
          enabled: data.registration?.enabled ?? true,
          add_drop_enabled: data.registration?.add_drop_enabled ?? true,
          waitlist_enabled: data.registration?.waitlist_enabled ?? true,
          max_credits: data.registration?.max_credits ?? 18,
          max_waitlist_per_student: data.registration?.max_waitlist_per_student ?? 3,
        },
        notifications: {
          email_enabled: data.notifications?.email_enabled ?? true,
          sms_enabled: data.notifications?.sms_enabled ?? false,
          registration_alerts: data.notifications?.registration_alerts ?? true,
          payment_reminders: data.notifications?.payment_reminders ?? true,
          grade_notifications: data.notifications?.grade_notifications ?? true,
        },
        academic: {
          current_term: data.academic?.current_term ?? 'Spring 2025',
          grading_open: data.academic?.grading_open ?? true,
          transcript_requests: data.academic?.transcript_requests ?? true,
        },
      })

      if (infoRes.data) {
        setSystemInfo({
          version: infoRes.data.version || '2.5.1',
          environment: infoRes.data.environment || 'production',
          database_connected: infoRes.data.database_connected ?? true,
          maintenance_mode: infoRes.data.maintenance_mode ?? false,
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

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save all groups
      await Promise.all([
        SettingsAPI.updateSettingsGroup('registration', settings.registration),
        SettingsAPI.updateSettingsGroup('notifications', settings.notifications),
        SettingsAPI.updateSettingsGroup('academic', settings.academic),
      ])
      toast({ title: 'Settings saved successfully' })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleClearCache = async () => {
    setClearingCache(true)
    try {
      await SettingsAPI.clearCache()
      toast({ title: 'Cache cleared successfully' })
    } catch (error) {
      console.error('Failed to clear cache:', error)
      toast({ title: 'Failed to clear cache', variant: 'destructive' })
    } finally {
      setClearingCache(false)
    }
  }

  const handleToggleMaintenance = async () => {
    try {
      const newState = !systemInfo.maintenance_mode
      await SettingsAPI.toggleMaintenance(newState)
      setSystemInfo(prev => ({ ...prev, maintenance_mode: newState }))
      toast({ title: newState ? 'Maintenance mode enabled' : 'Maintenance mode disabled' })
    } catch (error) {
      console.error('Failed to toggle maintenance:', error)
      toast({ title: 'Failed to toggle maintenance mode', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="form" />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageShell
        title="System Settings"
        description="Configure system-wide settings and preferences"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      >
        <Tabs defaultValue="registration">
          <TabsList>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Registration Settings */}
          <TabsContent value="registration" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registration Controls</CardTitle>
                <CardDescription>
                  Manage student registration and enrollment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registration Open</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow students to register for classes
                    </p>
                  </div>
                  <Switch
                    checked={settings.registration.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, registration: { ...s.registration, enabled: checked } }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Add/Drop Period</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow students to add and drop courses
                    </p>
                  </div>
                  <Switch
                    checked={settings.registration.add_drop_enabled}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, registration: { ...s.registration, add_drop_enabled: checked } }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Waitlist System</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable waitlists for full course sections
                    </p>
                  </div>
                  <Switch
                    checked={settings.registration.waitlist_enabled}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, registration: { ...s.registration, waitlist_enabled: checked } }))
                    }
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Credits Per Term</Label>
                    <Input
                      type="number"
                      value={settings.registration.max_credits}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, registration: { ...s.registration, max_credits: parseInt(e.target.value) } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Waitlist Entries Per Student</Label>
                    <Input
                      type="number"
                      value={settings.registration.max_waitlist_per_student}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, registration: { ...s.registration, max_waitlist_per_student: parseInt(e.target.value) } }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Channels</CardTitle>
                <CardDescription>
                  Configure how notifications are sent to users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.email_enabled}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, notifications: { ...s.notifications, email_enabled: checked } }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via text message
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.sms_enabled}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, notifications: { ...s.notifications, sms_enabled: checked } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Types</CardTitle>
                <CardDescription>
                  Choose which events trigger notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'registration_alerts', label: 'Registration Alerts', desc: 'Registration opens, closes, waitlist updates' },
                  { key: 'payment_reminders', label: 'Payment Reminders', desc: 'Payment due dates and confirmations' },
                  { key: 'grade_notifications', label: 'Grade Notifications', desc: 'When grades are posted' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onCheckedChange={(checked) =>
                        setSettings(s => ({ ...s, notifications: { ...s.notifications, [item.key]: checked } }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Settings */}
          <TabsContent value="academic" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Academic Calendar</CardTitle>
                <CardDescription>
                  Configure academic term and grading settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Current Term</Label>
                  <Select
                    value={settings.academic.current_term}
                    onValueChange={(value) =>
                      setSettings(s => ({ ...s, academic: { ...s.academic, current_term: value } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                      <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                      <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                      <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Grading Period Open</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow faculty to submit grades
                    </p>
                  </div>
                  <Switch
                    checked={settings.academic.grading_open}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, academic: { ...s.academic, grading_open: checked } }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transcript Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow students to request transcripts
                    </p>
                  </div>
                  <Switch
                    checked={settings.academic.transcript_requests}
                    onCheckedChange={(checked) =>
                      setSettings(s => ({ ...s, academic: { ...s.academic, transcript_requests: checked } }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-lg font-medium">{systemInfo.version}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <Badge>{systemInfo.environment}</Badge>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Database</p>
                    <div className="flex items-center gap-2">
                      {systemInfo.database_connected ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Maintenance Mode</p>
                    <Badge variant={systemInfo.maintenance_mode ? 'destructive' : 'secondary'}>
                      {systemInfo.maintenance_mode ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-muted-foreground">Clear system and application cache</p>
                  </div>
                  <Button variant="outline" onClick={handleClearCache} disabled={clearingCache}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${clearingCache ? 'animate-spin' : ''}`} />
                    {clearingCache ? 'Clearing...' : 'Clear Cache'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Take system offline for maintenance</p>
                  </div>
                  <Button
                    variant="outline"
                    className={systemInfo.maintenance_mode ? 'text-green-600' : 'text-amber-600'}
                    onClick={handleToggleMaintenance}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {systemInfo.maintenance_mode ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>
    </AppShell>
  )
}
