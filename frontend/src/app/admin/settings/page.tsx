"use client"

import { AppShell } from '@/components/layout/app-shell'
import { SettingsTab } from '@/components/admin/settings-tab'

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
        <SettingsTab />
      </div>
    </AppShell>
  )
}
