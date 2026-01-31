'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentDiscussionsPage() {
  return (
    <AppShell>
      <PageShell title="Discussions" description="Course discussion forums for your enrolled classes">
        <Card>
          <CardHeader>
            <CardTitle>My Course Discussions</CardTitle>
            <CardDescription>Select a course to view its discussion forum</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect to API to load your enrolled courses and discussions</p>
          </CardContent>
        </Card>
      </PageShell>
    </AppShell>
  )
}
