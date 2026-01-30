"use client"

import { AppShell } from '@/components/layout/app-shell'
import { GraduationApplicationsTab } from '@/components/admin/graduation-applications-tab'

export default function AdminGraduationPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Graduation Applications</h1>
          <p className="text-muted-foreground">
            Review and process student graduation applications
          </p>
        </div>
        <GraduationApplicationsTab />
      </div>
    </AppShell>
  )
}
