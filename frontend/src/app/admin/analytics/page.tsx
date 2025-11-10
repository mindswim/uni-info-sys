"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AnalyticsTab } from '@/components/admin/analytics-tab'

export default function AdminAnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsTab />
    </AppShell>
  )
}
