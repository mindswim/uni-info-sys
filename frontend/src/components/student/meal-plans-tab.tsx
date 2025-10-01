"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/layouts"
import { Utensils, Calendar } from "lucide-react"

export function MealPlansTab() {
  return (
    <div className="space-y-6">
      {/* Meal Plan Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Meal Swipes Remaining"
          value="142"
          description="Out of 180 this semester"
          icon={<Utensils className="h-4 w-4" />}
        />
        <StatCard
          title="Dining Dollars"
          value="$87.50"
          description="Expires at semester end"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Current Meal Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">Unlimited Plus Plan</p>
            <p className="text-sm text-muted-foreground">
              Unlimited dining hall access plus $200 dining dollars per semester
            </p>
          </div>
          {/* TODO: Plan management, transaction history */}
        </CardContent>
      </Card>
    </div>
  )
}
