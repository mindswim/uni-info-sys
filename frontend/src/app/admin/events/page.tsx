"use client"

import { AppShell } from '@/components/layout/app-shell'
import { EventsTab } from '@/components/admin/events-tab'

export default function EventsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Events & Calendar</h1>
          <p className="text-muted-foreground">
            Manage academic events and calendar entries
          </p>
        </div>
        <EventsTab />
      </div>
    </AppShell>
  )
}
