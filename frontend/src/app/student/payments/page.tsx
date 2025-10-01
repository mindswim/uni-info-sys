"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PaymentsTab } from '@/components/student/payments-tab'

export default function PaymentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            View and manage your tuition and fees
          </p>
        </div>
        <PaymentsTab />
      </div>
    </AppShell>
  )
}
