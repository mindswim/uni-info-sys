"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { TermsTab } from '@/components/admin/terms-tab'

export default function TermsManagementPage() {
  return (
    <AppShell>
      <PageShell title="Academic Terms" description="Manage academic terms and calendars">
        <TermsTab />
      </PageShell>
    </AppShell>
  )
}
