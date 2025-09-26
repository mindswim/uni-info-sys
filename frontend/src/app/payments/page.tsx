'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, DollarSign, Building, Lock,
  CheckCircle, AlertCircle, Info, Calendar
} from 'lucide-react'

export default function PaymentsPage() {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentAmount, setPaymentAmount] = useState('full')
  const [customAmount, setCustomAmount] = useState('')
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [setupAutoPay, setSetupAutoPay] = useState(false)

  const currentBalance = 12450.00
  const minimumDue = 6225.00
  const convenienceFee = paymentMethod === 'card' ? currentBalance * 0.0275 : 0

  const calculateTotal = () => {
    let amount = 0
    if (paymentAmount === 'full') {
      amount = currentBalance
    } else if (paymentAmount === 'minimum') {
      amount = minimumDue
    } else if (paymentAmount === 'custom' && customAmount) {
      amount = parseFloat(customAmount)
    }
    return amount + convenienceFee
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/billing' },
    { label: 'Make Payment' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Make a Payment
          </h1>
          <p className="text-muted-foreground">
            Pay your student account balance securely
          </p>
        </div>

        {/* Security Notice */}
        <Alert className="border-green-200 bg-green-50">
          <Lock className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Secure Payment</strong> - Your payment information is encrypted and secure.
            We never store your full card number.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Payment Amount */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Amount</CardTitle>
                <CardDescription>
                  Select how much you would like to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentAmount} onValueChange={setPaymentAmount}>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Pay Full Balance</p>
                          <p className="text-sm text-muted-foreground">Clear your entire balance</p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-bold">{formatCurrency(currentBalance)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimum" id="minimum" />
                      <Label htmlFor="minimum" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Pay Minimum Due</p>
                          <p className="text-sm text-muted-foreground">Avoid late fees</p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-bold">{formatCurrency(minimumDue)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer">
                        <div>
                          <p className="font-medium">Custom Amount</p>
                          <p className="text-sm text-muted-foreground">Pay a specific amount</p>
                        </div>
                      </Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setPaymentAmount('custom')
                      }}
                      className="w-32"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </RadioGroup>

                {/* AutoPay Option */}
                <div className="flex items-start space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Checkbox
                    id="autopay"
                    checked={setupAutoPay}
                    onCheckedChange={(checked) => setSetupAutoPay(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="autopay" className="cursor-pointer">
                      <p className="font-medium">Setup AutoPay</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically pay your balance on the due date each month
                      </p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose how you would like to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit/Debit Card
                          </p>
                          <p className="text-sm text-muted-foreground">
                            2.75% convenience fee applies
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="ach" id="ach" />
                    <Label htmlFor="ach" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Bank Account (ACH)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            No convenience fee
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expMonth">Exp. Month</Label>
                          <Select>
                            <SelectTrigger id="expMonth">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">01</SelectItem>
                              <SelectItem value="02">02</SelectItem>
                              <SelectItem value="03">03</SelectItem>
                              <SelectItem value="04">04</SelectItem>
                              <SelectItem value="05">05</SelectItem>
                              <SelectItem value="06">06</SelectItem>
                              <SelectItem value="07">07</SelectItem>
                              <SelectItem value="08">08</SelectItem>
                              <SelectItem value="09">09</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expYear">Exp. Year</Label>
                          <Select>
                            <SelectTrigger id="expYear">
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2026">2026</SelectItem>
                              <SelectItem value="2027">2027</SelectItem>
                              <SelectItem value="2028">2028</SelectItem>
                              <SelectItem value="2029">2029</SelectItem>
                              <SelectItem value="2030">2030</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" maxLength={4} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'ach' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select>
                          <SelectTrigger id="accountType">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input id="routingNumber" placeholder="123456789" maxLength={9} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" placeholder="Account number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmAccount">Confirm Account Number</Label>
                        <Input id="confirmAccount" placeholder="Re-enter account number" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="font-medium">Billing Address</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" placeholder="123 Main Street" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select>
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ny">New York</SelectItem>
                            <SelectItem value="ca">California</SelectItem>
                            <SelectItem value="tx">Texas</SelectItem>
                            {/* Add more states */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" maxLength={5} />
                    </div>
                  </div>
                </div>

                {/* Save Payment Method */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="save"
                    checked={savePaymentMethod}
                    onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="save" className="cursor-pointer">
                      Save this payment method for future use
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Your payment information will be securely stored
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span>{formatCurrency(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Amount</span>
                    <span className="font-medium">
                      {paymentAmount === 'full' && formatCurrency(currentBalance)}
                      {paymentAmount === 'minimum' && formatCurrency(minimumDue)}
                      {paymentAmount === 'custom' && formatCurrency(parseFloat(customAmount) || 0)}
                    </span>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Convenience Fee (2.75%)</span>
                      <span>{formatCurrency(convenienceFee)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Payment</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Payment will be processed immediately. You will receive a confirmation email.
                  </AlertDescription>
                </Alert>

                {setupAutoPay && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      AutoPay will be activated for future payments
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" size="lg" disabled={calculateTotal() === 0}>
                  <Lock className="h-4 w-4 mr-2" />
                  Submit Payment {formatCurrency(calculateTotal())}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting this payment, you agree to our terms and conditions
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}