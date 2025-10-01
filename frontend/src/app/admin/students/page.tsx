"use client"

import { AppShell } from '@/components/layout/app-shell'
import { StudentsTab } from '@/components/admin/students-tab'

export default function StudentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage all student records and information
          </p>
        </div>
        <StudentsTab />
      </div>
    </AppShell>
  )
}
