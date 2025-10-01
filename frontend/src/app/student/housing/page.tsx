"use client"

import { AppShell } from '@/components/layout/app-shell'
import { HousingTab } from '@/components/student/housing-tab'

export default function HousingPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Housing</h1>
          <p className="text-muted-foreground">
            View and manage your campus housing
          </p>
        </div>
        <HousingTab />
      </div>
    </AppShell>
  )
}
