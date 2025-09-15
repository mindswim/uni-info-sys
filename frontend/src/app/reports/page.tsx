"use client"

import { DataPageTemplate } from "@/components/templates/data-page-template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Calendar, Download, Eye, Filter, FileText, BarChart3, Users, GraduationCap, Building, TrendingUp, Clock } from "lucide-react"

export default function ReportsPage() {
  const stats = [
    {
      label: "Generated Reports",
      value: "1,247",
      description: "This academic year"
    },
    {
      label: "Scheduled Reports",
      value: "18", 
      description: "Auto-generated weekly"
    },
    {
      label: "Custom Reports",
      value: "89",
      description: "Created by users"
    },
    {
      label: "Data Export",
      value: "156GB",
      description: "Total data exported"
    }
  ]

  const reportCategories = [
    {
      category: "Academic Reports",
      icon: GraduationCap,
      reports: [
        {
          name: "Student Enrollment Report",
          description: "Comprehensive enrollment statistics by program and term",
          frequency: "Weekly",
          lastGenerated: "2024-12-10",
          format: "PDF, Excel",
          status: "Ready"
        },
        {
          name: "Course Performance Analysis",
          description: "Grade distribution and success rates across all courses",
          frequency: "Monthly",
          lastGenerated: "2024-12-08",
          format: "PDF, CSV",
          status: "Generating"
        },
        {
          name: "Academic Progress Tracking",
          description: "Student progression through degree requirements",
          frequency: "Semester",
          lastGenerated: "2024-11-30",
          format: "Excel, PDF",
          status: "Ready"
        }
      ]
    },
    {
      category: "Administrative Reports", 
      icon: Building,
      reports: [
        {
          name: "Faculty Workload Report",
          description: "Teaching assignments and course load distribution",
          frequency: "Monthly",
          lastGenerated: "2024-12-09",
          format: "PDF, Excel",
          status: "Ready"
        },
        {
          name: "Department Resource Utilization",
          description: "Classroom and lab usage statistics",
          frequency: "Weekly",
          lastGenerated: "2024-12-11",
          format: "Excel, CSV",
          status: "Ready"
        },
        {
          name: "Budget and Financial Summary",
          description: "Department spending and budget allocation overview",
          frequency: "Quarterly",
          lastGenerated: "2024-12-01",
          format: "PDF, Excel",
          status: "Scheduled"
        }
      ]
    },
    {
      category: "Student Reports",
      icon: Users,
      reports: [
        {
          name: "Admission Pipeline Report",
          description: "Application status and conversion rates",
          frequency: "Daily",
          lastGenerated: "2024-12-12",
          format: "PDF, CSV",
          status: "Ready"
        },
        {
          name: "Student Demographics Analysis",
          description: "Diversity and demographic breakdown",
          frequency: "Semester",
          lastGenerated: "2024-11-28",
          format: "PDF, Excel",
          status: "Ready"
        },
        {
          name: "Retention and Graduation Rates",
          description: "Student retention and completion statistics",
          frequency: "Annual",
          lastGenerated: "2024-08-15",
          format: "PDF, Excel",
          status: "Scheduled"
        }
      ]
    }
  ]

  const recentReports = [
    {
      name: "Fall 2024 Enrollment Summary",
      type: "Academic",
      generatedAt: "2024-12-12 09:30",
      size: "2.4 MB",
      format: "PDF",
      downloads: 23
    },
    {
      name: "Faculty Teaching Load Q4",
      type: "Administrative", 
      generatedAt: "2024-12-11 14:15",
      size: "1.8 MB",
      format: "Excel",
      downloads: 12
    },
    {
      name: "Student Progress Analytics",
      type: "Academic",
      generatedAt: "2024-12-10 11:45",
      size: "5.2 MB", 
      format: "PDF",
      downloads: 41
    },
    {
      name: "Admission Funnel Analysis",
      type: "Student",
      generatedAt: "2024-12-09 16:20",
      size: "3.1 MB",
      format: "CSV",
      downloads: 8
    }
  ]

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "System", href: "/system" },
    { label: "Reports" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-800'
      case 'Generating': return 'bg-blue-100 text-blue-800'
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DataPageTemplate
      title="Reports & Analytics"
      description="Generate, schedule, and manage comprehensive reports across all university operations"
      stats={stats}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic Reports</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="student">Student Reports</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePickerWithRange />
            
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Bulk Export
            </Button>
          </div>

          <div className="space-y-8">
            {reportCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    {category.reports.length} available reports in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {category.reports.map((report, reportIndex) => (
                      <div key={reportIndex} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1 flex-1">
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.description}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Generated {report.frequency}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Last: {report.lastGenerated}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{report.format}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recently Generated Reports
              </CardTitle>
              <CardDescription>
                Reports generated in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.type} • Generated {report.generatedAt}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {report.size} • {report.format} • {report.downloads} downloads
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>
                Automated report generation schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Scheduled Reports</h3>
                <p>Report scheduling interface coming soon</p>
                <p className="text-sm mt-2">Configure automatic report generation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>
                Create custom reports with specific data sets and filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Custom Report Builder</h3>
                <p>Drag-and-drop report builder coming soon</p>
                <p className="text-sm mt-2">Create custom reports with your specific requirements</p>
                <Button className="mt-4">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Request Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DataPageTemplate>
  )
}