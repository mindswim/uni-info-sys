// Centralized API configuration
// This file manages all API endpoints and base URLs

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1'
const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

// Remove /api/v1 if it exists in the base URL to get the host
const getApiHost = () => {
  if (API_BASE.includes('/api/v1')) {
    return API_BASE.replace('/api/v1', '')
  }
  return API_HOST
}

export const API_CONFIG = {
  // Base URLs
  BASE_URL: API_BASE,
  HOST: getApiHost(),

  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE}/tokens/create`,
    LOGOUT: `${API_BASE}/auth/logout`,
    USER: `${API_BASE}/auth/user`,
  },

  // Data viewer endpoints
  DATA_VIEWER: (table: string) => `${getApiHost()}/api/data-viewer/${table}`,

  // V1 API endpoints
  V1: {
    // Core entities
    STUDENTS: `${API_BASE}/students`,
    STAFF: `${API_BASE}/staff`,
    USERS: `${API_BASE}/users`,

    // Academic structure
    FACULTIES: `${API_BASE}/faculties`,
    DEPARTMENTS: `${API_BASE}/departments`,
    PROGRAMS: `${API_BASE}/programs`,
    COURSES: `${API_BASE}/courses`,
    COURSE_SECTIONS: `${API_BASE}/course-sections`,

    // Admissions
    ADMISSION_APPLICATIONS: `${API_BASE}/admission-applications`,
    PROGRAM_CHOICES: `${API_BASE}/program-choices`,
    ACADEMIC_RECORDS: `${API_BASE}/academic-records`,
    DOCUMENTS: `${API_BASE}/documents`,

    // Enrollment
    ENROLLMENTS: `${API_BASE}/enrollments`,

    // Infrastructure
    BUILDINGS: `${API_BASE}/buildings`,
    ROOMS: `${API_BASE}/rooms`,
    TERMS: `${API_BASE}/terms`,
  },
}

// Helper function to create authenticated headers
export const getAuthHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const authToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null)

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  return headers
}

// Helper function for API requests with error handling
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok && response.status === 401) {
    // Token expired or invalid
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // Don't redirect if we're already on login page
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
  }

  return response
}

export default API_CONFIG