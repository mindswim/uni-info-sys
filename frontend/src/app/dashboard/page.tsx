"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function DashboardPage() {
  const breadcrumbs = [
    { label: "Dashboard Overview" }
  ]

  return (
    <ComingSoonPage
      title="Dashboard Overview"
      description="Personalized dashboard with your courses, grades, and important notifications"
      breadcrumbs={breadcrumbs}
    />
  )
}