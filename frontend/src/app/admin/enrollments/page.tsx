"use client"

import { AppShell } from '@/components/layout/app-shell'
import { EnrollmentsTab } from '@/components/admin/enrollments-tab'

export default function AdminEnrollmentsPage() {
  return (
    <AppShell>
      <EnrollmentsTab />
    </AppShell>
  )
}
