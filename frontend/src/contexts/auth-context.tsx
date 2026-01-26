'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Type definitions
export interface Role {
  id: number
  name: string
  permissions: string[]
}

export interface User {
  id: number
  name: string
  email: string
  roles?: Role[]
  permissions?: string[]
  student_id?: number
  staff_id?: number
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

// Helper functions - Using sessionStorage so auth clears on browser/server restart
const storage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
      // Set expiry time (24 hours from now)
      const expiry = new Date().getTime() + (AUTH_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
      sessionStorage.setItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY, expiry.toString())
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null

    const token = sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    const expiry = sessionStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY)

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
      sessionStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null

    const userStr = sessionStorage.getItem(AUTH_CONFIG.USER_KEY)
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      sessionStorage.removeItem(AUTH_CONFIG.USER_KEY)
      sessionStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY)
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
    try {
      const storedToken = storage.getToken()
      const storedUser = storage.getUser()

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      // Clear potentially corrupted data
      storage.clearAuth()
    } finally {
      // Always set loading to false, even if there's an error
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Call our Next.js API route which will set the cookie AND return token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server')
      }

      // Store auth data in sessionStorage for client-side access
      // Cookie is already set by the API route for middleware
      storage.setToken(data.token)

      // Extract all permissions from roles (backend now returns roles with permissions)
      const permissions = new Set<string>()
      data.user.roles?.forEach((role: Role) => {
        role.permissions?.forEach((permission: string) => {
          permissions.add(permission)
        })
      })

      const enrichedUser: User = {
        ...data.user,
        permissions: Array.from(permissions),
      }

      storage.setUser(enrichedUser)
      setToken(data.token)
      setUser(enrichedUser)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    // Call API route to clear cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(err => console.error('Logout API error:', err))

    // Clear session storage
    storage.clearAuth()

    // Clear state
    setToken(null)
    setUser(null)

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  const refreshUser = async () => {
    if (!token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

      // Fetch user data with roles and permissions (backend now includes roles)
      const response = await fetch(`${apiUrl}/api/v1/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()

        // Extract all permissions from roles
        const permissions = new Set<string>()
        userData.roles?.forEach((role: Role) => {
          role.permissions?.forEach((permission: string) => {
            permissions.add(permission)
          })
        })

        const enrichedUser: User = {
          ...userData,
          permissions: Array.from(permissions),
        }

        storage.setUser(enrichedUser)
        setUser(enrichedUser)
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

// Helper hook for checking roles (case-insensitive comparison)
export function useRole(role: string): boolean {
  const { user } = useAuth()

  if (!user || !user.roles) return false

  const normalizedRole = role.toLowerCase()
  return user.roles.some(r => r.name.toLowerCase() === normalizedRole)
}
