"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useRegistrationStore } from '@/stores/registration-store'
import {
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen,
  CreditCard,
  FileText,
  Printer
} from 'lucide-react'

interface RegistrationSummaryProps {
  termInfo: any
}

export function RegistrationSummary({ termInfo }: RegistrationSummaryProps) {
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedCourses, getTotalCredits } = useRegistrationStore()

  const totalCredits = getTotalCredits()
  const tuitionRate = 1250 // Per credit hour
  const estimatedTuition = totalCredits * tuitionRate
  const fees = 850 // Flat fees

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // In real app, would submit registration and navigate to success page
    alert('Registration submitted successfully!')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your schedule is ready for registration. Please review the details below and confirm.
        </AlertDescription>
      </Alert>

      {/* Term Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Term</p>
              <p className="font-medium">{termInfo.term}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Status</p>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="font-medium">{totalCredits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number of Courses</p>
              <p className="font-medium">{selectedCourses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses to Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedCourses.map((course, index) => (
              <div key={course.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">
                        {course.code} - {course.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Section {course.section} • CRN: {Math.random().toString().slice(2, 7)}
                      </p>
                    </div>
                    <Badge>{course.credits} credits</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {course.schedule.days.join(', ')} {course.schedule.startTime}-{course.schedule.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Jan 15 - May 10, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Financial Summary
          </CardTitle>
          <CardDescription>
            Estimated charges for {termInfo.term}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Tuition ({totalCredits} credits × ${tuitionRate})</span>
              <span className="font-medium">${estimatedTuition.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Fees</span>
              <span className="font-medium">${fees.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Estimated Total</span>
              <span className="font-bold text-lg">
                ${(estimatedTuition + fees).toLocaleString()}
              </span>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This is an estimate. Final charges may vary based on course fees, lab fees, and other factors.
              Financial aid will be applied after registration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-2 max-h-32 overflow-y-auto">
            <p>By registering for courses, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Pay all tuition and fees by the payment deadline</li>
              <li>Attend classes and complete all course requirements</li>
              <li>Adhere to the university's academic policies and code of conduct</li>
              <li>Understand the add/drop and withdrawal deadlines</li>
              <li>Accept responsibility for your academic progress</li>
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agree"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the registration terms and conditions
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Summary
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
          >
            Save as Draft
            <FileText className="h-4 w-4 ml-2" />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!agreed || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Registration'}
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}