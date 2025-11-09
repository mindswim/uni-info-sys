"use client"

import { AppShell } from '@/components/layout/app-shell'
import { TermsTab } from '@/components/admin/terms-tab'

export default function TermsManagementPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Terms</h1>
          <p className="text-muted-foreground">
            Manage academic terms and calendars
          </p>
        </div>
        <TermsTab />
      </div>
    </AppShell>
  )
}
