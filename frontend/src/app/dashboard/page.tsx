"use client"

import { AppShell } from "@/components/layout/app-shell"
import { WidgetDashboard } from "@/components/dashboard/widget-dashboard"

const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' }
]

export default function DashboardPage() {
  // Temporarily hardcode role for testing
  const userRole = 'student'

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6">
        <WidgetDashboard userRole={userRole} />
      </div>
    </AppShell>
  )
}