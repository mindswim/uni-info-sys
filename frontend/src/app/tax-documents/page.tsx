'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText, Download, Send, Calendar, Shield,
  CheckCircle, AlertCircle, Info, Lock,
  Mail, Phone, User, Home, Printer, Eye
} from 'lucide-react'

export default function TaxDocumentsPage() {
  const [consentStatus, setConsentStatus] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2024')

  const documents1098T = [
    {
      year: '2024',
      formType: '1098-T',
      status: 'available',
      dateAvailable: '2025-01-31',
      boxAmounts: {
        box1: 24900,  // Payments received
        box2: 0,      // Amounts billed
        box4: 0,      // Adjustments
        box5: 18500,  // Scholarships and grants
        box8: true,   // At least half-time student
        box9: false   // Graduate student
      }
    },
    {
      year: '2023',
      formType: '1098-T',
      status: 'available',
      dateAvailable: '2024-01-31',
      boxAmounts: {
        box1: 23500,
        box2: 0,
        box4: 0,
        box5: 17000,
        box8: true,
        box9: false
      }
    },
    {
      year: '2022',
      formType: '1098-T',
      status: 'available',
      dateAvailable: '2023-01-31',
      boxAmounts: {
        box1: 22800,
        box2: 0,
        box4: 0,
        box5: 16500,
        box8: true,
        box9: false
      }
    }
  ]

  const studentInfo = {
    name: 'David Park',
    ssn: '***-**-6789',
    studentId: 'S00123456',
    address: '123 Campus Drive',
    city: 'University City',
    state: 'NY',
    zip: '10001',
    email: 'david.park@university.edu',
    phone: '(555) 123-4567'
  }

  const taxYearSummary = {
    paymentsReceived: 24900,
    qualifiedExpenses: 24900,
    scholarshipsGrants: 18500,
    netQualifiedExpenses: 6400,
    booksSupplies: 1200,
    roomBoard: 11400
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/billing' },
    { label: 'Tax Documents' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Tax Documents
            </h1>
            <p className="text-muted-foreground">
              Access your education tax forms and information
            </p>
          </div>
          <Button>
            <Phone className="h-4 w-4 mr-2" />
            Contact Tax Office
          </Button>
        </div>

        {/* Important Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Tax Season 2024:</strong> Your 2024 Form 1098-T will be available by January 31, 2025.
            You will receive an email notification when it's ready. The university reports all 1098-T
            information directly to the IRS.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="forms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="forms">Tax Forms</TabsTrigger>
            <TabsTrigger value="summary">Year Summary</TabsTrigger>
            <TabsTrigger value="consent">Electronic Consent</TabsTrigger>
            <TabsTrigger value="info">Student Information</TabsTrigger>
            <TabsTrigger value="resources">Tax Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form 1098-T - Tuition Statement</CardTitle>
                <CardDescription>
                  Educational institution tax forms for qualified tuition and related expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Year</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Available</TableHead>
                      <TableHead className="text-right">Box 1 - Payments</TableHead>
                      <TableHead className="text-right">Box 5 - Scholarships</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents1098T.map((doc) => (
                      <TableRow key={doc.year}>
                        <TableCell className="font-medium">{doc.year}</TableCell>
                        <TableCell>{doc.formType}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.dateAvailable}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(doc.boxAmounts.box1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(doc.boxAmounts.box5)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Button>
                            <Button size="sm" variant="outline">
                              <Printer className="h-3 w-3 mr-1" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Alert className="mt-4">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Tax documents are encrypted and password-protected. Your password is your
                    Date of Birth in MMDDYYYY format. For example, if your birthday is
                    January 15, 2000, your password would be 01152000.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Year {selectedYear} Summary</CardTitle>
                <CardDescription>
                  Breakdown of qualified education expenses and payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Qualified Expenses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Tuition & Fees (Box 1)</span>
                        <span className="font-medium">{formatCurrency(taxYearSummary.paymentsReceived)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Books & Supplies</span>
                        <span className="font-medium">{formatCurrency(taxYearSummary.booksSupplies)}</span>
                      </div>
                      <div className="flex justify-between p-3 border-t pt-3">
                        <span className="font-medium">Total Qualified Expenses</span>
                        <span className="font-bold">
                          {formatCurrency(taxYearSummary.paymentsReceived + taxYearSummary.booksSupplies)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Tax-Free Assistance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Scholarships & Grants (Box 5)</span>
                        <span className="font-medium">{formatCurrency(taxYearSummary.scholarshipsGrants)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Other Tax-Free Aid</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between p-3 border-t pt-3">
                        <span className="font-medium">Total Tax-Free Aid</span>
                        <span className="font-bold">{formatCurrency(taxYearSummary.scholarshipsGrants)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Net Qualified Expenses for Tax Credits
                  </h4>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(taxYearSummary.netQualifiedExpenses)}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    This amount may be eligible for education tax credits. Consult your tax advisor.
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Non-Qualified Expenses:</strong> Room and board ({formatCurrency(taxYearSummary.roomBoard)})
                    is not a qualified education expense for tax credit purposes but may be used
                    for 529 plan distributions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Electronic Consent for Tax Documents</CardTitle>
                <CardDescription>
                  Manage your consent to receive tax documents electronically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className={consentStatus ? 'border-green-200 bg-green-50' : ''}>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className={consentStatus ? 'text-green-800' : ''}>
                    {consentStatus
                      ? 'You have consented to receive tax documents electronically.'
                      : 'You have not consented to electronic delivery. Documents will be mailed.'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={consentStatus}
                      onCheckedChange={(checked) => setConsentStatus(checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="consent" className="cursor-pointer">
                        <p className="font-medium">I consent to electronic delivery</p>
                        <p className="text-sm text-muted-foreground">
                          By providing consent, you agree to receive all tax documents
                          electronically at the email address on file. You can withdraw
                          consent at any time.
                        </p>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">Delivery Information</h4>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={studentInfo.email}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={studentInfo.phone}
                          readOnly
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To update your contact information, please visit your profile settings.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Consent Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Information on File</CardTitle>
                <CardDescription>
                  This information appears on your tax documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{studentInfo.name}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Student ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{studentInfo.studentId}</span>
                      </div>
                    </div>
                    <div>
                      <Label>SSN/TIN</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{studentInfo.ssn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Mailing Address</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <Home className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{studentInfo.address}</p>
                          <p className="font-medium">
                            {studentInfo.city}, {studentInfo.state} {studentInfo.zip}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{studentInfo.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{studentInfo.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    If any of this information is incorrect, please update it in your student
                    profile or contact the Registrar's Office immediately to ensure accurate
                    tax reporting.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Your 1098-T</CardTitle>
                  <CardDescription>
                    Learn what each box means on your form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">Box 1 - Payments Received</p>
                    <p className="text-sm text-muted-foreground">
                      Total qualified tuition and fees paid in the tax year
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Box 5 - Scholarships/Grants</p>
                    <p className="text-sm text-muted-foreground">
                      Total scholarships and grants administered by the school
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Box 8 - Half-Time Student</p>
                    <p className="text-sm text-muted-foreground">
                      Indicates enrollment of at least half-time for one term
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Full Guide
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Credits & Deductions</CardTitle>
                  <CardDescription>
                    Education tax benefits you may qualify for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">American Opportunity Credit</p>
                    <p className="text-sm text-muted-foreground">
                      Up to $2,500 per student for first 4 years
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lifetime Learning Credit</p>
                    <p className="text-sm text-muted-foreground">
                      Up to $2,000 per tax return for any level
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Tuition & Fees Deduction</p>
                    <p className="text-sm text-muted-foreground">
                      May reduce taxable income by up to $4,000
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    IRS Publication 970
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Important Links</CardTitle>
                  <CardDescription>
                    External tax resources and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    IRS Website - Education Credits
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    Interactive Tax Assistant
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    Free File Tax Software
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    VITA Free Tax Preparation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Contact information for tax document assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Student Accounts Office</p>
                    <p className="text-sm text-muted-foreground">
                      (555) 123-4567<br />
                      tax.documents@university.edu<br />
                      Monday - Friday, 8:00 AM - 5:00 PM EST
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Tax Form Vendor Support</p>
                    <p className="text-sm text-muted-foreground">
                      1-800-TAX-FORM<br />
                      24/7 Technical Support
                    </p>
                  </div>
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}