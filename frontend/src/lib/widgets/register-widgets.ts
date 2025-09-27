import { WidgetRegistry } from './widget-registry'

// Import widget components
import { ScheduleTodayWidget } from '@/components/widgets/academic/schedule-today-widget'
import { GradesOverviewWidget } from '@/components/widgets/academic/grades-overview-widget'
import { AccountBalanceWidget } from '@/components/widgets/financial/account-balance-widget'

// Import icons
import {
  Calendar,
  Award,
  DollarSign,
  ClipboardCheck,
  Bell,
  Coffee,
  Users,
  BookOpen,
  Activity,
  BarChart3,
  AlertCircle,
  Clock,
  FileText,
  Heart,
  Car
} from 'lucide-react'

// Register all available widgets
export function registerAllWidgets() {
  // Academic Widgets
  WidgetRegistry.register({
    id: 'schedule-today',
    name: "Today's Schedule",
    description: 'View your classes for today',
    category: 'academic',
    icon: Calendar,
    component: ScheduleTodayWidget,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 6 },
    refreshInterval: 300 // 5 minutes
  })

  WidgetRegistry.register({
    id: 'grades-overview',
    name: 'Grades Overview',
    description: 'Your GPA and recent grades',
    category: 'academic',
    icon: Award,
    component: GradesOverviewWidget,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 5 }
  })

  WidgetRegistry.register({
    id: 'assignments-due',
    name: 'Assignments Due',
    description: 'Upcoming assignment deadlines',
    category: 'academic',
    icon: ClipboardCheck,
    component: ScheduleTodayWidget, // Placeholder - using schedule widget for now
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 6 }
  })

  // Financial Widgets
  WidgetRegistry.register({
    id: 'account-balance',
    name: 'Account Balance',
    description: 'Your current balance and payment due',
    category: 'financial',
    icon: DollarSign,
    component: AccountBalanceWidget,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 4 },
    refreshInterval: 3600 // 1 hour
  })

  // Campus Life Widgets
  WidgetRegistry.register({
    id: 'meal-balance',
    name: 'Meal Balance',
    description: 'Meal swipes and flex dollars remaining',
    category: 'campus',
    icon: Coffee,
    component: AccountBalanceWidget, // Placeholder
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 3 }
  })

  // Personal Widgets
  WidgetRegistry.register({
    id: 'notifications-feed',
    name: 'Notifications',
    description: 'Recent notifications and alerts',
    category: 'personal',
    icon: Bell,
    component: GradesOverviewWidget, // Placeholder
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 12, h: 8 },
    refreshInterval: 60 // 1 minute
  })

  // Additional placeholder widgets for demonstration
  const placeholderWidgets = [
    { id: 'course-progress', name: 'Course Progress', icon: BookOpen, category: 'academic' as const },
    { id: 'attendance', name: 'Attendance', icon: Users, category: 'academic' as const },
    { id: 'study-time', name: 'Study Time Tracker', icon: Clock, category: 'academic' as const },
    { id: 'financial-aid', name: 'Financial Aid Status', icon: Heart, category: 'financial' as const },
    { id: 'parking-status', name: 'Parking Status', icon: Car, category: 'campus' as const },
    { id: 'gym-capacity', name: 'Gym Capacity', icon: Activity, category: 'campus' as const },
    { id: 'upcoming-events', name: 'Upcoming Events', icon: Calendar, category: 'personal' as const },
    { id: 'important-dates', name: 'Important Dates', icon: AlertCircle, category: 'personal' as const },
  ]

  placeholderWidgets.forEach(widget => {
    WidgetRegistry.register({
      id: widget.id,
      name: widget.name,
      description: `View your ${widget.name.toLowerCase()}`,
      category: widget.category,
      icon: widget.icon,
      component: widget.category === 'academic' ? GradesOverviewWidget : AccountBalanceWidget, // Using existing widgets as placeholders
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      maxSize: { w: 6, h: 6 }
    })
  })
}

// Initialize widgets on module load
registerAllWidgets()