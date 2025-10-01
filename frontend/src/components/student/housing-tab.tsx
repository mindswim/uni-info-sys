"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, MapPin } from "lucide-react"

export function HousingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Housing Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Johnson Hall, Room 314</p>
                <p className="text-sm text-muted-foreground">Double occupancy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Roommate: Alex Johnson</p>
                <p className="text-sm text-muted-foreground">Computer Science, Junior</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">North Campus</p>
                <p className="text-sm text-muted-foreground">10 minute walk to main library</p>
              </div>
            </div>
          </div>
          {/* TODO: Roommate preferences, maintenance requests */}
        </CardContent>
      </Card>
    </div>
  )
}
