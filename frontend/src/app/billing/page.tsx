'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DollarSign, CreditCard, Calendar, Download,
  AlertCircle, CheckCircle, Clock, FileText,
  TrendingUp, Receipt, Info
} from 'lucide-react'

interface Transaction {
  id: number
  date: string
  description: string
  type: 'charge' | 'payment' | 'credit' | 'adjustment'
  amount: number
  balance: number
  status: 'posted' | 'pending'
}

interface BillingStatement {
  term: string
  dueDate: string
  currentBalance: number
  minimumDue: number
  charges: {
    tuition: number
    fees: number
    housing: number
    mealPlan: number
    other: number
  }
  credits: {
    financialAid: number
    scholarships: number
    payments: number
  }
}

export default function BillingPage() {
  const [currentBalance, setCurrentBalance] = useState(12450.00)
  const [minimumDue, setMinimumDue] = useState(6225.00)
  const [dueDate, setDueDate] = useState('2024-01-15')
  const [selectedTerm, setSelectedTerm] = useState('Spring 2024')

  // Mock data
  const statement: BillingStatement = {
    term: 'Spring 2024',
    dueDate: '2024-01-15',
    currentBalance: 12450.00,
    minimumDue: 6225.00,
    charges: {
      tuition: 18750.00,
      fees: 1200.00,
      housing: 4500.00,
      mealPlan: 2300.00,
      other: 200.00
    },
    credits: {
      financialAid: 8000.00,
      scholarships: 5000.00,
      payments: 1500.00
    }
  }

  const recentTransactions: Transaction[] = [
    {
      id: 1,
      date: '2024-01-02',
      description: 'Spring 2024 Tuition',
      type: 'charge',
      amount: 18750.00,
      balance: 26950.00,
      status: 'posted'
    },
    {
      id: 2,
      date: '2024-01-02',
      description: 'Student Activity Fee',
      type: 'charge',
      amount: 450.00,
      balance: 27400.00,
      status: 'posted'
    },
    {
      id: 3,
      date: '2024-01-02',
      description: 'Technology Fee',
      type: 'charge',
      amount: 350.00,
      balance: 27750.00,
      status: 'posted'
    },
    {
      id: 4,
      date: '2024-01-02',
      description: 'Health Services Fee',
      type: 'charge',
      amount: 400.00,
      balance: 28150.00,
      status: 'posted'
    },
    {
      id: 5,
      date: '2024-01-03',
      description: 'Housing - Spring 2024',
      type: 'charge',
      amount: 4500.00,
      balance: 32650.00,
      status: 'posted'
    },
    {
      id: 6,
      date: '2024-01-03',
      description: 'Meal Plan - Gold',
      type: 'charge',
      amount: 2300.00,
      balance: 34950.00,
      status: 'posted'
    },
    {
      id: 7,
      date: '2024-01-05',
      description: 'Federal Pell Grant',
      type: 'credit',
      amount: -3000.00,
      balance: 31950.00,
      status: 'posted'
    },
    {
      id: 8,
      date: '2024-01-05',
      description: 'State Grant',
      type: 'credit',
      amount: -2000.00,
      balance: 29950.00,
      status: 'posted'
    },
    {
      id: 9,
      date: '2024-01-05',
      description: 'Federal Direct Loan',
      type: 'credit',
      amount: -3000.00,
      balance: 26950.00,
      status: 'posted'
    },
    {
      id: 10,
      date: '2024-01-06',
      description: 'Merit Scholarship',
      type: 'credit',
      amount: -5000.00,
      balance: 21950.00,
      status: 'posted'
    },
    {
      id: 11,
      date: '2024-01-08',
      description: 'Online Payment - Thank you',
      type: 'payment',
      amount: -1500.00,
      balance: 20450.00,
      status: 'posted'
    },
    {
      id: 12,
      date: '2024-01-10',
      description: 'Payment Plan Setup',
      type: 'adjustment',
      amount: 0,
      balance: 20450.00,
      status: 'posted'
    },
    {
      id: 13,
      date: '2024-01-10',
      description: 'Financial Aid Adjustment',
      type: 'credit',
      amount: -8000.00,
      balance: 12450.00,
      status: 'pending'
    }
  ]

  const paymentHistory = [
    { date: '2023-12-15', amount: 6500.00, method: 'ACH Transfer', term: 'Fall 2023' },
    { date: '2023-11-15', amount: 500.00, method: 'Credit Card', term: 'Fall 2023' },
    { date: '2023-10-15', amount: 1000.00, method: 'Check', term: 'Fall 2023' },
    { date: '2023-09-15', amount: 5000.00, method: 'ACH Transfer', term: 'Fall 2023' },
    { date: '2023-08-01', amount: 7500.00, method: 'ACH Transfer', term: 'Fall 2023' }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'charge': return 'text-red-600'
      case 'payment': return 'text-green-600'
      case 'credit': return 'text-green-600'
      case 'adjustment': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing & Payment' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8" />
              Billing & Payment
            </h1>
            <p className="text-muted-foreground">
              View your account balance, statements, and make payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Statement
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Alert for Due Date */}
        {new Date(dueDate) > new Date() && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your payment of {formatCurrency(minimumDue)} is due by {new Date(dueDate).toLocaleDateString()}.
              Avoid late fees by paying on time.
            </AlertDescription>
          </Alert>
        )}

        {/* Account Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
              <p className="text-xs text-muted-foreground">For {selectedTerm}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minimum Due</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(minimumDue)}</div>
              <p className="text-xs text-muted-foreground">By {new Date(dueDate).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(1500)}</div>
              <p className="text-xs text-muted-foreground">Jan 8, 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Plan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <p className="text-xs text-muted-foreground mt-1">4 payments of $3,112.50</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="statement" className="space-y-4">
          <TabsList>
            <TabsTrigger value="statement">Current Statement</TabsTrigger>
            <TabsTrigger value="activity">Account Activity</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="aid">Financial Aid</TabsTrigger>
          </TabsList>

          <TabsContent value="statement">
            <Card>
              <CardHeader>
                <CardTitle>Statement for {selectedTerm}</CardTitle>
                <CardDescription>
                  Statement Date: {new Date().toLocaleDateString()} | Due Date: {new Date(dueDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Charges */}
                <div>
                  <h3 className="font-semibold mb-3">Charges</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Tuition</span>
                      <span className="font-medium">{formatCurrency(statement.charges.tuition)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Fees</span>
                      <span className="font-medium">{formatCurrency(statement.charges.fees)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Housing</span>
                      <span className="font-medium">{formatCurrency(statement.charges.housing)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Meal Plan</span>
                      <span className="font-medium">{formatCurrency(statement.charges.mealPlan)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Other Charges</span>
                      <span className="font-medium">{formatCurrency(statement.charges.other)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span>Total Charges</span>
                      <span>{formatCurrency(
                        statement.charges.tuition + statement.charges.fees +
                        statement.charges.housing + statement.charges.mealPlan +
                        statement.charges.other
                      )}</span>
                    </div>
                  </div>
                </div>

                {/* Credits */}
                <div>
                  <h3 className="font-semibold mb-3">Credits & Payments</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Financial Aid</span>
                      <span className="font-medium text-green-600">-{formatCurrency(statement.credits.financialAid)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Scholarships</span>
                      <span className="font-medium text-green-600">-{formatCurrency(statement.credits.scholarships)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Payments</span>
                      <span className="font-medium text-green-600">-{formatCurrency(statement.credits.payments)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span>Total Credits</span>
                      <span className="text-green-600">-{formatCurrency(
                        statement.credits.financialAid + statement.credits.scholarships +
                        statement.credits.payments
                      )}</span>
                    </div>
                  </div>
                </div>

                {/* Balance Due */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">Balance Due</p>
                      <p className="text-sm text-muted-foreground">Due by {new Date(dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="flex gap-2">
                  <Button className="flex-1">Pay Full Balance</Button>
                  <Button variant="outline" className="flex-1">Pay Minimum Due</Button>
                  <Button variant="outline" className="flex-1">Setup Payment Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>All transactions for your student account</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type === 'charge' ? '' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.balance)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'posted' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.term}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aid">
            <Card>
              <CardHeader>
                <CardTitle>Financial Aid Summary</CardTitle>
                <CardDescription>Your financial aid awards and disbursements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your financial aid has been applied to your account. Any remaining credit will be refunded to you.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Federal Pell Grant</p>
                        <p className="text-sm text-muted-foreground">2023-2024 Award Year</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Disbursed</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Award</p>
                        <p className="font-medium">{formatCurrency(6000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spring Disbursement</p>
                        <p className="font-medium">{formatCurrency(3000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disbursed Date</p>
                        <p className="font-medium">Jan 5, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">State Grant</p>
                        <p className="text-sm text-muted-foreground">2023-2024 Award Year</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Disbursed</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Award</p>
                        <p className="font-medium">{formatCurrency(4000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spring Disbursement</p>
                        <p className="font-medium">{formatCurrency(2000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disbursed Date</p>
                        <p className="font-medium">Jan 5, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Merit Scholarship</p>
                        <p className="text-sm text-muted-foreground">Academic Excellence Award</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Disbursed</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Award</p>
                        <p className="font-medium">{formatCurrency(10000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spring Disbursement</p>
                        <p className="font-medium">{formatCurrency(5000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disbursed Date</p>
                        <p className="font-medium">Jan 6, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Federal Direct Loan</p>
                        <p className="text-sm text-muted-foreground">Subsidized</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Award</p>
                        <p className="font-medium">{formatCurrency(6000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spring Disbursement</p>
                        <p className="font-medium">{formatCurrency(3000)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Date</p>
                        <p className="font-medium">Jan 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}