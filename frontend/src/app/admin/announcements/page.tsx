"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AdminAnnouncementsTab } from '@/components/admin/announcements-tab'

export default function AdminAnnouncementsPage() {
  return (
    <AppShell>
      <PageShell title="Announcements" description="Manage university-wide and departmental announcements">
        <AdminAnnouncementsTab />
      </PageShell>
    </AppShell>
  )
}
