'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { API_CONFIG, apiRequest } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Building, Users, GraduationCap, BookOpen, Award,
  Mail, Phone, MapPin, Calendar, TrendingUp,
  ChevronRight, ExternalLink, Globe, FileText
} from 'lucide-react'

interface Faculty {
  id: number
  name: string
  title: string
  email: string
  phone: string
  office: string
  research_areas: string[]
  courses_teaching: number
}

interface Program {
  id: number
  code: string
  name: string
  degree_type: string
  duration: string
  total_credits: number
  enrolled_students: number
  description: string
}

interface Course {
  id: number
  code: string
  name: string
  credits: number
  level: string
  offered_terms: string[]
  enrollment_current: number
  enrollment_capacity: number
}

interface DepartmentDetail {
  department: {
    id: number
    code: string
    name: string
    description: string
    established_year: number
    building: string
    phone: string
    email: string
    website: string
    head_of_department: string
    head_email: string
    head_office: string
  }
  statistics: {
    total_faculty: number
    total_students: number
    undergraduate_students: number
    graduate_students: number
    programs_offered: number
    courses_offered: number
    research_grants: number
    publications_this_year: number
  }
  faculty: Faculty[]
  programs: Program[]
  courses: Course[]
  achievements: Array<{
    title: string
    description: string
    date: string
    type: 'research' | 'award' | 'grant'
  }>
}

// Mock data generator
const generateMockDepartment = (deptId: string): DepartmentDetail => {
  const departments = [
    { code: 'CS', name: 'Computer Science', building: 'Science Building' },
    { code: 'MATH', name: 'Mathematics', building: 'Math Tower' },
    { code: 'ENG', name: 'English', building: 'Liberal Arts Hall' },
    { code: 'BIO', name: 'Biology', building: 'Life Sciences Center' },
    { code: 'PHYS', name: 'Physics', building: 'Physics Building' }
  ]

  const dept = departments[parseInt(deptId) % departments.length]

  return {
    department: {
      id: parseInt(deptId),
      code: dept.code,
      name: `Department of ${dept.name}`,
      description: `The Department of ${dept.name} is committed to excellence in teaching, research, and service. Our faculty members are renowned experts in their fields, and our programs prepare students for successful careers in academia, industry, and beyond.`,
      established_year: 1965 + parseInt(deptId) * 5,
      building: dept.building,
      phone: '(555) 123-4567',
      email: `${dept.code.toLowerCase()}@university.edu`,
      website: `https://university.edu/${dept.code.toLowerCase()}`,
      head_of_department: 'Dr. Michael Thompson',
      head_email: 'thompson@university.edu',
      head_office: `${dept.building}, Room 501`
    },
    statistics: {
      total_faculty: 35,
      total_students: 450,
      undergraduate_students: 320,
      graduate_students: 130,
      programs_offered: 8,
      courses_offered: 42,
      research_grants: 12,
      publications_this_year: 67
    },
    faculty: [
      { id: 1, name: 'Dr. Elizabeth Harper', title: 'Professor', email: 'harper@university.edu', phone: '(555) 123-4501', office: 'SB 302', research_areas: ['Machine Learning', 'Data Mining'], courses_teaching: 3 },
      { id: 2, name: 'Dr. James Wilson', title: 'Associate Professor', email: 'wilson@university.edu', phone: '(555) 123-4502', office: 'SB 304', research_areas: ['Algorithms', 'Complexity Theory'], courses_teaching: 2 },
      { id: 3, name: 'Dr. Sarah Chen', title: 'Assistant Professor', email: 'chen@university.edu', phone: '(555) 123-4503', office: 'SB 306', research_areas: ['Computer Vision', 'AI'], courses_teaching: 2 },
      { id: 4, name: 'Dr. Robert Martinez', title: 'Professor', email: 'martinez@university.edu', phone: '(555) 123-4504', office: 'SB 308', research_areas: ['Databases', 'Big Data'], courses_teaching: 3 },
      { id: 5, name: 'Dr. Emily Johnson', title: 'Senior Lecturer', email: 'johnson@university.edu', phone: '(555) 123-4505', office: 'SB 310', research_areas: ['Software Engineering'], courses_teaching: 4 }
    ],
    programs: [
      { id: 1, code: `${dept.code}-BS`, name: `Bachelor of Science in ${dept.name}`, degree_type: 'Undergraduate', duration: '4 years', total_credits: 120, enrolled_students: 180, description: 'Comprehensive undergraduate program' },
      { id: 2, code: `${dept.code}-BA`, name: `Bachelor of Arts in ${dept.name}`, degree_type: 'Undergraduate', duration: '4 years', total_credits: 120, enrolled_students: 140, description: 'Liberal arts focused program' },
      { id: 3, code: `${dept.code}-MS`, name: `Master of Science in ${dept.name}`, degree_type: 'Graduate', duration: '2 years', total_credits: 36, enrolled_students: 80, description: 'Advanced graduate studies' },
      { id: 4, code: `${dept.code}-PHD`, name: `Doctor of Philosophy in ${dept.name}`, degree_type: 'Doctoral', duration: '4-6 years', total_credits: 72, enrolled_students: 50, description: 'Research-focused doctoral program' }
    ],
    courses: [
      { id: 1, code: `${dept.code} 101`, name: `Introduction to ${dept.name}`, credits: 3, level: 'Undergraduate', offered_terms: ['Fall', 'Spring'], enrollment_current: 120, enrollment_capacity: 150 },
      { id: 2, code: `${dept.code} 201`, name: 'Intermediate Concepts', credits: 4, level: 'Undergraduate', offered_terms: ['Fall', 'Spring'], enrollment_current: 80, enrollment_capacity: 100 },
      { id: 3, code: `${dept.code} 301`, name: 'Advanced Topics', credits: 3, level: 'Undergraduate', offered_terms: ['Fall'], enrollment_current: 45, enrollment_capacity: 50 },
      { id: 4, code: `${dept.code} 401`, name: 'Senior Seminar', credits: 3, level: 'Undergraduate', offered_terms: ['Spring'], enrollment_current: 30, enrollment_capacity: 35 },
      { id: 5, code: `${dept.code} 501`, name: 'Graduate Theory', credits: 3, level: 'Graduate', offered_terms: ['Fall'], enrollment_current: 25, enrollment_capacity: 30 },
      { id: 6, code: `${dept.code} 601`, name: 'Research Methods', credits: 3, level: 'Graduate', offered_terms: ['Spring'], enrollment_current: 20, enrollment_capacity: 25 }
    ],
    achievements: [
      { title: 'NSF Research Grant Award', description: '$2.5M grant for quantum computing research', date: '2024-10', type: 'grant' },
      { title: 'Best Paper Award at International Conference', description: 'Dr. Harper\'s research on neural networks', date: '2024-09', type: 'award' },
      { title: 'Major Research Breakthrough', description: 'New algorithm reduces computational complexity by 40%', date: '2024-08', type: 'research' }
    ]
  }
}

export default function DepartmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const deptId = params.id as string
  const [department, setDepartment] = useState<DepartmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        // Try authenticated endpoint
        const response = await apiRequest(`${API_CONFIG.V1.DEPARTMENTS}/${deptId}?include=faculty,programs,courses`)
        if (response.ok) {
          const data = await response.json()
          setDepartment(data)
        } else {
          throw new Error('Auth failed')
        }
      } catch (error) {
        // Fallback to mock data
        setDepartment(generateMockDepartment(deptId))
      } finally {
        setLoading(false)
      }
    }

    fetchDepartment()
  }, [deptId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading department...</div>
  }

  if (!department || !department.department) {
    return <div className="flex items-center justify-center min-h-screen">Department not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-8 w-8" />
              <Badge variant="secondary" className="text-blue-800">
                {department.department.code}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{department.department.name}</h1>
            <p className="text-blue-100 max-w-3xl">{department.department.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Est. {department.department.established_year}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {department.department.building}
              </span>
              <a href={department.department.website} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1 hover:underline">
                <Globe className="h-4 w-4" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Department Head */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Leadership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>MT</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{department.department.head_of_department}</p>
              <p className="text-sm text-muted-foreground">Head of Department</p>
            </div>
            <div className="text-right text-sm">
              <p className="flex items-center gap-1 justify-end">
                <Mail className="h-3 w-3" />
                {department.department.head_email}
              </p>
              <p className="flex items-center gap-1 justify-end text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {department.department.head_office}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.statistics.total_faculty}</div>
            <p className="text-xs text-muted-foreground">Academic staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.statistics.total_students}</div>
            <div className="text-xs text-muted-foreground">
              {department.statistics.undergraduate_students} UG, {department.statistics.graduate_students} Grad
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.statistics.programs_offered}</div>
            <p className="text-xs text-muted-foreground">Degree programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Output</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.statistics.publications_this_year}</div>
            <p className="text-xs text-muted-foreground">Publications this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {department.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {department.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <Badge variant={
                    achievement.type === 'grant' ? 'default' :
                    achievement.type === 'award' ? 'secondary' : 'outline'
                  }>
                    {achievement.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{achievement.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        {/* Faculty Tab */}
        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Members</CardTitle>
              <CardDescription>{department.statistics.total_faculty} academic staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Research Areas</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Office</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {department.faculty.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.research_areas.map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{member.email}</p>
                          <p className="text-muted-foreground">{member.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{member.office}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>Academic Programs</CardTitle>
              <CardDescription>{department.statistics.programs_offered} degree programs offered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {department.programs.map(program => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">{program.code} • {program.degree_type}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/programs/${program.id}`)}
                      >
                        View Program
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <p className="text-sm mb-3">{program.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-medium">{program.duration}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Credits: </span>
                        <span className="font-medium">{program.total_credits}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Enrolled: </span>
                        <span className="font-medium">{program.enrolled_students} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Offerings</CardTitle>
              <CardDescription>{department.statistics.courses_offered} courses available</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Terms Offered</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {department.courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell>
                        <Badge variant={course.level === 'Graduate' ? 'default' : 'secondary'}>
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {course.offered_terms.map((term, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(course.enrollment_current / course.enrollment_capacity) * 100}
                            className="w-16"
                          />
                          <span className="text-sm">
                            {course.enrollment_current}/{course.enrollment_capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/courses/${course.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{department.department.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{department.department.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{department.department.building}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}