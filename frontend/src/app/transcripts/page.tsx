"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function TranscriptsPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Academic", href: "/academic" },
    { label: "Transcripts" }
  ]

  return (
    <ComingSoonPage
      title="Official Transcripts"
      description="Request and download official transcripts, view unofficial transcripts online"
      breadcrumbs={breadcrumbs}
    />
  )
}