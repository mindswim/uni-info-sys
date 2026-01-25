'use client'

import { AppShell } from '@/components/layout/app-shell'
import { BillingTab } from '@/components/student/billing-tab'

export default function StudentBillingPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Billing</h1>
          <p className="text-muted-foreground">
            View your invoices and make payments
          </p>
        </div>
        <BillingTab />
      </div>
    </AppShell>
  )
}
