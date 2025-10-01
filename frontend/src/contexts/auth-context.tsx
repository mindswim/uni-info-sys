'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Type definitions
export interface User {
  id: number
  name: string
  email: string
  role?: string
  roles?: Array<{ name: string }>
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth configuration
const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
  TOKEN_EXPIRY_KEY: 'auth_token_expiry',
  TOKEN_EXPIRY_HOURS: 24,
}

// Helper functions
const storage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
      // Set expiry time (24 hours from now)
      const expiry = new Date().getTime() + (AUTH_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
      localStorage.setItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY, expiry.toString())
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    const expiry = localStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY)

    // Check if token is expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry)
      if (new Date().getTime() > expiryTime) {
        // Token expired, clear it
        storage.clearAuth()
        return null
      }
    }

    return token
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY)
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      localStorage.removeItem(AUTH_CONFIG.USER_KEY)
      localStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY)
    }
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = storage.getToken()
    const storedUser = storage.getUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

      const response = await fetch(`${apiUrl}/api/v1/tokens/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, device_name: "University Frontend" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()

      // Laravel Sanctum returns token in different formats
      // Handle both { token: "..." } and { access_token: "..." }
      const authToken = data.token || data.access_token || data.data?.token
      const userData = data.user || data.data?.user

      if (!authToken || !userData) {
        throw new Error('Invalid response from server')
      }

      // Store auth data
      storage.setToken(authToken)
      storage.setUser(userData)

      setToken(authToken)
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    // Clear local storage
    storage.clearAuth()

    // Clear state
    setToken(null)
    setUser(null)

    // Optionally call logout endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    if (token) {
      fetch(`${apiUrl}/api/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).catch(err => console.error('Logout API error:', err))
    }
  }

  const refreshUser = async () => {
    if (!token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

      const response = await fetch(`${apiUrl}/api/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        const user = userData.data || userData
        storage.setUser(user)
        setUser(user)
      } else if (response.status === 401) {
        // Token invalid, logout
        logout()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// Helper hook for checking permissions
export function usePermission(permission: string): boolean {
  const { user } = useAuth()

  if (!user || !user.permissions) return false

  return user.permissions.includes(permission)
}

// Helper hook for checking roles
export function useRole(role: string): boolean {
  const { user } = useAuth()

  if (!user) return false

  // Check direct role property
  if (user.role === role) return true

  // Check roles array
  if (user.roles) {
    return user.roles.some(r => r.name === role)
  }

  return false
}
