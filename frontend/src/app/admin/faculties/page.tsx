"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { FacultiesTab } from '@/components/admin/faculties-tab'

export default function FacultiesPage() {
  return (
    <AppShell>
      <PageShell>
        <FacultiesTab />
      </PageShell>
    </AppShell>
  )
}
