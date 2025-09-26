import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Clock, User, Users, AlertCircle } from "lucide-react"

interface CourseSection {
  id: number
  section_number: string
  instructor: string
  schedule: {
    days: string[]
    start_time: string
    end_time: string
  }
  location: {
    building: string
    room: string
  }
  capacity: number
  enrolled: number
  waitlist: number
}

interface CourseSectionCardProps {
  course: {
    course_code: string
    title: string
    credits: number
    prerequisites?: string[]
  }
  section: CourseSection
  term: string
  showEnrollButton?: boolean
}

export function CourseSectionCard({
  course,
  section,
  term,
  showEnrollButton = false
}: CourseSectionCardProps) {
  const availableSeats = section.capacity - section.enrolled
  const enrollmentStatus = availableSeats === 0
    ? "closed"
    : availableSeats < 5
    ? "limited"
    : "open"

  const statusConfig = {
    open: { color: "bg-green-500", text: "Open", icon: "✓" },
    limited: { color: "bg-yellow-500", text: `${availableSeats} seats left`, icon: "⚠" },
    closed: { color: "bg-red-500", text: "Section Full", icon: "✗" }
  }

  const formatSchedule = () => {
    return `${section.schedule.days.join("")} ${section.schedule.start_time}-${section.schedule.end_time}`
  }

  const formatCourseCode = (code: string) => {
    return code.toUpperCase().replace(/(\D+)(\d+)/, "$1 $2")
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {formatCourseCode(course.course_code)} - {course.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {course.credits} credits • Section {section.section_number} • {term}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`${statusConfig[enrollmentStatus].color} text-white`}
          >
            {statusConfig[enrollmentStatus].icon} {statusConfig[enrollmentStatus].text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Prerequisites:</p>
                <p className="text-muted-foreground">{course.prerequisites.join(", ")}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatSchedule()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{section.location.building} {section.location.room}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{section.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {section.enrolled}/{section.capacity}
                {section.waitlist > 0 && (
                  <span className="text-muted-foreground"> • {section.waitlist} waitlisted</span>
                )}
              </span>
            </div>
          </div>

          {showEnrollButton && (
            <div className="pt-3 border-t">
              {enrollmentStatus === "closed" && section.waitlist > 0 ? (
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`http://localhost:5174/enroll/${section.id}`}>
                    Join Waitlist
                  </Link>
                </Button>
              ) : enrollmentStatus !== "closed" ? (
                <Button size="sm" className="w-full" asChild>
                  <Link href={`http://localhost:5174/enroll/${section.id}`}>
                    Enroll Now
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled className="w-full">
                  Section Closed
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}