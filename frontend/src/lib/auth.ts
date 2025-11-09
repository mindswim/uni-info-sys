// Authentication service for Laravel Sanctum integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1'

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  student_id?: number
  staff_id?: number
}

export interface LoginCredentials {
  email: string
  password: string
  device_name: string
}

export interface AuthResponse {
  token: string
  user: User
}

class AuthService {
  private token: string | null = null
  private user: User | null = null

  constructor() {
    // Initialize from localStorage on client-side
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('auth_token')
      const userData = localStorage.getItem('auth_user')
      this.user = userData ? JSON.parse(userData) : null
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data: AuthResponse = await response.json()
      
      // Store token and user data
      this.token = data.token
      this.user = data.user
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    if (!this.token) {
      throw new Error('No active session')
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
        },
      })
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error)
    }

    // Clear local storage
    this.token = null
    this.user = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No active session')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const user: User = await response.json()
      
      // Update cached user data
      this.user = user
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

      return user
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }

  getToken(): string | null {
    return this.token
  }

  getUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  hasRole(role: string): boolean {
    return this.user?.roles.includes(role) || false
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  }

  // Create authenticated API request helper with automatic token validation
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('No authentication token available')
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle token expiry
    if (response.status === 401 || response.status === 419) {
      // Token is invalid/expired, clear auth state
      this.token = null
      this.user = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        // Redirect to login if we're not already there
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login'
        }
      }
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }

  // Session validation
  async validateSession(): Promise<boolean> {
    if (!this.token) return false
    
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      console.warn('Session validation failed:', error)
      return false
    }
  }
}

export const authService = new AuthService()
export default authService