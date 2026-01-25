"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AnnouncementsTab } from '@/components/faculty/announcements-tab'

export default function AnnouncementsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for your courses
          </p>
        </div>
        <AnnouncementsTab />
      </div>
    </AppShell>
  )
}
