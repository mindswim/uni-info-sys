"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  UserCheck,
  User,
  Users,
  BookOpen,
  ArrowRight,
  Shuffle
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import authService from "@/lib/auth"

const demoPersonas = [
  {
    email: "admin@demo.com",
    password: "password",
    name: "Dr. Elizabeth Harper",
    role: "Administrator",
    description: "Full system access with administrative privileges",
    icon: UserCheck,
    color: "bg-red-500",
    features: ["User Management", "System Settings", "Analytics", "All Data Access"]
  },
  {
    email: "maria@demo.com", 
    password: "password",
    name: "Maria Rodriguez",
    role: "Prospective Student",
    description: "International student from Mexico applying for Computer Science",
    icon: User,
    color: "bg-blue-500",
    features: ["Course Catalog", "Applications", "Admissions Status", "Student Portal"]
  },
  {
    email: "david@demo.com",
    password: "password", 
    name: "David Park",
    role: "Current Student",
    description: "2nd year Computer Science student from South Korea",
    icon: BookOpen,
    color: "bg-green-500",
    features: ["Course Enrollment", "Academic Records", "Schedules", "Grades"]
  },
  {
    email: "sophie@demo.com",
    password: "password",
    name: "Sophie Turner", 
    role: "Transfer Student",
    description: "Transfer student from California, waitlisted for popular courses",
    icon: Users,
    color: "bg-purple-500",
    features: ["Transfer Credits", "Waitlist Management", "Course Planning", "Advising"]
  }
]

interface PersonaSwitcherProps {
  className?: string
  variant?: "button" | "menu-item"
}

export function PersonaSwitcher({ className, variant = "button" }: PersonaSwitcherProps) {
  const { user } = useAuth()
  const [switching, setSwitching] = useState(false)

  const handlePersonaSwitch = async (persona: typeof demoPersonas[0]) => {
    setSwitching(true)
    try {
      await authService.login({
        email: persona.email,
        password: persona.password,
        device_name: "University Demo"
      })
      // The AuthProvider will handle the state update and navigation
      window.location.reload() // Force a refresh to update the entire app state
    } catch (error) {
      console.error('Persona switch failed:', error)
    } finally {
      setSwitching(false)
    }
  }

  const currentPersona = demoPersonas.find(p => p.email === user?.email)

  if (variant === "menu-item") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className={className}>
          <DropdownMenuItem className="cursor-pointer">
            <Shuffle className="mr-2 h-4 w-4" />
            Switch Persona
          </DropdownMenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="text-center">Demo Personas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {demoPersonas.map((persona) => {
            const Icon = persona.icon
            const isCurrentPersona = persona.email === user?.email
            
            return (
              <DropdownMenuItem
                key={persona.email}
                className={`p-3 cursor-pointer ${isCurrentPersona ? 'bg-muted' : ''}`}
                onClick={() => !isCurrentPersona && handlePersonaSwitch(persona)}
                disabled={switching || isCurrentPersona}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${persona.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{persona.name}</span>
                      {isCurrentPersona && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mb-1">
                      {persona.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {persona.description}
                    </p>
                  </div>
                  {!isCurrentPersona && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={switching} className={className}>
          <Shuffle className="mr-2 h-4 w-4" />
          {switching ? "Switching..." : "Switch Persona"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Demo Personas</span>
            {currentPersona && (
              <Badge variant="secondary" className="text-xs">
                Current: {currentPersona.role}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {demoPersonas.map((persona) => {
          const Icon = persona.icon
          const isCurrentPersona = persona.email === user?.email
          
          return (
            <DropdownMenuItem
              key={persona.email}
              className={`p-3 cursor-pointer ${isCurrentPersona ? 'bg-muted' : ''}`}
              onClick={() => !isCurrentPersona && handlePersonaSwitch(persona)}
              disabled={switching || isCurrentPersona}
            >
              <div className="flex items-start space-x-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${persona.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{persona.name}</span>
                    {isCurrentPersona && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs mb-1">
                    {persona.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {persona.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{persona.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
                {!isCurrentPersona && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}