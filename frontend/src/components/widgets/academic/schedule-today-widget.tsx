"use client"

import { useEffect, useState } from 'react'
import { WidgetProps } from '@/lib/widgets/widget-registry'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User, Loader2 } from 'lucide-react'
import { enrollmentService } from '@/services'
import type { Enrollment } from '@/types/api-types'

interface ClassSchedule {
  time: string
  endTime: string
  course: string
  instructor: string
  room: string
  status: 'completed' | 'in-progress' | 'upcoming'
}

export function ScheduleTodayWidget({ size, isEditing }: WidgetProps) {
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' })

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollments = await enrollmentService.getCurrentEnrollments()

        // Filter enrollments for today's classes
        const todaySchedule = enrollments
          .filter((enrollment: Enrollment) => {
            const section = enrollment.course_section
            return section && section.schedule_days && section.schedule_days.includes(currentDay)
          })
          .map((enrollment: Enrollment) => {
            const section = enrollment.course_section
            const course = section?.course
            const instructor = section?.instructor?.user
            const room = section?.room
            const building = room?.building

            return {
              time: section?.start_time || 'TBA',
              endTime: section?.end_time || 'TBA',
              course: course ? `${course.code} - ${course.name}` : 'Unknown Course',
              instructor: instructor ? instructor.name : 'TBA',
              room: room && building ? `${building.name} ${room.room_number}` : 'TBA',
              status: 'upcoming' as const
            }
          })
          .sort((a, b) => {
            // Sort by time
            const timeA = a.time.replace(/[^\d:]/g, '')
            const timeB = b.time.replace(/[^\d:]/g, '')
            return timeA.localeCompare(timeB)
          })

        setTodayClasses(todaySchedule)
      } catch (error) {
        console.error('Failed to fetch enrollments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

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

  // Loading state
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

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