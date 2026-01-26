import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

/**
 * Get the auth token from sessionStorage.
 * Use this function instead of directly accessing storage to ensure consistency.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('auth_token')
}

/**
 * Get standard auth headers for fetch requests.
 * Use this when you need to make direct fetch() calls instead of using ApiClient.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

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

  // Get all applications (admin)
  static async getApplications(params?: {
    status?: string
    term_id?: number
    search?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.term_id) queryParams.append('term_id', params.term_id.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/admission-applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get applications stats
  static async getStats(): Promise<any> {
    return await ApiClient.get('/admission-applications/stats')
  }

  // Accept application
  static async accept(applicationId: number, data?: { notes?: string }): Promise<any> {
    return await ApiClient.post(`/admission-applications/${applicationId}/accept`, data)
  }

  // Reject application
  static async reject(applicationId: number, data?: { notes?: string; reason?: string }): Promise<any> {
    return await ApiClient.post(`/admission-applications/${applicationId}/reject`, data)
  }

  // Waitlist application
  static async waitlist(applicationId: number, data?: { notes?: string }): Promise<any> {
    return await ApiClient.post(`/admission-applications/${applicationId}/waitlist`, data)
  }

  // Bulk actions
  static async bulkAction(data: {
    action: 'accept' | 'reject' | 'waitlist'
    application_ids: number[]
    notes?: string
  }): Promise<any> {
    return await ApiClient.post('/admission-applications/bulk-actions', data)
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

// Holds API methods
export class HoldsAPI {
  // Get holds summary for current student
  static async getSummary(): Promise<any> {
    return await ApiClient.get('/holds/summary')
  }

  // Get all holds (admin) or for a student
  static async getHolds(params?: {
    student_id?: number
    type?: string
    severity?: string
    status?: 'active' | 'resolved'
    search?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/holds${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get a single hold
  static async getHold(holdId: number): Promise<any> {
    return await ApiClient.get(`/holds/${holdId}`)
  }

  // Create a new hold (admin only)
  static async createHold(data: {
    student_id: number
    type: string
    reason: string
    description?: string
    severity?: string
    prevents_registration?: boolean
    prevents_transcript?: boolean
    prevents_graduation?: boolean
    department?: string
  }): Promise<any> {
    return await ApiClient.post('/holds', data)
  }

  // Update a hold
  static async updateHold(holdId: number, data: Partial<{
    type: string
    reason: string
    description: string
    severity: string
    prevents_registration: boolean
    prevents_transcript: boolean
    prevents_graduation: boolean
  }>): Promise<any> {
    return await ApiClient.put(`/holds/${holdId}`, data)
  }

  // Resolve a hold (admin only)
  static async resolveHold(holdId: number, notes?: string): Promise<any> {
    return await ApiClient.post(`/holds/${holdId}/resolve`, { resolution_notes: notes })
  }

  // Delete a hold
  static async deleteHold(holdId: number): Promise<any> {
    return await ApiClient.delete(`/holds/${holdId}`)
  }
}

// Action Items / To-Do API methods
export class ActionItemsAPI {
  // Get dashboard summary for current student
  static async getDashboard(): Promise<any> {
    return await ApiClient.get('/action-items/dashboard')
  }

  // Get all action items
  static async getItems(params?: {
    student_id?: number
    status?: string
    type?: string
    overdue?: boolean
    due_within_days?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.overdue) queryParams.append('overdue', 'true')
    if (params?.due_within_days) queryParams.append('due_within_days', params.due_within_days.toString())
    const url = `/action-items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Mark action item as complete
  static async complete(itemId: number): Promise<any> {
    return await ApiClient.post(`/action-items/${itemId}/complete`)
  }

  // Dismiss action item
  static async dismiss(itemId: number): Promise<any> {
    return await ApiClient.post(`/action-items/${itemId}/dismiss`)
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

// Enrollment/Waitlist API methods
export class EnrollmentAPI {
  // Get all enrollments with filters
  static async getEnrollments(params?: {
    student_id?: number
    course_section_id?: number
    status?: string
    term_id?: number
    search?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.course_section_id) queryParams.append('course_section_id', params.course_section_id.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.term_id) queryParams.append('term_id', params.term_id.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/enrollments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get waitlisted enrollments
  static async getWaitlist(params?: {
    course_section_id?: number
    search?: string
  }): Promise<any> {
    return this.getEnrollments({ ...params, status: 'waitlisted' })
  }

  // Promote from waitlist (enroll the student)
  static async promoteFromWaitlist(enrollmentId: number): Promise<any> {
    return await ApiClient.put(`/enrollments/${enrollmentId}`, { status: 'enrolled' })
  }

  // Withdraw/remove from waitlist
  static async withdraw(enrollmentId: number): Promise<any> {
    return await ApiClient.post(`/enrollments/${enrollmentId}/withdraw`)
  }

  // Delete enrollment
  static async deleteEnrollment(enrollmentId: number): Promise<any> {
    return await ApiClient.delete(`/enrollments/${enrollmentId}`)
  }
}

// Invoice/Billing API methods
export class BillingAPI {
  // Get all invoices
  static async getInvoices(params?: {
    student_id?: number
    status?: string
    term_id?: number
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.term_id) queryParams.append('term_id', params.term_id.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get student billing summary
  static async getStudentSummary(): Promise<any> {
    return await ApiClient.get('/invoices/student-summary')
  }

  // Get single invoice
  static async getInvoice(invoiceId: number): Promise<any> {
    return await ApiClient.get(`/invoices/${invoiceId}`)
  }

  // Get student's invoice summary (for payment page)
  static async getStudentSummary(): Promise<any> {
    return await ApiClient.get('/invoices/student-summary')
  }

  // Create invoice
  static async createInvoice(data: {
    student_id: number
    term_id: number
    due_date: string
    items?: Array<{ description: string; amount: number; type?: string }>
  }): Promise<any> {
    return await ApiClient.post('/invoices', data)
  }

  // Add discount to invoice
  static async addDiscount(invoiceId: number, data: {
    description: string
    amount: number
  }): Promise<any> {
    return await ApiClient.post(`/invoices/${invoiceId}/discount`, data)
  }

  // Get all payments
  static async getPayments(params?: {
    invoice_id?: number
    student_id?: number
    page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.invoice_id) queryParams.append('invoice_id', params.invoice_id.toString())
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    const url = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Create payment
  static async createPayment(data: {
    invoice_id: number
    amount: number
    payment_method: string
    reference_number?: string
  }): Promise<any> {
    return await ApiClient.post('/payments', data)
  }

  // Refund payment
  static async refundPayment(paymentId: number, data?: {
    amount?: number
    reason?: string
  }): Promise<any> {
    return await ApiClient.post(`/payments/${paymentId}/refund`, data)
  }
}

// Financial Aid API methods
export class FinancialAidAPI {
  // Get current student's financial aid package
  static async getMyPackage(): Promise<any> {
    return await ApiClient.get('/financial-aid/me')
  }

  // Get all financial aid packages (admin)
  static async getPackages(params?: {
    student_id?: number
    term_id?: number
    status?: string
    search?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.term_id) queryParams.append('term_id', params.term_id.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/financial-aid${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get a student's financial aid packages
  static async getStudentPackages(studentId: number): Promise<any> {
    return await ApiClient.get(`/students/${studentId}/financial-aid`)
  }

  // Get financial aid stats
  static async getStats(): Promise<any> {
    return await ApiClient.get('/financial-aid/stats')
  }

  // Get available scholarships
  static async getScholarships(): Promise<any> {
    return await ApiClient.get('/financial-aid/scholarships')
  }

  // Get scholarship details
  static async getScholarship(scholarshipId: number): Promise<any> {
    return await ApiClient.get(`/financial-aid/scholarships/${scholarshipId}`)
  }
}

// Settings API methods
export class SettingsAPI {
  // Get current user's settings
  static async getMySettings(): Promise<any> {
    return await ApiClient.get('/settings/me')
  }

  // Update current user's settings
  static async updateMySettings(data: {
    email_grades?: boolean
    email_courses?: boolean
    email_announcements?: boolean
    push_notifications?: boolean
    sms_alerts?: boolean
    theme?: 'light' | 'dark' | 'system'
    compact_mode?: boolean
    animations?: boolean
    language?: string
    timezone?: string
  }): Promise<any> {
    return await ApiClient.patch('/settings/me', data)
  }

  // Update notification preferences
  static async updateNotifications(data: {
    email_grades?: boolean
    email_courses?: boolean
    email_announcements?: boolean
    push_notifications?: boolean
    sms_alerts?: boolean
  }): Promise<any> {
    return await ApiClient.patch('/settings/me/notifications', data)
  }

  // Update appearance preferences
  static async updateAppearance(data: {
    theme?: 'light' | 'dark' | 'system'
    compact_mode?: boolean
    animations?: boolean
  }): Promise<any> {
    return await ApiClient.patch('/settings/me/appearance', data)
  }

  // Get all system settings (admin)
  static async getSystemSettings(): Promise<any> {
    return await ApiClient.get('/settings/system')
  }

  // Get system info (admin)
  static async getSystemInfo(): Promise<any> {
    return await ApiClient.get('/settings/system/info')
  }

  // Get settings for a specific group (admin)
  static async getSettingsGroup(group: 'registration' | 'notifications' | 'academic' | 'system'): Promise<any> {
    return await ApiClient.get(`/settings/system/${group}`)
  }

  // Update settings for a group (admin)
  static async updateSettingsGroup(group: 'registration' | 'notifications' | 'academic' | 'system', data: Record<string, any>): Promise<any> {
    return await ApiClient.patch(`/settings/system/${group}`, data)
  }

  // Clear system cache (admin)
  static async clearCache(): Promise<any> {
    return await ApiClient.post('/settings/system/cache/clear')
  }

  // Toggle maintenance mode (admin)
  static async toggleMaintenance(enable: boolean): Promise<any> {
    return await ApiClient.post('/settings/system/maintenance', { enable })
  }
}

// Appointment API methods
export class AppointmentAPI {
  // Get current student's appointments
  static async getMyAppointments(params?: { upcoming?: boolean }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.upcoming) queryParams.append('upcoming', 'true')
    const url = `/appointments/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get current student's advisor info
  static async getMyAdvisor(): Promise<any> {
    return await ApiClient.get('/students/me/advisor')
  }

  // Get current staff's advisees
  static async getMyAdvisees(): Promise<any> {
    return await ApiClient.get('/staff/me/advisees')
  }

  // Get current staff's appointments
  static async getAdvisorAppointments(params?: { upcoming?: boolean }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.upcoming) queryParams.append('upcoming', 'true')
    const url = `/staff/me/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get all appointments (admin)
  static async getAppointments(params?: {
    student_id?: number
    advisor_id?: number
    status?: string
    type?: string
    upcoming?: boolean
    from_date?: string
    to_date?: string
    page?: number
    per_page?: number
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString())
    if (params?.advisor_id) queryParams.append('advisor_id', params.advisor_id.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.upcoming) queryParams.append('upcoming', 'true')
    if (params?.from_date) queryParams.append('from_date', params.from_date)
    if (params?.to_date) queryParams.append('to_date', params.to_date)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    const url = `/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await ApiClient.get(url)
  }

  // Get a specific appointment
  static async getAppointment(appointmentId: number): Promise<any> {
    return await ApiClient.get(`/appointments/${appointmentId}`)
  }

  // Book a new appointment
  static async bookAppointment(data: {
    advisor_id: number
    scheduled_at: string
    duration_minutes?: number
    type?: string
    location?: string
    meeting_link?: string
    student_notes?: string
  }): Promise<any> {
    return await ApiClient.post('/appointments', data)
  }

  // Update an appointment
  static async updateAppointment(appointmentId: number, data: {
    scheduled_at?: string
    duration_minutes?: number
    type?: string
    status?: string
    location?: string
    meeting_link?: string
    student_notes?: string
    advisor_notes?: string
    meeting_notes?: string
  }): Promise<any> {
    return await ApiClient.patch(`/appointments/${appointmentId}`, data)
  }

  // Cancel an appointment
  static async cancelAppointment(appointmentId: number, reason?: string): Promise<any> {
    return await ApiClient.post(`/appointments/${appointmentId}/cancel`, { reason })
  }

  // Confirm an appointment
  static async confirmAppointment(appointmentId: number): Promise<any> {
    return await ApiClient.post(`/appointments/${appointmentId}/confirm`)
  }

  // Complete an appointment
  static async completeAppointment(appointmentId: number, meetingNotes?: string): Promise<any> {
    return await ApiClient.post(`/appointments/${appointmentId}/complete`, { meeting_notes: meetingNotes })
  }

  // Mark as no show
  static async markNoShow(appointmentId: number): Promise<any> {
    return await ApiClient.post(`/appointments/${appointmentId}/no-show`)
  }

  // Delete an appointment
  static async deleteAppointment(appointmentId: number): Promise<any> {
    return await ApiClient.delete(`/appointments/${appointmentId}`)
  }
}

export default ApiClient