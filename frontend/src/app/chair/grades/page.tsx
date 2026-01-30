'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChairGradeReportsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grade Reports</h1>
          <p className="text-muted-foreground">
            Grade distribution and statistics across department courses
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Aggregated grade data for the current term</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect to API to load grade distribution data</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
