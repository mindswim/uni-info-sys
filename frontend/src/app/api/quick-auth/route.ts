import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Call backend API to get token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    const response = await fetch(`${apiUrl}/api/v1/tokens/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        device_name: 'Quick Login'
      })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Create response with token in cookie
    const res = NextResponse.json({
      success: true,
      user: data.user,
      token: data.token
    })

    // Set auth token in cookie (accessible to middleware)
    res.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return res
  } catch (error) {
    console.error('Quick auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
