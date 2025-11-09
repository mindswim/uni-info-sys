"use client"

import { AppShell } from '@/components/layout/app-shell'
import { CoursesTab } from '@/components/admin/courses-tab'

export default function CoursesPage() {
  return (
    <AppShell>
      <CoursesTab />
    </AppShell>
  )
}
