"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { SectionsTab } from '@/components/faculty/sections-tab'

export default function SectionsPage() {
  return (
    <AppShell>
      <PageShell title="Sections" description="View and manage your course sections">
        <SectionsTab />
      </PageShell>
    </AppShell>
  )
}
