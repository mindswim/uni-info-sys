"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function SectionsPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Course Sections" }
  ]

  return (
    <ComingSoonPage
      title="Course Sections"
      description="Manage course sections, schedules, and student enrollments"
      breadcrumbs={breadcrumbs}
    />
  )
}