"use client"

import { AppShell } from '@/components/layout/app-shell'
import { CareerTab } from '@/components/student/career-tab'

export default function CareerServicesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Career Services</h1>
          <p className="text-muted-foreground">
            Explore career opportunities and resources
          </p>
        </div>
        <CareerTab />
      </div>
    </AppShell>
  )
}
