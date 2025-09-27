"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Download,
  Shield,
  AlertCircle,
  CheckCircle,
  Activity,
  Pill,
  Stethoscope,
  Brain,
  Eye,
  MessageSquare,
  ChevronRight,
  Plus,
  ClipboardList,
  Syringe,
  Info
} from "lucide-react"

export default function HealthPage() {
  // Upcoming appointments
  const appointments = [
    {
      type: "Annual Physical",
      provider: "Dr. Sarah Johnson",
      date: "2025-01-10",
      time: "10:30 AM",
      location: "Student Health Center",
      status: "confirmed",
      room: "Exam Room 3"
    },
    {
      type: "Dental Cleaning",
      provider: "Dr. Michael Chen",
      date: "2025-01-25",
      time: "2:00 PM",
      location: "Dental Clinic",
      status: "confirmed",
      room: "Suite 201"
    }
  ]

  // Medical history
  const medicalHistory = [
    {
      date: "2024-11-15",
      type: "Sick Visit",
      provider: "Dr. Emily Roberts",
      diagnosis: "Upper Respiratory Infection",
      status: "completed"
    },
    {
      date: "2024-09-20",
      type: "Immunization",
      provider: "Nurse Practitioner",
      description: "Flu Vaccine",
      status: "completed"
    },
    {
      date: "2024-08-10",
      type: "Sports Physical",
      provider: "Dr. Sarah Johnson",
      result: "Cleared for Athletics",
      status: "completed"
    }
  ]

  // Active prescriptions
  const prescriptions = [
    {
      medication: "Albuterol Inhaler",
      dosage: "90mcg, 2 puffs as needed",
      prescriber: "Dr. Sarah Johnson",
      pharmacy: "Campus Pharmacy",
      refills: 2,
      lastFilled: "2024-11-20",
      nextRefill: "2025-01-20"
    },
    {
      medication: "Cetirizine",
      dosage: "10mg daily",
      prescriber: "Dr. Emily Roberts",
      pharmacy: "Campus Pharmacy",
      refills: 5,
      lastFilled: "2024-12-01",
      nextRefill: "2025-01-01"
    }
  ]

  // Immunization records
  const immunizations = [
    {
      vaccine: "COVID-19 (Pfizer)",
      doses: "Primary Series + Booster",
      lastDose: "2024-10-15",
      status: "up_to_date"
    },
    {
      vaccine: "MMR",
      doses: "2 doses",
      lastDose: "2019-08-01",
      status: "complete"
    },
    {
      vaccine: "Hepatitis B",
      doses: "3 doses",
      lastDose: "2019-12-01",
      status: "complete"
    },
    {
      vaccine: "Meningococcal",
      doses: "1 dose",
      lastDose: "2023-08-15",
      status: "complete"
    },
    {
      vaccine: "Flu",
      doses: "Annual",
      lastDose: "2024-09-20",
      status: "current_season"
    }
  ]

  // Insurance information
  const insurance = {
    provider: "University Student Health Plan",
    memberId: "STU987654321",
    groupNumber: "UNIV2024",
    effectiveDate: "2024-08-15",
    expirationDate: "2025-05-15",
    copay: {
      primary: 20,
      specialist: 40,
      emergency: 150,
      prescription: 10
    }
  }

  // Health resources
  const resources = [
    {
      title: "Mental Health Support",
      icon: Brain,
      description: "Counseling and psychological services",
      hours: "Mon-Fri 8AM-6PM",
      phone: "(555) 123-4567"
    },
    {
      title: "24/7 Nurse Hotline",
      icon: Phone,
      description: "Speak with a registered nurse anytime",
      hours: "24/7",
      phone: "1-800-NURSE-24"
    },
    {
      title: "Crisis Support",
      icon: Heart,
      description: "Immediate mental health crisis support",
      hours: "24/7",
      phone: "988"
    },
    {
      title: "Wellness Programs",
      icon: Activity,
      description: "Nutrition, fitness, and stress management",
      hours: "Various",
      phone: "(555) 123-4568"
    }
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Health Services</h1>
            <p className="text-muted-foreground mt-1">Manage appointments, prescriptions, and health records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              24/7 Nurse Line
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Insurance Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-3">Insurance Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p className="font-medium">{insurance.provider}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Member ID</p>
                    <p className="font-medium">{insurance.memberId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Group Number</p>
                    <p className="font-medium">{insurance.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coverage Period</p>
                    <p className="font-medium">
                      {new Date(insurance.effectiveDate).toLocaleDateString()} - {new Date(insurance.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-l pl-4">
                <h4 className="font-medium mb-2">Copayments</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary Care</span>
                    <span className="font-medium">${insurance.copay.primary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialist</span>
                    <span className="font-medium">${insurance.copay.specialist}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emergency</span>
                    <span className="font-medium">${insurance.copay.emergency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prescription</span>
                    <span className="font-medium">${insurance.copay.prescription}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download Card
              </Button>
              <Button size="sm" variant="secondary">
                <Shield className="h-4 w-4 mr-2" />
                View Benefits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled health appointments</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((apt, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{apt.type}</h4>
                            <Badge variant="secondary">
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.provider}</p>
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(apt.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {apt.location}, {apt.room}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">Reschedule</Button>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please arrive 15 minutes early for your appointment. Bring your student ID and insurance card.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Visits</CardTitle>
                <CardDescription>Your recent medical visits and treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicalHistory.map((visit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{visit.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {visit.date} • {visit.provider}
                          </p>
                          {visit.diagnosis && (
                            <p className="text-xs">{visit.diagnosis}</p>
                          )}
                          {visit.result && (
                            <p className="text-xs">{visit.result}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Prescriptions</CardTitle>
                <CardDescription>Your current medications and refill information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptions.map((rx, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{rx.medication}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{rx.dosage}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Prescriber</p>
                              <p>{rx.prescriber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pharmacy</p>
                              <p>{rx.pharmacy}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Filled</p>
                              <p>{rx.lastFilled}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Refills Remaining</p>
                              <p>{rx.refills}</p>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">
                          Request Refill
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Refill requests typically take 2-3 business days to process.
                    Request refills when you have at least 7 days of medication remaining.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>Access your health records and test results</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Records
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Recent Test Results</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Basic Metabolic Panel</span>
                        <span className="text-muted-foreground">2024-11-15</span>
                        <Badge variant="secondary">Normal</Badge>
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Complete Blood Count</span>
                        <span className="text-muted-foreground">2024-11-15</span>
                        <Badge variant="secondary">Normal</Badge>
                        <Button size="sm" variant="ghost">View</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Document Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Visit Summaries
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Lab Results
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        Imaging Reports
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Syringe className="h-4 w-4 mr-2" />
                        Immunization Records
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="immunizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Immunization Records</CardTitle>
                <CardDescription>Your vaccination history and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {immunizations.map((vaccine, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Syringe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{vaccine.vaccine}</p>
                            <p className="text-sm text-muted-foreground">
                              {vaccine.doses} • Last: {vaccine.lastDose}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          vaccine.status === "up_to_date" || vaccine.status === "complete" || vaccine.status === "current_season"
                            ? "secondary"
                            : "destructive"
                        }>
                          {vaccine.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All required immunizations are up to date. Your next flu shot will be available in Fall 2025.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <resource.icon className="h-5 w-5" />
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hours</span>
                        <span className="font-medium">{resource.hours}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{resource.phone}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Health Tips & Wellness</CardTitle>
                <CardDescription>Stay healthy with these resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Schedule Telehealth Visit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    Mental Health Self-Assessment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Wellness Workshop Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Health Education Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}