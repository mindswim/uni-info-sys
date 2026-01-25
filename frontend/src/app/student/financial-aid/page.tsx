'use client'

import { FinancialAidTab } from '@/components/student/financial-aid-tab'

export default function StudentFinancialAidPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Financial Aid</h1>
        <p className="text-muted-foreground">
          View your financial aid package, awards, and disbursement schedule
        </p>
      </div>
      <FinancialAidTab />
    </div>
  )
}
