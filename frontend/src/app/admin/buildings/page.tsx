"use client"

import { AppShell } from '@/components/layout/app-shell'
import { BuildingsTab } from '@/components/admin/buildings-tab'

export default function BuildingsManagementPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Buildings & Rooms</h1>
          <p className="text-muted-foreground">
            Manage campus infrastructure and facilities
          </p>
        </div>
        <BuildingsTab />
      </div>
    </AppShell>
  )
}
