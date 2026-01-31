"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  CreditCard, Building2, DollarSign, Shield, CheckCircle,
  AlertCircle, Calendar, ArrowRight, Lock
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { BillingAPI } from '@/lib/api-client'
import Link from 'next/link'

interface AccountSummary {
  balance: number
  due_date: string | null
  minimum_payment: number
  invoices: Array<{
    id: number
    invoice_number: string
    total_amount: number
    balance: number
    due_date: string
    status: string
  }>
}

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
  const [amount, setAmount] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accountData, setAccountData] = useState<AccountSummary | null>(null)
  const { toast } = useToast()

  const fetchAccountSummary = useCallback(async () => {
    setLoading(true)
    try {
      const response = await BillingAPI.getStudentSummary()
      setAccountData(response.data)
    } catch (error) {
      console.error('Failed to fetch account summary:', error)
      // Use fallback values if API fails
      setAccountData({
        balance: 0,
        due_date: null,
        minimum_payment: 0,
        invoices: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccountSummary()
  }, [fetchAccountSummary])

  // Account data from API or fallback
  const accountBalance = accountData?.balance || 0
  const dueDate = accountData?.due_date ? new Date(accountData.due_date) : addDays(new Date(), 14)
  const minimumPayment = accountData?.minimum_payment || Math.min(500, accountBalance)
  const primaryInvoice = accountData?.invoices?.[0]

  const handlePayment = async () => {
    if (!primaryInvoice) {
      toast({ title: 'No invoice to pay', variant: 'destructive' })
      return
    }

    setProcessing(true)
    try {
      await BillingAPI.createPayment({
        invoice_id: primaryInvoice.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod === 'card' ? 'credit_card' : 'ach',
        reference_number: `PAY-${Date.now()}`
      })
      setPaymentComplete(true)
      toast({ title: 'Payment successful' })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Payment failed'
      toast({ title: message, variant: 'destructive' })
    } finally {
      setProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  const quickAmounts = [
    { label: 'Minimum Due', value: minimumPayment },
    { label: 'Full Balance', value: accountBalance },
    { label: '$500', value: 500 },
    { label: '$1,000', value: 1000 },
  ]

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="detail" />
      </AppShell>
    )
  }

  if (paymentComplete) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
            <p className="text-muted-foreground mb-6">
              Your payment of ${parseFloat(amount).toFixed(2)} has been processed successfully.
              A confirmation email has been sent to your university email address.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/student/billing">View Account</Link>
              </Button>
              <Button asChild>
                <Link href="/student">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (accountBalance === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">No Balance Due</h1>
            <p className="text-muted-foreground mb-6">
              Your account has no outstanding balance. You're all set!
            </p>
            <Button asChild>
              <Link href="/student">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageShell title="Make a Payment" description="Pay your tuition and fees securely online">

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Account Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="text-2xl font-bold">${accountBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-muted-foreground">Payment Due Date</span>
                  <div className="text-right">
                    <span className="font-medium">{format(dueDate, 'MMMM d, yyyy')}</span>
                    <Badge variant="secondary" className="ml-2">
                      {Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-muted-foreground">Minimum Payment</span>
                  <span className="font-medium">${minimumPayment.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Amount */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {quickAmounts.map((qa) => (
                    <Button
                      key={qa.label}
                      variant={amount === qa.value.toString() ? 'default' : 'outline'}
                      className="h-auto py-3 flex-col"
                      onClick={() => setAmount(qa.value.toString())}
                    >
                      <span className="text-xs text-muted-foreground">{qa.label}</span>
                      <span className="font-bold">${qa.value.toFixed(2)}</span>
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9 text-lg"
                    min="0"
                    step="0.01"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'card' | 'bank')}
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Discover, AMEX</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Bank Account (ACH)</p>
                        <p className="text-xs text-muted-foreground">No processing fee</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <Separator />

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiration</Label>
                        <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" className="mt-1" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A 2.75% convenience fee will be applied to card payments.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input id="routingNumber" placeholder="123456789" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" placeholder="1234567890" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="accountName">Name on Account</Label>
                      <Input id="accountName" placeholder="John Doe" className="mt-1" />
                    </div>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No convenience fee for bank account payments.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Amount</span>
                  <span className="font-medium">${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                </div>
                {paymentMethod === 'card' && amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Convenience Fee (2.75%)</span>
                    <span className="font-medium">${(parseFloat(amount) * 0.0275).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    ${amount
                      ? (parseFloat(amount) * (paymentMethod === 'card' ? 1.0275 : 1)).toFixed(2)
                      : '0.00'}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Need help with your payment? Contact the Bursar's Office at
                  <a href="mailto:bursar@university.edu" className="text-primary ml-1">
                    bursar@university.edu
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Please review your payment details before proceeding.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${parseFloat(amount || '0').toFixed(2)}</span>
              </div>
              {paymentMethod === 'card' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Convenience Fee</span>
                  <span className="font-medium">${(parseFloat(amount || '0') * 0.0275).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Account'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold">
                  ${(parseFloat(amount || '0') * (paymentMethod === 'card' ? 1.0275 : 1)).toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={processing}>
                {processing ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
    </AppShell>
  )
}
