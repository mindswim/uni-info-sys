"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Play,
  ArrowRight
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const demoPersonas = [
  {
    email: "admin@demo.com",
    password: "password",
    name: "Dr. Elizabeth Harper",
    role: "System Administrator",
    description: "Full system access with administrative privileges",
    icon: UserCheck,
    color: "bg-red-500",
    features: ["User Management", "System Settings", "Analytics", "All Data Access"]
  },
  {
    email: "maria@demo.com", 
    password: "password",
    name: "Maria Rodriguez",
    role: "Prospective Student",
    description: "International student from Mexico applying for Computer Science",
    icon: User,
    color: "bg-blue-500",
    features: ["Course Catalog", "Applications", "Admissions Status", "Student Portal"]
  },
  {
    email: "david@demo.com",
    password: "password", 
    name: "David Park",
    role: "Current Student",
    description: "2nd year Computer Science student from South Korea",
    icon: BookOpen,
    color: "bg-green-500",
    features: ["Course Enrollment", "Academic Records", "Schedules", "Grades"]
  },
  {
    email: "sophie@demo.com",
    password: "password",
    name: "Sophie Turner", 
    role: "Transfer Student",
    description: "Transfer student from California, waitlisted for popular courses",
    icon: Users,
    color: "bg-purple-500",
    features: ["Transfer Credits", "Waitlist Management", "Course Planning", "Advising"]
  }
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // Check if already authenticated, but only after initial load
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    // Clear any existing errors when component mounts or fields change
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
      // Don't push immediately, let the useEffect handle redirect
      router.push('/')
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
      // Don't push immediately, let the useEffect handle redirect
      router.push('/')
    } catch (err) {
      console.error('Demo login failed:', err)
      setError(err instanceof Error ? err.message : 'Demo login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">University Admissions System</h1>
          <p className="text-muted-foreground mt-2">
            Professional university management platform demo
          </p>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Demo Login
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Manual Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Choose Demo Persona</h2>
              <p className="text-muted-foreground">
                Experience different user roles and permissions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoPersonas.map((persona) => {
                const Icon = persona.icon
                return (
                  <Card 
                    key={persona.email} 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleDemoLogin(persona)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-full ${persona.color} flex items-center justify-center text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{persona.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {persona.role}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {persona.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-muted-foreground">KEY FEATURES:</p>
                        <div className="flex flex-wrap gap-1">
                          {persona.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {persona.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{persona.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        className="w-full group-hover:bg-primary/90"
                        disabled={authLoading || isSubmitting}
                        size="sm"
                      >
                        {(authLoading || isSubmitting) ? "Logging in..." : (
                          <>
                            Login as {persona.name.split(' ')[0]}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Alert className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This is a demo environment. All personas use the password "password" for easy testing.
                  Each persona showcases different aspects of the university management system.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Manual Login
                </CardTitle>
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

                <div className="mt-6 pt-4 border-t text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <a href="/auth/forgot-password" className="text-primary hover:underline font-medium">
                      Forgot password?
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Demo credentials available in the Demo Login tab
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <a href="/auth/register" className="text-primary hover:underline font-medium">
                      Register
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}