"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatCard } from "@/components/layouts"
import { Building2, Plus, Search, GraduationCap, Folders, Loader2, Edit, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services"
import type { Faculty, Department, Course, CourseSection, Term, Staff, Room } from "@/types/api-types"

export function FacultyTab() {
  const { toast } = useToast()
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Faculty dialog state
  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false)
  const [submittingFaculty, setSubmittingFaculty] = useState(false)
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    code: '',
    description: '',
    dean_id: ''
  })

  // Department dialog state
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)
  const [submittingDepartment, setSubmittingDepartment] = useState(false)
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    code: '',
    abbreviation: '',
    faculty_id: '',
    head_id: '',
    description: ''
  })

  // Course dialog state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [submittingCourse, setSubmittingCourse] = useState(false)
  const [courseFormData, setCourseFormData] = useState({
    course_code: '',
    course_number: '',
    title: '',
    description: '',
    credits: '3',
    level: '',
    prerequisites: '',
    department_id: ''
  })

  // Course Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [submittingSection, setSubmittingSection] = useState(false)
  const [sectionFormData, setSectionFormData] = useState({
    course_id: '',
    section_number: '',
    term_id: '',
    instructor_id: '',
    room_id: '',
    capacity: '30',
    schedule_days: [] as string[],
    start_time: '',
    end_time: '',
    status: 'open'
  })

  // Edit Faculty dialog state
  const [editFacultyDialogOpen, setEditFacultyDialogOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [editFacultyFormData, setEditFacultyFormData] = useState({
    name: '',
    code: '',
    description: '',
    dean_id: ''
  })

  // Edit Department dialog state
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [editDepartmentFormData, setEditDepartmentFormData] = useState({
    name: '',
    code: '',
    abbreviation: '',
    faculty_id: '',
    head_id: '',
    description: ''
  })

  // Edit Course dialog state
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editCourseFormData, setEditCourseFormData] = useState({
    course_code: '',
    course_number: '',
    title: '',
    description: '',
    credits: '3',
    level: '',
    prerequisites: '',
    department_id: ''
  })

  // Edit Course Section dialog state
  const [editSectionDialogOpen, setEditSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null)
  const [editSectionFormData, setEditSectionFormData] = useState({
    course_id: '',
    section_number: '',
    term_id: '',
    instructor_id: '',
    room_id: '',
    capacity: '30',
    schedule_days: [] as string[],
    start_time: '',
    end_time: '',
    status: 'open'
  })

  // Delete dialog states
  const [deleteFacultyDialogOpen, setDeleteFacultyDialogOpen] = useState(false)
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null)
  const [deletingFacultyId, setDeletingFacultyId] = useState(false)

  const [deleteDepartmentDialogOpen, setDeleteDepartmentDialogOpen] = useState(false)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [deletingDepartmentId, setDeletingDepartmentId] = useState(false)

  const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState(false)

  const [deleteSectionDialogOpen, setDeleteSectionDialogOpen] = useState(false)
  const [deletingSection, setDeletingSection] = useState<CourseSection | null>(null)
  const [deletingSectionId, setDeletingSectionId] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      const [
        facultiesData,
        departmentsData,
        coursesResponse,
        sectionsResponse,
        termsData,
        staffData,
        roomsResponse
      ] = await Promise.all([
        adminService.getAllFaculties(),
        adminService.getAllDepartments(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }),
        adminService.getAllTerms(),
        adminService.getAllStaff(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        })
      ])

      setFaculties(facultiesData.data || [])
      setDepartments(departmentsData.data || [])
      setTerms(termsData.data || [])
      setStaff(staffData.data || [])

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.data || [])
      }

      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json()
        setCourseSections(sectionsData.data || [])
      }

      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        setRooms(roomsData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateFaculty = async () => {
    if (!facultyFormData.name || !facultyFormData.code) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name and code)",
        variant: "destructive",
      })
      return
    }

    setSubmittingFaculty(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faculties`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: facultyFormData.name,
            code: facultyFormData.code,
            description: facultyFormData.description || undefined,
            dean_id: facultyFormData.dean_id ? parseInt(facultyFormData.dean_id) : undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create faculty')
      }

      toast({
        title: "Faculty Created",
        description: "The faculty has been created successfully",
      })

      setFacultyDialogOpen(false)
      setFacultyFormData({ name: '', code: '', description: '', dean_id: '' })
      fetchData()
    } catch (error: any) {
      console.error('Create faculty error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create faculty. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingFaculty(false)
    }
  }

  const handleCreateDepartment = async () => {
    if (!departmentFormData.name || !departmentFormData.code || !departmentFormData.faculty_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, code, and faculty)",
        variant: "destructive",
      })
      return
    }

    setSubmittingDepartment(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/departments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: departmentFormData.name,
            code: departmentFormData.code,
            abbreviation: departmentFormData.abbreviation || undefined,
            faculty_id: parseInt(departmentFormData.faculty_id),
            head_id: departmentFormData.head_id ? parseInt(departmentFormData.head_id) : undefined,
            description: departmentFormData.description || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create department')
      }

      toast({
        title: "Department Created",
        description: "The department has been created successfully",
      })

      setDepartmentDialogOpen(false)
      setDepartmentFormData({ name: '', code: '', abbreviation: '', faculty_id: '', head_id: '', description: '' })
      fetchData()
    } catch (error: any) {
      console.error('Create department error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create department. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingDepartment(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!courseFormData.course_code || !courseFormData.title || !courseFormData.description || !courseFormData.department_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (course code, title, description, and department)",
        variant: "destructive",
      })
      return
    }

    setSubmittingCourse(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_code: courseFormData.course_code,
            course_number: courseFormData.course_number || undefined,
            title: courseFormData.title,
            description: courseFormData.description,
            credits: parseFloat(courseFormData.credits),
            level: courseFormData.level || undefined,
            prerequisites: courseFormData.prerequisites || undefined,
            department_id: parseInt(courseFormData.department_id),
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create course')
      }

      toast({
        title: "Course Created",
        description: "The course has been created successfully",
      })

      setCourseDialogOpen(false)
      setCourseFormData({
        course_code: '',
        course_number: '',
        title: '',
        description: '',
        credits: '3',
        level: '',
        prerequisites: '',
        department_id: ''
      })
      fetchData()
    } catch (error: any) {
      console.error('Create course error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingCourse(false)
    }
  }

  const handleCreateCourseSection = async () => {
    if (!sectionFormData.course_id || !sectionFormData.section_number || !sectionFormData.term_id ||
        !sectionFormData.instructor_id || !sectionFormData.start_time || !sectionFormData.end_time ||
        sectionFormData.schedule_days.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (course, section number, term, instructor, schedule days, and times)",
        variant: "destructive",
      })
      return
    }

    setSubmittingSection(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_id: parseInt(sectionFormData.course_id),
            section_number: sectionFormData.section_number,
            term_id: parseInt(sectionFormData.term_id),
            instructor_id: parseInt(sectionFormData.instructor_id),
            room_id: sectionFormData.room_id ? parseInt(sectionFormData.room_id) : undefined,
            capacity: parseInt(sectionFormData.capacity),
            schedule_days: sectionFormData.schedule_days,
            start_time: sectionFormData.start_time,
            end_time: sectionFormData.end_time,
            status: sectionFormData.status,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create course section')
      }

      toast({
        title: "Course Section Created",
        description: "The course section has been created successfully",
      })

      setSectionDialogOpen(false)
      setSectionFormData({
        course_id: '',
        section_number: '',
        term_id: '',
        instructor_id: '',
        room_id: '',
        capacity: '30',
        schedule_days: [],
        start_time: '',
        end_time: '',
        status: 'open'
      })
      fetchData()
    } catch (error: any) {
      console.error('Create course section error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create course section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingSection(false)
    }
  }

  const toggleScheduleDay = (day: string) => {
    setSectionFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day]
    }))
  }

  // Edit Faculty handlers
  const handleEditFacultyClick = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setEditFacultyFormData({
      name: faculty.name || '',
      code: faculty.code || '',
      description: faculty.description || '',
      dean_id: faculty.dean_id?.toString() || ''
    })
    setEditFacultyDialogOpen(true)
  }

  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return

    if (!editFacultyFormData.name || !editFacultyFormData.code) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmittingFaculty(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faculties/${editingFaculty.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: editFacultyFormData.name,
            code: editFacultyFormData.code,
            description: editFacultyFormData.description || undefined,
            dean_id: editFacultyFormData.dean_id ? parseInt(editFacultyFormData.dean_id) : undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update faculty')
      }

      toast({
        title: "Faculty Updated",
        description: "The faculty has been updated successfully",
      })

      setEditFacultyDialogOpen(false)
      setEditingFaculty(null)
      fetchData()
    } catch (error: any) {
      console.error('Update faculty error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update faculty. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingFaculty(false)
    }
  }

  // Edit Department handlers
  const handleEditDepartmentClick = (department: Department) => {
    setEditingDepartment(department)
    setEditDepartmentFormData({
      name: department.name || '',
      code: department.code || '',
      abbreviation: department.abbreviation || '',
      faculty_id: department.faculty_id?.toString() || '',
      head_id: department.head_id?.toString() || '',
      description: department.description || ''
    })
    setEditDepartmentDialogOpen(true)
  }

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return

    if (!editDepartmentFormData.name || !editDepartmentFormData.code || !editDepartmentFormData.faculty_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmittingDepartment(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/departments/${editingDepartment.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: editDepartmentFormData.name,
            code: editDepartmentFormData.code,
            abbreviation: editDepartmentFormData.abbreviation || undefined,
            faculty_id: parseInt(editDepartmentFormData.faculty_id),
            head_id: editDepartmentFormData.head_id ? parseInt(editDepartmentFormData.head_id) : undefined,
            description: editDepartmentFormData.description || undefined,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update department')
      }

      toast({
        title: "Department Updated",
        description: "The department has been updated successfully",
      })

      setEditDepartmentDialogOpen(false)
      setEditingDepartment(null)
      fetchData()
    } catch (error: any) {
      console.error('Update department error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update department. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingDepartment(false)
    }
  }

  // Edit Course handlers
  const handleEditCourseClick = (course: Course) => {
    setEditingCourse(course)
    setEditCourseFormData({
      course_code: course.course_code || '',
      course_number: course.course_number || '',
      title: course.title || '',
      description: course.description || '',
      credits: course.credits?.toString() || '3',
      level: course.level || '',
      prerequisites: course.prerequisites || '',
      department_id: course.department_id?.toString() || ''
    })
    setEditCourseDialogOpen(true)
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    if (!editCourseFormData.course_code || !editCourseFormData.title || !editCourseFormData.description || !editCourseFormData.department_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmittingCourse(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${editingCourse.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_code: editCourseFormData.course_code,
            course_number: editCourseFormData.course_number || undefined,
            title: editCourseFormData.title,
            description: editCourseFormData.description,
            credits: parseFloat(editCourseFormData.credits),
            level: editCourseFormData.level || undefined,
            prerequisites: editCourseFormData.prerequisites || undefined,
            department_id: parseInt(editCourseFormData.department_id),
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update course')
      }

      toast({
        title: "Course Updated",
        description: "The course has been updated successfully",
      })

      setEditCourseDialogOpen(false)
      setEditingCourse(null)
      fetchData()
    } catch (error: any) {
      console.error('Update course error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingCourse(false)
    }
  }

  // Edit Course Section handlers
  const handleEditSectionClick = (section: CourseSection) => {
    setEditingSection(section)
    setEditSectionFormData({
      course_id: section.course_id?.toString() || '',
      section_number: section.section_number || '',
      term_id: section.term_id?.toString() || '',
      instructor_id: section.instructor_id?.toString() || '',
      room_id: section.room_id?.toString() || '',
      capacity: section.capacity?.toString() || '30',
      schedule_days: section.schedule_days ? JSON.parse(section.schedule_days as any) : [],
      start_time: section.start_time || '',
      end_time: section.end_time || '',
      status: section.status || 'open'
    })
    setEditSectionDialogOpen(true)
  }

  const toggleEditScheduleDay = (day: string) => {
    setEditSectionFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day]
    }))
  }

  const handleUpdateSection = async () => {
    if (!editingSection) return

    if (!editSectionFormData.course_id || !editSectionFormData.section_number || !editSectionFormData.term_id || !editSectionFormData.capacity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (editSectionFormData.schedule_days.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one schedule day",
        variant: "destructive",
      })
      return
    }

    if (!editSectionFormData.start_time || !editSectionFormData.end_time) {
      toast({
        title: "Validation Error",
        description: "Please provide both start and end times",
        variant: "destructive",
      })
      return
    }

    setSubmittingSection(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${editingSection.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_id: parseInt(editSectionFormData.course_id),
            section_number: editSectionFormData.section_number,
            term_id: parseInt(editSectionFormData.term_id),
            instructor_id: editSectionFormData.instructor_id ? parseInt(editSectionFormData.instructor_id) : undefined,
            room_id: editSectionFormData.room_id ? parseInt(editSectionFormData.room_id) : undefined,
            capacity: parseInt(editSectionFormData.capacity),
            schedule_days: JSON.stringify(editSectionFormData.schedule_days),
            start_time: editSectionFormData.start_time,
            end_time: editSectionFormData.end_time,
            status: editSectionFormData.status,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update course section')
      }

      toast({
        title: "Section Updated",
        description: "The course section has been updated successfully",
      })

      setEditSectionDialogOpen(false)
      setEditingSection(null)
      fetchData()
    } catch (error: any) {
      console.error('Update course section error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update course section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingSection(false)
    }
  }

  // Delete handlers
  const handleDeleteFacultyClick = (faculty: Faculty) => {
    setDeletingFaculty(faculty)
    setDeleteFacultyDialogOpen(true)
  }

  const handleDeleteFaculty = async () => {
    if (!deletingFaculty) return
    setDeletingFacultyId(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faculties/${deletingFaculty.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete faculty')
      }

      toast({
        title: "Faculty Deleted",
        description: "The faculty has been deleted successfully",
      })

      setDeleteFacultyDialogOpen(false)
      setDeletingFaculty(null)
      fetchData()
    } catch (error: any) {
      console.error('Delete faculty error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete faculty. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingFacultyId(false)
    }
  }

  const handleDeleteDepartmentClick = (department: Department) => {
    setDeletingDepartment(department)
    setDeleteDepartmentDialogOpen(true)
  }

  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return
    setDeletingDepartmentId(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/departments/${deletingDepartment.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete department')
      }

      toast({
        title: "Department Deleted",
        description: "The department has been deleted successfully",
      })

      setDeleteDepartmentDialogOpen(false)
      setDeletingDepartment(null)
      fetchData()
    } catch (error: any) {
      console.error('Delete department error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete department. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingDepartmentId(false)
    }
  }

  const handleDeleteCourseClick = (course: Course) => {
    setDeletingCourse(course)
    setDeleteCourseDialogOpen(true)
  }

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return
    setDeletingCourseId(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${deletingCourse.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete course')
      }

      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully",
      })

      setDeleteCourseDialogOpen(false)
      setDeletingCourse(null)
      fetchData()
    } catch (error: any) {
      console.error('Delete course error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingCourseId(false)
    }
  }

  const handleDeleteSectionClick = (section: CourseSection) => {
    setDeletingSection(section)
    setDeleteSectionDialogOpen(true)
  }

  const handleDeleteSection = async () => {
    if (!deletingSection) return
    setDeletingSectionId(true)

    try {
      const token = sessionStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections/${deletingSection.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete course section')
      }

      toast({
        title: "Section Deleted",
        description: "The course section has been deleted successfully",
      })

      setDeleteSectionDialogOpen(false)
      setDeletingSection(null)
      fetchData()
    } catch (error: any) {
      console.error('Delete course section error:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete course section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingSectionId(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalFaculties = faculties.length
  const totalDepartments = departments.length
  const totalCourses = courses.length
  const totalSections = courseSections.length
  const totalPrograms = departments.reduce((sum, dept) => sum + (dept.programs?.length || 0), 0)

  // Filter functions
  const filteredFaculties = faculties.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = departments.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCourses = courses.filter(c =>
    c.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSections = courseSections.filter(s =>
    s.course?.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.section_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.instructor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Faculties"
          value={totalFaculties.toString()}
          description="Academic divisions"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="Departments"
          value={totalDepartments.toString()}
          description="Academic departments"
          icon={<Folders className="h-4 w-4" />}
        />
        <StatCard
          title="Courses"
          value={totalCourses.toString()}
          description="Course catalog"
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          title="Sections"
          value={totalSections.toString()}
          description="Course sections"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculties, departments, courses, and sections..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs for Faculties, Departments, Courses, and Sections */}
      <Tabs defaultValue="faculties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faculties">Faculties ({filteredFaculties.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({filteredDepartments.length})</TabsTrigger>
          <TabsTrigger value="courses">Courses ({filteredCourses.length})</TabsTrigger>
          <TabsTrigger value="sections">Sections ({filteredSections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="faculties" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFacultyDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Faculties ({filteredFaculties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaculties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No faculties found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredFaculties.map((faculty) => (
                    <div key={faculty.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{faculty.name}</p>
                          <Badge variant="outline">{faculty.code}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {faculty.dean && <span>Dean: {faculty.dean.user?.name}</span>}
                          {faculty.departments && <span>{faculty.departments.length} departments</span>}
                        </div>
                        {faculty.description && (
                          <p className="text-sm text-muted-foreground mt-1">{faculty.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {faculty.established_date && (
                          <Badge variant="secondary">
                            Est. {new Date(faculty.established_date).getFullYear()}
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFacultyClick(faculty)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFacultyClick(faculty)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDepartmentDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDepartments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No departments found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDepartments.map((department) => (
                    <div key={department.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{department.name}</p>
                          <Badge variant="outline">{department.code}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {department.faculty && <span>Faculty: {department.faculty.name}</span>}
                          {department.head && <span>Head: {department.head.user?.name}</span>}
                          {department.programs && <span>{department.programs.length} programs</span>}
                        </div>
                        {department.description && (
                          <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDepartmentClick(department)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDepartmentClick(department)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCourseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Courses ({filteredCourses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No courses found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{course.course_code} - {course.title}</p>
                          <Badge variant="outline">{course.credits} credits</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {course.department && <span>Department: {course.department.name}</span>}
                          {course.level && <span>Level: {course.level}</span>}
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourseClick(course)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourseClick(course)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSectionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Sections ({filteredSections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No course sections found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredSections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {section.course?.course_code} - Section {section.section_number}
                          </p>
                          <Badge variant={section.status === 'open' ? 'default' : section.status === 'closed' ? 'destructive' : 'secondary'}>
                            {section.status}
                          </Badge>
                          <Badge variant="outline">{section.capacity} seats</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{section.course?.title}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-2">
                          {section.term && (
                            <div>
                              <p className="font-medium">Term</p>
                              <p>{section.term.name}</p>
                            </div>
                          )}
                          {section.instructor && (
                            <div>
                              <p className="font-medium">Instructor</p>
                              <p>{section.instructor.user?.name}</p>
                            </div>
                          )}
                          {section.schedule_days && section.schedule_days.length > 0 && (
                            <div>
                              <p className="font-medium">Schedule</p>
                              <p>{section.schedule_days.join(', ')}</p>
                            </div>
                          )}
                          {section.start_time && section.end_time && (
                            <div>
                              <p className="font-medium">Time</p>
                              <p>{section.start_time} - {section.end_time}</p>
                            </div>
                          )}
                          {section.room && (
                            <div>
                              <p className="font-medium">Room</p>
                              <p>{section.room.building?.code} {section.room.room_number}</p>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Enrollment</p>
                            <p>{section.enrolled_count || 0}/{section.capacity}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSectionClick(section)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSectionClick(section)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Faculty Dialog */}
      <Dialog open={facultyDialogOpen} onOpenChange={setFacultyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Faculty</DialogTitle>
            <DialogDescription>
              Add a new faculty to the institution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty_name">Faculty Name *</Label>
                <Input
                  id="faculty_name"
                  placeholder="e.g., Faculty of Engineering"
                  value={facultyFormData.name}
                  onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty_code">Faculty Code *</Label>
                <Input
                  id="faculty_code"
                  placeholder="e.g., ENG"
                  value={facultyFormData.code}
                  onChange={(e) => setFacultyFormData({ ...facultyFormData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty_description">Description (Optional)</Label>
              <Textarea
                id="faculty_description"
                placeholder="Enter faculty description..."
                value={facultyFormData.description}
                onChange={(e) => setFacultyFormData({ ...facultyFormData, description: e.target.value })}
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFacultyDialogOpen(false)}
              disabled={submittingFaculty}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFaculty}
              disabled={submittingFaculty}
            >
              {submittingFaculty ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Faculty
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Add a new department to the institution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept_name">Department Name *</Label>
                <Input
                  id="dept_name"
                  placeholder="e.g., Computer Science"
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept_code">Department Code *</Label>
                <Input
                  id="dept_code"
                  placeholder="e.g., CS"
                  value={departmentFormData.code}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept_abbreviation">Abbreviation (Optional)</Label>
                <Input
                  id="dept_abbreviation"
                  placeholder="e.g., CompSci"
                  value={departmentFormData.abbreviation}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, abbreviation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept_faculty">Faculty *</Label>
                <Select
                  value={departmentFormData.faculty_id}
                  onValueChange={(value) => setDepartmentFormData({ ...departmentFormData, faculty_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name} ({faculty.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept_description">Description (Optional)</Label>
              <Textarea
                id="dept_description"
                placeholder="Enter department description..."
                value={departmentFormData.description}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepartmentDialogOpen(false)}
              disabled={submittingDepartment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDepartment}
              disabled={submittingDepartment}
            >
              {submittingDepartment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>
              Add a new course to the catalog
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code *</Label>
                <Input
                  id="course_code"
                  placeholder="e.g., CS101"
                  value={courseFormData.course_code}
                  onChange={(e) => setCourseFormData({ ...courseFormData, course_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_number">Course Number (Optional)</Label>
                <Input
                  id="course_number"
                  placeholder="e.g., 101"
                  value={courseFormData.course_number}
                  onChange={(e) => setCourseFormData({ ...courseFormData, course_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_title">Course Title *</Label>
              <Input
                id="course_title"
                placeholder="e.g., Introduction to Computer Science"
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_department">Department *</Label>
                <Select
                  value={courseFormData.department_id}
                  onValueChange={(value) => setCourseFormData({ ...courseFormData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_credits">Credits *</Label>
                <Input
                  id="course_credits"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={courseFormData.credits}
                  onChange={(e) => setCourseFormData({ ...courseFormData, credits: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_level">Level (Optional)</Label>
              <Input
                id="course_level"
                placeholder="e.g., Undergraduate, Graduate"
                value={courseFormData.level}
                onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_description">Description *</Label>
              <Textarea
                id="course_description"
                placeholder="Enter course description..."
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_prerequisites">Prerequisites (Optional)</Label>
              <Textarea
                id="course_prerequisites"
                placeholder="Enter prerequisite courses or requirements..."
                value={courseFormData.prerequisites}
                onChange={(e) => setCourseFormData({ ...courseFormData, prerequisites: e.target.value })}
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseDialogOpen(false)}
              disabled={submittingCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={submittingCourse}
            >
              {submittingCourse ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course Section</DialogTitle>
            <DialogDescription>
              Add a new section for a course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course and Section Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_course">Course *</Label>
                <Select
                  value={sectionFormData.course_id}
                  onValueChange={(value) => setSectionFormData({ ...sectionFormData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_number">Section Number *</Label>
                <Input
                  id="section_number"
                  placeholder="e.g., 001"
                  value={sectionFormData.section_number}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, section_number: e.target.value })}
                />
              </div>
            </div>

            {/* Term and Instructor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_term">Term *</Label>
                <Select
                  value={sectionFormData.term_id}
                  onValueChange={(value) => setSectionFormData({ ...sectionFormData, term_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name} ({term.academic_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_instructor">Instructor *</Label>
                <Select
                  value={sectionFormData.instructor_id}
                  onValueChange={(value) => setSectionFormData({ ...sectionFormData, instructor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.user?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_room">Room (Optional)</Label>
                <Select
                  value={sectionFormData.room_id}
                  onValueChange={(value) => setSectionFormData({ ...sectionFormData, room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No room assigned</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.building?.code} {room.room_number} (Capacity: {room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_capacity">Capacity *</Label>
                <Input
                  id="section_capacity"
                  type="number"
                  min="1"
                  max="500"
                  value={sectionFormData.capacity}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, capacity: e.target.value })}
                />
              </div>
            </div>

            {/* Schedule Days */}
            <div className="space-y-2">
              <Label>Schedule Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={sectionFormData.schedule_days.includes(day)}
                      onCheckedChange={() => toggleScheduleDay(day)}
                    />
                    <label
                      htmlFor={`day-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_start_time">Start Time *</Label>
                <Input
                  id="section_start_time"
                  type="time"
                  value={sectionFormData.start_time}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_end_time">End Time *</Label>
                <Input
                  id="section_end_time"
                  type="time"
                  value={sectionFormData.end_time}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, end_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section_status">Status</Label>
                <Select
                  value={sectionFormData.status}
                  onValueChange={(value) => setSectionFormData({ ...sectionFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSectionDialogOpen(false)}
              disabled={submittingSection}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourseSection}
              disabled={submittingSection}
            >
              {submittingSection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Section
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={editFacultyDialogOpen} onOpenChange={setEditFacultyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>
              Update faculty information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_faculty_name">Faculty Name *</Label>
                <Input
                  id="edit_faculty_name"
                  placeholder="e.g., Faculty of Engineering"
                  value={editFacultyFormData.name}
                  onChange={(e) => setEditFacultyFormData({ ...editFacultyFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_faculty_code">Faculty Code *</Label>
                <Input
                  id="edit_faculty_code"
                  placeholder="e.g., ENG"
                  value={editFacultyFormData.code}
                  onChange={(e) => setEditFacultyFormData({ ...editFacultyFormData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_faculty_dean">Dean (Optional)</Label>
              <Select
                value={editFacultyFormData.dean_id}
                onValueChange={(value) => setEditFacultyFormData({ ...editFacultyFormData, dean_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dean" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.user?.name} - {s.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_faculty_description">Description (Optional)</Label>
              <Textarea
                id="edit_faculty_description"
                placeholder="Faculty description"
                value={editFacultyFormData.description}
                onChange={(e) => setEditFacultyFormData({ ...editFacultyFormData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditFacultyDialogOpen(false)}
              disabled={submittingFaculty}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFaculty}
              disabled={submittingFaculty}
            >
              {submittingFaculty ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Faculty
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={editDepartmentDialogOpen} onOpenChange={setEditDepartmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_dept_name">Department Name *</Label>
                <Input
                  id="edit_dept_name"
                  placeholder="e.g., Computer Science"
                  value={editDepartmentFormData.name}
                  onChange={(e) => setEditDepartmentFormData({ ...editDepartmentFormData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_dept_code">Code *</Label>
                <Input
                  id="edit_dept_code"
                  placeholder="e.g., CS"
                  value={editDepartmentFormData.code}
                  onChange={(e) => setEditDepartmentFormData({ ...editDepartmentFormData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_dept_abbreviation">Abbreviation (Optional)</Label>
                <Input
                  id="edit_dept_abbreviation"
                  placeholder="e.g., CompSci"
                  value={editDepartmentFormData.abbreviation}
                  onChange={(e) => setEditDepartmentFormData({ ...editDepartmentFormData, abbreviation: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_dept_faculty">Faculty *</Label>
                <Select
                  value={editDepartmentFormData.faculty_id}
                  onValueChange={(value) => setEditDepartmentFormData({ ...editDepartmentFormData, faculty_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_dept_head">Department Head (Optional)</Label>
              <Select
                value={editDepartmentFormData.head_id}
                onValueChange={(value) => setEditDepartmentFormData({ ...editDepartmentFormData, head_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select head" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.user?.name} - {s.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_dept_description">Description (Optional)</Label>
              <Textarea
                id="edit_dept_description"
                placeholder="Department description"
                value={editDepartmentFormData.description}
                onChange={(e) => setEditDepartmentFormData({ ...editDepartmentFormData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDepartmentDialogOpen(false)}
              disabled={submittingDepartment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDepartment}
              disabled={submittingDepartment}
            >
              {submittingDepartment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Department
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={editCourseDialogOpen} onOpenChange={setEditCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_course_code">Course Code *</Label>
                <Input
                  id="edit_course_code"
                  placeholder="e.g., CS101"
                  value={editCourseFormData.course_code}
                  onChange={(e) => setEditCourseFormData({ ...editCourseFormData, course_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_course_number">Course Number (Optional)</Label>
                <Input
                  id="edit_course_number"
                  placeholder="e.g., 101"
                  value={editCourseFormData.course_number}
                  onChange={(e) => setEditCourseFormData({ ...editCourseFormData, course_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_course_title">Title *</Label>
              <Input
                id="edit_course_title"
                placeholder="e.g., Introduction to Computer Science"
                value={editCourseFormData.title}
                onChange={(e) => setEditCourseFormData({ ...editCourseFormData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_course_description">Description *</Label>
              <Textarea
                id="edit_course_description"
                placeholder="Course description"
                value={editCourseFormData.description}
                onChange={(e) => setEditCourseFormData({ ...editCourseFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_credits">Credits *</Label>
                <Input
                  id="edit_credits"
                  type="number"
                  step="0.5"
                  min="0"
                  value={editCourseFormData.credits}
                  onChange={(e) => setEditCourseFormData({ ...editCourseFormData, credits: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_level">Level (Optional)</Label>
                <Input
                  id="edit_level"
                  placeholder="e.g., Undergraduate"
                  value={editCourseFormData.level}
                  onChange={(e) => setEditCourseFormData({ ...editCourseFormData, level: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_course_department">Department *</Label>
                <Select
                  value={editCourseFormData.department_id}
                  onValueChange={(value) => setEditCourseFormData({ ...editCourseFormData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_prerequisites">Prerequisites (Optional)</Label>
              <Input
                id="edit_prerequisites"
                placeholder="e.g., CS100"
                value={editCourseFormData.prerequisites}
                onChange={(e) => setEditCourseFormData({ ...editCourseFormData, prerequisites: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCourseDialogOpen(false)}
              disabled={submittingCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={submittingCourse}
            >
              {submittingCourse ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Section Dialog */}
      <Dialog open={editSectionDialogOpen} onOpenChange={setEditSectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Section</DialogTitle>
            <DialogDescription>
              Update course section information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_section_course">Course *</Label>
                <Select
                  value={editSectionFormData.course_id}
                  onValueChange={(value) => setEditSectionFormData({ ...editSectionFormData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_section_number">Section Number *</Label>
                <Input
                  id="edit_section_number"
                  placeholder="e.g., 001"
                  value={editSectionFormData.section_number}
                  onChange={(e) => setEditSectionFormData({ ...editSectionFormData, section_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_section_term">Term *</Label>
                <Select
                  value={editSectionFormData.term_id}
                  onValueChange={(value) => setEditSectionFormData({ ...editSectionFormData, term_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name} {term.academic_year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_section_instructor">Instructor (Optional)</Label>
                <Select
                  value={editSectionFormData.instructor_id}
                  onValueChange={(value) => setEditSectionFormData({ ...editSectionFormData, instructor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.user?.name} - {s.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_section_room">Room (Optional)</Label>
                <Select
                  value={editSectionFormData.room_id}
                  onValueChange={(value) => setEditSectionFormData({ ...editSectionFormData, room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.building?.code} {room.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_section_capacity">Capacity *</Label>
                <Input
                  id="edit_section_capacity"
                  type="number"
                  min="1"
                  value={editSectionFormData.capacity}
                  onChange={(e) => setEditSectionFormData({ ...editSectionFormData, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day}`}
                      checked={editSectionFormData.schedule_days.includes(day)}
                      onCheckedChange={() => toggleEditScheduleDay(day)}
                    />
                    <label htmlFor={`edit-day-${day}`} className="text-sm cursor-pointer">
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_section_start_time">Start Time *</Label>
                <Input
                  id="edit_section_start_time"
                  type="time"
                  value={editSectionFormData.start_time}
                  onChange={(e) => setEditSectionFormData({ ...editSectionFormData, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_section_end_time">End Time *</Label>
                <Input
                  id="edit_section_end_time"
                  type="time"
                  value={editSectionFormData.end_time}
                  onChange={(e) => setEditSectionFormData({ ...editSectionFormData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_section_status">Status *</Label>
              <Select
                value={editSectionFormData.status}
                onValueChange={(value) => setEditSectionFormData({ ...editSectionFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditSectionDialogOpen(false)}
              disabled={submittingSection}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSection}
              disabled={submittingSection}
            >
              {submittingSection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Section
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Faculty Confirmation Dialog */}
      <AlertDialog open={deleteFacultyDialogOpen} onOpenChange={setDeleteFacultyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingFaculty && (
                <>
                  Are you sure you want to delete <strong>{deletingFaculty.name}</strong>?
                  <br /><br />
                  This action cannot be undone. All associated departments and courses may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFacultyId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFaculty}
              disabled={deletingFacultyId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingFacultyId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Faculty'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Department Confirmation Dialog */}
      <AlertDialog open={deleteDepartmentDialogOpen} onOpenChange={setDeleteDepartmentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingDepartment && (
                <>
                  Are you sure you want to delete <strong>{deletingDepartment.name}</strong>?
                  <br /><br />
                  This action cannot be undone. All associated courses may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingDepartmentId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDepartment}
              disabled={deletingDepartmentId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingDepartmentId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Department'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={deleteCourseDialogOpen} onOpenChange={setDeleteCourseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCourse && (
                <>
                  Are you sure you want to delete <strong>{deletingCourse.course_code} - {deletingCourse.title}</strong>?
                  <br /><br />
                  This action cannot be undone. All associated course sections may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingCourseId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={deletingCourseId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingCourseId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Course'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Section Confirmation Dialog */}
      <AlertDialog open={deleteSectionDialogOpen} onOpenChange={setDeleteSectionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course Section</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingSection && (
                <>
                  Are you sure you want to delete section <strong>{deletingSection.section_number}</strong> of <strong>{deletingSection.course?.course_code}</strong>?
                  <br /><br />
                  This action cannot be undone. All associated enrollments may be affected.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingSectionId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              disabled={deletingSectionId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingSectionId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Section'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
