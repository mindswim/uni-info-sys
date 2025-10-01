"use client"

import { AppShell } from '@/components/layout/app-shell'
import { MyStudentsTab } from '@/components/faculty/my-students-tab'

export default function MyStudentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground">
            Manage and view information about your students
          </p>
        </div>
        <MyStudentsTab />
      </div>
    </AppShell>
  )
}
