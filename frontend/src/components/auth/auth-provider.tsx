"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import authService, { type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register']

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    initializeAuth()
  }, [])

  useEffect(() => {
    // Handle route protection
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname)
      const isAuthenticated = authService.isAuthenticated()

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth/login')
      } else if (isAuthenticated && pathname === '/auth/login') {
        router.push('/')
      }
    }
  }, [isLoading, pathname, router])

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Verify token is still valid by fetching current user
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      // Token is invalid, clear auth state
      console.warn('Auth initialization failed:', error)
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({
        email,
        password,
        device_name: "University Demo"
      })
      setUser(response.user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout locally even if API call fails
      setUser(null)
      router.push('/auth/login')
    }
  }

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasAnyRole
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // AuthProvider will redirect to login
    }

    return <Component {...props} />
  }
}

// Component for role-based content rendering
interface RoleGuardProps {
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean
}

export function RoleGuard({ roles, children, fallback = null, requireAll = false }: RoleGuardProps) {
  const { hasRole, hasAnyRole } = useAuth()

  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}