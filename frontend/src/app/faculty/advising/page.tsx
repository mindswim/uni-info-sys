"use client"

import { AppShell } from '@/components/layout/app-shell'
import { AdvisingTab } from '@/components/faculty/advising-tab'

export default function AdvisingPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Advising</h1>
          <p className="text-muted-foreground">
            Advise and mentor your assigned students
          </p>
        </div>
        <AdvisingTab />
      </div>
    </AppShell>
  )
}
