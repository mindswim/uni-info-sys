"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function EnrollmentPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Academic", href: "/academic" },
    { label: "Enrollment" }
  ]

  return (
    <ComingSoonPage
      title="Course Enrollment"
      description="Manage your course enrollments, add/drop courses, and view enrollment history"
      breadcrumbs={breadcrumbs}
    />
  )
}