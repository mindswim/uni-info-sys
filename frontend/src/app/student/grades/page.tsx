"use client"

import { AppShell } from '@/components/layout/app-shell'
import { GradesTab } from '@/components/student/grades-tab'

export default function GradesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground">
            View your course grades and academic performance
          </p>
        </div>
        <GradesTab />
      </div>
    </AppShell>
  )
}
