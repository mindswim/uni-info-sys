"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Download, Filter } from "lucide-react"

interface DataPageTemplateProps {
  title: string
  description: string
  stats?: Array<{
    label: string
    value: string | number
    description?: string
  }>
  children: React.ReactNode
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function DataPageTemplate({ 
  title, 
  description, 
  stats = [], 
  children, 
  actions,
  breadcrumbs = []
}: DataPageTemplateProps) {
  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {actions || (
              <>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </AppShell>
  )
}

// Coming Soon placeholder
export function ComingSoonPage({ 
  title, 
  description,
  breadcrumbs = []
}: { 
  title: string
  description: string 
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <DataPageTemplate 
      title={title} 
      description={description}
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature is currently under development and will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Feature in Development</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We're working hard to bring you this functionality. Check back soon!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DataPageTemplate>
  )
}