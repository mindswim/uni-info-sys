"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AdmissionsTab } from '@/components/admin/admissions-tab'

export default function AdmissionsPage() {
  return (
    <AppShell>
      <PageShell title="Admissions" description="Manage student applications and admissions">
        <AdmissionsTab />
      </PageShell>
    </AppShell>
  )
}
