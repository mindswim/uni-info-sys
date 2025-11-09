"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ApplyForm } from "@/components/admissions/apply-form"

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Apply" }
]

export default function ApplyPage() {
  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container max-w-4xl mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Apply to University</h1>
          <p className="text-xl text-muted-foreground">
            Start your academic journey with us
          </p>
        </div>

        <ApplyForm />
      </div>
    </AppShell>
  )
}
