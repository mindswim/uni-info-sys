"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList } from "lucide-react"

export function RegistrationTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Registration for Spring 2025 opens on November 1st, 2024.
            </p>
            <Button disabled>
              <ClipboardList className="mr-2 h-4 w-4" />
              Registration Not Open
            </Button>
          </div>
          {/* TODO: Course search, shopping cart, registration workflow */}
        </CardContent>
      </Card>
    </div>
  )
}
