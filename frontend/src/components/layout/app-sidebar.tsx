"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  GraduationCap, 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  Building,
  ClipboardCheck,
  Award,
  MessageSquare,
  Bell,
  User,
  LogOut,
  ChevronUp,
  PanelLeft,
  Database,
  Grid3X3
} from "lucide-react"
import Link from "next/link"

interface AppSidebarProps {
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
}

const navigationItems = {
  student: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/dashboard", icon: Home },
        { title: "My Courses", url: "/courses", icon: BookOpen },
        { title: "Schedule", url: "/schedule", icon: Calendar },
        { title: "Grades", url: "/grades", icon: Award }
      ]
    },
    {
      title: "Academic",
      items: [
        { title: "Course Catalog", url: "/course-catalog", icon: BookOpen },
        { title: "Enrollment", url: "/enrollment", icon: ClipboardCheck },
        { title: "Academic Records", url: "/records", icon: FileText },
        { title: "Transcripts", url: "/transcripts", icon: FileText }
      ]
    },
    {
      title: "Personal",
      items: [
        { title: "Profile", url: "/profile", icon: User },
        { title: "Notifications", url: "/notifications", icon: Bell },
        { title: "Messages", url: "/messages", icon: MessageSquare }
      ]
    }
  ],
  staff: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/dashboard", icon: Home },
        { title: "My Courses", url: "/courses", icon: BookOpen },
        { title: "Schedule", url: "/schedule", icon: Calendar }
      ]
    },
    {
      title: "Teaching",
      items: [
        { title: "Course Sections", url: "/sections", icon: BookOpen },
        { title: "Students", url: "/students", icon: Users },
        { title: "Gradebook", url: "/gradebook", icon: Award },
        { title: "Attendance", url: "/attendance", icon: UserCheck }
      ]
    },
    {
      title: "Academic",
      items: [
        { title: "Course Management", url: "/course-management", icon: Settings },
        { title: "Reports", url: "/reports", icon: BarChart3 },
        { title: "Academic Calendar", url: "/calendar", icon: Calendar }
      ]
    },
    {
      title: "Communication",
      items: [
        { title: "Messages", url: "/messages", icon: MessageSquare },
        { title: "Announcements", url: "/announcements", icon: Bell }
      ]
    }
  ],
  admin: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/dashboard", icon: Home },
        { title: "Analytics", url: "/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "Student Management", 
      items: [
        { title: "Students", url: "/students", icon: Users },
        { title: "Admissions", url: "/admissions", icon: ClipboardCheck },
        { title: "Enrollments", url: "/enrollments", icon: BookOpen },
        { title: "Academic Records", url: "/academic-records", icon: FileText }
      ]
    },
    {
      title: "Academic Structure",
      items: [
        { title: "Faculties", url: "/faculties", icon: Building },
        { title: "Departments", url: "/departments", icon: Building },
        { title: "Programs", url: "/programs", icon: GraduationCap },
        { title: "Courses", url: "/courses", icon: BookOpen },
        { title: "Course Catalog", url: "/course-catalog", icon: BookOpen }
      ]
    },
    {
      title: "Staff & Faculty",
      items: [
        { title: "All Staff", url: "/staff", icon: Users },
        { title: "Faculty Management", url: "/faculty", icon: Users },
        { title: "Course Assignments", url: "/assignments", icon: ClipboardCheck }
      ]
    },
    {
      title: "System",
      items: [
        { title: "System Overview", url: "/system", icon: Grid3X3 },
        { title: "Data Explorer", url: "/data-explorer", icon: Database },
        { title: "User Management", url: "/users", icon: Users },
        { title: "Roles & Permissions", url: "/roles", icon: Settings },
        { title: "System Settings", url: "/settings", icon: Settings },
        { title: "Reports", url: "/reports", icon: BarChart3 }
      ]
    }
  ]
}

export function AppSidebar({ user }: AppSidebarProps) {
  const userRole = user?.role?.toLowerCase() || 'student'
  const roleNavigation = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.student

  return (
    <Sidebar collapsible="icon" className="w-[280px]">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 relative">
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold truncate group-data-[collapsible=icon]:hidden">
              UniSys
            </span>
          </Link>
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:hidden" />
          
          {/* ChatGPT-style collapsed trigger */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center absolute inset-0 left-0 right-0">
            <SidebarTrigger className="relative group hover:bg-sidebar-accent rounded-md p-2 transition-colors">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 group-hover:opacity-0 transition-opacity duration-200" />
                <PanelLeft className="h-4 w-4 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" />
              </div>
            </SidebarTrigger>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {roleNavigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || 'Guest User'}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || 'guest@example.com'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || 'Guest User'}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || 'guest@example.com'}
                      </span>
                      {user?.role && (
                        <Badge variant="secondary" className="w-fit text-xs mt-1">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}