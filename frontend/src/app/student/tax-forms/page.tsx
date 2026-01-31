'use client'

import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function StudentTaxFormsPage() {
  return (
    <AppShell>
      <PageShell title="Tax Forms (1098-T)" description="View and download your 1098-T tuition statements for tax filing">
        <Card>
          <CardHeader>
            <CardTitle>Available Tax Forms</CardTitle>
            <CardDescription>1098-T forms are generated annually for qualifying students</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Qualified Tuition</TableHead>
                  <TableHead>Scholarships/Grants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No 1098-T forms available yet
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
