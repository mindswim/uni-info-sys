"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AcademicRecordsTab } from '@/components/student/academic-records-tab'

export default function AcademicRecordsPage() {
  return (
    <AppShell>
      <PageShell title="Academic Records" description="View your academic history and progress">
        <AcademicRecordsTab />
      </PageShell>
    </AppShell>
  )
}
