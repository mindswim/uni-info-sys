"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import {
  Search,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Building,
  ClipboardCheck,
  Award,
  MessageSquare,
  User,
  Home,
  DollarSign,
  Shield,
  Clock,
  ArrowRight,
  Megaphone,
  Building2,
  PenTool,
  FolderOpen,
  Moon,
  Sun,
  LogOut,
  Plus,
} from "lucide-react"

interface SearchItem {
  id: string
  title: string
  description?: string
  category: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[]
  badge?: string
  shortcut?: string
  roles?: string[]
}

// Role-specific navigation items
const getNavigationItems = (role: string): SearchItem[] => {
  const commonItems: SearchItem[] = [
    {
      id: "messages",
      title: "Messages",
      description: "View conversations and send messages",
      category: "Communication",
      url: "/messages",
      icon: MessageSquare,
      keywords: ["chat", "inbox", "conversations"]
    },
    {
      id: "profile",
      title: "Profile",
      description: "View and edit your profile",
      category: "Account",
      url: "/profile",
      icon: User,
      keywords: ["account", "settings", "personal"]
    },
  ]

  if (role === 'admin') {
    return [
      // Dashboard
      {
        id: "admin-overview",
        title: "Admin Dashboard",
        description: "System overview and statistics",
        category: "Dashboard",
        url: "/admin",
        icon: Home,
        keywords: ["home", "overview", "main"],
        shortcut: "G H"
      },
      {
        id: "analytics",
        title: "Analytics",
        description: "View system analytics and reports",
        category: "Dashboard",
        url: "/admin/analytics",
        icon: BarChart3,
        keywords: ["reports", "statistics", "data"]
      },
      // Users
      {
        id: "students",
        title: "Students",
        description: "Manage student records",
        category: "Users",
        url: "/admin/students",
        icon: Users,
        keywords: ["pupils", "learners", "roster"],
        shortcut: "G S"
      },
      {
        id: "faculty",
        title: "Faculty",
        description: "Manage faculty and instructors",
        category: "Users",
        url: "/admin/faculty",
        icon: GraduationCap,
        keywords: ["teachers", "professors", "instructors"]
      },
      {
        id: "staff",
        title: "Staff",
        description: "Manage staff members",
        category: "Users",
        url: "/admin/staff",
        icon: Shield,
        keywords: ["employees", "admin"]
      },
      // Academic
      {
        id: "programs",
        title: "Programs",
        description: "Manage degree programs",
        category: "Academic",
        url: "/admin/programs",
        icon: GraduationCap,
        keywords: ["degrees", "majors"]
      },
      {
        id: "courses",
        title: "Courses",
        description: "Course catalog management",
        category: "Academic",
        url: "/admin/courses",
        icon: BookOpen,
        keywords: ["classes", "subjects", "curriculum"],
        shortcut: "G C"
      },
      {
        id: "sections",
        title: "Course Sections",
        description: "Manage course sections",
        category: "Academic",
        url: "/admin/sections",
        icon: Calendar,
        keywords: ["classes", "schedule"]
      },
      {
        id: "grades",
        title: "Grades",
        description: "Manage student grades",
        category: "Academic",
        url: "/admin/grades",
        icon: Award,
        keywords: ["marks", "scores"]
      },
      {
        id: "enrollments",
        title: "Enrollments",
        description: "Manage student enrollments",
        category: "Academic",
        url: "/admin/enrollments",
        icon: ClipboardCheck,
        keywords: ["registration"]
      },
      // Structure
      {
        id: "faculties",
        title: "Faculties",
        description: "Manage faculties",
        category: "Structure",
        url: "/admin/faculties",
        icon: Building2,
        keywords: ["schools", "colleges"]
      },
      {
        id: "departments",
        title: "Departments",
        description: "Manage departments",
        category: "Structure",
        url: "/admin/departments",
        icon: Building,
        keywords: ["units"]
      },
      {
        id: "terms",
        title: "Terms",
        description: "Manage academic terms",
        category: "Structure",
        url: "/admin/terms",
        icon: Calendar,
        keywords: ["semesters", "quarters"]
      },
      {
        id: "buildings",
        title: "Buildings",
        description: "Manage campus buildings",
        category: "Structure",
        url: "/admin/buildings",
        icon: Building2,
        keywords: ["rooms", "facilities"]
      },
      // Admissions
      {
        id: "applications",
        title: "Applications",
        description: "Review admission applications",
        category: "Admissions",
        url: "/admin/admissions",
        icon: FileText,
        keywords: ["applicants", "review"],
        shortcut: "G A"
      },
      // Communications
      {
        id: "announcements",
        title: "Announcements",
        description: "Manage announcements",
        category: "Communications",
        url: "/admin/announcements",
        icon: Megaphone,
        keywords: ["news", "notifications"]
      },
      // System
      {
        id: "system",
        title: "System Settings",
        description: "User and role management",
        category: "System",
        url: "/admin/system",
        icon: Settings,
        keywords: ["settings", "config", "roles"]
      },
      ...commonItems,
    ]
  }

  if (role === 'staff') {
    return [
      {
        id: "faculty-overview",
        title: "Faculty Dashboard",
        description: "Your teaching overview",
        category: "Dashboard",
        url: "/faculty",
        icon: Home,
        keywords: ["home", "overview"]
      },
      {
        id: "my-students",
        title: "My Students",
        description: "Students in your courses",
        category: "Teaching",
        url: "/faculty/students",
        icon: Users,
        keywords: ["roster", "class list"]
      },
      {
        id: "my-sections",
        title: "My Sections",
        description: "Your course sections",
        category: "Teaching",
        url: "/faculty/sections",
        icon: BookOpen,
        keywords: ["classes", "courses"]
      },
      {
        id: "assignments",
        title: "Assignments",
        description: "Manage assignments",
        category: "Teaching",
        url: "/faculty/assignments",
        icon: PenTool,
        keywords: ["homework", "projects"]
      },
      {
        id: "materials",
        title: "Course Materials",
        description: "Upload and manage materials",
        category: "Teaching",
        url: "/faculty/materials",
        icon: FolderOpen,
        keywords: ["files", "resources"]
      },
      {
        id: "announcements",
        title: "Announcements",
        description: "Course announcements",
        category: "Teaching",
        url: "/faculty/announcements",
        icon: Megaphone,
        keywords: ["news"]
      },
      {
        id: "grades",
        title: "Grades",
        description: "Enter and manage grades",
        category: "Grading",
        url: "/faculty/grades",
        icon: Award,
        keywords: ["marks", "scores"]
      },
      {
        id: "attendance",
        title: "Attendance",
        description: "Track attendance",
        category: "Grading",
        url: "/faculty/attendance",
        icon: ClipboardCheck,
        keywords: ["present", "absent"]
      },
      ...commonItems,
    ]
  }

  // Student role (default)
  return [
    {
      id: "student-overview",
      title: "Student Dashboard",
      description: "Your academic overview",
      category: "Dashboard",
      url: "/student",
      icon: Home,
      keywords: ["home", "overview"],
      shortcut: "G H"
    },
    // Academic
    {
      id: "academic-records",
      title: "Academic Records",
      description: "View your academic history",
      category: "Academic",
      url: "/student/academic-records",
      icon: Award,
      keywords: ["transcript", "history"]
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "View your class schedule",
      category: "Academic",
      url: "/student/schedule",
      icon: Calendar,
      keywords: ["timetable", "classes"]
    },
    {
      id: "grades",
      title: "Grades",
      description: "View your grades",
      category: "Academic",
      url: "/student/grades",
      icon: Award,
      keywords: ["marks", "scores", "gpa"],
      shortcut: "G G"
    },
    {
      id: "transcripts",
      title: "Transcripts",
      description: "Request official transcripts",
      category: "Academic",
      url: "/student/transcripts",
      icon: FileText,
      keywords: ["official", "records"]
    },
    // Courses
    {
      id: "enrollments",
      title: "My Enrollments",
      description: "View enrolled courses",
      category: "Courses",
      url: "/student/enrollments",
      icon: BookOpen,
      keywords: ["classes", "courses"]
    },
    {
      id: "registration",
      title: "Course Registration",
      description: "Register for courses",
      category: "Courses",
      url: "/student/registration",
      icon: ClipboardCheck,
      keywords: ["enroll", "signup", "add"],
      shortcut: "G R"
    },
    {
      id: "assignments",
      title: "Assignments",
      description: "View and submit assignments",
      category: "Courses",
      url: "/student/assignments",
      icon: PenTool,
      keywords: ["homework", "projects"]
    },
    {
      id: "materials",
      title: "Course Materials",
      description: "Access course materials",
      category: "Courses",
      url: "/student/materials",
      icon: FolderOpen,
      keywords: ["files", "resources"]
    },
    {
      id: "announcements",
      title: "Announcements",
      description: "View announcements",
      category: "Courses",
      url: "/student/announcements",
      icon: Megaphone,
      keywords: ["news", "updates"]
    },
    // Financial
    {
      id: "financial-aid",
      title: "Financial Aid",
      description: "View aid packages and scholarships",
      category: "Financial",
      url: "/student/financial-aid",
      icon: Award,
      keywords: ["scholarships", "grants"]
    },
    {
      id: "billing",
      title: "Billing",
      description: "View bills and make payments",
      category: "Financial",
      url: "/student/billing",
      icon: DollarSign,
      keywords: ["pay", "invoice", "fees"],
      shortcut: "G B"
    },
    // Applications
    {
      id: "apply",
      title: "Apply",
      description: "Submit applications",
      category: "Applications",
      url: "/student/apply",
      icon: FileText,
      keywords: ["application", "submit"]
    },
    {
      id: "application-status",
      title: "Application Status",
      description: "Track application progress",
      category: "Applications",
      url: "/student/admissions",
      icon: ClipboardCheck,
      keywords: ["status", "decision"]
    },
    ...commonItems,
  ]
}

// Quick actions available to all users
const quickActions = [
  {
    id: "action-theme-toggle",
    title: "Toggle Dark Mode",
    description: "Switch between light and dark theme",
    category: "Actions",
    icon: Moon,
    action: "toggle-theme",
    keywords: ["theme", "dark", "light", "mode"]
  },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const { user, logout } = useAuth()

  const firstRole = user?.roles?.[0]
  const userRole = (typeof firstRole === 'string' ? firstRole : firstRole?.name)?.toLowerCase() || 'student'
  const navigationItems = getNavigationItems(userRole)

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback((item: SearchItem | typeof quickActions[0]) => {
    setOpen(false)
    setSearch("")

    if ('action' in item && item.action === 'toggle-theme') {
      document.documentElement.classList.toggle('dark')
      return
    }

    if ('url' in item) {
      router.push(item.url)
    }
  }, [router])

  const handleLogout = useCallback(() => {
    setOpen(false)
    logout()
  }, [logout])

  const filteredItems = navigationItems.filter(item => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  })

  const filteredActions = quickActions.filter(item => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  })

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SearchItem[]>)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline-flex">Search...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/70">Try a different search term</p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <>
              <CommandGroup heading="Actions">
                {filteredActions.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-destructive"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Log Out</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Navigation by category */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                  {item.shortcut && (
                    <CommandShortcut className="text-xs">{item.shortcut}</CommandShortcut>
                  )}
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
