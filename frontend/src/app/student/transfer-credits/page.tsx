'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'

export default function StudentTransferCreditsPage() {
  return (
    <AppShell>
      <PageShell
        title="Transfer Credits"
        description="View the status of your transfer credit evaluations"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Submit Transfer Credit
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Transfer Credit Status</CardTitle>
            <CardDescription>Credits transferred from other institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>External Course</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Equivalent Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transfer credits on file
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
