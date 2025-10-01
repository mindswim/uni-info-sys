import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // Call Laravel backend logout if we have a token
  if (token) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      await fetch(`${apiUrl}/api/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
    } catch (error) {
      console.error('Backend logout error:', error)
      // Continue with local logout even if backend fails
    }
  }

  // Create response
  const res = NextResponse.json({ success: true })

  // Clear the auth cookie
  res.cookies.delete('auth_token')

  return res
}
