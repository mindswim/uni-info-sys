'use client'

import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PersonaSwitcher() {
  const handleSwitch = (persona: string) => {
    // This is a demo component for switching between user personas
    console.log('Switching to persona:', persona)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Switch Persona
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Demo Personas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSwitch('student')}>
          Student View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitch('faculty')}>
          Faculty View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitch('admin')}>
          Admin View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
