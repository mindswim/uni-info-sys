"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface Stat {
  label: string
  value: string | number
  change?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

interface AdminPageTemplateProps {
  title: string
  description: string
  icon?: LucideIcon
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  actions?: React.ReactNode
  stats?: Stat[]
  tabs?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminPageTemplate({
  title,
  description,
  icon: Icon,
  breadcrumbs = [],
  actions,
  stats = [],
  tabs,
  children,
  className
}: AdminPageTemplateProps) {
  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {Icon && <Icon className="h-8 w-8" />}
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className={cn(
            "grid gap-4",
            stats.length === 2 && "md:grid-cols-2",
            stats.length === 3 && "md:grid-cols-3",
            stats.length >= 4 && "md:grid-cols-4"
          )}>
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  {stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <p className={cn(
                      "text-xs",
                      getTrendColor(stat.trend)
                    )}>
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs or Content */}
        {tabs || children}
      </div>
    </AppShell>
  )
}