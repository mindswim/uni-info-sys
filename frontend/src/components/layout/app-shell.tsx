"use client"

import { useState } from "react"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { useAuth } from "@/components/auth/auth-provider"

interface AppShellProps {
  children: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  return (
    <div className={`min-h-screen transition-all duration-300 ${
      sidebarCollapsed 
        ? 'grid grid-cols-[60px_1fr]' 
        : 'grid grid-cols-[280px_1fr]'
    }`}>
      {/* Sidebar */}
      <div className="border-r border-border bg-card">
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col overflow-hidden">
        <AppHeader 
          user={user} 
          breadcrumbs={breadcrumbs}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="min-h-[calc(100vh-120px)] rounded-xl bg-muted/50 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}