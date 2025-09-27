"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WidgetRegistry, WidgetConfig } from '@/lib/widgets/widget-registry'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Plus, Check } from 'lucide-react'

interface WidgetGalleryProps {
  open: boolean
  onClose: () => void
  userRole?: string
}

export function WidgetGallery({ open, onClose, userRole = 'student' }: WidgetGalleryProps) {
  const { layout, addWidget } = useDashboardStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get available widgets
  const allWidgets = WidgetRegistry.getAll()
  const categories = ['all', 'academic', 'financial', 'campus', 'personal', 'administrative']

  // Filter widgets by category
  const filteredWidgets = selectedCategory === 'all'
    ? allWidgets
    : allWidgets.filter(w => w.category === selectedCategory)

  // Check if widget is already added
  const isWidgetAdded = (widgetId: string) => {
    return layout.some(instance => instance.widgetId === widgetId)
  }

  const handleAddWidget = (widget: WidgetConfig) => {
    addWidget(widget.id)
    onClose()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-500'
      case 'financial': return 'bg-green-500'
      case 'campus': return 'bg-purple-500'
      case 'personal': return 'bg-orange-500'
      case 'administrative': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Widgets to Dashboard</DialogTitle>
          <DialogDescription>
            Select widgets to add to your dashboard. You can rearrange them later.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-6 w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All' : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
              {filteredWidgets.map(widget => {
                const Icon = widget.icon
                const added = isWidgetAdded(widget.id)

                return (
                  <Card
                    key={widget.id}
                    className={`relative p-4 cursor-pointer transition-all hover:shadow-md ${
                      added ? 'opacity-60' : ''
                    }`}
                    onClick={() => !added && handleAddWidget(widget)}
                  >
                    {/* Category indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${getCategoryColor(widget.category)} rounded-l`} />

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        {added && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Added
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">{widget.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {widget.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {widget.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {widget.defaultSize.w}x{widget.defaultSize.h}
                        </span>
                      </div>

                      {!added && (
                        <Button size="sm" className="w-full">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Widget
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {layout.length} widgets in your dashboard
          </p>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}