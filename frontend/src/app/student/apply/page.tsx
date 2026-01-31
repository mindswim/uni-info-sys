'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { ApplyTab } from '@/components/student/apply-tab'

export default function StudentApplyPage() {
  return (
    <AppShell>
      <PageShell>
        <ApplyTab />
      </PageShell>
    </AppShell>
  )
}
