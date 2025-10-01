"use client"

import { AppShell } from '@/components/layout/app-shell'
import { CoursesTab } from '@/components/faculty/courses-tab'

export default function CourseManagementPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
            Manage course content and materials
          </p>
        </div>
        <CoursesTab />
      </div>
    </AppShell>
  )
}
