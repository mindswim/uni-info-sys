"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function ProfilePage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Personal", href: "/personal" },
    { label: "Profile" }
  ]

  return (
    <ComingSoonPage
      title="Student Profile"
      description="Manage your personal information, contact details, and account settings"
      breadcrumbs={breadcrumbs}
    />
  )
}