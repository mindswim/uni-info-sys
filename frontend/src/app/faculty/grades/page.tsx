"use client"

import { AppShell } from '@/components/layout/app-shell'
import { GradesTab } from '@/components/faculty/grades-tab'

export default function GradesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground">
            Enter and manage student grades
          </p>
        </div>
        <GradesTab />
      </div>
    </AppShell>
  )
}
