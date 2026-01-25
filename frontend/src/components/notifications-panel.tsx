"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNotificationsStore } from "@/stores/notifications-store"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  GraduationCap,
  DollarSign,
  Home,
  Briefcase,
  ChevronRight
} from "lucide-react"

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  system: Settings,
}

const categoryIcons = {
  academic: GraduationCap,
  financial: DollarSign,
  housing: Home,
  general: Bell,
  urgent: AlertCircle,
}

export function NotificationsPanel() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotificationsStore()

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      setOpen(false)
      router.push(notification.actionUrl)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-danger'
      case 'medium': return 'text-warning'
      case 'low': return 'text-success'
      default: return 'text-muted-foreground'
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'default'
      case 'success': return 'secondary'
      case 'system': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearAll}
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="px-4">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[400px] p-2">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => {
                const TypeIcon = typeIcons[notification.type]
                const CategoryIcon = notification.category ? categoryIcons[notification.category] : Bell

                return (
                  <div
                    key={notification.id}
                    className={`
                      relative p-3 rounded-lg border transition-colors cursor-pointer
                      ${notification.read
                        ? 'bg-background hover:bg-muted/50'
                        : 'bg-muted/50 hover:bg-muted'
                      }
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!notification.read && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                    )}

                    <div className="flex items-start gap-3 pl-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="relative">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          {notification.priority && (
                            <div className={`absolute -bottom-1 -right-1 ${getPriorityColor(notification.priority)}`}>
                              <TypeIcon className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>

                          {notification.actionLabel && (
                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                              <span>{notification.actionLabel}</span>
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {notification.type && (
                          <Badge
                            variant={getTypeVariant(notification.type)}
                            className="text-xs h-5 px-1"
                          >
                            {notification.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              setOpen(false)
              router.push('/notifications')
            }}
          >
            <Bell className="mr-2 h-4 w-4" />
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}