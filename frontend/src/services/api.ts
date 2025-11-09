import axios, { AxiosResponse } from 'axios'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
const API_VERSION = 'v1'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Generic API response type
interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Student interfaces
interface Student {
  id: number
  user_id: number
  student_number: string
  first_name: string
  last_name: string
  preferred_name?: string
  pronouns?: string
  date_of_birth: string
  gender: string
  nationality: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  gpa?: number
  semester_gpa?: number
  class_standing?: string
  enrollment_status?: string
  academic_status?: string
  major_program_id?: number
  minor_program_id?: number
  admission_date?: string
  expected_graduation_date?: string
  total_credits_earned?: number
  credits_in_progress?: number
  financial_hold?: boolean
  receives_financial_aid?: boolean
  high_school?: string
  high_school_graduation_year?: number
  sat_score?: number
  act_score?: number
  parent_guardian_name?: string
  parent_guardian_phone?: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  major_program?: {
    id: number
    name: string
    code: string
  }
  minor_program?: {
    id: number
    name: string
    code: string
  }
}

interface Course {
  id: number
  code: string
  name: string
  description?: string
  credits: number
  department_id: number
  created_at: string
  updated_at: string
  department?: {
    id: number
    name: string
    code: string
  }
}

interface CourseSection {
  id: number
  course_id: number
  section_number: string
  term_id: number
  instructor_id?: number
  room_id?: number
  schedule?: string
  capacity: number
  enrolled_count: number
  status: string
  created_at: string
  updated_at: string
  course?: Course
  instructor?: {
    id: number
    first_name: string
    last_name: string
  }
  room?: {
    id: number
    number: string
    building?: {
      name: string
    }
  }
}

interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  status: string
  enrollment_date: string
  grade?: string
  grade_points?: number
  created_at: string
  updated_at: string
  student?: Student
  course_section?: CourseSection
}

// API service class
class ApiService {
  // Students
  async getStudents(params?: {
    page?: number
    per_page?: number
    search?: string
    class_standing?: string
    academic_status?: string
    program_id?: number
  }): Promise<ApiResponse<Student[]>> {
    const response: AxiosResponse<ApiResponse<Student[]>> = await apiClient.get('/students', { params })
    return response.data
  }

  async getStudent(id: number): Promise<Student> {
    const response: AxiosResponse<{ data: Student }> = await apiClient.get(`/students/${id}`)
    return response.data.data
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    const response: AxiosResponse<{ data: Student }> = await apiClient.post('/students', data)
    return response.data.data
  }

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const response: AxiosResponse<{ data: Student }> = await apiClient.put(`/students/${id}`, data)
    return response.data.data
  }

  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`)
  }

  // Courses
  async getCourses(params?: {
    page?: number
    per_page?: number
    search?: string
    department_id?: number
  }): Promise<ApiResponse<Course[]>> {
    const response: AxiosResponse<ApiResponse<Course[]>> = await apiClient.get('/courses', { params })
    return response.data
  }

  async getCourse(id: number): Promise<Course> {
    const response: AxiosResponse<{ data: Course }> = await apiClient.get(`/courses/${id}`)
    return response.data.data
  }

  // Course Sections
  async getCourseSections(params?: {
    page?: number
    per_page?: number
    course_id?: number
    term_id?: number
    instructor_id?: number
  }): Promise<ApiResponse<CourseSection[]>> {
    const response: AxiosResponse<ApiResponse<CourseSection[]>> = await apiClient.get('/course-sections', { params })
    return response.data
  }

  async getCourseSection(id: number): Promise<CourseSection> {
    const response: AxiosResponse<{ data: CourseSection }> = await apiClient.get(`/course-sections/${id}`)
    return response.data.data
  }

  // Enrollments
  async getEnrollments(params?: {
    page?: number
    per_page?: number
    student_id?: number
    course_section_id?: number
    status?: string
  }): Promise<ApiResponse<Enrollment[]>> {
    const response: AxiosResponse<ApiResponse<Enrollment[]>> = await apiClient.get('/enrollments', { params })
    return response.data
  }

  async createEnrollment(data: {
    student_id: number
    course_section_id: number
  }): Promise<Enrollment> {
    const response: AxiosResponse<{ data: Enrollment }> = await apiClient.post('/enrollments', data)
    return response.data.data
  }

  async updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment> {
    const response: AxiosResponse<{ data: Enrollment }> = await apiClient.put(`/enrollments/${id}`, data)
    return response.data.data
  }

  // Programs
  async getPrograms(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get('/programs')
    return response.data
  }

  // Departments
  async getDepartments(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get('/departments')
    return response.data
  }

  // Staff
  async getStaff(params?: {
    page?: number
    per_page?: number
    search?: string
    department_id?: number
  }): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get('/staff', { params })
    return response.data
  }

  // Analytics endpoints (custom)
  async getStudentAnalytics(): Promise<{
    total_students: number
    by_class_standing: Record<string, number>
    by_academic_status: Record<string, number>
    by_enrollment_status: Record<string, number>
    average_gpa: number
    financial_aid_recipients: number
  }> {
    const response = await apiClient.get('/analytics/students')
    return response.data
  }

  async getCourseAnalytics(): Promise<{
    total_courses: number
    total_sections: number
    enrollment_statistics: any[]
  }> {
    const response = await apiClient.get('/analytics/courses')
    return response.data
  }

  // Announcements (using placeholder endpoints - would need to be implemented in backend)
  async getAnnouncements(params?: {
    page?: number
    per_page?: number
    category?: string
    audience?: string
    search?: string
  }): Promise<ApiResponse<any[]>> {
    // For now, return mock data since announcements API doesn't exist yet
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              title: "Fall 2024 Final Exam Schedule Released",
              content: "The final examination schedule for Fall 2024 semester has been posted...",
              author: "Academic Affairs Office",
              category: "academic",
              priority: "high",
              audience: "students",
              isPinned: true,
              isPublished: true,
              publishedAt: "2024-12-10T09:00:00Z",
              readBy: 847,
              totalAudience: 2847
            }
          ],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1
          }
        })
      }, 500)
    })
  }

  async createAnnouncement(data: any): Promise<any> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { ...data, id: Date.now() } })
      }, 500)
    })
  }

  // Attendance (using placeholder endpoints)
  async getAttendanceRecords(params?: {
    course_id?: number
    student_id?: number
    date?: string
  }): Promise<ApiResponse<any[]>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 }
        })
      }, 500)
    })
  }

  // Assignments (using placeholder endpoints)
  async getAssignments(params?: {
    course_id?: number
    instructor_id?: number
    status?: string
  }): Promise<ApiResponse<any[]>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 }
        })
      }, 500)
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health')
    return response.data
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService

// Export types for use in components
export type { Student, Course, CourseSection, Enrollment, ApiResponse }