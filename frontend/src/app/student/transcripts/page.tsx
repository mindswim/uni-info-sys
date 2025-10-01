"use client"

import { AppShell } from '@/components/layout/app-shell'
import { TranscriptsTab } from '@/components/student/transcripts-tab'

export default function TranscriptsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Transcripts</h1>
          <p className="text-muted-foreground">
            Request and view your official transcripts
          </p>
        </div>
        <TranscriptsTab />
      </div>
    </AppShell>
  )
}
