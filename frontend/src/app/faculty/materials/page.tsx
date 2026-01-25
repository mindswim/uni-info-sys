"use client"

import { AppShell } from '@/components/layout/app-shell'
import { MaterialsTab } from '@/components/faculty/materials-tab'

export default function MaterialsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Course Materials</h1>
          <p className="text-muted-foreground">
            Manage and share course materials with students
          </p>
        </div>
        <MaterialsTab />
      </div>
    </AppShell>
  )
}
