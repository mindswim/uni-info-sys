'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar, CreditCard, DollarSign, FileText,
  CheckCircle, AlertCircle, Info, Clock,
  TrendingUp, Calculator, Shield, Zap, Phone
} from 'lucide-react'

export default function PaymentPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const currentBalance = 12450.00
  const enrollmentDeadline = '2025-01-05'

  const activePlan = {
    name: '5-Month Payment Plan',
    enrolled: '2024-08-15',
    totalAmount: 12450.00,
    paidAmount: 4980.00,
    remainingAmount: 7470.00,
    nextPayment: 2490.00,
    nextDueDate: '2025-01-05',
    paymentsCompleted: 2,
    totalPayments: 5,
    status: 'active'
  }

  const paymentHistory = [
    { date: '2024-09-05', amount: 2490.00, status: 'paid', method: 'Auto-debit' },
    { date: '2024-10-05', amount: 2490.00, status: 'paid', method: 'Auto-debit' },
    { date: '2024-11-05', amount: 2490.00, status: 'paid', method: 'Auto-debit' },
    { date: '2024-12-05', amount: 2490.00, status: 'paid', method: 'Auto-debit' },
    { date: '2025-01-05', amount: 2490.00, status: 'scheduled', method: 'Auto-debit' }
  ]

  const availablePlans = [
    {
      id: 'full',
      name: 'Pay in Full',
      description: 'Pay your entire balance now',
      enrollmentFee: 0,
      payments: 1,
      monthlyAmount: currentBalance,
      totalCost: currentBalance,
      savings: 75,
      features: ['No enrollment fee', 'No monthly payments', 'Save $75 on fees']
    },
    {
      id: '2pay',
      name: '2-Payment Plan',
      description: 'Split your balance into 2 payments',
      enrollmentFee: 25,
      payments: 2,
      monthlyAmount: currentBalance / 2,
      totalCost: currentBalance + 25,
      features: ['Low enrollment fee', '50% due at signup', 'Final payment in 30 days']
    },
    {
      id: '4pay',
      name: '4-Payment Plan',
      description: 'Spread costs over the semester',
      enrollmentFee: 50,
      payments: 4,
      monthlyAmount: currentBalance / 4,
      totalCost: currentBalance + 50,
      features: ['Monthly payments', 'Auto-debit available', 'No interest charges']
    },
    {
      id: '5pay',
      name: '5-Payment Plan',
      description: 'Maximum flexibility with lowest monthly payment',
      enrollmentFee: 75,
      payments: 5,
      monthlyAmount: currentBalance / 5,
      totalCost: currentBalance + 75,
      features: ['Lowest monthly payment', 'Auto-debit available', 'Extends through semester']
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/billing' },
    { label: 'Payment Plans' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Payment Plans
          </h1>
          <p className="text-muted-foreground">
            Manage your tuition payment plans and schedules
          </p>
        </div>

        {/* Active Plan Alert */}
        {activePlan && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Active Payment Plan:</strong> {activePlan.name} - Next payment of{' '}
                  <strong>{formatCurrency(activePlan.nextPayment)}</strong> due on{' '}
                  <strong>{activePlan.nextDueDate}</strong>
                </div>
                <Button size="sm" variant="outline">Make Payment</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {activePlan ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Payment Plan</CardTitle>
                    <CardDescription>
                      Enrolled on {activePlan.enrolled}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan Type</p>
                        <p className="text-lg font-semibold">{activePlan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">{formatCurrency(activePlan.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining Balance</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(activePlan.remainingAmount)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Payment Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {activePlan.paymentsCompleted} of {activePlan.totalPayments} payments
                        </span>
                      </div>
                      <Progress
                        value={(activePlan.paidAmount / activePlan.totalAmount) * 100}
                        className="h-3"
                      />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Paid: {formatCurrency(activePlan.paidAmount)}</span>
                        <span>Remaining: {formatCurrency(activePlan.remainingAmount)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Payment Schedule</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistory.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {payment.method}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Agreement
                    </Button>
                    <Button variant="destructive">
                      Cancel Plan
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Choose a Payment Plan</CardTitle>
                    <CardDescription>
                      Select a payment plan for your balance of {formatCurrency(currentBalance)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                      <div className="space-y-4">
                        {availablePlans.map((plan) => (
                          <div key={plan.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                              <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold">{plan.name}</p>
                                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    <div className="mt-3 space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Enrollment Fee:</span>
                                        <span className="font-medium">
                                          {plan.enrollmentFee === 0 ? 'FREE' : formatCurrency(plan.enrollmentFee)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Payment Amount:</span>
                                        <span className="font-medium">
                                          {formatCurrency(plan.monthlyAmount)}
                                          {plan.payments > 1 && '/month'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Total Cost:</span>
                                        <span className="font-bold">
                                          {formatCurrency(plan.totalCost)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                          {feature}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {plan.savings && (
                                    <Badge className="bg-green-100 text-green-800">
                                      Save ${plan.savings}
                                    </Badge>
                                  )}
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm cursor-pointer">
                          I agree to the payment plan terms and conditions. I understand that
                          enrolling in a payment plan may include an enrollment fee and that
                          payments will be automatically deducted on the scheduled dates.
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedPlan || !agreedToTerms}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Enroll in Payment Plan
                    </Button>
                  </CardFooter>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> You must enroll in a payment plan by{' '}
                    <strong>{enrollmentDeadline}</strong> to avoid late fees and registration holds.
                    All payment plans require automatic payment setup.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Plan Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No Interest Charges</p>
                    <p className="text-sm text-muted-foreground">
                      Spread payments with no additional interest
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calculator className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Budget-Friendly</p>
                    <p className="text-sm text-muted-foreground">
                      Manageable monthly payments
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Auto-Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Set it and forget it with automatic deductions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure & Protected</p>
                    <p className="text-sm text-muted-foreground">
                      Your payment information is encrypted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Have questions about payment plans or need assistance?
                </p>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Bursar Office
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment Plan FAQ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Spring 2025 Enrollment</p>
                  <p className="text-sm text-muted-foreground">Opens December 1, 2024</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Payment Plan Deadline</p>
                  <p className="text-sm text-muted-foreground">January 5, 2025</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Classes Begin</p>
                  <p className="text-sm text-muted-foreground">January 20, 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}