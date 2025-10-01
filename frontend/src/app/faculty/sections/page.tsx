"use client"

import { AppShell } from '@/components/layout/app-shell'
import { SectionsTab } from '@/components/faculty/sections-tab'

export default function SectionsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Sections</h1>
          <p className="text-muted-foreground">
            View and manage your course sections
          </p>
        </div>
        <SectionsTab />
      </div>
    </AppShell>
  )
}
