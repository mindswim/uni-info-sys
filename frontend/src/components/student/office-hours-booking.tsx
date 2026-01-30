"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video, Calendar } from "lucide-react"

interface OfficeHourSlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  location: string | null
  is_virtual: boolean
  meeting_link: string | null
  max_appointments: number
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface OfficeHoursBookingProps {
  staffId: number
  staffName: string
  slots: OfficeHourSlot[]
  onBook?: (slotId: number, date: string) => void
}

export function OfficeHoursBooking({ staffId, staffName, slots, onBook }: OfficeHoursBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')

  const groupedByDay = slots.reduce<Record<number, OfficeHourSlot[]>>((acc, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = []
    acc[slot.day_of_week].push(slot)
    return acc
  }, {})

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Office Hours - {staffName}</CardTitle>
          <CardDescription>No office hours currently scheduled</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Office Hours - {staffName}
        </CardTitle>
        <CardDescription>Select a time slot to book an appointment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByDay)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([day, daySlots]) => (
            <div key={day} className="space-y-2">
              <h4 className="font-medium text-sm">{DAY_NAMES[Number(day)]}</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {slot.is_virtual ? (
                          <>
                            <Video className="h-3 w-3" />
                            Virtual
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" />
                            {slot.location || 'TBA'}
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBook?.(slot.id, selectedDate)}
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
