"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { EnrollmentsTab } from '@/components/admin/enrollments-tab'

export default function AdminEnrollmentsPage() {
  return (
    <AppShell>
      <PageShell>
        <EnrollmentsTab />
      </PageShell>
    </AppShell>
  )
}
