"use client"

import { useState, useEffect, useCallback } from 'react'
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
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  DollarSign, Search, Award, FileText, CheckCircle, Clock,
  AlertCircle, Download, Users, TrendingUp, RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FinancialAidAPI } from '@/lib/api-client'

interface AidPackage {
  id: number
  student_id: number
  student?: {
    id: number
    first_name: string
    last_name: string
    student_number: string
  }
  term_id?: number
  term?: { name: string }
  status: string
  aid_totals?: {
    grants: number
    scholarships: number
    loans: number
    work_study: number
    total_gift_aid: number
    total_aid: number
  }
  notes?: string
}

// Helper functions
function getStudentName(pkg: AidPackage): string {
  if (pkg.student) {
    return `${pkg.student.first_name} ${pkg.student.last_name}`
  }
  return `Student #${pkg.student_id}`
}

function getStudentNumber(pkg: AidPackage): string {
  return pkg.student?.student_number || `#${pkg.student_id}`
}

function getTermName(pkg: AidPackage): string {
  return pkg.term?.name || ''
}

function getTotalAid(pkg: AidPackage): number {
  return pkg.aid_totals?.total_aid || 0
}

function getGrants(pkg: AidPackage): number {
  return (pkg.aid_totals?.grants || 0) + (pkg.aid_totals?.scholarships || 0)
}

function getLoans(pkg: AidPackage): number {
  return pkg.aid_totals?.loans || 0
}

function getWorkStudy(pkg: AidPackage): number {
  return pkg.aid_totals?.work_study || 0
}

function getFafsaStatus(pkg: AidPackage): string {
  // Infer FAFSA status from notes or package status
  if (pkg.notes?.toLowerCase().includes('verification')) return 'verification'
  if (pkg.status === 'pending') return 'incomplete'
  return 'complete'
}

export default function FinancialAidAdminPage() {
  const [packages, setPackages] = useState<AidPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await FinancialAidAPI.getPackages({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      })
      setPackages(response.data || [])
    } catch (error) {
      console.error('Failed to fetch financial aid packages:', error)
      toast({ title: 'Failed to load packages', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, toast])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Stats calculated from real data
  const stats = {
    totalAwarded: packages.reduce((sum, p) => sum + getTotalAid(p), 0),
    totalGrants: packages.reduce((sum, p) => sum + getGrants(p), 0),
    packagesOffered: packages.filter(p => p.status === 'offered' || p.status === 'accepted').length,
    pendingVerification: packages.filter(p => getFafsaStatus(p) === 'verification').length,
  }

  const filteredPackages = packages.filter(pkg => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const studentName = getStudentName(pkg).toLowerCase()
      const studentNumber = getStudentNumber(pkg).toLowerCase()
      if (!studentName.includes(q) && !studentNumber.includes(q)) {
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

  if (loading) {
    return (
      <AppShell>
        <PageSkeleton type="list" />
      </AppShell>
    )
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
            <Button variant="outline" size="sm" onClick={fetchPackages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                      <p className="font-medium">{getStudentName(pkg)}</p>
                      <p className="text-xs text-muted-foreground">{getStudentNumber(pkg)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg font-bold">{formatCurrency(getTotalAid(pkg))}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Grants</span>
                        <span className="font-medium">{formatCurrency(getGrants(pkg))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loans</span>
                        <span className="font-medium">{formatCurrency(getLoans(pkg))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Work-Study</span>
                        <span className="font-medium">{formatCurrency(getWorkStudy(pkg))}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getFafsaBadge(getFafsaStatus(pkg))}</TableCell>
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
