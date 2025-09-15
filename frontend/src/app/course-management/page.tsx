"use client"

import { ComingSoonPage } from "@/components/templates/data-page-template"

export default function CourseManagementPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Academic", href: "/academic" },
    { label: "Course Management" }
  ]

  return (
    <ComingSoonPage
      title="Course Management"
      description="Manage course curriculum, prerequisites, and academic requirements"
      breadcrumbs={breadcrumbs}
    />
  )
}