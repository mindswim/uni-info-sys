"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { MyStudentsTab } from '@/components/faculty/my-students-tab'

export default function MyStudentsPage() {
  return (
    <AppShell>
      <PageShell title="My Students" description="Manage and view information about your students">
        <MyStudentsTab />
      </PageShell>
    </AppShell>
  )
}
