'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FacultyDiscussionsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussion Forums</h1>
          <p className="text-muted-foreground">
            Manage course discussion forums across your sections
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Course Discussions</CardTitle>
            <CardDescription>Select a course section to view and manage its discussion topics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect to API to load your course sections and discussions</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
