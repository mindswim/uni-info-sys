'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'

export default function FacultyRubricsPage() {
  return (
    <AppShell>
      <PageShell
        title="Rubrics"
        description="Create and manage grading rubrics for assignments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Rubric
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>My Rubrics</CardTitle>
            <CardDescription>Custom and template rubrics for structured grading</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Max Points</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No rubrics created yet. Create one to get started.
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
