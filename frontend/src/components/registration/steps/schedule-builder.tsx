"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRegistrationStore } from '@/stores/registration-store'
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ArrowRight
} from 'lucide-react'

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function ScheduleBuilder() {
  const {
    selectedCourses,
    conflicts,
    checkConflicts,
    moveToCart
  } = useRegistrationStore()

  useEffect(() => {
    checkConflicts()
  }, [selectedCourses])

  // Build schedule grid
  const scheduleGrid: { [key: string]: any[] } = {}
  days.forEach(day => {
    scheduleGrid[day] = []
  })

  selectedCourses.forEach(course => {
    course.schedule.days.forEach(day => {
      scheduleGrid[day].push({
        course,
        startHour: parseInt(course.schedule.startTime.split(':')[0]),
        startMinute: parseInt(course.schedule.startTime.split(':')[1]),
        endHour: parseInt(course.schedule.endTime.split(':')[0]),
        endMinute: parseInt(course.schedule.endTime.split(':')[1])
      })
    })
  })

  const getCourseColor = (courseCode: string) => {
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-purple-100 border-purple-300',
      'bg-orange-100 border-orange-300',
      'bg-pink-100 border-pink-300'
    ]
    const index = courseCode.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getTimePosition = (hour: number, minute: number) => {
    const startHour = 8
    const totalMinutes = (hour - startHour) * 60 + minute
    return (totalMinutes / 60) * 60 // 60px per hour
  }

  const getDuration = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
    const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)
    return (durationMinutes / 60) * 60 // 60px per hour
  }

  return (
    <div className="space-y-6">
      {/* Conflict Summary */}
      {conflicts.length > 0 ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Schedule Conflicts Detected</AlertTitle>
          <AlertDescription className="text-red-800">
            {conflicts.length} time conflict(s) found. Please resolve before proceeding.
          </AlertDescription>
        </Alert>
      ) : selectedCourses.length > 0 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">No Conflicts!</AlertTitle>
          <AlertDescription className="text-green-800">
            Your schedule has no time conflicts. You can proceed with registration.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>No Courses Selected</AlertTitle>
          <AlertDescription>
            Select courses from your shopping cart to build your schedule.
          </AlertDescription>
        </Alert>
      )}

      {/* Weekly Schedule View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
          <CardDescription>
            Visual representation of your course schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                {days.map(day => (
                  <div key={day} className="text-sm font-medium text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {/* Time labels */}
                <div className="absolute left-0 top-0 w-16">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className="h-[60px] text-xs text-muted-foreground pr-2 text-right"
                      style={{ paddingTop: '2px' }}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Schedule Grid */}
                <div className="ml-16 grid grid-cols-5 gap-2 relative">
                  {days.map(day => (
                    <div key={day} className="relative" style={{ height: `${timeSlots.length * 60}px` }}>
                      {/* Background lines */}
                      {timeSlots.map((_, index) => (
                        <div
                          key={index}
                          className="absolute w-full border-t border-gray-100"
                          style={{ top: `${index * 60}px` }}
                        />
                      ))}

                      {/* Course blocks */}
                      {scheduleGrid[day].map((item, index) => {
                        const hasConflict = conflicts.some(
                          c => c.course1.id === item.course.id || c.course2.id === item.course.id
                        )

                        return (
                          <div
                            key={`${day}-${index}`}
                            className={`absolute left-0 right-0 p-1 border rounded ${
                              hasConflict
                                ? 'bg-red-100 border-red-300'
                                : getCourseColor(item.course.code)
                            }`}
                            style={{
                              top: `${getTimePosition(item.startHour, item.startMinute)}px`,
                              height: `${getDuration(
                                item.startHour,
                                item.startMinute,
                                item.endHour,
                                item.endMinute
                              )}px`
                            }}
                          >
                            <div className="text-xs font-medium">{item.course.code}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.course.schedule.startTime}-{item.course.schedule.endTime}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Details */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Conflict Details</h3>
          {conflicts.map((conflict, index) => (
            <Card key={index} className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">Time Conflict</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {conflict.message}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {conflict.course1.code} - {conflict.course1.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conflict.course1.schedule.days.join(', ')}{' '}
                          {conflict.course1.schedule.startTime}-{conflict.course1.schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {conflict.course2.code} - {conflict.course2.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conflict.course2.schedule.days.join(', ')}{' '}
                          {conflict.course2.schedule.startTime}-{conflict.course2.schedule.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveToCart(conflict.course1.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove {conflict.course1.code}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveToCart(conflict.course2.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove {conflict.course2.code}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course List */}
      <div>
        <h3 className="font-semibold mb-3">Selected Courses</h3>
        <div className="space-y-2">
          {selectedCourses.map(course => {
            const hasConflict = conflicts.some(
              c => c.course1.id === course.id || c.course2.id === course.id
            )

            return (
              <div
                key={course.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  hasConflict ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded ${
                      hasConflict ? 'bg-red-400' : 'bg-green-400'
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {course.code} - {course.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.schedule.days.join(', ')} {course.schedule.startTime}-{course.schedule.endTime} •{' '}
                      {course.location} • {course.credits} credits
                    </p>
                  </div>
                </div>
                {hasConflict && (
                  <Badge variant="destructive">Conflict</Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}