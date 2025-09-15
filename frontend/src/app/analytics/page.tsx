"use client"

import { DataPageTemplate } from "@/components/templates/data-page-template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, BookOpen, GraduationCap, Building } from "lucide-react"

export default function AnalyticsPage() {
  const stats = [
    {
      label: "Total Students",
      value: "2,847",
      description: "+12% from last semester"
    },
    {
      label: "Active Applications",
      value: "573", 
      description: "For upcoming semester"
    },
    {
      label: "Course Sections",
      value: "284",
      description: "Across all departments"
    },
    {
      label: "Faculty Members",
      value: "156",
      description: "Full-time equivalent"
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Analytics" }
  ]

  return (
    <DataPageTemplate
      title="System Analytics"
      description="Comprehensive overview of university metrics and performance indicators"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enrollment Trends
            </CardTitle>
            <CardDescription>
              Student enrollment over the past 5 years
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>2024</span>
                  <span>2,847 students</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>2023</span>
                  <span>2,541 students</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>2022</span>
                  <span>2,398 students</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Popular Programs
            </CardTitle>
            <CardDescription>
              Most enrolled programs this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Computer Science</span>
                  <span>487 students</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Business Administration</span>
                  <span>423 students</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Engineering</span>
                  <span>356 students</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Department Overview
            </CardTitle>
            <CardDescription>
              Faculty distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Computer Science</span>
                <span className="text-sm font-medium">23 faculty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Business</span>
                <span className="text-sm font-medium">19 faculty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Engineering</span>
                <span className="text-sm font-medium">31 faculty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Liberal Arts</span>
                <span className="text-sm font-medium">28 faculty</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Utilization
            </CardTitle>
            <CardDescription>
              Average enrollment per course section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Undergraduate</span>
                  <span>78% capacity</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Graduate</span>
                  <span>65% capacity</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Online Courses</span>
                  <span>82% capacity</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DataPageTemplate>
  )
}