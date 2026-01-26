"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign, Search, TrendingUp, AlertCircle, CheckCircle,
  Download, CreditCard, Receipt, Users
} from 'lucide-react'
import { format } from 'date-fns'

interface Invoice {
  id: string
  student_name: string
  student_id: string
  amount: number
  due_date: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  term: string
  type: 'tuition' | 'fees' | 'housing' | 'meal_plan'
}

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock billing data
  const invoices: Invoice[] = [
    {
      id: 'INV-2025-001',
      student_name: 'Maria Rodriguez',
      student_id: 'STU001',
      amount: 15000,
      due_date: '2025-02-01',
      status: 'pending',
      term: 'Spring 2025',
      type: 'tuition',
    },
    {
      id: 'INV-2025-002',
      student_name: 'David Park',
      student_id: 'STU002',
      amount: 2450,
      due_date: '2025-01-15',
      status: 'overdue',
      term: 'Spring 2025',
      type: 'tuition',
    },
    {
      id: 'INV-2025-003',
      student_name: 'Sophie Turner',
      student_id: 'STU003',
      amount: 15000,
      due_date: '2025-02-01',
      status: 'paid',
      term: 'Spring 2025',
      type: 'tuition',
    },
    {
      id: 'INV-2025-004',
      student_name: 'James Wilson',
      student_id: 'STU004',
      amount: 7500,
      due_date: '2025-02-01',
      status: 'partial',
      term: 'Spring 2025',
      type: 'tuition',
    },
    {
      id: 'INV-2025-005',
      student_name: 'Emma Johnson',
      student_id: 'STU005',
      amount: 4500,
      due_date: '2025-02-01',
      status: 'paid',
      term: 'Spring 2025',
      type: 'housing',
    },
  ]

  // Stats
  const stats = {
    totalBilled: invoices.reduce((sum, i) => sum + i.amount, 0),
    totalCollected: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
  }

  const filteredInvoices = invoices.filter(inv => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!inv.student_name.toLowerCase().includes(q) &&
          !inv.student_id.toLowerCase().includes(q) &&
          !inv.id.toLowerCase().includes(q)) {
        return false
      }
    }
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'partial':
        return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Billing & Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Manage student billing and payment processing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalBilled)}</p>
                  <p className="text-xs text-muted-foreground">Total Billed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalCollected)}</p>
                  <p className="text-xs text-muted-foreground">Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.outstanding)}</p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.overdue)}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, ID, or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.student_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.student_id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{invoice.type.replace('_', ' ')}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  )
}
