import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Users, GraduationCap, DollarSign } from "lucide-react"

interface ProgramCardProps {
  program: {
    id: number
    name: string
    degree_level: "undergraduate" | "graduate" | "doctoral" | "certificate"
    department: string
    faculty: string
    duration: string
    credits: number
    tuition?: string
    capacity?: number
    enrolled?: number
  }
  showDetails?: boolean
  className?: string
}

const degreeLevelColors = {
  undergraduate: "bg-blue-500",
  graduate: "bg-purple-500",
  doctoral: "bg-red-500",
  certificate: "bg-green-500"
}

const degreeLevelLabels = {
  undergraduate: "Bachelor's",
  graduate: "Master's",
  doctoral: "Doctorate",
  certificate: "Certificate"
}

export function ProgramCard({ program, showDetails = true, className = "" }: ProgramCardProps) {
  const enrollmentPercentage = program.capacity && program.enrolled
    ? Math.round((program.enrolled / program.capacity) * 100)
    : null

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="secondary"
            className={`${degreeLevelColors[program.degree_level]} text-white`}
          >
            {degreeLevelLabels[program.degree_level]}
          </Badge>
          {enrollmentPercentage !== null && (
            <span className="text-sm text-muted-foreground">
              {enrollmentPercentage}% enrolled
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{program.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {program.department} • {program.faculty}
        </p>
      </CardHeader>
      <CardContent>
        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-muted-foreground" />
                <span>{program.credits} credits</span>
              </div>
              {program.tuition && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span>{program.tuition}</span>
                </div>
              )}
              {program.enrolled && program.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{program.enrolled}/{program.capacity}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t">
              <Button size="sm" className="w-full" asChild>
                <Link href={`/academics/programs/${program.id}`}>
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}