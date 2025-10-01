'use client'

import { ComponentType } from 'react'
import { ProtectedRoute } from './protected-route'

interface WithAuthOptions {
  requiredRole?: string
  requiredPermission?: string
  fallbackUrl?: string
}

/**
 * Higher-order component to add authentication protection to pages
 *
 * Usage:
 * export default withAuth(MyPage, { requiredRole: 'admin' })
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Convenience exports for common role requirements
 */
export const withStudentAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'student' })

export const withFacultyAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'faculty' })

export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requiredRole: 'admin' })
