'use client'

import { AppShell } from '@/components/layout/app-shell'
import { FinancialAidTab } from '@/components/student/financial-aid-tab'

export default function StudentFinancialAidPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Aid</h1>
          <p className="text-muted-foreground">
            View your financial aid package, awards, and disbursement schedule
          </p>
        </div>
        <FinancialAidTab />
      </div>
    </AppShell>
  )
}
