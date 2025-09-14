// Comprehensive University Management API Service
import authService from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1'
const DATA_VIEWER_URL = 'http://localhost:8001/api/data-viewer'

// Utility to simulate API delay for consistent UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface ApiResponse<T> {
  data: T[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  links?: {
    first: string
    last: string
    prev?: string
    next?: string
  }
}

export interface Student {
  id: number
  user_id: number
  student_number: string
  date_of_birth: string
  gender: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  emergency_contact_name: string
  emergency_contact_phone: string
  enrollment_status: 'active' | 'inactive' | 'graduated' | 'suspended'
  created_at: string
  updated_at: string
  deleted_at?: string
  user: {
    id: number
    name: string
    email: string
    roles: string[]
  }
  enrollments?: Enrollment[]
  academic_records?: AcademicRecord[]
  admission_applications?: AdmissionApplication[]
}

export interface Staff {
  id: number
  user_id: number
  staff_number: string
  department_id: number
  position: string
  hire_date: string
  salary?: number
  phone: string
  office_location?: string
  office_hours?: string
  specialization?: string
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
    roles: string[]
  }
  department: Department
  course_sections?: CourseSection[]
}

export interface Faculty {
  id: number
  name: string
  abbreviation: string
  dean_id?: number
  established_date: string
  description?: string
  created_at: string
  updated_at: string
  dean?: Staff
  departments: Department[]
}

export interface Department {
  id: number
  faculty_id: number
  name: string
  abbreviation: string
  head_id?: number
  description?: string
  created_at: string
  updated_at: string
  faculty: Faculty
  head?: Staff
  programs: Program[]
  staff: Staff[]
}

export interface Program {
  id: number
  department_id: number
  name: string
  degree_type: 'bachelor' | 'master' | 'doctorate' | 'certificate'
  duration_years: number
  credits_required: number
  description?: string
  admission_requirements?: string
  created_at: string
  updated_at: string
  department: Department
  courses: Course[]
}

export interface Course {
  id: number
  program_id: number
  course_code: string
  title: string
  credits: number
  description?: string
  prerequisites?: string
  is_core: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
  program: Program
  sections: CourseSection[]
}

export interface CourseSection {
  id: number
  course_id: number
  term_id: number
  instructor_id: number
  room_id?: number
  section_number: string
  capacity: number
  status: 'open' | 'closed' | 'cancelled'
  schedule_days: string[]
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  course: Course
  term: Term
  instructor: Staff
  room?: Room
  enrollments: Enrollment[]
}

export interface Term {
  id: number
  name: string
  code: string
  start_date: string
  end_date: string
  registration_start: string
  registration_end: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  enrollment_date: string
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed'
  grade?: string
  credits_earned?: number
  created_at: string
  updated_at: string
  deleted_at?: string
  student: Student
  course_section: CourseSection
}

export interface AdmissionApplication {
  id: number
  student_id: number
  term_id: number
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn'
  application_date: string
  decision_date?: string
  decision_status?: 'accepted' | 'rejected' | 'waitlisted'
  comments?: string
  created_at: string
  updated_at: string
  deleted_at?: string
  student: Student
  term: Term
  program_choices: ProgramChoice[]
  documents: Document[]
}

export interface ProgramChoice {
  id: number
  admission_application_id: number
  program_id: number
  priority: number
  created_at: string
  updated_at: string
  program: Program
}

export interface AcademicRecord {
  id: number
  student_id: number
  institution_name: string
  degree_type: string
  field_of_study: string
  graduation_date?: string
  gpa?: number
  transcript_verified: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  student_id: number
  admission_application_id?: number
  document_type: 'transcript' | 'personal_statement' | 'recommendation_letter' | 'test_scores' | 'other'
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  version: number
  status: 'pending' | 'verified' | 'rejected'
  uploaded_by: number
  verified_by?: number
  verified_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  capacity: number
  room_type: 'classroom' | 'laboratory' | 'auditorium' | 'office' | 'other'
  equipment?: string
  created_at: string
  updated_at: string
  building: Building
}

export interface Building {
  id: number
  name: string
  address: string
  floors: number
  description?: string
  created_at: string
  updated_at: string
  rooms: Room[]
}

// Main University API Class
export class UniversityAPI {
  // Student Management
  static async getStudents(params?: {
    page?: number
    per_page?: number
    search?: string
    status?: string
    sort?: string
  }): Promise<ApiResponse<Student>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.search) queryParams.set('search', params.search)
      if (params?.status) queryParams.set('status', params.status)
      if (params?.sort) queryParams.set('sort', params.sort)
      
      const response = await authService.apiRequest(`/students?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  }

  static async getStudent(id: number): Promise<Student> {
    await delay(200)
    
    try {
      const response = await authService.apiRequest(`/students/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch student: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  }

  static async createStudent(student: Partial<Student>): Promise<Student> {
    await delay(500)
    
    try {
      const response = await authService.apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(student)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create student')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  static async updateStudent(id: number, updates: Partial<Student>): Promise<Student> {
    await delay(500)
    
    try {
      const response = await authService.apiRequest(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update student')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  static async deleteStudent(id: number): Promise<void> {
    await delay(300)
    
    try {
      const response = await authService.apiRequest(`/students/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  }

  // Staff Management
  static async getStaff(params?: {
    page?: number
    per_page?: number
    search?: string
    department_id?: number
    position?: string
  }): Promise<ApiResponse<Staff>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.search) queryParams.set('search', params.search)
      if (params?.department_id) queryParams.set('department_id', params.department_id.toString())
      if (params?.position) queryParams.set('position', params.position)
      
      const response = await authService.apiRequest(`/staff?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching staff:', error)
      throw error
    }
  }

  // Course Management
  static async getCourses(params?: {
    page?: number
    per_page?: number
    search?: string
    program_id?: number
    is_core?: boolean
  }): Promise<ApiResponse<Course>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.search) queryParams.set('search', params.search)
      if (params?.program_id) queryParams.set('program_id', params.program_id.toString())
      if (params?.is_core !== undefined) queryParams.set('is_core', params.is_core.toString())
      
      const response = await authService.apiRequest(`/courses?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  }

  // Course Section Management
  static async getCourseSections(params?: {
    page?: number
    per_page?: number
    term_id?: number
    instructor_id?: number
    status?: string
  }): Promise<ApiResponse<CourseSection>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.term_id) queryParams.set('term_id', params.term_id.toString())
      if (params?.instructor_id) queryParams.set('instructor_id', params.instructor_id.toString())
      if (params?.status) queryParams.set('status', params.status)
      
      const response = await authService.apiRequest(`/course-sections?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course sections: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching course sections:', error)
      throw error
    }
  }

  // Enrollment Management
  static async getEnrollments(params?: {
    page?: number
    per_page?: number
    student_id?: number
    course_section_id?: number
    status?: string
    term_id?: number
  }): Promise<ApiResponse<Enrollment>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.student_id) queryParams.set('student_id', params.student_id.toString())
      if (params?.course_section_id) queryParams.set('course_section_id', params.course_section_id.toString())
      if (params?.status) queryParams.set('status', params.status)
      if (params?.term_id) queryParams.set('term_id', params.term_id.toString())
      
      const response = await authService.apiRequest(`/enrollments?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enrollments: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      throw error
    }
  }

  static async createEnrollment(enrollment: {
    student_id: number
    course_section_id: number
    enrollment_date: string
  }): Promise<Enrollment> {
    await delay(500)
    
    try {
      const response = await authService.apiRequest('/enrollments', {
        method: 'POST',
        body: JSON.stringify(enrollment)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create enrollment')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating enrollment:', error)
      throw error
    }
  }

  static async withdrawEnrollment(id: number): Promise<Enrollment> {
    await delay(400)
    
    try {
      const response = await authService.apiRequest(`/enrollments/${id}/withdraw`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to withdraw from enrollment')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error withdrawing enrollment:', error)
      throw error
    }
  }

  // Admission Applications
  static async getAdmissionApplications(params?: {
    page?: number
    per_page?: number
    status?: string
    term_id?: number
    student_id?: number
  }): Promise<ApiResponse<AdmissionApplication>> {
    await delay(300)
    
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.set('page', params.page.toString())
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString())
      if (params?.status) queryParams.set('status', params.status)
      if (params?.term_id) queryParams.set('term_id', params.term_id.toString())
      if (params?.student_id) queryParams.set('student_id', params.student_id.toString())
      
      const response = await authService.apiRequest(`/admission-applications?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admission applications: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching admission applications:', error)
      throw error
    }
  }

  // Academic Structure
  static async getFaculties(): Promise<ApiResponse<Faculty>> {
    await delay(200)
    
    try {
      const response = await authService.apiRequest('/faculties')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch faculties: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching faculties:', error)
      throw error
    }
  }

  static async getDepartments(facultyId?: number): Promise<ApiResponse<Department>> {
    await delay(200)
    
    try {
      const queryParams = facultyId ? `?faculty_id=${facultyId}` : ''
      const response = await authService.apiRequest(`/departments${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
  }

  static async getPrograms(departmentId?: number): Promise<ApiResponse<Program>> {
    await delay(200)
    
    try {
      const queryParams = departmentId ? `?department_id=${departmentId}` : ''
      const response = await authService.apiRequest(`/programs${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch programs: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching programs:', error)
      throw error
    }
  }

  // System Analytics
  static async getSystemStats(): Promise<{
    students: number
    staff: number
    courses: number
    enrollments: number
    applications: number
    faculties: number
    departments: number
    programs: number
  }> {
    await delay(400)
    
    try {
      // Use data viewer for public stats
      const [studentsRes, staffRes, coursesRes, enrollmentsRes, applicationsRes, facultiesRes, departmentsRes, programsRes] = await Promise.all([
        fetch(`${DATA_VIEWER_URL}/students`),
        fetch(`${DATA_VIEWER_URL}/staff`),
        fetch(`${DATA_VIEWER_URL}/courses`),
        fetch(`${DATA_VIEWER_URL}/enrollments`),
        fetch(`${DATA_VIEWER_URL}/admission_applications`),
        fetch(`${DATA_VIEWER_URL}/faculties`),
        fetch(`${DATA_VIEWER_URL}/departments`),
        fetch(`${DATA_VIEWER_URL}/programs`)
      ])

      const [students, staff, courses, enrollments, applications, faculties, departments, programs] = await Promise.all([
        studentsRes.json(),
        staffRes.json(),
        coursesRes.json(),
        enrollmentsRes.json(),
        applicationsRes.json(),
        facultiesRes.json(),
        departmentsRes.json(),
        programsRes.json()
      ])

      return {
        students: students.stats.total_records,
        staff: staff.stats.total_records,
        courses: courses.stats.total_records,
        enrollments: enrollments.stats.total_records,
        applications: applications.stats.total_records,
        faculties: faculties.stats.total_records,
        departments: departments.stats.total_records,
        programs: programs.stats.total_records
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
      return {
        students: 0,
        staff: 0,
        courses: 0,
        enrollments: 0,
        applications: 0,
        faculties: 0,
        departments: 0,
        programs: 0
      }
    }
  }
}

export default UniversityAPI