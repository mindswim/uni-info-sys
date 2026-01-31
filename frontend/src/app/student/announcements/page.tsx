"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { StudentAnnouncementsTab } from '@/components/student/student-announcements-tab'

export default function StudentAnnouncementsPage() {
  return (
    <AppShell>
      <PageShell title="Announcements" description="Stay updated with course and university announcements">
        <StudentAnnouncementsTab />
      </PageShell>
    </AppShell>
  )
}
