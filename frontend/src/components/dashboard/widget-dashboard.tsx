"use client"

import { useEffect, useState, useMemo } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { useDashboardStore } from '@/stores/dashboard-store'
import { WidgetRegistry, GRID_CONFIG, WidgetInstance } from '@/lib/widgets/widget-registry'
import { WidgetGallery } from './widget-gallery'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Edit,
  Plus,
  Save,
  X,
  Settings,
  RefreshCw,
  Maximize2,
  Minimize2,
  GripVertical,
  LayoutGrid,
  Trash2
} from 'lucide-react'
import '@/lib/widgets/register-widgets' // Register all widgets
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface WidgetDashboardProps {
  userRole?: string
  className?: string
}

export function WidgetDashboard({ userRole = 'student', className }: WidgetDashboardProps) {
  const {
    layout,
    isEditing,
    setLayout,
    removeWidget,
    setEditing,
    resetToDefault
  } = useDashboardStore()

  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert our layout format to react-grid-layout format
  const gridLayout = useMemo(() => {
    return layout.map(widget => ({
      i: widget.i,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      static: widget.static || !isEditing,
      minW: WidgetRegistry.get(widget.widgetId)?.minSize.w || 2,
      minH: WidgetRegistry.get(widget.widgetId)?.minSize.h || 2,
      maxW: WidgetRegistry.get(widget.widgetId)?.maxSize?.w,
      maxH: WidgetRegistry.get(widget.widgetId)?.maxSize?.h,
    }))
  }, [layout, isEditing])

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!isEditing) return

    const updatedInstances = layout.map(instance => {
      const layoutItem = newLayout.find(item => item.i === instance.i)
      if (layoutItem) {
        return {
          ...instance,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return instance
    })

    setLayout(updatedInstances)
  }

  const renderWidget = (instance: WidgetInstance) => {
    const config = WidgetRegistry.get(instance.widgetId)
    if (!config) {
      return (
        <Card className="h-full flex items-center justify-center bg-destructive/10">
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">Widget not found</p>
            <p className="text-xs text-muted-foreground">{instance.widgetId}</p>
          </div>
        </Card>
      )
    }

    const WidgetComponent = config.component
    const Icon = config.icon

    // Fullscreen mode
    if (isFullscreen === instance.i) {
      return (
        <div className="fixed inset-0 z-50 bg-background p-4">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <h3 className="font-semibold">{config.name}</h3>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsFullscreen(null)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <WidgetComponent
                size={{ w: 12, h: 10 }}
                settings={instance.settings}
                isEditing={false}
              />
            </div>
          </Card>
        </div>
      )
    }

    return (
      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all",
        isEditing && "ring-2 ring-primary/20"
      )}>
        {/* Widget Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isEditing && (
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            )}
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <h4 className="text-sm font-medium truncate">{config.name}</h4>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    // Trigger widget refresh
                    console.log('Refresh widget', instance.i)
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsFullscreen(instance.i)}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </>
            )}
            {isEditing && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => removeWidget(instance.i)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="flex-1 overflow-auto">
          <WidgetComponent
            size={{ w: instance.w, h: instance.h }}
            settings={instance.settings}
            onRemove={isEditing ? () => removeWidget(instance.i) : undefined}
            isEditing={isEditing}
          />
        </div>
      </Card>
    )
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">My Dashboard</h2>
          {isEditing && (
            <Badge variant="secondary">Edit Mode</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGallery(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetToDefault(userRole)}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
              <Button
                size="sm"
                onClick={() => setEditing(false)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      {layout.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No widgets added yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start customizing your dashboard by adding widgets
            </p>
            <Button onClick={() => setEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={GRID_CONFIG.rowHeight}
          margin={GRID_CONFIG.margin}
          containerPadding={GRID_CONFIG.containerPadding}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          compactType={GRID_CONFIG.compactType}
          preventCollision={false}
          autoSize={true}
        >
          {layout.map(instance => (
            <div key={instance.i}>
              {renderWidget(instance)}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

      {/* Widget Gallery Modal */}
      <WidgetGallery
        open={showGallery}
        onClose={() => setShowGallery(false)}
        userRole={userRole}
      />
    </div>
  )
}