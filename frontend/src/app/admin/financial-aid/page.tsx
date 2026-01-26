"use client"

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
  DollarSign, Search, Award, FileText, CheckCircle, Clock,
  AlertCircle, Download, Users, TrendingUp
} from 'lucide-react'

interface AidPackage {
  id: number
  student_name: string
  student_id: string
  total_aid: number
  grants: number
  loans: number
  work_study: number
  status: 'pending' | 'offered' | 'accepted' | 'declined'
  term: string
  fafsa_status: 'complete' | 'incomplete' | 'verification'
}

export default function FinancialAidAdminPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock aid packages
  const packages: AidPackage[] = [
    {
      id: 1,
      student_name: 'Maria Rodriguez',
      student_id: 'STU001',
      total_aid: 25000,
      grants: 15000,
      loans: 8000,
      work_study: 2000,
      status: 'accepted',
      term: 'Spring 2025',
      fafsa_status: 'complete',
    },
    {
      id: 2,
      student_name: 'David Park',
      student_id: 'STU002',
      total_aid: 18500,
      grants: 10000,
      loans: 7000,
      work_study: 1500,
      status: 'offered',
      term: 'Spring 2025',
      fafsa_status: 'complete',
    },
    {
      id: 3,
      student_name: 'Sophie Turner',
      student_id: 'STU003',
      total_aid: 22000,
      grants: 12000,
      loans: 8500,
      work_study: 1500,
      status: 'pending',
      term: 'Spring 2025',
      fafsa_status: 'verification',
    },
    {
      id: 4,
      student_name: 'James Wilson',
      student_id: 'STU004',
      total_aid: 15000,
      grants: 8000,
      loans: 5500,
      work_study: 1500,
      status: 'accepted',
      term: 'Spring 2025',
      fafsa_status: 'complete',
    },
    {
      id: 5,
      student_name: 'Emma Johnson',
      student_id: 'STU005',
      total_aid: 30000,
      grants: 20000,
      loans: 8000,
      work_study: 2000,
      status: 'offered',
      term: 'Spring 2025',
      fafsa_status: 'complete',
    },
  ]

  // Stats
  const stats = {
    totalAwarded: packages.reduce((sum, p) => sum + p.total_aid, 0),
    totalGrants: packages.reduce((sum, p) => sum + p.grants, 0),
    packagesOffered: packages.filter(p => p.status === 'offered' || p.status === 'accepted').length,
    pendingVerification: packages.filter(p => p.fafsa_status === 'verification').length,
  }

  const filteredPackages = packages.filter(pkg => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!pkg.student_name.toLowerCase().includes(q) &&
          !pkg.student_id.toLowerCase().includes(q)) {
        return false
      }
    }
    if (statusFilter !== 'all' && pkg.status !== statusFilter) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>
      case 'offered':
        return <Badge className="bg-blue-100 text-blue-800">Offered</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case 'declined':
        return <Badge className="bg-gray-100 text-gray-800">Declined</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFafsaBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
      case 'verification':
        return <Badge variant="outline" className="text-amber-600"><Clock className="h-3 w-3 mr-1" />Verification</Badge>
      case 'incomplete':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Incomplete</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Financial Aid Administration</h1>
            <p className="text-sm text-muted-foreground">
              Manage student financial aid packages and disbursements
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalAwarded)}</p>
                  <p className="text-xs text-muted-foreground">Total Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalGrants)}</p>
                  <p className="text-xs text-muted-foreground">In Grants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.packagesOffered}</p>
                  <p className="text-xs text-muted-foreground">Packages Offered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pendingVerification}</p>
                  <p className="text-xs text-muted-foreground">Pending Verification</p>
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
                  placeholder="Search by student name or ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Aid Packages Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Total Aid</TableHead>
                <TableHead>Breakdown</TableHead>
                <TableHead>FAFSA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{pkg.student_name}</p>
                      <p className="text-xs text-muted-foreground">{pkg.student_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg font-bold">{formatCurrency(pkg.total_aid)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Grants</span>
                        <span className="font-medium">{formatCurrency(pkg.grants)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loans</span>
                        <span className="font-medium">{formatCurrency(pkg.loans)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Work-Study</span>
                        <span className="font-medium">{formatCurrency(pkg.work_study)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getFafsaBadge(pkg.fafsa_status)}</TableCell>
                  <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
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
