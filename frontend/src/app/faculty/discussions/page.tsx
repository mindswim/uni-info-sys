'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FacultyDiscussionsPage() {
  return (
    <AppShell>
      <PageShell title="Discussion Forums" description="Manage course discussion forums across your sections">
        <Card>
          <CardHeader>
            <CardTitle>My Course Discussions</CardTitle>
            <CardDescription>Select a course section to view and manage its discussion topics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect to API to load your course sections and discussions</p>
          </CardContent>
        </Card>
      </PageShell>
    </AppShell>
  )
}
