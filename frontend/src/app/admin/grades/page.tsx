"use client"

import { AppShell } from '@/components/layout/app-shell'
import { GradesTab } from '@/components/admin/grades-tab'

export default function AdminGradesPage() {
  return (
    <AppShell>
      <GradesTab />
    </AppShell>
  )
}
