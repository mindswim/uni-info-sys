"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FacultyManagementPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">
            Manage faculty members and their assignments
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Faculty Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Faculty management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
