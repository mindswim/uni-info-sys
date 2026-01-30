"use client"

import { AppShell } from '@/components/layout/app-shell'
import { GraduationTab } from '@/components/student/graduation-tab'

export default function StudentGraduationPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Graduation</h1>
          <p className="text-muted-foreground">
            Apply for graduation and track your application status
          </p>
        </div>
        <GraduationTab />
      </div>
    </AppShell>
  )
}
