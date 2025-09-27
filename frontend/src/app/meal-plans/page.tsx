"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Coffee,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  CreditCard,
  Receipt,
  Utensils,
  Pizza,
  Apple,
  ChevronRight,
  Download,
  RefreshCw,
  ShoppingCart,
  Star
} from "lucide-react"

export default function MealPlansPage() {
  // Current meal plan
  const currentPlan = {
    name: "Unlimited Plus",
    type: "unlimited",
    swipes: "Unlimited",
    flexDollars: 200,
    guestPasses: 5,
    semesterCost: 2850,
    status: "active",
    startDate: "2024-08-22",
    endDate: "2025-05-15"
  }

  // Usage statistics
  const usage = {
    weeklyAverage: 14,
    todaySwipes: 2,
    flexDollarsUsed: 127.50,
    flexDollarsRemaining: 72.50,
    guestPassesUsed: 3,
    guestPassesRemaining: 2,
    favoriteLocation: "Main Dining Hall"
  }

  // Available meal plans
  const mealPlans = [
    {
      name: "Unlimited Plus",
      description: "Unlimited dining hall access + flex dollars",
      swipes: "Unlimited",
      flexDollars: 200,
      guestPasses: 5,
      semesterCost: 2850,
      popular: true,
      bestFor: "Heavy eaters, athletes"
    },
    {
      name: "Block 175",
      description: "175 meals per semester + flex dollars",
      swipes: "175 meals",
      flexDollars: 300,
      guestPasses: 3,
      semesterCost: 2450,
      popular: false,
      bestFor: "Moderate eaters"
    },
    {
      name: "Block 125",
      description: "125 meals per semester + flex dollars",
      swipes: "125 meals",
      flexDollars: 400,
      guestPasses: 2,
      semesterCost: 2150,
      popular: false,
      bestFor: "Light eaters, upperclassmen"
    },
    {
      name: "Flex Only",
      description: "No meal swipes, only flex dollars",
      swipes: "None",
      flexDollars: 1500,
      guestPasses: 0,
      semesterCost: 1500,
      popular: false,
      bestFor: "Off-campus students"
    }
  ]

  // Dining locations
  const diningLocations = [
    {
      name: "Main Dining Hall",
      type: "dining_hall",
      hours: "7:00 AM - 10:00 PM",
      status: "open",
      distance: "0.2 mi",
      acceptsSwipes: true,
      acceptsFlex: true,
      rating: 4.2
    },
    {
      name: "North Campus Dining",
      type: "dining_hall",
      hours: "7:00 AM - 9:00 PM",
      status: "open",
      distance: "0.5 mi",
      acceptsSwipes: true,
      acceptsFlex: true,
      rating: 4.5
    },
    {
      name: "Union Food Court",
      type: "retail",
      hours: "8:00 AM - 11:00 PM",
      status: "open",
      distance: "0.3 mi",
      acceptsSwipes: false,
      acceptsFlex: true,
      rating: 4.0
    },
    {
      name: "Library Café",
      type: "cafe",
      hours: "7:30 AM - 2:00 AM",
      status: "open",
      distance: "0.4 mi",
      acceptsSwipes: false,
      acceptsFlex: true,
      rating: 4.7
    },
    {
      name: "Athletic Center Grill",
      type: "retail",
      hours: "11:00 AM - 8:00 PM",
      status: "closed",
      distance: "0.6 mi",
      acceptsSwipes: false,
      acceptsFlex: true,
      rating: 3.9
    }
  ]

  // Recent transactions
  const recentTransactions = [
    {
      date: "2024-12-19",
      time: "12:35 PM",
      location: "Main Dining Hall",
      type: "swipe",
      amount: null
    },
    {
      date: "2024-12-19",
      time: "8:15 AM",
      location: "Library Café",
      type: "flex",
      amount: 8.75
    },
    {
      date: "2024-12-18",
      time: "6:45 PM",
      location: "North Campus Dining",
      type: "swipe",
      amount: null
    },
    {
      date: "2024-12-18",
      time: "2:20 PM",
      location: "Union Food Court",
      type: "flex",
      amount: 12.50
    },
    {
      date: "2024-12-18",
      time: "9:00 AM",
      location: "Main Dining Hall",
      type: "guest",
      amount: null
    }
  ]

  // Nutritional summary (weekly)
  const nutrition = {
    averageCalories: 2150,
    averageProtein: 85,
    averageCarbs: 280,
    averageFat: 75,
    topCategories: ["Grilled Items", "Salad Bar", "Pizza", "Pasta"]
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meal Plans</h1>
            <p className="text-muted-foreground mt-1">Manage your dining plan and track usage</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              View Statement
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
          </div>
        </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Current Meal Plan
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  {currentPlan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">
                    Active from {new Date(currentPlan.startDate).toLocaleDateString()} to{" "}
                    {new Date(currentPlan.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Meal Swipes</p>
                    <p className="text-xl font-semibold">{currentPlan.swipes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Flex Dollars</p>
                    <p className="text-xl font-semibold">${currentPlan.flexDollars}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Guest Passes</p>
                    <p className="text-xl font-semibold">{currentPlan.guestPasses}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Semester Cost</span>
                    <span className="text-lg font-bold">${currentPlan.semesterCost}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Flex Dollars</span>
                  <span className="text-sm font-medium">
                    ${usage.flexDollarsRemaining} / ${currentPlan.flexDollars}
                  </span>
                </div>
                <Progress value={(usage.flexDollarsRemaining / currentPlan.flexDollars) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Guest Passes</span>
                  <span className="text-sm font-medium">
                    {usage.guestPassesRemaining} / {currentPlan.guestPasses}
                  </span>
                </div>
                <Progress value={(usage.guestPassesRemaining / currentPlan.guestPasses) * 100} />
              </div>

              <div className="pt-2 space-y-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Swipes</span>
                  <span className="font-medium">{usage.todaySwipes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Average</span>
                  <span className="font-medium">{usage.weeklyAverage} meals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Favorite Spot</span>
                  <span className="font-medium text-sm">{usage.favoriteLocation}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="locations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="locations">Dining Locations</TabsTrigger>
            <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campus Dining Locations</CardTitle>
                <CardDescription>Find dining halls, cafés, and retail locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diningLocations.map((location, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{location.name}</h4>
                            <Badge variant={location.status === "open" ? "secondary" : "outline"}>
                              {location.status}
                            </Badge>
                            {location.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span>{location.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {location.hours}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {location.distance}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {location.acceptsSwipes && (
                              <Badge variant="outline" className="text-xs">
                                Meal Swipes
                              </Badge>
                            )}
                            {location.acceptsFlex && (
                              <Badge variant="outline" className="text-xs">
                                Flex Dollars
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          View Menu
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your dining activity for the past week</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {transaction.type === "swipe" ? (
                          <Utensils className="h-4 w-4 text-muted-foreground" />
                        ) : transaction.type === "flex" ? (
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{transaction.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date} at {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {transaction.type === "swipe" && (
                          <Badge variant="secondary" className="text-xs">Meal Swipe</Badge>
                        )}
                        {transaction.type === "guest" && (
                          <Badge variant="outline" className="text-xs">Guest Pass</Badge>
                        )}
                        {transaction.amount && (
                          <span className="font-medium">-${transaction.amount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Meal Plans</CardTitle>
                <CardDescription>Compare and change your meal plan for next semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mealPlans.map((plan, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${plan.name === currentPlan.name ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{plan.name}</h4>
                            {plan.popular && (
                              <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                            )}
                            {plan.name === currentPlan.name && (
                              <Badge className="text-xs">Current Plan</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Swipes: </span>
                              <span className="font-medium">{plan.swipes}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Flex: </span>
                              <span className="font-medium">${plan.flexDollars}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Guest Passes: </span>
                              <span className="font-medium">{plan.guestPasses}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Best for: {plan.bestFor}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-2xl font-bold">${plan.semesterCost}</p>
                          <p className="text-xs text-muted-foreground">per semester</p>
                          {plan.name !== currentPlan.name && (
                            <Button size="sm">Select Plan</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Meal plan changes take effect at the start of the next semester.
                    Changes must be submitted by the deadline shown in your student portal.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Summary</CardTitle>
                <CardDescription>Your average daily nutrition based on dining hall selections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Avg. Calories</p>
                    <p className="text-2xl font-bold">{nutrition.averageCalories}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-2xl font-bold">{nutrition.averageProtein}g</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-2xl font-bold">{nutrition.averageCarbs}g</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-2xl font-bold">{nutrition.averageFat}g</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Your Top Food Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutrition.topCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <Apple className="h-4 w-4" />
                  <AlertDescription>
                    Track your meals in the campus dining app to get personalized nutrition recommendations
                    and allergen alerts.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}