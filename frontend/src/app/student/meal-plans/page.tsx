"use client"

import { AppShell } from '@/components/layout/app-shell'
import { MealPlansTab } from '@/components/student/meal-plans-tab'

export default function MealPlansPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <p className="text-muted-foreground">
            View and manage your dining plans
          </p>
        </div>
        <MealPlansTab />
      </div>
    </AppShell>
  )
}
