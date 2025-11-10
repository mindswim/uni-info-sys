'use client'

import { BillingTab } from '@/components/student/billing-tab'

export default function StudentBillingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Billing</h1>
        <p className="text-muted-foreground">
          View your invoices and make payments
        </p>
      </div>
      <BillingTab />
    </div>
  )
}
