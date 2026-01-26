"use client"

import { Button } from "@/components/ui/button"
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
  Grid3X3,
  GitBranch,
  Play,
  DollarSign,
  CreditCard,
  Receipt,
  Target,
  AlertCircle,
  Briefcase,
  CheckCircle,
  Shield,
  TrendingUp,
  Package,
  Wrench,
  Trophy,
  Edit,
  Car,
  MapPin,
  Mail,
  Edit2,
  Building2,
  Megaphone,
  FolderOpen,
  PenTool
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigationItems = {
  student: [
    {
      title: "Home",
      items: [
        { title: "Dashboard", url: "/student", icon: Home }
      ]
    },
    {
      title: "Registration",
      items: [
        { title: "Register for Classes", url: "/student/registration", icon: ClipboardCheck },
        { title: "My Schedule", url: "/student/schedule", icon: Calendar },
        { title: "Drop/Add", url: "/student/drop-add", icon: Edit2 }
      ]
    },
    {
      title: "Academics",
      items: [
        { title: "Grades", url: "/student/grades", icon: Award },
        { title: "Degree Audit", url: "/student/degree-audit", icon: Target },
        { title: "Transcripts", url: "/student/transcripts", icon: FileText }
      ]
    },
    {
      title: "Financial",
      items: [
        { title: "Account Summary", url: "/student/billing", icon: DollarSign },
        { title: "Make Payment", url: "/student/payment", icon: CreditCard },
        { title: "Financial Aid", url: "/student/financial-aid", icon: Award }
      ]
    },
    {
      title: "My Info",
      items: [
        { title: "Holds & To-Do", url: "/student/holds", icon: AlertCircle },
        { title: "Advisor", url: "/student/advisor", icon: Users },
        { title: "Profile", url: "/profile", icon: User }
      ]
    },
    {
      title: "Resources",
      items: [
        { title: "Messages", url: "/messages", icon: MessageSquare },
        { title: "Announcements", url: "/student/announcements", icon: Megaphone },
        { title: "Academic Calendar", url: "/student/calendar", icon: Calendar }
      ]
    }
  ],
  staff: [
    {
      title: "Home",
      items: [
        { title: "Dashboard", url: "/faculty", icon: Home }
      ]
    },
    {
      title: "My Classes",
      items: [
        { title: "Current Sections", url: "/faculty/sections", icon: BookOpen },
        { title: "Rosters", url: "/faculty/students", icon: Users },
        { title: "Attendance", url: "/faculty/attendance", icon: ClipboardCheck },
        { title: "Gradebook", url: "/faculty/grades", icon: Award }
      ]
    },
    {
      title: "Course Content",
      items: [
        { title: "Assignments", url: "/faculty/assignments", icon: PenTool },
        { title: "Materials", url: "/faculty/materials", icon: FolderOpen },
        { title: "Announcements", url: "/faculty/announcements", icon: Megaphone }
      ]
    },
    {
      title: "Advising",
      items: [
        { title: "My Advisees", url: "/faculty/advisees", icon: Users },
        { title: "Appointments", url: "/faculty/appointments", icon: Calendar }
      ]
    },
    {
      title: "Resources",
      items: [
        { title: "Messages", url: "/messages", icon: MessageSquare },
        { title: "Profile", url: "/profile", icon: User }
      ]
    }
  ],
  admin: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/admin", icon: Home },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "People",
      items: [
        { title: "Students", url: "/admin/students", icon: Users },
        { title: "Faculty & Staff", url: "/admin/faculty", icon: UserCheck },
        { title: "User Accounts", url: "/admin/system", icon: Shield }
      ]
    },
    {
      title: "Academics",
      items: [
        { title: "Programs", url: "/admin/programs", icon: GraduationCap },
        { title: "Courses", url: "/admin/courses", icon: BookOpen },
        { title: "Sections", url: "/admin/sections", icon: Calendar },
        { title: "Terms", url: "/admin/terms", icon: Calendar }
      ]
    },
    {
      title: "Enrollment",
      items: [
        { title: "Registration", url: "/admin/enrollments", icon: ClipboardCheck },
        { title: "Holds Management", url: "/admin/holds", icon: AlertCircle },
        { title: "Waitlists", url: "/admin/waitlists", icon: Users },
        { title: "Grades", url: "/admin/grades", icon: Award }
      ]
    },
    {
      title: "Admissions",
      items: [
        { title: "Applications", url: "/admin/admissions", icon: FileText },
        { title: "Review Queue", url: "/admin/admissions/review", icon: ClipboardCheck }
      ]
    },
    {
      title: "Financials",
      items: [
        { title: "Billing", url: "/admin/billing", icon: DollarSign },
        { title: "Financial Aid", url: "/admin/financial-aid", icon: Award }
      ]
    },
    {
      title: "Structure",
      items: [
        { title: "Faculties", url: "/admin/faculties", icon: Building2 },
        { title: "Departments", url: "/admin/departments", icon: Building },
        { title: "Buildings", url: "/admin/buildings", icon: Building2 }
      ]
    },
    {
      title: "Communications",
      items: [
        { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
        { title: "Messages", url: "/messages", icon: MessageSquare }
      ]
    },
    {
      title: "System",
      items: [
        { title: "Settings", url: "/admin/settings", icon: Settings },
        { title: "Profile", url: "/profile", icon: User }
      ]
    }
  ]
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const userRole = user?.roles[0]?.toLowerCase() || 'student'
  const roleNavigation = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.student

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border px-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center space-x-2 min-w-0 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground whitespace-nowrap">
              UniSys
            </span>
          )}
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="h-8 w-8 shrink-0 group"
        >
          <div className="relative w-4 h-4">
            <GraduationCap className={`h-4 w-4 transition-opacity duration-200 ${collapsed ? 'group-hover:opacity-0' : 'opacity-100'}`} />
            <PanelLeft className={`h-4 w-4 absolute inset-0 transition-all duration-200 ${
              collapsed 
                ? 'rotate-180 opacity-0 group-hover:opacity-100' 
                : 'opacity-100'
            }`} />
          </div>
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {roleNavigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
                >
                  <item.icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="border-t border-border p-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start p-2 h-auto hover:bg-accent ${collapsed ? 'px-0' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 text-left flex-1">
                  <div className="text-sm font-medium">{user?.name || 'Guest User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || 'guest@example.com'}
                  </div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{user?.name || 'Guest User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || 'guest@example.com'}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}