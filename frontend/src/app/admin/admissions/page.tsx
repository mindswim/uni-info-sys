"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AdmissionsTab } from '@/components/admin/admissions-tab'

export default function AdmissionsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Admissions</h1>
          <p className="text-muted-foreground">
            Manage student applications and admissions
          </p>
        </div>
        <AdmissionsTab />
      </div>
    </AppShell>
  )
}
