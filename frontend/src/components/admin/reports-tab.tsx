"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"

export function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Enrollment Report</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Financial Report</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Academic Report</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Graduation Report</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Retention Report</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-sm">Compliance Report</span>
        </Button>
      </div>

      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Build custom reports with selected data points and filters
            </p>
            <div className="flex gap-2">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Build Report
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage automated report generation and distribution
          </p>
          {/* TODO: List of scheduled reports with frequency, recipients */}
        </CardContent>
      </Card>
    </div>
  )
}
