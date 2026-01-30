"use client"

import { AppShell } from '@/components/layout/app-shell'
import { TuitionRatesTab } from '@/components/admin/tuition-rates-tab'

export default function AdminTuitionRatesPage() {
  return (
    <AppShell>
      <TuitionRatesTab />
    </AppShell>
  )
}
