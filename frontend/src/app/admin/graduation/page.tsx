"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { GraduationApplicationsTab } from '@/components/admin/graduation-applications-tab'

export default function AdminGraduationPage() {
  return (
    <AppShell>
      <PageShell title="Graduation Applications" description="Review and process student graduation applications">
        <GraduationApplicationsTab />
      </PageShell>
    </AppShell>
  )
}
