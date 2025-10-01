import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

// Define admin-only routes
const adminRoutes = ['/admin', '/users', '/settings', '/system']

// Define student-only routes
const studentRoutes = ['/enrollment', '/my-courses', '/academic-records']

// Define faculty-only routes
const facultyRoutes = ['/grades', '/attendance', '/course-management']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '')

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    // Not authenticated - redirect to login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // TODO: In production, verify token with backend and check roles
  // For now, we'll allow all authenticated requests through
  // Role-based checks will be handled on the client side

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
