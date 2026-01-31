"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { TuitionRatesTab } from '@/components/admin/tuition-rates-tab'

export default function AdminTuitionRatesPage() {
  return (
    <AppShell>
      <PageShell>
        <TuitionRatesTab />
      </PageShell>
    </AppShell>
  )
}
