"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings, Bell, Shield, Database, Mail, Calendar,
  Clock, Save, RefreshCw, AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Mock settings state
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

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast({ title: 'Settings saved successfully' })
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

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
                  <Select value={settings.academic.current_term}>
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
                    <p className="text-lg font-medium">2.5.1</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <Badge>Production</Badge>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Database</p>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Last Backup</p>
                    <p className="font-medium">Jan 25, 2025 03:00 AM</p>
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
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Take system offline for maintenance</p>
                  </div>
                  <Button variant="outline" className="text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Enable
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
