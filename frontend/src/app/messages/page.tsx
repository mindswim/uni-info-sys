"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function MessagesPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Personal", href: "/personal" },
    { label: "Messages" }
  ]

  return (
    <ComingSoonPage
      title="Messages"
      description="Communicate with instructors, advisors, and university staff"
      breadcrumbs={breadcrumbs}
    />
  )
}