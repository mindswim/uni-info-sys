"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function SchedulePage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Personal", href: "/personal" },
    { label: "Schedule" }
  ]

  return (
    <ComingSoonPage
      title="Class Schedule"
      description="View your weekly class schedule, exam dates, and important academic deadlines"
      breadcrumbs={breadcrumbs}
    />
  )
}