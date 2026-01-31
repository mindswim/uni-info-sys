'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { BillingTab } from '@/components/student/billing-tab'

export default function StudentBillingPage() {
  return (
    <AppShell>
      <PageShell title="My Billing" description="View your invoices and make payments">
        <BillingTab />
      </PageShell>
    </AppShell>
  )
}
