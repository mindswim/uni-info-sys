"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function RecordsPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Academic", href: "/academic" },
    { label: "Academic Records" }
  ]

  return (
    <ComingSoonPage
      title="Academic Records"
      description="Access your complete academic history, degree progress, and official transcripts"
      breadcrumbs={breadcrumbs}
    />
  )
}