"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Tab {
  value: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
}

interface DashboardLayoutProps {
  title: string
  description?: string
  tabs: Tab[]
  defaultTab?: string
  action?: React.ReactNode
}

/**
 * DashboardLayout - Tabbed dashboard pattern
 *
 * Use this for consolidating related pages into a single dashboard view.
 * Perfect for student/faculty/admin dashboards with multiple sections.
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   title="Student Dashboard"
 *   description="View your academic information"
 *   tabs={[
 *     { value: 'overview', label: 'Overview', content: <OverviewTab /> },
 *     { value: 'grades', label: 'Grades', content: <GradesTab /> }
 *   ]}
 * />
 * ```
 */
export function DashboardLayout({
  title,
  description,
  tabs,
  defaultTab,
  action
}: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue={defaultTab || tabs[0]?.value} className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
