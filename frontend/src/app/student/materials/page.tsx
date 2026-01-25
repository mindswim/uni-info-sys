"use client"

import { AppShell } from '@/components/layout/app-shell'
import { StudentMaterialsTab } from '@/components/student/student-materials-tab'

export default function StudentMaterialsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Course Materials</h1>
          <p className="text-muted-foreground">
            Access your course readings and resources
          </p>
        </div>
        <StudentMaterialsTab />
      </div>
    </AppShell>
  )
}
