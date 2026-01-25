"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AdminAnnouncementsTab } from '@/components/admin/announcements-tab'

export default function AdminAnnouncementsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Manage university-wide and departmental announcements
          </p>
        </div>
        <AdminAnnouncementsTab />
      </div>
    </AppShell>
  )
}
