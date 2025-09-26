"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

export default function TranscriptsPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to the appropriate transcript page based on user
    if (user?.student_id) {
      router.replace(`/students/${user.student_id}/transcript`)
    } else {
      // Default to student 1 for demo purposes
      router.replace('/students/1/transcript')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Loading Transcript...</h2>
        <p className="text-muted-foreground">Redirecting to your transcript page</p>
      </div>
    </div>
  )
}