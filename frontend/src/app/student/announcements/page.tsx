"use client"

import { AppShell } from '@/components/layout/app-shell'
import { StudentAnnouncementsTab } from '@/components/student/student-announcements-tab'

export default function StudentAnnouncementsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with course and university announcements
          </p>
        </div>
        <StudentAnnouncementsTab />
      </div>
    </AppShell>
  )
}
