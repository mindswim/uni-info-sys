'use client'

import { AdmissionsStatusTab } from '@/components/student/admissions-status-tab'

export default function StudentAdmissionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
        <p className="text-muted-foreground">
          Track your admission application progress and view decisions
        </p>
      </div>
      <AdmissionsStatusTab />
    </div>
  )
}
