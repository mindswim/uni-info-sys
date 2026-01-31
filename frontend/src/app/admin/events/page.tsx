"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { EventsTab } from '@/components/admin/events-tab'

export default function EventsPage() {
  return (
    <AppShell>
      <PageShell title="Events & Calendar" description="Manage academic events and calendar entries">
        <EventsTab />
      </PageShell>
    </AppShell>
  )
}
