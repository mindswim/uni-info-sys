'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DollarSign,
  Gift,
  Landmark,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  TrendingDown,
  Info
} from 'lucide-react'

interface Award {
  id: number
  aid_type: string
  aid_type_label: string
  name: string
  description: string | null
  amount: number
  status: string
  disbursement_schedule: string | null
  interest_rate: number | null
  origination_fee: number | null
  net_amount: number | null
  min_gpa_to_maintain: number | null
  min_credits_to_maintain: number | null
  conditions: string | null
  is_loan: boolean
  is_gift_aid: boolean
  scholarship: {
    id: number
    name: string
    type: string
  } | null
  disbursements: Disbursement[]
}

interface Disbursement {
  id: number
  amount: number
  scheduled_date: string
  disbursed_date: string | null
  status: string
}

interface FinancialAidPackage {
  id: number
  term: {
    id: number
    name: string
  } | null
  status: string
  cost_of_attendance: {
    tuition: number
    fees: number
    room_board: number
    books_supplies: number
    transportation: number
    personal: number
    total: number
  }
  financial_need: {
    expected_family_contribution: number | null
    demonstrated_need: number | null
    unmet_need: number
  }
  aid_totals: {
    grants: number
    scholarships: number
    loans: number
    work_study: number
    total_gift_aid: number
    total_aid: number
    net_cost: number
  }
  awards: {
    gift_aid: Award[]
    loans: Award[]
    work_study: Award[]
    other: Award[]
  }
  dates: {
    offer_date: string | null
    response_deadline: string | null
    accepted_date: string | null
  }
  notes: string | null
}

export function FinancialAidTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [aidPackage, setAidPackage] = useState<FinancialAidPackage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFinancialAidData()
  }, [])

  const fetchFinancialAidData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/financial-aid/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (response.status === 404) {
        setAidPackage(null)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch financial aid data')
      }

      const data = await response.json()
      setAidPackage(data.data)
    } catch (error) {
      console.error('Error fetching financial aid data:', error)
      setError('Failed to load financial aid information')
      toast({
        title: "Error",
        description: "Failed to load financial aid information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      offered: { variant: "outline", icon: Info },
      accepted: { variant: "default", icon: CheckCircle },
      declined: { variant: "destructive", icon: AlertCircle },
      disbursed: { variant: "default", icon: CheckCircle },
      scheduled: { variant: "secondary", icon: Calendar },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!aidPackage) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Financial Aid Package Found</h3>
            <p className="max-w-md mx-auto">
              You don't have an active financial aid package. If you've applied for financial aid,
              your package will appear here once it's been processed.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { cost_of_attendance, aid_totals, awards, financial_need } = aidPackage
  const giftAidPercentage = cost_of_attendance.total > 0
    ? Math.round((aid_totals.total_gift_aid / cost_of_attendance.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Package Status Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Financial Aid Package</CardTitle>
            <CardDescription>
              {aidPackage.term?.name || 'Current Term'} Academic Year
            </CardDescription>
          </div>
          {getStatusBadge(aidPackage.status)}
        </CardHeader>
        {aidPackage.dates.response_deadline && aidPackage.status === 'offered' && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Response required by {formatDate(aidPackage.dates.response_deadline)}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cost_of_attendance.total)}</div>
            <p className="text-xs text-muted-foreground">Cost of attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gift Aid</CardTitle>
            <Gift className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(aid_totals.total_gift_aid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Grants & scholarships (no repayment)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loans</CardTitle>
            <Landmark className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(aid_totals.loans)}
            </div>
            <p className="text-xs text-muted-foreground">Must be repaid</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(aid_totals.net_cost)}
            </div>
            <p className="text-xs text-muted-foreground">Your out-of-pocket cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Coverage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Aid Coverage</CardTitle>
          <CardDescription>
            How your financial aid covers your cost of attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gift Aid Coverage</span>
              <span className="font-medium">{giftAidPercentage}%</span>
            </div>
            <Progress value={giftAidPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {formatCurrency(aid_totals.total_gift_aid)} of {formatCurrency(cost_of_attendance.total)} covered by grants and scholarships
            </p>
          </div>

          {financial_need.unmet_need > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Unmet Need: {formatCurrency(financial_need.unmet_need)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This amount is not covered by your aid package. Consider additional scholarships or payment plans.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="awards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="awards">Aid Awards</TabsTrigger>
          <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
        </TabsList>

        {/* Awards Tab */}
        <TabsContent value="awards" className="space-y-4">
          {/* Gift Aid Section */}
          {(awards.gift_aid.length > 0) && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <CardTitle>Gift Aid (Grants & Scholarships)</CardTitle>
                </div>
                <CardDescription>
                  Free money that doesn't need to be repaid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {awards.gift_aid.map((award) => (
                    <AccordionItem key={award.id} value={`award-${award.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {award.aid_type_label}
                            </Badge>
                            <span className="font-medium">{award.name}</span>
                          </div>
                          <span className="text-green-600 font-bold">{formatCurrency(award.amount)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-3 text-sm">
                          {award.description && (
                            <p className="text-muted-foreground">{award.description}</p>
                          )}
                          {award.min_gpa_to_maintain && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span>Maintain GPA of {award.min_gpa_to_maintain} or higher</span>
                            </div>
                          )}
                          {award.min_credits_to_maintain && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span>Enroll in at least {award.min_credits_to_maintain} credits</span>
                            </div>
                          )}
                          {award.conditions && (
                            <div className="p-2 bg-muted rounded text-muted-foreground">
                              <strong>Conditions:</strong> {award.conditions}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Gift Aid</span>
                  <span className="text-green-600">{formatCurrency(aid_totals.total_gift_aid)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loans Section */}
          {awards.loans.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-amber-600" />
                  <CardTitle>Student Loans</CardTitle>
                </div>
                <CardDescription>
                  These funds must be repaid with interest after graduation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {awards.loans.map((award) => (
                    <AccordionItem key={award.id} value={`loan-${award.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {award.aid_type_label}
                            </Badge>
                            <span className="font-medium">{award.name}</span>
                          </div>
                          <span className="text-amber-600 font-bold">{formatCurrency(award.amount)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="grid gap-3 text-sm">
                          {award.interest_rate !== null && (
                            <div className="flex justify-between p-2 bg-muted rounded">
                              <span>Interest Rate</span>
                              <span className="font-medium">{award.interest_rate}%</span>
                            </div>
                          )}
                          {award.origination_fee !== null && (
                            <div className="flex justify-between p-2 bg-muted rounded">
                              <span>Origination Fee</span>
                              <span className="font-medium">{award.origination_fee}%</span>
                            </div>
                          )}
                          {award.net_amount !== null && (
                            <div className="flex justify-between p-2 bg-muted rounded">
                              <span>Net Amount (after fees)</span>
                              <span className="font-medium">{formatCurrency(award.net_amount)}</span>
                            </div>
                          )}
                          {award.description && (
                            <p className="text-muted-foreground">{award.description}</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Loans</span>
                  <span className="text-amber-600">{formatCurrency(aid_totals.loans)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Study Section */}
          {awards.work_study.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <CardTitle>Federal Work-Study</CardTitle>
                </div>
                <CardDescription>
                  Earn money through part-time campus employment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {awards.work_study.map((award) => (
                  <div key={award.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{award.name}</p>
                      {award.description && (
                        <p className="text-sm text-muted-foreground">{award.description}</p>
                      )}
                    </div>
                    <span className="text-blue-600 font-bold">{formatCurrency(award.amount)}</span>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Work-Study</span>
                  <span className="text-blue-600">{formatCurrency(aid_totals.work_study)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {awards.gift_aid.length === 0 && awards.loans.length === 0 && awards.work_study.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No aid awards in this package</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Cost of Attendance Breakdown</CardTitle>
              <CardDescription>
                Estimated expenses for the academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Tuition</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.tuition)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fees</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.fees)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Room & Board</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.room_board)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Books & Supplies</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.books_supplies)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Transportation</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.transportation)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Personal Expenses</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost_of_attendance.personal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost of Attendance</span>
                <span>{formatCurrency(cost_of_attendance.total)}</span>
              </div>

              {/* Financial Need Summary */}
              {financial_need.expected_family_contribution !== null && (
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">Financial Need Calculation</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cost of Attendance</span>
                      <span>{formatCurrency(cost_of_attendance.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Family Contribution (EFC)</span>
                      <span>- {formatCurrency(financial_need.expected_family_contribution)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Demonstrated Need</span>
                      <span>{formatCurrency(financial_need.demonstrated_need || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disbursements Tab */}
        <TabsContent value="disbursements">
          <Card>
            <CardHeader>
              <CardTitle>Disbursement Schedule</CardTitle>
              <CardDescription>
                When your financial aid will be credited to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Collect all disbursements from all awards
                const allDisbursements = [
                  ...awards.gift_aid,
                  ...awards.loans,
                  ...awards.work_study,
                  ...awards.other
                ].flatMap(award =>
                  award.disbursements.map(d => ({
                    ...d,
                    awardName: award.name,
                    awardType: award.aid_type_label
                  }))
                )

                if (allDisbursements.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No disbursement schedule available</p>
                    </div>
                  )
                }

                // Sort by scheduled date
                allDisbursements.sort((a, b) =>
                  new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
                )

                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Award</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Disbursed Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allDisbursements.map((disbursement) => (
                        <TableRow key={disbursement.id}>
                          <TableCell className="font-medium">
                            {disbursement.awardName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{disbursement.awardType}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(disbursement.scheduled_date)}</TableCell>
                          <TableCell>
                            {disbursement.disbursed_date
                              ? formatDate(disbursement.disbursed_date)
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(disbursement.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(disbursement.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {aidPackage.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{aidPackage.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
