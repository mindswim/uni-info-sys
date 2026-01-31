"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { StudentMaterialsTab } from '@/components/student/student-materials-tab'

export default function StudentMaterialsPage() {
  return (
    <AppShell>
      <PageShell title="Course Materials" description="Access your course readings and resources">
        <StudentMaterialsTab />
      </PageShell>
    </AppShell>
  )
}
