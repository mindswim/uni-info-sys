'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: string
  fallbackUrl?: string
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackUrl = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(fallbackUrl)
      return
    }

    // Check role requirement (case-insensitive)
    if (requiredRole && user) {
      const userRole = user.roles?.[0]?.name?.toLowerCase()
      if (userRole !== requiredRole.toLowerCase()) {
        // Unauthorized - redirect to dashboard
        router.push('/')
        return
      }
    }

    // Check permission requirement
    if (requiredPermission && user) {
      const hasPermission = user.permissions?.includes(requiredPermission)
      if (!hasPermission) {
        // Unauthorized - redirect to dashboard
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requiredPermission, router, fallbackUrl])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Role check failed (case-insensitive)
  if (requiredRole && user) {
    const userRole = user.roles?.[0]?.name?.toLowerCase()
    if (userRole !== requiredRole.toLowerCase()) {
      return null
    }
  }

  // Permission check failed
  if (requiredPermission && user) {
    const hasPermission = user.permissions?.includes(requiredPermission)
    if (!hasPermission) {
      return null
    }
  }

  // Render protected content
  return <>{children}</>
}
