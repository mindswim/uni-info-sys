"use client"

import { WidgetProps } from '@/lib/widgets/widget-registry'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User } from 'lucide-react'

// Mock data - in production, this would fetch from API
const todayClasses = [
  {
    time: '9:00 AM',
    endTime: '10:15 AM',
    course: 'CS350 - Introduction to AI',
    instructor: 'Dr. Sarah Chen',
    room: 'Engineering 301',
    status: 'upcoming'
  },
  {
    time: '11:00 AM',
    endTime: '12:15 PM',
    course: 'MATH201 - Linear Algebra',
    instructor: 'Prof. Michael Roberts',
    room: 'Math Building 205',
    status: 'upcoming'
  },
  {
    time: '2:00 PM',
    endTime: '3:15 PM',
    course: 'PHYS150 - Physics I',
    instructor: 'Dr. Emily Johnson',
    room: 'Science Hall 110',
    status: 'upcoming'
  },
  {
    time: '4:00 PM',
    endTime: '5:15 PM',
    course: 'CS Lab Session',
    instructor: 'TA: Alex Kim',
    room: 'Computer Lab 3',
    status: 'upcoming'
  }
]

export function ScheduleTodayWidget({ size, isEditing }: WidgetProps) {
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  // Determine which classes have passed, are current, or upcoming
  const classesWithStatus = todayClasses.map(cls => {
    const [startHour, startMinute] = cls.time.includes('PM')
      ? [parseInt(cls.time) + 12, parseInt(cls.time.split(':')[1])]
      : [parseInt(cls.time), parseInt(cls.time.split(':')[1])]

    // Simplified status calculation
    if (currentHour > startHour + 2) {
      return { ...cls, status: 'completed' }
    } else if (currentHour >= startHour && currentHour < startHour + 2) {
      return { ...cls, status: 'in-progress' }
    }
    return { ...cls, status: 'upcoming' }
  })

  // Compact view for small widget sizes
  if (size.h <= 2) {
    const nextClass = classesWithStatus.find(c => c.status === 'upcoming' || c.status === 'in-progress')

    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1">Next Class</div>
        {nextClass ? (
          <div>
            <p className="font-medium text-sm">{nextClass.course.split(' - ')[0]}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{nextClass.time}</span>
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{nextClass.room}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No more classes today</p>
        )}
      </div>
    )
  }

  // Full view for larger widget sizes
  return (
    <div className="p-4">
      <div className="space-y-2">
        {classesWithStatus.slice(0, size.h >= 4 ? 4 : 2).map((cls, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              cls.status === 'in-progress'
                ? 'bg-primary/10 border-primary'
                : cls.status === 'completed'
                ? 'opacity-50'
                : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{cls.course}</p>
                  {cls.status === 'in-progress' && (
                    <Badge variant="default" className="text-xs">Now</Badge>
                  )}
                </div>
                {size.w >= 4 && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cls.time} - {cls.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cls.room}
                    </span>
                  </div>
                )}
                {size.h >= 4 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {cls.instructor}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {classesWithStatus.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No classes today</p>
        </div>
      )}
    </div>
  )
}