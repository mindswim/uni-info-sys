'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

export default function AdminTransferCreditsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transfer Credit Evaluation</h1>
            <p className="text-muted-foreground">
              Evaluate transfer credits and manage course equivalency mappings
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Equivalency
          </Button>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Evaluation</TabsTrigger>
            <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
            <TabsTrigger value="equivalencies">Equivalency Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transfer Credits</CardTitle>
                <CardDescription>Credits awaiting evaluation and course mapping</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>External Course</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pending transfer credits
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluated">
            <Card>
              <CardHeader>
                <CardTitle>Evaluated Transfer Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Connect to API to load evaluated credits</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equivalencies">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Approved Equivalency Mappings</CardTitle>
                <CardDescription>Automatically applied when matching transfer credits are submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Connect to API to load equivalency mappings</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
