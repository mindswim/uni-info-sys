"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Info,
  X,
  UserCheck,
  User,
  Users,
  BookOpen,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { PersonaSwitcher } from "./persona-switcher"

const personaInfo = {
  "admin@demo.com": {
    name: "Dr. Elizabeth Harper",
    role: "System Administrator",
    description: "You have full administrative access to the university system",
    icon: UserCheck,
    color: "bg-red-100 border-red-200",
    accent: "text-red-800"
  },
  "maria@demo.com": {
    name: "Maria Rodriguez", 
    role: "Prospective Student",
    description: "Experience the system as a prospective international student applying for admission",
    icon: User,
    color: "bg-blue-100 border-blue-200", 
    accent: "text-blue-800"
  },
  "david@demo.com": {
    name: "David Park",
    role: "Current Student", 
    description: "Navigate the system as an enrolled student managing courses and academics",
    icon: BookOpen,
    color: "bg-green-100 border-green-200",
    accent: "text-green-800" 
  },
  "sophie@demo.com": {
    name: "Sophie Turner",
    role: "Transfer Student",
    description: "Experience features specific to transfer students and waitlist management", 
    icon: Users,
    color: "bg-purple-100 border-purple-200",
    accent: "text-purple-800"
  }
}

interface DemoBannerProps {
  className?: string
}

export function DemoBanner({ className }: DemoBannerProps) {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !user?.email) return null

  const persona = personaInfo[user.email as keyof typeof personaInfo]
  if (!persona) return null

  const Icon = persona.icon

  return (
    <Alert className={`${persona.color} ${persona.accent} ${className} relative`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <Badge variant="outline" className="border-current bg-white/50 text-xs">
            Demo Mode
          </Badge>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium text-sm">
              Signed in as {persona.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {persona.role}
            </Badge>
          </div>
          <p className="text-xs mt-1 opacity-90">
            {persona.description} • <PersonaSwitcher className="inline-flex h-6 text-xs px-2 py-1" /> to explore different roles
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-6 w-6 p-0 hover:bg-black/10 shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  )
}