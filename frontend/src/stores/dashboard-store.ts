import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WidgetInstance, DEFAULT_LAYOUTS } from '@/lib/widgets/widget-registry'

interface DashboardState {
  // Widget layout
  layout: WidgetInstance[]
  isEditing: boolean

  // Actions
  setLayout: (layout: WidgetInstance[]) => void
  addWidget: (widgetId: string) => void
  removeWidget: (instanceId: string) => void
  updateWidget: (instanceId: string, updates: Partial<WidgetInstance>) => void
  updateWidgetSettings: (instanceId: string, settings: any) => void

  // Edit mode
  setEditing: (editing: boolean) => void
  resetToDefault: (role: string) => void

  // Utility
  generateInstanceId: () => string
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state - default student layout
      layout: DEFAULT_LAYOUTS.student || [],
      isEditing: false,

      setLayout: (layout) => set({ layout }),

      addWidget: (widgetId) => {
        const instanceId = get().generateInstanceId()
        const newWidget: WidgetInstance = {
          i: instanceId,
          widgetId,
          x: 0,
          y: 0, // Will be auto-positioned by grid
          w: 4,
          h: 3,
          settings: {}
        }

        set((state) => ({
          layout: [...state.layout, newWidget]
        }))
      },

      removeWidget: (instanceId) => {
        set((state) => ({
          layout: state.layout.filter(w => w.i !== instanceId)
        }))
      },

      updateWidget: (instanceId, updates) => {
        set((state) => ({
          layout: state.layout.map(widget =>
            widget.i === instanceId
              ? { ...widget, ...updates }
              : widget
          )
        }))
      },

      updateWidgetSettings: (instanceId, settings) => {
        set((state) => ({
          layout: state.layout.map(widget =>
            widget.i === instanceId
              ? { ...widget, settings }
              : widget
          )
        }))
      },

      setEditing: (editing) => set({ isEditing: editing }),

      resetToDefault: (role) => {
        const defaultLayout = DEFAULT_LAYOUTS[role] || DEFAULT_LAYOUTS.student
        set({ layout: defaultLayout })
      },

      generateInstanceId: () => {
        return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    }),
    {
      name: 'dashboard-layout', // localStorage key
      partialize: (state) => ({ layout: state.layout }) // Only persist layout
    }
  )
)