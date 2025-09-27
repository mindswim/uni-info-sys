'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText, Send, Clock, CheckCircle, XCircle,
  Download, Mail, Printer, Search, Filter,
  AlertCircle, DollarSign, Calendar, User,
  Building, Globe, Shield, Eye, Package
} from 'lucide-react'

export default function TranscriptRequestsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const requests = [
    {
      id: 'TR-2024-1234',
      student: 'Sarah Johnson',
      studentId: 'S00123450',
      email: 'sjohnson@university.edu',
      requestDate: '2024-12-26',
      type: 'Official',
      delivery: 'Electronic',
      recipient: 'Stanford University Graduate Admissions',
      copies: 1,
      rush: false,
      status: 'pending',
      payment: 'paid',
      amount: 10,
      notes: 'Graduate school application',
      graduationYear: '2024',
      degree: 'Bachelor of Science',
      major: 'Computer Science'
    },
    {
      id: 'TR-2024-1235',
      student: 'Michael Chen',
      studentId: 'S00123451',
      email: 'mchen@university.edu',
      requestDate: '2024-12-25',
      type: 'Official',
      delivery: 'Mail',
      recipient: 'Google Inc. - HR Department',
      copies: 2,
      rush: true,
      status: 'processing',
      payment: 'paid',
      amount: 45,
      notes: 'Employment verification',
      graduationYear: '2025',
      degree: 'Bachelor of Business Administration',
      major: 'Finance'
    },
    {
      id: 'TR-2024-1236',
      student: 'Emily Rodriguez',
      studentId: 'S00123452',
      email: 'erodriguez@university.edu',
      requestDate: '2024-12-24',
      type: 'Unofficial',
      delivery: 'Electronic',
      recipient: 'Student (Self)',
      copies: 1,
      rush: false,
      status: 'completed',
      payment: 'paid',
      amount: 0,
      notes: 'Personal records',
      graduationYear: '2026',
      degree: 'Bachelor of Science',
      major: 'Biology'
    },
    {
      id: 'TR-2024-1237',
      student: 'David Park',
      studentId: 'S00123456',
      email: 'dpark@university.edu',
      requestDate: '2024-12-23',
      type: 'Official',
      delivery: 'Hold for Pickup',
      recipient: 'State Licensing Board',
      copies: 1,
      rush: false,
      status: 'hold',
      payment: 'pending',
      amount: 10,
      notes: 'Professional license application - HOLD due to balance',
      graduationYear: '2025',
      degree: 'Bachelor of Engineering',
      major: 'Mechanical Engineering',
      hold: 'Financial hold - Outstanding balance $2,450'
    },
    {
      id: 'TR-2024-1238',
      student: 'Jennifer Lee',
      studentId: 'S00123789',
      email: 'jlee@university.edu',
      requestDate: '2024-12-22',
      type: 'Official',
      delivery: 'Electronic',
      recipient: 'NYU School of Medicine',
      copies: 1,
      rush: true,
      status: 'ready',
      payment: 'paid',
      amount: 25,
      notes: 'Medical school application - Deadline Dec 31',
      graduationYear: '2024',
      degree: 'Bachelor of Science',
      major: 'Pre-Medicine'
    }
  ]

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    ready: requests.filter(r => r.status === 'ready').length,
    onHold: requests.filter(r => r.status === 'hold').length,
    todayRequests: 12,
    weeklyAverage: 85,
    averageProcessTime: '2.3 days',
    revenue: 2450
  }

  const deliveryOptions = [
    { value: 'electronic', label: 'Electronic (PDF)', time: '1-2 business days', cost: 10 },
    { value: 'mail', label: 'US Mail', time: '5-7 business days', cost: 15 },
    { value: 'express', label: 'Express Mail', time: '2-3 business days', cost: 35 },
    { value: 'international', label: 'International Mail', time: '10-14 business days', cost: 45 },
    { value: 'pickup', label: 'Hold for Pickup', time: '1-2 business days', cost: 10 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'hold': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentColor = (payment: string) => {
    return payment === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesType = filterType === 'all' || request.type.toLowerCase() === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const breadcrumbs = [
    { label: 'Registrar Dashboard', href: '/registrar-dashboard' },
    { label: 'Transcript Requests' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Transcript Requests
            </h1>
            <p className="text-muted-foreground">
              Process and manage official transcript requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Queue
            </Button>
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Batch Process
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.onHold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weekly Avg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyAverage}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.averageProcessTime}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, ID, or request number..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="unofficial">Unofficial</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transcript Request Queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {filteredRequests.length} of {requests.length} requests
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.student}</p>
                        <p className="text-xs text-muted-foreground">{request.studentId}</p>
                        <p className="text-xs text-muted-foreground">{request.graduationYear} • {request.major}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{request.type}</span>
                        {request.rush && (
                          <Badge variant="destructive" className="text-xs">Rush</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {request.delivery === 'Electronic' && <Globe className="h-3 w-3" />}
                        {request.delivery === 'Mail' && <Mail className="h-3 w-3" />}
                        <span className="text-sm">{request.delivery}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{request.copies} copy</p>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{request.recipient}</p>
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getPaymentColor(request.payment)}>
                          {request.payment}
                        </Badge>
                        <p className="text-xs text-muted-foreground">${request.amount}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      {request.hold && (
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 h-auto text-xs text-red-600"
                          onClick={() => alert(request.hold)}
                        >
                          View Hold
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Transcript Request Details</DialogTitle>
                              <DialogDescription>
                                Request ID: {selectedRequest?.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Student Information</Label>
                                    <div className="mt-2 space-y-1 text-sm">
                                      <p><strong>{selectedRequest.student}</strong></p>
                                      <p>{selectedRequest.studentId}</p>
                                      <p>{selectedRequest.email}</p>
                                      <p>{selectedRequest.degree} in {selectedRequest.major}</p>
                                      <p>Class of {selectedRequest.graduationYear}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Request Details</Label>
                                    <div className="mt-2 space-y-1 text-sm">
                                      <p>Type: {selectedRequest.type} Transcript</p>
                                      <p>Copies: {selectedRequest.copies}</p>
                                      <p>Delivery: {selectedRequest.delivery}</p>
                                      <p>Rush: {selectedRequest.rush ? 'Yes' : 'No'}</p>
                                      <p>Amount: ${selectedRequest.amount}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Recipient</Label>
                                  <p className="mt-2 text-sm">{selectedRequest.recipient}</p>
                                </div>
                                {selectedRequest.notes && (
                                  <div>
                                    <Label>Notes</Label>
                                    <p className="mt-2 text-sm">{selectedRequest.notes}</p>
                                  </div>
                                )}
                                {selectedRequest.hold && (
                                  <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                      {selectedRequest.hold}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <div className="space-y-2">
                                  <Label>Processing Options</Label>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="ferpa" />
                                      <Label htmlFor="ferpa" className="text-sm font-normal">
                                        FERPA release verified
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="degree" />
                                      <Label htmlFor="degree" className="text-sm font-normal">
                                        Degree posted on transcript
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id="honors" />
                                      <Label htmlFor="honors" className="text-sm font-normal">
                                        Honors/awards included
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline">Cancel Request</Button>
                              <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </Button>
                              <Button>
                                <Send className="h-4 w-4 mr-2" />
                                Process & Send
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {request.status === 'pending' && (
                          <Button size="sm">Process</Button>
                        )}
                        {request.status === 'ready' && (
                          <Button size="sm">
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Processing Guidelines */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Processing Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Verify Student Identity</p>
                  <p className="text-muted-foreground">Check photo ID and student records</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Check for Holds</p>
                  <p className="text-muted-foreground">Financial, academic, or disciplinary holds</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Verify FERPA Release</p>
                  <p className="text-muted-foreground">Ensure proper authorization on file</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Quality Check</p>
                  <p className="text-muted-foreground">Review transcript for accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods & Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <div key={option.value} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.time}</p>
                    </div>
                    <Badge variant="outline">${option.cost}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}