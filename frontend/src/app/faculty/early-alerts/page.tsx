'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'

export default function FacultyEarlyAlertsPage() {
  return (
    <AppShell>
      <PageShell
        title="Early Alerts"
        description="Flag at-risk students for advisor intervention"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Raise Alert
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>My Alerts</CardTitle>
            <CardDescription>Alerts you have raised for students in your sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No early alerts raised yet
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageShell>
    </AppShell>
  )
}
