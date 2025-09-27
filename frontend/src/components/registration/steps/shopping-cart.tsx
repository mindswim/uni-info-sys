"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRegistrationStore } from '@/stores/registration-store'
import {
  Trash2,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export function ShoppingCartReview() {
  const {
    shoppingCart,
    selectedCourses,
    removeFromCart,
    moveToSelected,
    moveToCart,
    getTotalCredits
  } = useRegistrationStore()

  const totalCredits = getTotalCredits()
  const cartCredits = shoppingCart.reduce((sum, course) => sum + course.credits, 0)
  const maxCredits = 18 // Maximum credits allowed per semester

  return (
    <div className="space-y-6">
      {/* Credit Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected for Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalCredits} credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shoppingCart.length}</div>
            <p className="text-xs text-muted-foreground">
              {cartCredits} credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Credit Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCredits} / {maxCredits}
            </div>
            <p className="text-xs text-muted-foreground">
              {maxCredits - totalCredits} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning for credit limit */}
      {totalCredits + cartCredits > maxCredits && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Adding all courses in your cart would exceed the {maxCredits} credit limit by{' '}
            {totalCredits + cartCredits - maxCredits} credits. Remove some courses to proceed.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Courses (Ready for Registration) */}
      {selectedCourses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Ready for Registration</h3>
            <Badge className="bg-green-100 text-green-800">
              {totalCredits} credits
            </Badge>
          </div>

          <div className="space-y-3">
            {selectedCourses.map(course => (
              <Card key={course.id} className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div>
                        <h4 className="font-medium">
                          {course.code} - {course.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Section {course.section} • {course.credits} credits
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {course.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.schedule.days.join(', ')} {course.schedule.startTime}-{course.schedule.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {course.location}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveToCart(course.id)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Move to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shopping Cart (Pending Selection) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5" />
          <h3 className="font-semibold">Shopping Cart</h3>
          <Badge variant="secondary">
            {cartCredits} credits
          </Badge>
        </div>

        {shoppingCart.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Your shopping cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Go back to the catalog to add more courses
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {shoppingCart.map(course => {
              const wouldExceedLimit = totalCredits + course.credits > maxCredits

              return (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div>
                          <h4 className="font-medium">
                            {course.code} - {course.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Section {course.section} • {course.credits} credits
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {course.instructor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.schedule.days.join(', ')} {course.schedule.startTime}-{course.schedule.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {course.location}
                          </span>
                        </div>
                        {wouldExceedLimit && (
                          <p className="text-xs text-yellow-600">
                            Would exceed credit limit
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveToSelected(course.id)}
                          disabled={wouldExceedLimit}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}