'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  TrendingUp,
  Loader2,
  Save
} from 'lucide-react'
import { CsvImportExport } from "@/components/admin/csv-import-export"

interface CourseSection {
  id: number
  course: {
    code: string
    name: string
  }
  section_number: string
}

interface Enrollment {
  id: number
  student_id: number
  student: {
    id: number
    user: {
      first_name: string
      last_name: string
    }
    student_number: string
  }
}

interface AttendanceRecord {
  enrollment_id: number
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

interface AttendanceStats {
  total_records: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
}

export function AttendanceTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRecord>>({})
  const [statistics, setStatistics] = useState<AttendanceStats | null>(null)

  useEffect(() => {
    fetchCourseSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchEnrollments()
      fetchStatistics()
    }
  }, [selectedSection])

  const fetchCourseSections = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('auth_token')
      const user = JSON.parse(sessionStorage.getItem('user') || '{}')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections?staff_id=${user.staff_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch course sections')
      const data = await response.json()
      setCourseSections(data.data || [])

      if (data.data && data.data.length > 0) {
        setSelectedSection(data.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching course sections:', error)
      toast({
        title: "Error",
        description: "Failed to load course sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    if (!selectedSection) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${selectedSection}/enrollments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch enrollments')
      const data = await response.json()
      setEnrollments(data.data || [])

      // Initialize attendance records with default "present" status
      const initialRecords: Record<number, AttendanceRecord> = {}
      data.data?.forEach((enrollment: Enrollment) => {
        initialRecords[enrollment.id] = {
          enrollment_id: enrollment.id,
          status: 'present',
        }
      })
      setAttendanceRecords(initialRecords)

      // Fetch existing attendance for this date
      await fetchExistingAttendance()
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    }
  }

  const fetchExistingAttendance = async () => {
    if (!selectedSection) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance?course_section_id=${selectedSection}&attendance_date=${attendanceDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) return // No existing attendance is fine

      const data = await response.json()

      // Update attendance records with existing data
      if (data.data) {
        const updatedRecords = { ...attendanceRecords }
        data.data.forEach((record: any) => {
          updatedRecords[record.enrollment_id] = {
            enrollment_id: record.enrollment_id,
            status: record.status,
            notes: record.notes,
          }
        })
        setAttendanceRecords(updatedRecords)
      }
    } catch (error) {
      console.error('Error fetching existing attendance:', error)
    }
  }

  const fetchStatistics = async () => {
    if (!selectedSection) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${selectedSection}/attendance-statistics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch statistics')
      const data = await response.json()
      setStatistics(data.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const updateAttendanceStatus = (enrollmentId: number, status: AttendanceRecord['status']) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        status,
      }
    }))
  }

  const updateAttendanceNotes = (enrollmentId: number, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        notes,
      }
    }))
  }

  const markAllPresent = () => {
    const updated = { ...attendanceRecords }
    Object.keys(updated).forEach(key => {
      updated[parseInt(key)].status = 'present'
    })
    setAttendanceRecords(updated)
  }

  const markAllAbsent = () => {
    const updated = { ...attendanceRecords }
    Object.keys(updated).forEach(key => {
      updated[parseInt(key)].status = 'absent'
    })
    setAttendanceRecords(updated)
  }

  const submitAttendance = async () => {
    if (!selectedSection) return

    setSubmitting(true)
    try {
      const token = sessionStorage.getItem('auth_token')

      // Convert records object to array
      const records = Object.values(attendanceRecords).map(record => ({
        enrollment_id: record.enrollment_id,
        status: record.status,
        notes: record.notes || undefined,
      }))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_section_id: selectedSection,
            attendance_date: attendanceDate,
            records,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save attendance')
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message || "Attendance saved successfully",
      })

      // Refresh statistics
      fetchStatistics()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      present: { variant: "default", icon: CheckCircle, label: "Present" },
      absent: { variant: "destructive", icon: XCircle, label: "Absent" },
      late: { variant: "secondary", icon: Clock, label: "Late" },
      excused: { variant: "outline", icon: UserCheck, label: "Excused" },
    }

    const config = variants[status] || variants.present
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const selectedCourse = courseSections.find(cs => cs.id === selectedSection)

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="course-section">Course Section</Label>
          <Select
            value={selectedSection?.toString()}
            onValueChange={(value) => setSelectedSection(parseInt(value))}
          >
            <SelectTrigger id="course-section">
              <SelectValue placeholder="Select course section" />
            </SelectTrigger>
            <SelectContent>
              {courseSections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  {section.course.code} - Section {section.section_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-date">Date</Label>
          <Input
            id="attendance-date"
            type="date"
            value={attendanceDate}
            onChange={(e) => {
              setAttendanceDate(e.target.value)
              // Refetch attendance for new date
              if (selectedSection) {
                fetchExistingAttendance()
              }
            }}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={markAllPresent}
            variant="outline"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            All Present
          </Button>
          <Button
            onClick={markAllAbsent}
            variant="outline"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            All Absent
          </Button>
          <CsvImportExport
            entityName="attendance"
            entityDisplayName="Attendance"
            importEndpoint="/api/v1/attendance/csv/import"
            exportEndpoint="/api/v1/attendance/csv/export"
            templateEndpoint="/api/v1/attendance/csv/template"
            onImportComplete={fetchExistingAttendance}
          />
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_records}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{statistics.present}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">{statistics.absent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late/Excused</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {statistics.late + statistics.excused}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {statistics.attendance_rate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCourse && `${selectedCourse.course.code} - ${selectedCourse.course.name}`}
          </CardTitle>
          <CardDescription>
            Mark attendance for {attendanceDate} ({enrollments.length} students)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No students enrolled in this section</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quick Actions</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => {
                    const record = attendanceRecords[enrollment.id]
                    if (!record) return null

                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-mono text-sm">
                          {enrollment.student.student_number}
                        </TableCell>
                        <TableCell>
                          {enrollment.student.user.first_name} {enrollment.student.user.last_name}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={record.status === 'present' ? 'default' : 'outline'}
                              onClick={() => updateAttendanceStatus(enrollment.id, 'present')}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => updateAttendanceStatus(enrollment.id, 'absent')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === 'late' ? 'secondary' : 'outline'}
                              onClick={() => updateAttendanceStatus(enrollment.id, 'late')}
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === 'excused' ? 'secondary' : 'outline'}
                              onClick={() => updateAttendanceStatus(enrollment.id, 'excused')}
                            >
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add notes..."
                            value={record.notes || ''}
                            onChange={(e) => updateAttendanceNotes(enrollment.id, e.target.value)}
                            className="max-w-xs"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={submitAttendance}
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
