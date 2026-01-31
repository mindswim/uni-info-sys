"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { CourseSectionsTab } from '@/components/admin/sections-tab'

export default function CourseSectionsPage() {
  return (
    <AppShell>
      <PageShell>
        <CourseSectionsTab />
      </PageShell>
    </AppShell>
  )
}
