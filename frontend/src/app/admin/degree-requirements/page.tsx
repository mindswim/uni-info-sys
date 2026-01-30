"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { DegreeRequirementsTab } from '@/components/admin/degree-requirements-tab'

export default function DegreeRequirementsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <DegreeRequirementsContent />
    </Suspense>
  )
}

function DegreeRequirementsContent() {
  const searchParams = useSearchParams()
  const programId = searchParams.get('program')

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Degree Requirements</h1>
          <p className="text-muted-foreground">
            Manage degree requirements by program
          </p>
        </div>
        <DegreeRequirementsTab programId={programId ? parseInt(programId) : undefined} />
      </div>
    </AppShell>
  )
}
