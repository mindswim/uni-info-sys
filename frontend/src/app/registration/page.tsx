"use client"

import { useState } from 'react'
import { AppShell } from "@/components/layout/app-shell"
import { CourseRegistrationWizard } from "@/components/registration/course-registration-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertCircle, BookOpen } from 'lucide-react'

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Registration', href: '/registration' }
]

// Mock data for registration periods
const registrationPeriods = {
  current: {
    term: 'Spring 2025',
    status: 'open',
    startDate: '2024-11-15',
    endDate: '2025-01-15',
    appointmentTime: '2024-11-16 10:00 AM',
    creditsAllowed: 18,
    creditsEnrolled: 0
  }
}

export default function RegistrationPage() {
  const [showWizard, setShowWizard] = useState(false)
  const period = registrationPeriods.current

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto py-6">
        {!showWizard ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Course Registration</h1>
              <p className="text-muted-foreground mt-2">
                Register for courses for {period.term}
              </p>
            </div>

            {/* Registration Status */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Registration for {period.term} is currently <strong className="uppercase">{period.status}</strong>.
                Your registration appointment begins on {period.appointmentTime}.
              </AlertDescription>
            </Alert>

            {/* Registration Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Registration Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{period.term}</div>
                  <p className="text-xs text-muted-foreground">
                    {period.startDate} - {period.endDate}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Your Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    {period.appointmentTime}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Credit Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {period.creditsEnrolled} / {period.creditsAllowed}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Credits enrolled / allowed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Options</CardTitle>
                <CardDescription>
                  Choose how you want to register for courses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    size="lg"
                    className="h-auto flex-col py-4"
                    onClick={() => setShowWizard(true)}
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <div>
                      <div className="font-semibold">Browse & Register</div>
                      <div className="text-xs font-normal opacity-90">
                        Search courses and build your schedule
                      </div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => window.location.href = '/schedule'}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    <div>
                      <div className="font-semibold">View Schedule</div>
                      <div className="text-xs font-normal">
                        See your current course schedule
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Registration Tips</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Check prerequisites before selecting courses</li>
                    <li>• Have backup options in case courses fill up</li>
                    <li>• Consider your work and extracurricular commitments</li>
                    <li>• Meet with your advisor if you need guidance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <CourseRegistrationWizard
            onClose={() => setShowWizard(false)}
            termInfo={period}
          />
        )}
      </div>
    </AppShell>
  )
}