"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AppointmentsTab } from '@/components/faculty/appointments-tab'

export default function AppointmentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your appointment schedule
          </p>
        </div>
        <AppointmentsTab />
      </div>
    </AppShell>
  )
}
