"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
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
      <PageShell title="Degree Requirements" description="Manage degree requirements by program">
        <DegreeRequirementsTab programId={programId ? parseInt(programId) : undefined} />
      </PageShell>
    </AppShell>
  )
}
