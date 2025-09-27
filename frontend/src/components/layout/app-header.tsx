"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, Settings, User, LogOut, Moon, Sun, PanelLeft } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { GlobalSearch } from "@/components/global-search"
import { NotificationsPanel } from "@/components/notifications-panel"

interface AppHeaderProps {
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}

export function AppHeader({ user, breadcrumbs = [], sidebarCollapsed, onSidebarToggle }: AppHeaderProps) {

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile menu button - only show if we have toggle function */}
      {onSidebarToggle && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSidebarToggle}
          className="md:hidden"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex-1" />

      <div className="flex items-center space-x-2">
        <div className="hidden md:block w-64">
          <GlobalSearch />
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-4 w-4" />
        </Button>

        <NotificationsPanel />

        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Guest User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || 'guest@example.com'}</p>
                {user?.role && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    {user.role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}