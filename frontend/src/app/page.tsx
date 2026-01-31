'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.replace('/auth/login')
      return
    }

    const role = user.roles?.[0]?.name?.toLowerCase()
    if (role === 'admin') {
      router.replace('/admin')
    } else if (role === 'staff' || role === 'instructor') {
      router.replace('/faculty')
    } else {
      router.replace('/student')
    }
  }, [isLoading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
