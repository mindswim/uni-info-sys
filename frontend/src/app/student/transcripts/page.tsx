"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { TranscriptsTab } from '@/components/student/transcripts-tab'

export default function TranscriptsPage() {
  return (
    <AppShell>
      <PageShell>
        <TranscriptsTab />
      </PageShell>
    </AppShell>
  )
}
