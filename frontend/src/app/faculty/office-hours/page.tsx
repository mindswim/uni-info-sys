'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FacultyOfficeHoursPage() {
  return (
    <AppShell>
      <PageShell
        title="Office Hours"
        description="Manage your weekly office hour availability"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Time Slot
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
                <CardDescription>No office hours scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click "Add Time Slot" to schedule office hours for {day}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageShell>
    </AppShell>
  )
}
