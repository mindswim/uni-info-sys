import { ComponentType } from 'react'
import { LucideIcon } from 'lucide-react'

export interface WidgetSize {
  w: number  // Width in grid units
  h: number  // Height in grid units
}

export interface WidgetConfig {
  id: string
  name: string
  description: string
  category: 'academic' | 'financial' | 'campus' | 'administrative' | 'personal'
  icon: LucideIcon
  component: ComponentType<WidgetProps>
  defaultSize: WidgetSize
  minSize: WidgetSize
  maxSize?: WidgetSize
  refreshInterval?: number // in seconds
  permissions?: string[]
  settingsComponent?: ComponentType<WidgetSettingsProps>
}

export interface WidgetProps {
  size: WidgetSize
  settings?: any
  onRefresh?: () => void
  onSettings?: () => void
  onRemove?: () => void
  isEditing?: boolean
}

export interface WidgetSettingsProps {
  settings: any
  onSave: (settings: any) => void
  onCancel: () => void
}

export interface WidgetInstance {
  i: string // instance id
  widgetId: string // reference to widget config
  x: number
  y: number
  w: number
  h: number
  settings?: any
  static?: boolean
}

class WidgetRegistryClass {
  private widgets: Map<string, WidgetConfig> = new Map()

  register(widget: WidgetConfig) {
    if (this.widgets.has(widget.id)) {
      console.warn(`Widget ${widget.id} already registered`)
    }
    this.widgets.set(widget.id, widget)
  }

  unregister(widgetId: string) {
    this.widgets.delete(widgetId)
  }

  get(widgetId: string): WidgetConfig | undefined {
    return this.widgets.get(widgetId)
  }

  getAll(): WidgetConfig[] {
    return Array.from(this.widgets.values())
  }

  getByCategory(category: string): WidgetConfig[] {
    return this.getAll().filter(w => w.category === category)
  }

  getAvailableForUser(userRole?: string, permissions?: string[]): WidgetConfig[] {
    return this.getAll().filter(widget => {
      if (!widget.permissions || widget.permissions.length === 0) {
        return true // No permissions required
      }
      // Check if user has required permissions
      return widget.permissions.some(permission =>
        permissions?.includes(permission)
      )
    })
  }
}

// Singleton instance
export const WidgetRegistry = new WidgetRegistryClass()

// Default dashboard layouts by role
export const DEFAULT_LAYOUTS: Record<string, WidgetInstance[]> = {
  student: [
    { i: '1', widgetId: 'schedule-today', x: 0, y: 0, w: 4, h: 3 },
    { i: '2', widgetId: 'assignments-due', x: 4, y: 0, w: 4, h: 3 },
    { i: '3', widgetId: 'grades-overview', x: 8, y: 0, w: 4, h: 3 },
    { i: '4', widgetId: 'account-balance', x: 0, y: 3, w: 3, h: 2 },
    { i: '5', widgetId: 'meal-balance', x: 3, y: 3, w: 3, h: 2 },
    { i: '6', widgetId: 'notifications-feed', x: 6, y: 3, w: 6, h: 4 },
  ],
  faculty: [
    { i: '1', widgetId: 'teaching-schedule', x: 0, y: 0, w: 6, h: 3 },
    { i: '2', widgetId: 'grading-needed', x: 6, y: 0, w: 6, h: 3 },
    { i: '3', widgetId: 'office-hours', x: 0, y: 3, w: 4, h: 2 },
    { i: '4', widgetId: 'student-messages', x: 4, y: 3, w: 4, h: 3 },
    { i: '5', widgetId: 'research-deadlines', x: 8, y: 3, w: 4, h: 3 },
  ],
  advisor: [
    { i: '1', widgetId: 'appointments-today', x: 0, y: 0, w: 6, h: 3 },
    { i: '2', widgetId: 'student-alerts', x: 6, y: 0, w: 6, h: 3 },
    { i: '3', widgetId: 'advising-queue', x: 0, y: 3, w: 4, h: 4 },
    { i: '4', widgetId: 'registration-stats', x: 4, y: 3, w: 4, h: 2 },
    { i: '5', widgetId: 'upcoming-deadlines', x: 8, y: 3, w: 4, h: 2 },
  ],
  admin: [
    { i: '1', widgetId: 'system-stats', x: 0, y: 0, w: 8, h: 3 },
    { i: '2', widgetId: 'active-users', x: 8, y: 0, w: 4, h: 3 },
    { i: '3', widgetId: 'recent-applications', x: 0, y: 3, w: 6, h: 4 },
    { i: '4', widgetId: 'department-metrics', x: 6, y: 3, w: 6, h: 4 },
    { i: '5', widgetId: 'system-health', x: 0, y: 7, w: 4, h: 2 },
  ],
}

// Grid configuration
export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 80,
  margin: [16, 16] as [number, number],
  containerPadding: [16, 16] as [number, number],
  isDraggable: true,
  isResizable: true,
  compactType: 'vertical' as 'vertical' | 'horizontal' | null,
}