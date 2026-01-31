'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { FinancialAidTab } from '@/components/student/financial-aid-tab'

export default function StudentFinancialAidPage() {
  return (
    <AppShell>
      <PageShell title="Financial Aid" description="View your financial aid package, awards, and disbursement schedule">
        <FinancialAidTab />
      </PageShell>
    </AppShell>
  )
}
