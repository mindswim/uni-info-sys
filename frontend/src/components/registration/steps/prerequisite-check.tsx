"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRegistrationStore } from '@/stores/registration-store'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Info,
  ArrowRight
} from 'lucide-react'

// Mock completed courses (in real app, would fetch from API)
const completedCourses = [
  { code: 'CS101', name: 'Introduction to Computer Science', grade: 'A' },
  { code: 'CS102', name: 'Programming Fundamentals', grade: 'B+' },
  { code: 'MATH101', name: 'Calculus I', grade: 'A-' },
  { code: 'ENG101', name: 'English Composition', grade: 'B' },
  { code: 'HIST101', name: 'World History I', grade: 'A' }
]

export function PrerequisiteCheck() {
  const { shoppingCart, prerequisites, checkPrerequisites, moveToSelected } = useRegistrationStore()

  useEffect(() => {
    // Check prerequisites for all courses in cart
    shoppingCart.forEach(course => {
      checkPrerequisites(course)
    })
  }, [shoppingCart])

  const coursesWithIssues = prerequisites.filter(p => !p.met)
  const coursesReady = shoppingCart.filter(course => {
    const prereqStatus = prerequisites.find(p => p.courseId === course.id)
    return !prereqStatus || prereqStatus.met
  })

  const handleApproveAll = () => {
    coursesReady.forEach(course => {
      moveToSelected(course.id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      {coursesWithIssues.length > 0 ? (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Prerequisite Issues Found</AlertTitle>
          <AlertDescription className="text-yellow-800">
            {coursesWithIssues.length} course(s) have missing prerequisites.
            You'll need to resolve these before registration.
          </AlertDescription>
        </Alert>
      ) : shoppingCart.length > 0 ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">All Prerequisites Met!</AlertTitle>
          <AlertDescription className="text-green-800">
            All selected courses meet prerequisite requirements. You can proceed with registration.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Courses Selected</AlertTitle>
          <AlertDescription>
            Go back to the catalog to select courses for registration.
          </AlertDescription>
        </Alert>
      )}

      {/* Your Completed Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Completed Courses</CardTitle>
          <CardDescription>
            These courses satisfy prerequisites for advanced courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {completedCourses.map(course => (
              <Badge key={course.code} variant="secondary">
                {course.code} ({course.grade})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Prerequisites Status */}
      <div className="space-y-4">
        <h3 className="font-semibold">Prerequisites Analysis</h3>

        {shoppingCart.map(course => {
          const prereqStatus = prerequisites.find(p => p.courseId === course.id)
          const allMet = !prereqStatus || prereqStatus.met

          return (
            <Card key={course.id} className={allMet ? 'border-green-200' : 'border-yellow-200'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.code} - {course.name}
                    </CardTitle>
                    <CardDescription>
                      Section {course.section} • {course.credits} credits
                    </CardDescription>
                  </div>
                  {allMet ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing Prerequisites
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.prerequisites.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium mb-2">Prerequisites Required:</p>
                    <div className="space-y-2">
                      {course.prerequisites.map(prereq => {
                        const isCompleted = completedCourses.some(c => c.code === prereq)
                        return (
                          <div key={prereq} className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className={`text-sm ${isCompleted ? '' : 'text-destructive'}`}>
                              {prereq}
                              {isCompleted && (
                                <span className="text-muted-foreground ml-1">
                                  (Completed with {completedCourses.find(c => c.code === prereq)?.grade})
                                </span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No prerequisites required</p>
                )}

                {!allMet && prereqStatus && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm text-yellow-800">
                      Missing: {prereqStatus.missing.join(', ')}.
                      You'll need to complete these courses first or get instructor permission.
                    </AlertDescription>
                  </Alert>
                )}

                {allMet && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => moveToSelected(course.id)}
                  >
                    Approve for Registration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      {coursesReady.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleApproveAll}>
            Approve All Eligible Courses ({coursesReady.length})
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}