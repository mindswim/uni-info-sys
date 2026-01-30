import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, password_confirmation } = await request.json()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, password, password_confirmation })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Registration failed', errors: error.errors },
        { status: response.status }
      )
    }

    const data = await response.json()

    const token = data.token
    const user = data.user

    if (!token || !user) {
      return NextResponse.json(
        { message: 'Invalid response from server' },
        { status: 500 }
      )
    }

    const res = NextResponse.json({ token, user })

    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    })

    return res
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
