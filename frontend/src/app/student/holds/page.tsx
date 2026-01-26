"use client"

import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Phone,
  Shield,
  XCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Hold, ActionItem, HoldSummary, ActionItemDashboard } from '@/types/api-types'
import Link from 'next/link'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

export default function HoldsAndToDoPage() {
  const [holdsSummary, setHoldsSummary] = useState<HoldSummary | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [completedItems, setCompletedItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingItem, setCompletingItem] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('todo')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }

      const [holdsRes, pendingRes, completedRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/holds/summary`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items?status=incomplete`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items?status=completed&per_page=10`, { headers }),
      ])

      const holdsSummary = holdsRes.ok ? (await holdsRes.json()).data : null
      const pendingItems = pendingRes.ok ? (await pendingRes.json()).data || [] : []
      const completedItems = completedRes.ok ? (await completedRes.json()).data || [] : []

      setHoldsSummary(holdsSummary)
      setActionItems(pendingItems)
      setCompletedItems(completedItems)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteItem = async (itemId: number) => {
    setCompletingItem(itemId)
    try {
      const token = sessionStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items/${itemId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (res.ok) {
        const completedItem = actionItems.find(item => item.id === itemId)
        if (completedItem) {
          setActionItems(prev => prev.filter(item => item.id !== itemId))
          setCompletedItems(prev => [{ ...completedItem, status: 'completed', completed_at: new Date().toISOString() }, ...prev])
        }
      }
    } catch (error) {
      console.error('Failed to complete item:', error)
    } finally {
      setCompletingItem(null)
    }
  }

  const handleDismissItem = async (itemId: number) => {
    setCompletingItem(itemId)
    try {
      const token = sessionStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/action-items/${itemId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      if (res.ok) {
        setActionItems(prev => prev.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Failed to dismiss item:', error)
    } finally {
      setCompletingItem(null)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    )
  }

  const hasActiveHolds = holdsSummary && holdsSummary.active > 0
  const urgentItems = actionItems.filter(item => item.priority === 'urgent')
  const overdueItems = actionItems.filter(item => item.due_date && isPast(new Date(item.due_date)))

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Holds & To-Do</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account holds and complete required tasks
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className={hasActiveHolds ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasActiveHolds ? 'bg-amber-500/20' : 'bg-emerald-500/10'}`}>
                  <Shield className={`h-5 w-5 ${hasActiveHolds ? 'text-amber-600' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{holdsSummary?.active || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Holds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{actionItems.length}</p>
                  <p className="text-xs text-muted-foreground">To-Do Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={overdueItems.length > 0 ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${overdueItems.length > 0 ? 'bg-red-500/20' : 'bg-muted'}`}>
                  <AlertCircle className={`h-5 w-5 ${overdueItems.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueItems.length}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedItems.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="todo" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              To-Do List
              {actionItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">{actionItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="holds" className="gap-2">
              <Shield className="h-4 w-4" />
              Holds
              {hasActiveHolds && (
                <Badge variant="destructive" className="ml-1">{holdsSummary?.active}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          {/* To-Do Tab */}
          <TabsContent value="todo" className="space-y-4">
            {actionItems.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                    <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
                    <p className="text-sm mt-1">You have no pending action items.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Urgent items first */}
                {urgentItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Urgent ({urgentItems.length})
                    </h3>
                  </div>
                )}

                {actionItems.map((item) => {
                  const isOverdue = item.due_date && isPast(new Date(item.due_date))
                  const isDueToday = item.due_date && isToday(new Date(item.due_date))
                  const isDueTomorrow = item.due_date && isTomorrow(new Date(item.due_date))

                  return (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        isOverdue
                          ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
                          : item.priority === 'urgent'
                            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50'
                            : ''
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={false}
                            disabled={completingItem === item.id}
                            onCheckedChange={() => handleCompleteItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{item.title}</h4>
                              {item.priority === 'urgent' && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                              {item.priority === 'high' && (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">High Priority</Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                              {item.due_date && (
                                <span className={`text-sm flex items-center gap-1 ${
                                  isOverdue
                                    ? 'text-red-600 font-medium'
                                    : isDueToday
                                      ? 'text-amber-600 font-medium'
                                      : isDueTomorrow
                                        ? 'text-amber-500'
                                        : 'text-muted-foreground'
                                }`}>
                                  <Clock className="h-4 w-4" />
                                  {isOverdue
                                    ? `Overdue by ${formatDistanceToNow(new Date(item.due_date))}`
                                    : isDueToday
                                      ? 'Due today'
                                      : isDueTomorrow
                                        ? 'Due tomorrow'
                                        : `Due ${format(new Date(item.due_date), 'MMMM d, yyyy')}`
                                  }
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.action_url && (
                              <Button size="sm" asChild>
                                <Link href={item.action_url}>
                                  {item.action_label || 'Take Action'}
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                            {!item.is_system_generated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismissItem(item.id)}
                                disabled={completingItem === item.id}
                              >
                                Dismiss
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Holds Tab */}
          <TabsContent value="holds" className="space-y-4">
            {!hasActiveHolds ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                    <h3 className="text-lg font-medium text-foreground">No Active Holds</h3>
                    <p className="text-sm mt-1">Your account is in good standing with no holds.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Registration hold warning */}
                {holdsSummary?.has_registration_hold && (
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200">Registration Blocked</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            One or more holds are preventing you from registering for classes.
                            Please resolve these holds before the registration deadline.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {holdsSummary?.holds.map((hold) => (
                  <Card
                    key={hold.id}
                    className={
                      hold.severity === 'critical'
                        ? 'border-red-200 dark:border-red-800'
                        : hold.severity === 'warning'
                          ? 'border-amber-200 dark:border-amber-800'
                          : ''
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <HoldIcon severity={hold.severity} />
                          <div>
                            <CardTitle className="text-base">{hold.reason}</CardTitle>
                            <CardDescription className="mt-0.5">
                              {hold.department || getTypeLabel(hold.type)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            hold.severity === 'critical'
                              ? 'destructive'
                              : hold.severity === 'warning'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {hold.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hold.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {hold.description}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-4 flex-wrap">
                          {hold.prevents_registration && (
                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Blocks Registration
                            </span>
                          )}
                          {hold.prevents_transcript && (
                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Blocks Transcripts
                            </span>
                          )}
                          {hold.prevents_graduation && (
                            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Blocks Graduation
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          Placed {formatDistanceToNow(new Date(hold.placed_at), { addSuffix: true })}
                        </span>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact {hold.department || 'Registrar'} to resolve
                        </div>
                        <Button variant="outline" size="sm">
                          Get Help
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedItems.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No Completed Items</h3>
                    <p className="text-sm mt-1">Your completed tasks will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {completedItems.map((item) => (
                  <Card key={item.id} className="opacity-75">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through text-muted-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Completed {item.completed_at && formatDistanceToNow(new Date(item.completed_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function HoldIcon({ severity }: { severity: string }) {
  const className = `h-5 w-5 ${
    severity === 'critical'
      ? 'text-red-600'
      : severity === 'warning'
        ? 'text-amber-600'
        : 'text-blue-600'
  }`

  switch (severity) {
    case 'critical':
      return <XCircle className={className} />
    case 'warning':
      return <AlertTriangle className={className} />
    default:
      return <Info className={className} />
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    registration: 'Registration',
    financial: 'Financial',
    financial_aid: 'Financial Aid',
    academic: 'Academic',
    administrative: 'Administrative',
    immunization: 'Health Services',
    library: 'Library',
    parking: 'Parking',
    payment: 'Payment',
    document: 'Documents',
    advising: 'Advising',
    course_eval: 'Course Evaluation',
    orientation: 'Orientation',
    graduation: 'Graduation',
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
}
