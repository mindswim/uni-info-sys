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
  Edit2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { PersonaSwitcher } from "@/components/demo/persona-switcher"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
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
        { title: "Academic Records", url: "/academic-records", icon: FileText },
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
  advisor: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/advisor-dashboard", icon: Home },
        { title: "My Students", url: "/my-students", icon: Users },
        { title: "Appointments", url: "/advising-appointments", icon: Calendar },
        { title: "Schedule", url: "/schedule", icon: Calendar }
      ]
    },
    {
      title: "Advising Tools",
      items: [
        { title: "Degree Planning", url: "/degree-planning", icon: Target },
        { title: "Early Alerts", url: "/early-alerts", icon: AlertCircle },
        { title: "Student Notes", url: "/student-notes", icon: FileText },
        { title: "Referrals", url: "/referrals", icon: UserCheck }
      ]
    },
    {
      title: "Analytics",
      items: [
        { title: "Student Success", url: "/student-success", icon: TrendingUp },
        { title: "Retention Reports", url: "/retention-reports", icon: BarChart3 },
        { title: "Graduation Tracking", url: "/graduation-tracking", icon: GraduationCap }
      ]
    }
  ],
  bursar: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/financial-dashboard", icon: Home },
        { title: "Student Accounts", url: "/student-accounts", icon: Users },
        { title: "Daily Reports", url: "/daily-reports", icon: BarChart3 }
      ]
    },
    {
      title: "Billing & Payments",
      items: [
        { title: "Billing", url: "/billing", icon: Receipt },
        { title: "Payments", url: "/payments", icon: CreditCard },
        { title: "Payment Plans", url: "/payment-plans", icon: Calendar },
        { title: "Refunds", url: "/refunds", icon: DollarSign }
      ]
    },
    {
      title: "Financial Aid",
      items: [
        { title: "Aid Overview", url: "/financial-aid", icon: Award },
        { title: "Disbursements", url: "/disbursements", icon: DollarSign },
        { title: "Scholarships", url: "/scholarships", icon: Trophy },
        { title: "Work Study", url: "/work-study", icon: Briefcase }
      ]
    },
    {
      title: "Reports",
      items: [
        { title: "Accounts Receivable", url: "/accounts-receivable", icon: BarChart3 },
        { title: "Collections", url: "/collections", icon: AlertCircle },
        { title: "Tax Documents", url: "/tax-documents", icon: FileText }
      ]
    }
  ],
  registrar: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/registrar-dashboard", icon: Home },
        { title: "Daily Tasks", url: "/daily-tasks", icon: ClipboardCheck },
        { title: "Calendar", url: "/academic-calendar", icon: Calendar }
      ]
    },
    {
      title: "Records Management",
      items: [
        { title: "Transcript Requests", url: "/transcript-requests", icon: FileText },
        { title: "Enrollment Verification", url: "/enrollment-verification", icon: CheckCircle },
        { title: "Grade Changes", url: "/grade-changes", icon: Edit },
        { title: "Degree Verification", url: "/degree-verification", icon: GraduationCap }
      ]
    },
    {
      title: "Academic Operations",
      items: [
        { title: "Course Scheduling", url: "/course-scheduling", icon: Calendar },
        { title: "Room Assignment", url: "/room-assignment", icon: Building },
        { title: "Final Exams", url: "/final-exams", icon: ClipboardCheck },
        { title: "Graduation", url: "/graduation-clearance", icon: GraduationCap }
      ]
    },
    {
      title: "Compliance",
      items: [
        { title: "FERPA Management", url: "/ferpa", icon: Shield },
        { title: "Veterans Affairs", url: "/veterans", icon: Award },
        { title: "Athletic Eligibility", url: "/athletic-eligibility", icon: Trophy },
        { title: "Federal Reporting", url: "/federal-reporting", icon: FileText }
      ]
    }
  ],
  dean: [
    {
      title: "Dashboard",
      items: [
        { title: "College Overview", url: "/dean-dashboard", icon: Home },
        { title: "Strategic Initiatives", url: "/strategic-initiatives", icon: Target },
        { title: "Analytics", url: "/college-analytics", icon: TrendingUp }
      ]
    },
    {
      title: "Academic Governance",
      items: [
        { title: "Department Overview", url: "/department-overview", icon: Building },
        { title: "Faculty Management", url: "/faculty-management", icon: Users },
        { title: "Tenure Tracking", url: "/tenure-tracking", icon: Award },
        { title: "Curriculum Approval", url: "/curriculum-approval", icon: BookOpen }
      ]
    },
    {
      title: "Performance",
      items: [
        { title: "Research Metrics", url: "/research-metrics", icon: BarChart3 },
        { title: "Grant Management", url: "/grant-management", icon: DollarSign },
        { title: "Publications", url: "/publications", icon: FileText },
        { title: "Accreditation", url: "/accreditation", icon: Shield }
      ]
    }
  ],
  operations: [
    {
      title: "Dashboard",
      items: [
        { title: "Campus Overview", url: "/operations-dashboard", icon: Home },
        { title: "Work Orders", url: "/work-orders", icon: Wrench },
        { title: "Events", url: "/event-management", icon: Calendar }
      ]
    },
    {
      title: "Facilities",
      items: [
        { title: "Buildings", url: "/buildings", icon: Building },
        { title: "Rooms", url: "/rooms", icon: Grid3X3 },
        { title: "Maintenance", url: "/maintenance", icon: Wrench },
        { title: "Space Utilization", url: "/space-utilization", icon: BarChart3 }
      ]
    },
    {
      title: "Campus Services",
      items: [
        { title: "Dining Services", url: "/dining-services", icon: Package },
        { title: "Transportation", url: "/transportation", icon: Car },
        { title: "Parking", url: "/parking-management", icon: MapPin },
        { title: "Mail Services", url: "/mail-services", icon: Mail }
      ]
    },
    {
      title: "Safety & Security",
      items: [
        { title: "Emergency Management", url: "/emergency-management", icon: AlertCircle },
        { title: "Access Control", url: "/access-control", icon: Shield },
        { title: "Incident Reports", url: "/incident-reports", icon: FileText }
      ]
    }
  ],
  admin: [
    {
      title: "Dashboard",
      items: [
        { title: "Overview", url: "/", icon: Home },
        { title: "Interactive Demo", url: "/demo", icon: Play },
        { title: "Analytics", url: "/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "Student Management", 
      items: [
        { title: "Students", url: "/students", icon: Users },
        { title: "Admissions", url: "/admissions", icon: ClipboardCheck },
        { title: "Application Pipeline", url: "/pipeline", icon: GitBranch },
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

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const userRole = user?.roles[0]?.toLowerCase() || 'student'
  const roleNavigation = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.student

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border px-4 flex items-center justify-between">
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
            <nav className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="border-t border-border p-4">
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            {user?.roles.includes('admin') && (
              <>
                <DropdownMenuSeparator />
                <PersonaSwitcher variant="menu-item" />
              </>
            )}
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