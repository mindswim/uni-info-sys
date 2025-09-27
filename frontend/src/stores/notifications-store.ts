import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  category?: 'academic' | 'financial' | 'housing' | 'general' | 'urgent'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  icon?: string
  priority?: 'low' | 'medium' | 'high'
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

// Mock initial notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Course Registration Opens',
    message: 'Spring 2025 course registration opens tomorrow at 8:00 AM',
    type: 'info',
    category: 'academic',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    actionUrl: '/enrollment',
    actionLabel: 'View Courses',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Payment Due',
    message: 'Your tuition payment of $6,225 is due by January 15',
    type: 'warning',
    category: 'financial',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: '/payments',
    actionLabel: 'Make Payment',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Grade Posted',
    message: 'Your grade for CS350 - Introduction to AI has been posted',
    type: 'success',
    category: 'academic',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    actionUrl: '/grades',
    actionLabel: 'View Grade',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Housing Assignment',
    message: 'Room selection for Fall 2025 begins next week',
    type: 'info',
    category: 'housing',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: '/housing',
    actionLabel: 'Select Room',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Career Fair Reminder',
    message: 'Spring Career Fair is tomorrow - don\'t forget to bring your resume!',
    type: 'info',
    category: 'general',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    actionUrl: '/career',
    actionLabel: 'Event Details',
    priority: 'low'
  },
  {
    id: '6',
    title: 'System Maintenance',
    message: 'Portal will be unavailable Saturday 2:00 AM - 4:00 AM for maintenance',
    type: 'system',
    category: 'general',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    priority: 'low'
  }
]

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,

  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }
  }),

  markAsRead: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    if (!notification || notification.read) return state

    return {
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id)
    const wasUnread = notification && !notification.read

    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }
  }),

  clearAll: () => set({
    notifications: [],
    unreadCount: 0,
  }),
}))