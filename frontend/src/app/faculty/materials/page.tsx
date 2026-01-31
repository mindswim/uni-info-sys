"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { MaterialsTab } from '@/components/faculty/materials-tab'

export default function MaterialsPage() {
  return (
    <AppShell>
      <PageShell title="Course Materials" description="Manage and share course materials with students">
        <MaterialsTab />
      </PageShell>
    </AppShell>
  )
}
