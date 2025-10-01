import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Call Laravel backend to authenticate
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
        device_name: 'University Frontend'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract token and user (handle different response formats)
    const token = data.token || data.access_token || data.data?.token
    const user = data.user || data.data?.user

    if (!token || !user) {
      return NextResponse.json(
        { message: 'Invalid response from authentication server' },
        { status: 500 }
      )
    }

    // Create response with user data
    const res = NextResponse.json({
      token,
      user
    })

    // Set auth token in HTTP-only cookie for middleware
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return res
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
