"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AnalyticsTab } from '@/components/admin/analytics-tab'

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            View system analytics and insights
          </p>
        </div>
        <AnalyticsTab />
      </div>
    </AppShell>
  )
}
