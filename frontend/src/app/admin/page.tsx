"use client"

import { AppShell } from '@/components/layout/app-shell'
import { DashboardLayout } from '@/components/layouts'
import { Users, UserCheck, GraduationCap, BarChart, Settings, FileText, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentsTab } from '@/components/admin/students-tab'
import { AdmissionsTab } from '@/components/admin/admissions-tab'
import { AlumniTab } from '@/components/admin/alumni-tab'
import { AnalyticsTab } from '@/components/admin/analytics-tab'
import { ReportsTab } from '@/components/admin/reports-tab'
import { SettingsTab } from '@/components/admin/settings-tab'

export default function AdminDashboardPage() {
  const tabs = [
    {
      value: 'students',
      label: 'Students',
      icon: <Users className="h-4 w-4" />,
      content: <StudentsTab />
    },
    {
      value: 'admissions',
      label: 'Admissions',
      icon: <UserCheck className="h-4 w-4" />,
      content: <AdmissionsTab />
    },
    {
      value: 'alumni',
      label: 'Alumni',
      icon: <GraduationCap className="h-4 w-4" />,
      content: <AlumniTab />
    },
    {
      value: 'analytics',
      label: 'Analytics',
      icon: <BarChart className="h-4 w-4" />,
      content: <AnalyticsTab />
    },
    {
      value: 'reports',
      label: 'Reports',
      icon: <FileText className="h-4 w-4" />,
      content: <ReportsTab />
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      content: <SettingsTab />
    }
  ]

  return (
    <AppShell>
      <DashboardLayout
        title="Admin Dashboard"
        description="System-wide administration and management"
        tabs={tabs}
        defaultTab="students"
        action={
          <Button>
            <Building className="mr-2 h-4 w-4" />
            System Overview
          </Button>
        }
      />
    </AppShell>
  )
}
