'use client'

import { ApplyTab } from '@/components/student/apply-tab'

export default function StudentApplyPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Submit and track your program applications
        </p>
      </div>
      <ApplyTab />
    </div>
  )
}
