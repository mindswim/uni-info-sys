"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  ArrowRight,
  X,
  Search,
  ShoppingCart,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Import step components
import { CourseCatalog } from './steps/course-catalog'
import { PrerequisiteCheck } from './steps/prerequisite-check'
import { ShoppingCartReview } from './steps/shopping-cart'
import { ScheduleBuilder } from './steps/schedule-builder'
import { RegistrationSummary } from './steps/registration-summary'
import { useRegistrationStore } from '@/stores/registration-store'

interface CourseRegistrationWizardProps {
  onClose: () => void
  termInfo: any
}

const steps = [
  {
    id: 'catalog',
    title: 'Browse Courses',
    icon: Search,
    description: 'Search and select courses from the catalog'
  },
  {
    id: 'prerequisites',
    title: 'Check Prerequisites',
    icon: CheckCircle,
    description: 'Verify you meet all course requirements'
  },
  {
    id: 'cart',
    title: 'Shopping Cart',
    icon: ShoppingCart,
    description: 'Review and manage selected courses'
  },
  {
    id: 'schedule',
    title: 'Build Schedule',
    icon: Calendar,
    description: 'Resolve conflicts and finalize schedule'
  },
  {
    id: 'summary',
    title: 'Confirm & Register',
    icon: CheckCircle,
    description: 'Review and submit registration'
  }
]

export function CourseRegistrationWizard({ onClose, termInfo }: CourseRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const {
    selectedCourses,
    conflicts,
    prerequisites,
    clearAll
  } = useRegistrationStore()

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Here we would submit the registration
    console.log('Submitting registration:', selectedCourses)
    clearAll()
    onClose()
  }

  const renderStep = () => {
    switch (currentStepData.id) {
      case 'catalog':
        return <CourseCatalog />
      case 'prerequisites':
        return <PrerequisiteCheck />
      case 'cart':
        return <ShoppingCartReview />
      case 'schedule':
        return <ScheduleBuilder />
      case 'summary':
        return <RegistrationSummary termInfo={termInfo} />
      default:
        return null
    }
  }

  const StepIcon = currentStepData.icon

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <StepIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-muted-foreground">
                {selectedCourses.length} courses selected
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index < currentStep
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    onClick={() => setCurrentStep(index)}
                    disabled={index > currentStep}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium hidden lg:inline">
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="min-h-[500px]">
          {/* Warnings */}
          {conflicts.length > 0 && currentStep >= 3 && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                You have {conflicts.length} schedule conflict(s) that need to be resolved.
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          {renderStep()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {selectedCourses.length > 0 && (
              <Badge variant="secondary">
                {selectedCourses.reduce((sum, course) => sum + course.credits, 0)} credits
              </Badge>
            )}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete}>
              Complete Registration
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}