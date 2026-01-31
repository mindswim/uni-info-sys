"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AnnouncementsTab } from '@/components/faculty/announcements-tab'

export default function AnnouncementsPage() {
  return (
    <AppShell>
      <PageShell title="Announcements" description="Create and manage announcements for your courses">
        <AnnouncementsTab />
      </PageShell>
    </AppShell>
  )
}
