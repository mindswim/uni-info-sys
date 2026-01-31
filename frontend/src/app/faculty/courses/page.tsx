"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { CoursesTab } from '@/components/faculty/courses-tab'

export default function CourseManagementPage() {
  return (
    <AppShell>
      <PageShell title="Course Management" description="Manage course content and materials">
        <CoursesTab />
      </PageShell>
    </AppShell>
  )
}
