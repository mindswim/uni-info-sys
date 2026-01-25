import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

// Development mode flags
const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'
const ENABLE_LOGGING = process.env.NEXT_PUBLIC_API_LOGGING === 'true' || process.env.NODE_ENV === 'development'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for Sanctum
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Sanctum CSRF protection
export const sanctumClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (ENABLE_LOGGING) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }

    // Development mode bypass
    if (DEV_BYPASS_AUTH) {
      console.log('🔓 DEV MODE: Auth bypassed for', config.url)
      return config
    }

    // Add auth token if available (using sessionStorage - clears on restart)
    const token = sessionStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (ENABLE_LOGGING) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Log error
    if (ENABLE_LOGGING) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
    }

    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      console.warn('🔒 Authentication expired or invalid')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token_expiry')

      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 100)
      }
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - insufficient permissions')
    } else if (error.response?.status === 422) {
      console.warn('⚠️ Validation Error:', error.response.data)
    } else if (error.response?.status === 429) {
      console.warn('⏰ Rate Limited - too many requests')
    } else if (error.response?.status && error.response.status >= 500) {
      console.error('🔥 Server Error:', error.response.status)
    }

    return Promise.reject(error)
  }
)

// Generic API methods
export class ApiClient {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get(url, config)
    return response.data
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post(url, data, config)
    return response.data
  }

  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put(url, data, config)
    return response.data
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete(url, config)
    return response.data
  }

  // Sanctum CSRF cookie
  static async getCsrfCookie(): Promise<void> {
    await sanctumClient.get('/sanctum/csrf-cookie')
  }

  // Authentication methods
  static async login(email: string, password: string): Promise<any> {
    await this.getCsrfCookie()
    const response = await sanctumClient.post('/login', { email, password })

    // Store auth token if using token-based auth (sessionStorage clears on restart)
    if (response.data.token) {
      sessionStorage.setItem('auth_token', response.data.token)
      sessionStorage.setItem('auth_user', JSON.stringify(response.data.user))
    }

    return response.data
  }

  static async logout(): Promise<void> {
    await apiClient.post('/logout')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token_expiry')
  }

  static async getUser(): Promise<any> {
    return await this.get('/user')
  }
}

// Course-specific API methods
export class CourseAPI {
  // Get all course sections with filters
  static async getCourseSections(params?: {
    department?: string
    level?: string
    term_id?: number
    search?: string
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.department) queryParams.append('department', params.department)
    if (params?.level) queryParams.append('level', params.level)
    if (params?.term_id) queryParams.append('term_id', params.term_id.toString())
    if (params?.search) queryParams.append('search', params.search)

    const url = `/course-sections${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get single course section with enrollment info
  static async getCourseSection(id: number): Promise<any> {
    return await ApiClient.get(`/course-sections/${id}`)
  }

  // Enroll in a course section
  static async enrollInSection(sectionId: number): Promise<any> {
    return await ApiClient.post(`/course-sections/${sectionId}/enroll`)
  }

  // Drop from a course section  
  static async dropFromSection(sectionId: number): Promise<any> {
    return await ApiClient.delete(`/course-sections/${sectionId}/enroll`)
  }

  // Join waitlist for a course section
  static async joinWaitlist(sectionId: number): Promise<any> {
    return await ApiClient.post(`/course-sections/${sectionId}/waitlist`)
  }

  // Get student's enrollments
  static async getStudentEnrollments(studentId?: number): Promise<any> {
    const url = studentId ? `/enrollments?student_id=${studentId}` : '/enrollments/me'
    return await ApiClient.get(url)
  }

  // Get course prerequisites
  static async getCoursePrerequisites(courseId: number): Promise<any> {
    return await ApiClient.get(`/courses/${courseId}/prerequisites`)
  }
}

// Student-specific API methods
export class StudentAPI {
  // Get student profile
  static async getProfile(): Promise<any> {
    return await ApiClient.get('/students/me')
  }

  // Get student's academic records
  static async getAcademicRecords(): Promise<any> {
    return await ApiClient.get('/students/me/academic-records')
  }

  // Get student's enrollments for current term
  static async getCurrentEnrollments(): Promise<any> {
    return await ApiClient.get('/enrollments/me')
  }

  // Get student's transcript
  static async getTranscript(): Promise<any> {
    return await ApiClient.get('/students/me/transcript')
  }
}

// Admission-specific API methods
export class AdmissionAPI {
  // Submit new application
  static async submitApplication(data: {
    term_id: number
    program_choices: Array<{ program_id: number; preference_order: number }>
  }): Promise<any> {
    return await ApiClient.post('/admission-applications', data)
  }

  // Get application status
  static async getApplicationStatus(applicationId: number): Promise<any> {
    return await ApiClient.get(`/admission-applications/${applicationId}`)
  }

  // Upload document
  static async uploadDocument(applicationId: number, file: File, documentType: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)
    
    return await ApiClient.post(`/admission-applications/${applicationId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Messaging API methods
export class MessageAPI {
  // Get all conversations for current user
  static async getConversations(): Promise<any> {
    return await ApiClient.get('/messages/conversations')
  }

  // Get a specific conversation with messages
  static async getConversation(conversationId: number, params?: { per_page?: number }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/messages/conversations/${conversationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Start a new conversation with initial message
  static async startConversation(data: {
    recipient_id?: number
    course_section_id?: number
    subject?: string
    message: string
  }): Promise<any> {
    return await ApiClient.post('/messages/conversations', data)
  }

  // Send a message in a conversation
  static async sendMessage(conversationId: number, data: {
    body: string
    reply_to_id?: number
  }): Promise<any> {
    return await ApiClient.post(`/messages/conversations/${conversationId}/messages`, data)
  }

  // Mark conversation as read
  static async markAsRead(conversationId: number): Promise<any> {
    return await ApiClient.put(`/messages/conversations/${conversationId}/read`)
  }

  // Get unread message count
  static async getUnreadCount(): Promise<any> {
    return await ApiClient.get('/messages/unread-count')
  }

  // Archive a conversation
  static async archiveConversation(conversationId: number): Promise<any> {
    return await ApiClient.post(`/messages/conversations/${conversationId}/archive`)
  }

  // Search for users to message
  static async searchUsers(query: string): Promise<any> {
    return await ApiClient.get(`/messages/search-users?query=${encodeURIComponent(query)}`)
  }
}

// System/Admin API methods
export class SystemAPI {
  // Health check
  static async healthCheck(): Promise<any> {
    return await ApiClient.get('/health')
  }

  // Get system metrics
  static async getMetrics(): Promise<any> {
    return await ApiClient.get('/metrics')
  }

  // Get all users (admin only)
  static async getUsers(params?: { role?: string; page?: number }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.role) queryParams.append('role', params.role)
    if (params?.page) queryParams.append('page', params.page.toString())

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Create new user (admin only)
  static async createUser(userData: any): Promise<any> {
    return await ApiClient.post('/users', userData)
  }
}

export default ApiClient