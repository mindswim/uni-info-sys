"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { RegistrationTab } from '@/components/student/registration-tab'

export default function RegistrationPage() {
  return (
    <AppShell>
      <PageShell>
        <RegistrationTab />
      </PageShell>
    </AppShell>
  )
}
