"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RecordsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct academic records page
    router.replace('/academic-records')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to Academic Records</p>
      </div>
    </div>
  )
}