"use client"

import { AppShell } from '@/components/layout/app-shell'
import { RegistrationTab } from '@/components/student/registration-tab'

export default function RegistrationPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Registration</h1>
          <p className="text-muted-foreground">
            Register for courses and manage your enrollment
          </p>
        </div>
        <RegistrationTab />
      </div>
    </AppShell>
  )
}
