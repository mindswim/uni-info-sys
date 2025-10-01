"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AlumniTab } from '@/components/admin/alumni-tab'

export default function AlumniPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Alumni</h1>
          <p className="text-muted-foreground">
            Manage alumni records and engagement
          </p>
        </div>
        <AlumniTab />
      </div>
    </AppShell>
  )
}
