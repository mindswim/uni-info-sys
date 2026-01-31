"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { AnalyticsTab } from '@/components/admin/analytics-tab'

export default function AdminAnalyticsPage() {
  return (
    <AppShell>
      <PageShell>
        <AnalyticsTab />
      </PageShell>
    </AppShell>
  )
}
