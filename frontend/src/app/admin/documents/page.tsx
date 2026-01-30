"use client"

import { AppShell } from '@/components/layout/app-shell'
import { DocumentsTab } from '@/components/admin/documents-tab'

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Document Verification</h1>
          <p className="text-muted-foreground">
            Review and verify student documents
          </p>
        </div>
        <DocumentsTab />
      </div>
    </AppShell>
  )
}
