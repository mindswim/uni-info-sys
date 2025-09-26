'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Award, DollarSign, FileText, Calendar, Clock,
  CheckCircle, AlertCircle, Info, TrendingUp,
  Download, ExternalLink, School, Briefcase,
  Car, BookOpen, Home
} from 'lucide-react'

export default function FinancialAidPage() {
  const [academicYear, setAcademicYear] = useState('2024-2025')

  const aidPackage = {
    totalAid: 28500,
    totalCost: 42000,
    remainingNeed: 13500,
    disbursed: 14250,
    pending: 14250
  }

  const awards = [
    {
      id: 1,
      name: 'Federal Pell Grant',
      type: 'grant',
      amount: 6895,
      status: 'accepted',
      fall: 3447.50,
      spring: 3447.50,
      requirements: 'Maintain SAP'
    },
    {
      id: 2,
      name: 'State University Grant',
      type: 'grant',
      amount: 5600,
      status: 'accepted',
      fall: 2800,
      spring: 2800,
      requirements: 'Full-time enrollment'
    },
    {
      id: 3,
      name: 'Academic Excellence Scholarship',
      type: 'scholarship',
      amount: 10000,
      status: 'accepted',
      fall: 5000,
      spring: 5000,
      requirements: 'Maintain 3.5 GPA'
    },
    {
      id: 4,
      name: 'Federal Direct Subsidized Loan',
      type: 'loan',
      amount: 3500,
      status: 'accepted',
      fall: 1750,
      spring: 1750,
      requirements: 'Complete MPN & Entrance Counseling'
    },
    {
      id: 5,
      name: 'Federal Work-Study',
      type: 'work-study',
      amount: 2500,
      status: 'accepted',
      fall: 1250,
      spring: 1250,
      requirements: 'Secure campus employment'
    },
    {
      id: 6,
      name: 'Federal Direct Unsubsidized Loan',
      type: 'loan',
      amount: 2000,
      status: 'pending',
      fall: 1000,
      spring: 1000,
      requirements: 'Complete MPN'
    }
  ]

  const requirements = [
    {
      item: 'FAFSA 2024-2025',
      status: 'completed',
      date: '2024-02-15',
      action: null
    },
    {
      item: 'Verification Documents',
      status: 'completed',
      date: '2024-03-20',
      action: null
    },
    {
      item: 'Master Promissory Note',
      status: 'completed',
      date: '2024-07-10',
      action: null
    },
    {
      item: 'Entrance Counseling',
      status: 'completed',
      date: '2024-07-10',
      action: null
    },
    {
      item: 'FAFSA 2025-2026',
      status: 'pending',
      date: 'Due by March 1, 2025',
      action: 'Start Application'
    },
    {
      item: 'Scholarship Renewal Form',
      status: 'pending',
      date: 'Due by April 15, 2025',
      action: 'Complete Form'
    }
  ]

  const sapStatus = {
    gpa: { current: 3.42, required: 2.0, status: 'good' },
    completion: { current: 85, required: 67, status: 'good' },
    pace: { current: 120, maximum: 180, status: 'good' }
  }

  const disbursementSchedule = [
    { date: '2024-08-20', term: 'Fall 2024', amount: 14250, status: 'disbursed' },
    { date: '2025-01-15', term: 'Spring 2025', amount: 14250, status: 'scheduled' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-green-100 text-green-800'
      case 'scholarship': return 'bg-blue-100 text-blue-800'
      case 'loan': return 'bg-yellow-100 text-yellow-800'
      case 'work-study': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Financial Aid' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Award className="h-8 w-8" />
              Financial Aid
            </h1>
            <p className="text-muted-foreground">
              Academic Year {academicYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Award Letter
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Documents
            </Button>
          </div>
        </div>

        {/* Aid Summary */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Aid Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(aidPackage.totalAid)}</div>
              <p className="text-xs text-muted-foreground">Accepted awards</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost of Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(aidPackage.totalCost)}</div>
              <p className="text-xs text-muted-foreground">Estimated total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Remaining Need</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(aidPackage.remainingNeed)}
              </div>
              <p className="text-xs text-muted-foreground">Out of pocket</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(aidPackage.disbursed)}
              </div>
              <p className="text-xs text-muted-foreground">Fall 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(aidPackage.pending)}
              </div>
              <p className="text-xs text-muted-foreground">Spring 2025</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="awards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="awards">Awards</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="sap">SAP Status</TabsTrigger>
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
            <TabsTrigger value="cost">Cost Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="awards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Aid Awards</CardTitle>
                <CardDescription>
                  Review and accept your financial aid awards for {academicYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Award</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Fall</TableHead>
                      <TableHead className="text-right">Spring</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Requirements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {awards.map((award) => (
                      <TableRow key={award.id}>
                        <TableCell className="font-medium">{award.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(award.type)}>
                            {award.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={award.status === 'accepted' ? 'default' : 'secondary'}>
                            {award.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(award.fall)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(award.spring)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(award.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {award.requirements}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Last updated: December 15, 2024
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Decline Awards</Button>
                    <Button>Accept All Awards</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Aid Requirements</CardTitle>
                <CardDescription>
                  Complete all requirements to receive your financial aid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(req.status)}
                        <div>
                          <p className="font-medium">{req.item}</p>
                          <p className="text-sm text-muted-foreground">{req.date}</p>
                        </div>
                      </div>
                      {req.action && (
                        <Button variant="outline" size="sm">
                          {req.action}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Complete all requirements by their due dates to avoid delays in aid disbursement.
                    Missing deadlines may result in loss of aid eligibility.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Satisfactory Academic Progress (SAP)</CardTitle>
                <CardDescription>
                  Your academic progress determines continued aid eligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Good Standing</strong> - You are meeting all SAP requirements
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cumulative GPA</span>
                      <span className="text-sm font-bold">{sapStatus.gpa.current} / {sapStatus.gpa.required}</span>
                    </div>
                    <Progress value={(sapStatus.gpa.current / 4.0) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum {sapStatus.gpa.required} GPA required
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm font-bold">{sapStatus.completion.current}%</span>
                    </div>
                    <Progress value={sapStatus.completion.current} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must complete {sapStatus.completion.required}% of attempted credits
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Maximum Timeframe</span>
                      <span className="text-sm font-bold">{sapStatus.pace.current} / {sapStatus.pace.maximum} credits</span>
                    </div>
                    <Progress value={(sapStatus.pace.current / sapStatus.pace.maximum) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must complete degree within 150% of program length
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Next Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Your SAP status will be reviewed after Spring 2025 grades are posted
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disbursements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Disbursement Schedule</CardTitle>
                <CardDescription>
                  When your financial aid will be applied to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disbursementSchedule.map((disbursement, index) => (
                      <TableRow key={index}>
                        <TableCell>{disbursement.date}</TableCell>
                        <TableCell className="font-medium">{disbursement.term}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(disbursement.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={disbursement.status === 'disbursed' ? 'default' : 'secondary'}>
                            {disbursement.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Aid is disbursed at the beginning of each semester. Funds are first applied to your
                    student account for tuition and fees. Any remaining credit will be refunded to you
                    within 14 days.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost of Attendance Breakdown</CardTitle>
                <CardDescription>
                  Estimated expenses for {academicYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Tuition & Fees</span>
                      </div>
                      <span className="font-bold">{formatCurrency(24900)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Room & Board</span>
                      </div>
                      <span className="font-bold">{formatCurrency(11400)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Books & Supplies</span>
                      </div>
                      <span className="font-bold">{formatCurrency(1200)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Personal Expenses</span>
                      </div>
                      <span className="font-bold">{formatCurrency(2000)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Transportation</span>
                      </div>
                      <span className="font-bold">{formatCurrency(2500)}</span>
                    </div>
                    <div className="flex justify-between p-3 border-t pt-4">
                      <span className="font-bold text-lg">Total Cost of Attendance</span>
                      <span className="font-bold text-lg">{formatCurrency(42000)}</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      These are estimated costs for a full-time student living on campus. Your actual
                      costs may vary based on your enrollment status and living situation.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}