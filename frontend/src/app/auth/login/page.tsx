"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Users,
  BookOpen,
  ArrowRight,
  Loader2,
  Info
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const demoPersonas = [
  {
    email: "admin@demo.com",
    password: "password",
    name: "Dr. Elizabeth Harper",
    role: "Administrator",
    icon: UserCheck,
    color: "text-red-600 bg-red-50",
  },
  {
    email: "maria@demo.com",
    password: "password",
    name: "Maria Rodriguez",
    role: "Prospective Student",
    icon: User,
    color: "text-blue-600 bg-blue-50",
  },
  {
    email: "david@demo.com",
    password: "password",
    name: "David Park",
    role: "Current Student",
    icon: BookOpen,
    color: "text-green-600 bg-green-50",
  },
  {
    email: "sophie@demo.com",
    password: "password",
    name: "Sophie Turner",
    role: "Transfer Student",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
  },
]

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const { user, login, isAuthenticated, isLoading: authLoading } = useAuth()

  const getDashboardPath = (u: typeof user) => {
    if (redirectTo) return redirectTo
    const role = u?.roles?.[0]?.name?.toLowerCase()
    if (role === 'admin') return '/admin'
    if (role === 'staff' || role === 'instructor') return '/faculty'
    return '/student'
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.push(getDashboardPath(user))
    }
  }, [isAuthenticated, authLoading, user, router])

  useEffect(() => {
    if (error) {
      setError(null)
    }
  }, [email, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
    } catch (err) {
      console.error('Login failed:', err)
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (persona: typeof demoPersonas[0]) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await login(persona.email, persona.password)
    } catch (err) {
      console.error('Demo login failed:', err)
      setError(err instanceof Error ? err.message : 'Demo login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const registerHref = redirectTo
    ? `/auth/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/auth/register"

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Greenfield University</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">University Admissions System</h1>
          <p className="text-muted-foreground mt-1">
            Manage applications, enrollment, and academic records
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Apply / Register */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">New to the university?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Start your application to Greenfield University. Browse available programs,
                submit your documents, and track your admission status online.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <Button size="lg" className="w-full" onClick={() => router.push('/apply')}>
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(registerHref)}
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Sign In */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={authLoading || isSubmitting || !email || !password}
                >
                  {(authLoading || isSubmitting) ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Demo Personas */}
              <div className="mt-6 pt-5 border-t">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoPersonas.map((persona) => {
                    const Icon = persona.icon
                    return (
                      <button
                        key={persona.email}
                        onClick={() => handleDemoLogin(persona)}
                        disabled={authLoading || isSubmitting}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${persona.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate text-xs">{persona.name}</div>
                          <div className="text-muted-foreground truncate text-xs">{persona.role}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a href={registerHref} className="text-primary hover:underline font-medium">
                    Register
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo notice */}
        <div className="mt-8 flex items-start gap-2 rounded-md border px-4 py-3 text-sm text-muted-foreground max-w-2xl">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            This is a demo environment. All demo accounts use the password &quot;password&quot; for testing purposes.
          </span>
        </div>
      </div>
    </div>
  )
}
