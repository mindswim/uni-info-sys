"use client"

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { DocumentsTab } from '@/components/admin/documents-tab'

export default function DocumentsPage() {
  return (
    <AppShell>
      <PageShell title="Document Verification" description="Review and verify student documents">
        <DocumentsTab />
      </PageShell>
    </AppShell>
  )
}
