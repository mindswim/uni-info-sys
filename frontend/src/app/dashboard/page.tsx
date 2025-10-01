"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { WidgetDashboard } from "@/components/dashboard/widget-dashboard"
import { authService } from "@/services"
import { Skeleton } from "@/components/ui/skeleton"

const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' }
]

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = authService.getUser()
    if (user && user.roles && user.roles.length > 0) {
      // Get the primary role (first role in the array)
      const role = typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].name
      setUserRole(role)
    } else {
      // Default to student if no role found
      setUserRole('student')
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="container mx-auto py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6">
        <WidgetDashboard userRole={userRole || 'student'} />
      </div>
    </AppShell>
  )
}