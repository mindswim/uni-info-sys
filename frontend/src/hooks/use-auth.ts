import { useState, useEffect } from 'react'
import { ApiClient } from '@/lib/api-client'

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedUser && storedToken) {
      setState({
        user: JSON.parse(storedUser),
        isLoading: false,
        isAuthenticated: true
      })
    } else {
      // For demo purposes, auto-login as Maria
      const demoUser: User = {
        id: 2,
        name: "Maria Rodriguez",
        email: "maria@demo.com",
        role: "Student"
      }
      
      // Simulate having a token
      localStorage.setItem('user', JSON.stringify(demoUser))
      localStorage.setItem('auth_token', 'demo-token-123')
      
      setState({
        user: demoUser,
        isLoading: false,
        isAuthenticated: true
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // In a real app, this would call ApiClient.login()
      // For now, simulate login
      const user: User = {
        id: 2,
        name: "Maria Rodriguez", 
        email: email,
        role: "Student"
      }

      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('auth_token', 'demo-token-123')

      setState({
        user,
        isLoading: false,
        isAuthenticated: true
      })

      return { success: true, user }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await ApiClient.logout()
    } catch (error) {
      console.warn('Logout API call failed:', error)
    }
    
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  const switchUser = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser))
    setState(prev => ({
      ...prev,
      user: newUser
    }))
  }

  return {
    ...state,
    login,
    logout,
    switchUser
  }
}

// Demo users for easy switching
export const demoUsers: User[] = [
  {
    id: 1,
    name: "Dr. Elizabeth Harper",
    email: "admin@demo.com",
    role: "Administrator"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria@demo.com", 
    role: "Student"
  },
  {
    id: 3,
    name: "David Park",
    email: "david@demo.com",
    role: "Student"
  },
  {
    id: 4,
    name: "Prof. Sarah Kim",
    email: "sarah.kim@demo.com",
    role: "Faculty"
  }
]