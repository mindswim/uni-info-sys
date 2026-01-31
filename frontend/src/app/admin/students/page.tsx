"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { StudentsTab } from '@/components/admin/students-tab'

export default function StudentsPage() {
  return (
    <AppShell>
      <PageShell title="Students" description="Manage all student records and information">
        <StudentsTab />
      </PageShell>
    </AppShell>
  )
}
