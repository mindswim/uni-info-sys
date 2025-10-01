'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Quick login page to bypass the stuck auth loading state
export default function QuickLoginPage() {
  const router = useRouter()

  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch('http://localhost/api/v1/tokens/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: 'student@test.com',
            password: 'password123',
            device_name: 'Quick Login'
          })
        })

        const data = await response.json()

        if (data.token && data.user) {
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('auth_user', JSON.stringify(data.user))

          // Redirect based on role
          const role = data.user.roles?.[0] || 'student'
          if (role === 'admin') {
            router.push('/admin')
          } else if (role === 'staff' || role === 'Faculty') {
            router.push('/faculty')
          } else {
            router.push('/student')
          }
        }
      } catch (error) {
        console.error('Quick login failed:', error)
      }
    }

    login()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="text-2xl font-bold">Quick Login</h1>
        <p className="text-muted-foreground">Logging in as student...</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Also available:</p>
          <a href="/quick-login?role=admin" className="text-blue-600 hover:underline block">Login as Admin</a>
          <a href="/quick-login?role=faculty" className="text-blue-600 hover:underline block">Login as Faculty</a>
        </div>
      </div>
    </div>
  )
}
