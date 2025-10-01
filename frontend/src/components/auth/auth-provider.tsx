import { ReactNode } from 'react'

// Re-export from the main auth context
// This file exists for backward compatibility with existing imports
export { AuthProvider, useAuth, usePermission, useRole } from '@/contexts/auth-context'

// Higher-order component for protecting routes
export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    // Import useAuth inside the component
    const { useAuth } = require('@/contexts/auth-context')
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
  const { useRole } = require('@/contexts/auth-context')
  const hasRole = (role: string) => useRole(role)
  const hasAnyRole = (roles: string[]) => roles.some(role => hasRole(role))

  const hasAccess = requireAll
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}