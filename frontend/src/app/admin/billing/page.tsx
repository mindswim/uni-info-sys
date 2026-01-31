"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { PageShell } from '@/components/layout/page-shell'
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
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  DollarSign, Search, TrendingUp, AlertCircle, CheckCircle,
  Download, CreditCard, Receipt, Users, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { BillingAPI } from '@/lib/api-client'

interface Invoice {
  id: number
  invoice_number?: string
  student_id: number
  student?: {
    id: number
    first_name: string
    last_name: string
    student_number: string
    user?: { email: string }
  }
  term_id?: number
  term?: { name: string }
  total_amount: number
  amount_paid: number
  balance: number
  due_date: string
  status: string
  created_at: string
  line_items?: Array<{
    id: number
    description: string
    amount: number
    type: string
  }>
}

// Helper functions
function getStudentName(invoice: Invoice): string {
  if (invoice.student) {
    return `${invoice.student.first_name} ${invoice.student.last_name}`
  }
  return `Student #${invoice.student_id}`
}

function getStudentNumber(invoice: Invoice): string {
  return invoice.student?.student_number || `#${invoice.student_id}`
}

function getInvoiceNumber(invoice: Invoice): string {
  return invoice.invoice_number || `INV-${invoice.id}`
}

function getTermName(invoice: Invoice): string {
  return invoice.term?.name || ''
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const response = await BillingAPI.getInvoices({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setInvoices(response.data || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      toast({ title: 'Failed to load invoices', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Stats calculated from real data
  const stats = {
    totalBilled: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    totalCollected: invoices.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
    outstanding: invoices.reduce((sum, i) => sum + (i.balance || 0), 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.balance || 0), 0),
  }

  const filteredInvoices = invoices.filter(inv => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const studentName = getStudentName(inv).toLowerCase()
      const studentNumber = getStudentNumber(inv).toLowerCase()
      const invoiceNumber = getInvoiceNumber(inv).toLowerCase()
      if (!studentName.includes(q) && !studentNumber.includes(q) && !invoiceNumber.includes(q)) {
        return false
      }
    }
    // Status is filtered server-side, but double-check locally
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="list" />
      </AppShell>
    )
  }

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
      <PageShell
        title="Billing & Invoices"
        description="Manage student billing and payment processing"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </>
        }
      >
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
                <TableHead>Term</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{getInvoiceNumber(invoice)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getStudentName(invoice)}</p>
                      <p className="text-xs text-muted-foreground">{getStudentNumber(invoice)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTermName(invoice) || '-'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
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
      </PageShell>
    </AppShell>
  )
}
