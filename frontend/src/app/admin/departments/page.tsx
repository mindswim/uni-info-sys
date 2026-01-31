"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { DepartmentsTab } from '@/components/admin/departments-tab'

export default function DepartmentsPage() {
  return (
    <AppShell>
      <PageShell>
        <DepartmentsTab />
      </PageShell>
    </AppShell>
  )
}
