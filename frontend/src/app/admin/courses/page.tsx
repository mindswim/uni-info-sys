"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { CoursesTab } from '@/components/admin/courses-tab'

export default function CoursesPage() {
  return (
    <AppShell>
      <PageShell>
        <CoursesTab />
      </PageShell>
    </AppShell>
  )
}
