"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
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
  Bell,
  User,
  Home,
  DollarSign,
  Receipt,
  Car,
  Coffee,
  Heart,
  Briefcase,
  Trophy,
  FlaskConical,
  Database,
  Shield,
  Wrench,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles
} from "lucide-react"

interface SearchItem {
  id: string
  title: string
  description?: string
  category: string
  url: string
  icon: any
  keywords?: string[]
  badge?: string
  action?: string
}

const searchableItems: SearchItem[] = [
  // Main Navigation
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Main overview and statistics",
    category: "Navigation",
    url: "/dashboard",
    icon: Home,
    keywords: ["home", "overview", "main"]
  },
  {
    id: "students",
    title: "Students",
    description: "Student management and records",
    category: "Navigation",
    url: "/students",
    icon: Users,
    keywords: ["pupils", "learners", "roster"]
  },

  // Academic
  {
    id: "courses",
    title: "Courses",
    description: "Course catalog and management",
    category: "Academic",
    url: "/courses",
    icon: BookOpen,
    keywords: ["classes", "subjects", "curriculum"]
  },
  {
    id: "grades",
    title: "Grades",
    description: "View and manage grades",
    category: "Academic",
    url: "/grades",
    icon: Award,
    keywords: ["marks", "scores", "assessment"]
  },
  {
    id: "enrollment",
    title: "Enrollment",
    description: "Course enrollment and registration",
    category: "Academic",
    url: "/enrollment",
    icon: ClipboardCheck,
    keywords: ["registration", "signup", "register"]
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Class schedule and calendar",
    category: "Academic",
    url: "/schedule",
    icon: Calendar,
    keywords: ["timetable", "calendar", "classes"]
  },
  {
    id: "transcripts",
    title: "Transcripts",
    description: "Academic transcripts and records",
    category: "Academic",
    url: "/transcripts",
    icon: FileText,
    keywords: ["records", "documents", "academic history"]
  },

  // Financial
  {
    id: "billing",
    title: "Billing",
    description: "Billing statements and charges",
    category: "Financial",
    url: "/billing",
    icon: Receipt,
    keywords: ["invoice", "charges", "fees"]
  },
  {
    id: "payments",
    title: "Payments",
    description: "Make payments and view history",
    category: "Financial",
    url: "/payments",
    icon: DollarSign,
    keywords: ["pay", "transaction", "money"]
  },
  {
    id: "financial-aid",
    title: "Financial Aid",
    description: "Scholarships and aid packages",
    category: "Financial",
    url: "/financial-aid",
    icon: Award,
    keywords: ["scholarship", "grants", "funding"]
  },
  {
    id: "payment-plans",
    title: "Payment Plans",
    description: "Installment payment options",
    category: "Financial",
    url: "/payment-plans",
    icon: Calendar,
    keywords: ["installments", "monthly", "deferred"]
  },

  // Campus Life
  {
    id: "housing",
    title: "Housing",
    description: "Student housing and residence life",
    category: "Campus Life",
    url: "/housing",
    icon: Home,
    keywords: ["dorm", "residence", "accommodation"]
  },
  {
    id: "meal-plans",
    title: "Meal Plans",
    description: "Dining plans and food services",
    category: "Campus Life",
    url: "/meal-plans",
    icon: Coffee,
    keywords: ["dining", "food", "cafeteria"]
  },
  {
    id: "parking",
    title: "Parking",
    description: "Parking permits and regulations",
    category: "Campus Life",
    url: "/parking",
    icon: Car,
    keywords: ["permits", "vehicle", "transportation"]
  },
  {
    id: "athletics",
    title: "Athletics",
    description: "Sports and recreation",
    category: "Campus Life",
    url: "/athletics",
    icon: Trophy,
    keywords: ["sports", "gym", "fitness", "recreation"]
  },

  // Services
  {
    id: "library",
    title: "Library",
    description: "Library resources and study spaces",
    category: "Services",
    url: "/library",
    icon: BookOpen,
    keywords: ["books", "study", "resources", "research"]
  },
  {
    id: "health",
    title: "Health Services",
    description: "Medical and wellness services",
    category: "Services",
    url: "/health",
    icon: Heart,
    keywords: ["medical", "wellness", "clinic", "counseling"]
  },
  {
    id: "career",
    title: "Career Services",
    description: "Job search and career planning",
    category: "Services",
    url: "/career",
    icon: Briefcase,
    keywords: ["jobs", "internships", "employment"]
  },

  // Administrative
  {
    id: "advisor-dashboard",
    title: "Advisor Dashboard",
    description: "Academic advising tools",
    category: "Administrative",
    url: "/advisor-dashboard",
    icon: Users,
    keywords: ["advising", "counseling", "guidance"],
    badge: "Staff"
  },
  {
    id: "registrar-dashboard",
    title: "Registrar Dashboard",
    description: "Registrar operations",
    category: "Administrative",
    url: "/registrar-dashboard",
    icon: FileText,
    keywords: ["records", "registration", "verification"],
    badge: "Staff"
  },
  {
    id: "dean-dashboard",
    title: "Dean Dashboard",
    description: "College administration",
    category: "Administrative",
    url: "/dean-dashboard",
    icon: GraduationCap,
    keywords: ["administration", "college", "leadership"],
    badge: "Admin"
  },
  {
    id: "department-dashboard",
    title: "Department Dashboard",
    description: "Department management",
    category: "Administrative",
    url: "/department-dashboard",
    icon: Building,
    keywords: ["faculty", "department", "management"],
    badge: "Staff"
  },
  {
    id: "operations-dashboard",
    title: "Operations Dashboard",
    description: "Campus operations and facilities",
    category: "Administrative",
    url: "/operations-dashboard",
    icon: Wrench,
    keywords: ["facilities", "maintenance", "campus"],
    badge: "Staff"
  },

  // Research & Alumni
  {
    id: "research",
    title: "Research & Grants",
    description: "Research projects and funding",
    category: "Research",
    url: "/research",
    icon: FlaskConical,
    keywords: ["grants", "projects", "publications", "lab"]
  },
  {
    id: "alumni",
    title: "Alumni Relations",
    description: "Alumni network and events",
    category: "Alumni",
    url: "/alumni",
    icon: Award,
    keywords: ["graduates", "networking", "donations", "events"]
  },

  // Quick Actions
  {
    id: "action-register",
    title: "Register for Classes",
    description: "Quick course registration",
    category: "Quick Actions",
    url: "/enrollment",
    icon: ClipboardCheck,
    action: "register",
    keywords: ["enroll", "signup", "add class"]
  },
  {
    id: "action-pay",
    title: "Make a Payment",
    description: "Pay tuition and fees",
    category: "Quick Actions",
    url: "/payments",
    icon: DollarSign,
    action: "pay",
    keywords: ["pay bill", "tuition", "fees"]
  },
  {
    id: "action-appointment",
    title: "Book Appointment",
    description: "Schedule advisor meeting",
    category: "Quick Actions",
    url: "/advising-appointments",
    icon: Calendar,
    action: "book",
    keywords: ["schedule", "meeting", "advisor"]
  },
  {
    id: "action-transcript",
    title: "Request Transcript",
    description: "Order official transcript",
    category: "Quick Actions",
    url: "/transcript-requests",
    icon: FileText,
    action: "request",
    keywords: ["order", "official", "document"]
  },
]

// Recent searches (mock data - in production, this would be from localStorage or API)
const recentSearches = [
  { id: "recent-1", title: "Course Registration", url: "/enrollment", icon: ClipboardCheck },
  { id: "recent-2", title: "Financial Aid", url: "/financial-aid", icon: Award },
  { id: "recent-3", title: "Library", url: "/library", icon: BookOpen },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

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

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const filteredItems = searchableItems.filter(item => {
    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
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
        className="relative flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Search...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for courses, services, actions..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!search && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.url)}
                    className="cursor-pointer"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                    <Clock className="ml-auto h-3 w-3 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.action && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="mr-1 h-2 w-2" />
                          Action
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}