import { ReactNode } from 'react'
import { useAuth, useRole } from '@/contexts/auth-context'

// Re-export from the main auth context
// This file exists for backward compatibility with existing imports
export { AuthProvider, useAuth, usePermission, useRole } from '@/contexts/auth-context'

// Higher-order component for protecting routes
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
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
  // Check roles using the hook properly
  const hasAnyRole = roles.some(role => useRole(role))
  const hasAllRoles = roles.every(role => useRole(role))

  const hasAccess = requireAll ? hasAllRoles : hasAnyRole

  return hasAccess ? <>{children}</> : <>{fallback}</>
}