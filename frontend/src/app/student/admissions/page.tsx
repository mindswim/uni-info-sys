'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AdmissionsStatusTab } from '@/components/student/admissions-status-tab'

export default function StudentAdmissionsPage() {
  return (
    <AppShell>
      <PageShell title="Application Status" description="Track your admission application progress and view decisions">
        <AdmissionsStatusTab />
      </PageShell>
    </AppShell>
  )
}
