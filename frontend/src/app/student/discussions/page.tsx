'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentDiscussionsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground">
            Course discussion forums for your enrolled classes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Course Discussions</CardTitle>
            <CardDescription>Select a course to view its discussion forum</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect to API to load your enrolled courses and discussions</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
