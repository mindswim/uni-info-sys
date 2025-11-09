"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, BookOpen, BarChart3, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function WelcomeCard() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('welcome-dismissed') === 'true'
    }
    return false
  })

  const handleDismiss = () => {
    sessionStorage.setItem('welcome-dismissed', 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  const quickActions = [
    {
      title: "Manage Applications",
      description: "Review and process student applications",
      icon: FileText,
      href: "/admin/admissions",
      color: "text-blue-500"
    },
    {
      title: "View Students",
      description: "Access student records and information",
      icon: Users,
      href: "/admin/students",
      color: "text-green-500"
    },
    {
      title: "Course Enrollments",
      description: "Manage course sections and enrollments",
      icon: BookOpen,
      href: "/admin/enrollments",
      color: "text-purple-500"
    },
    {
      title: "Analytics Dashboard",
      description: "View reports and system analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-orange-500"
    }
  ]

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl">Welcome to UniSys Admin Portal</CardTitle>
        <CardDescription>
          Manage your university operations from this central dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-background p-2 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
