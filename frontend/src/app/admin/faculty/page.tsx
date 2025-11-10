"use client"

import { AppShell } from '@/components/layout/app-shell'
import { FacultyTab } from '@/components/admin/faculty-tab'

export default function FacultyManagementPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">
            Manage academic faculties and departments
          </p>
        </div>
        <FacultyTab />
      </div>
    </AppShell>
  )
}
