"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Calendar,
  User,
  CheckCircle,
  Plus,
  Loader2,
  Filter,
  RefreshCw,
  ShoppingCart,
  X,
  AlertTriangle,
  Check
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface CourseSection {
  id: number
  section_number: string
  capacity: number
  enrolled_count: number
  waitlist_count: number
  status: string
  schedule_days: string
  schedule_time: string
  schedule_display: string
  term: {
    id: number
    name: string
    academic_year: string
  }
  course: {
    id: number
    course_code: string
    course_name: string
    title: string
    description: string
    credits: number
    department: {
      name: string
    }
  }
  instructor: {
    user: {
      name: string
    }
  } | null
  room: {
    room_number: string
    building: {
      name: string
      code: string
    }
  } | null
}

export function RegistrationTab() {
  const { toast } = useToast()
  const [sections, setSections] = useState<CourseSection[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerm, setSelectedTerm] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [availableTerms, setAvailableTerms] = useState<any[]>([])

  // Shopping cart state
  const [cart, setCart] = useState<CourseSection[]>([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('auth_token')

      // Fetch available course sections
      const sectionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-sections`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json()
        setSections(sectionsData.data || [])

        // Extract unique terms
        const terms = Array.from(
          new Set(
            (sectionsData.data || []).map((s: CourseSection) =>
              JSON.stringify({ id: s.term.id, name: s.term.name, year: s.term.academic_year })
            )
          )
        ).map(t => JSON.parse(t))
        setAvailableTerms(terms)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast({
        title: "Error",
        description: "Failed to load available courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cart functions
  const addToCart = (section: CourseSection) => {
    if (cart.find(s => s.id === section.id)) {
      toast({
        title: "Already in Cart",
        description: "This course is already in your cart",
        variant: "destructive",
      })
      return
    }

    setCart([...cart, section])
    toast({
      title: "Added to Cart",
      description: `${section.course.course_code} - ${section.course.course_name}`,
    })
  }

  const removeFromCart = (sectionId: number) => {
    setCart(cart.filter(s => s.id !== sectionId))
  }

  const clearCart = () => {
    setCart([])
  }

  const detectScheduleConflicts = (): boolean => {
    const schedules = cart
      .filter(s => s.schedule_days && s.schedule_time)
      .map(s => ({ id: s.id, days: s.schedule_days, time: s.schedule_time }))

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i]
        const s2 = schedules[j]

        // Check if days overlap
        const days1 = s1.days.split(',').map(d => d.trim())
        const days2 = s2.days.split(',').map(d => d.trim())
        const hasCommonDay = days1.some(d => days2.includes(d))

        if (hasCommonDay) {
          // Simple time overlap check (this is a basic implementation)
          // In production, you'd want more robust time parsing
          if (s1.time === s2.time) {
            return true
          }
        }
      }
    }

    return false
  }

  const handleBulkEnroll = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Add courses to your cart before enrolling",
        variant: "destructive",
      })
      return
    }

    if (detectScheduleConflicts()) {
      toast({
        title: "Schedule Conflict Detected",
        description: "You have courses with overlapping schedules in your cart",
        variant: "destructive",
      })
      return
    }

    setEnrolling(true)

    try {
      const token = sessionStorage.getItem('auth_token')

      // Get student profile to get student ID
      const studentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/students/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!studentResponse.ok) throw new Error('Could not retrieve student profile')

      const studentData = await studentResponse.json()
      const studentId = studentData.data.id

      // Enroll in each course
      const results = await Promise.allSettled(
        cart.map(section =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enrollments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              student_id: studentId,
              course_section_id: section.id,
            }),
          }).then(async res => {
            if (!res.ok) {
              const error = await res.json()
              throw new Error(error.detail || error.message || 'Failed to enroll')
            }
            return res.json()
          })
        )
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')

      if (successful > 0) {
        toast({
          title: "Enrollment Complete!",
          description: `Successfully enrolled in ${successful} course${successful !== 1 ? 's' : ''}${rejected.length > 0 ? `. ${rejected.length} failed.` : ''}`,
        })
        clearCart()
        fetchData()
      } else {
        // Show the first distinct error reason from the backend
        const reasons = [...new Set(rejected.map(r => r.reason?.message))]
        throw new Error(reasons[0] || 'All enrollments failed')
      }
    } catch (error: any) {
      console.error('Enrollment error:', error)
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in courses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnrolling(false)
    }
  }

  // Filter sections
  const filteredSections = sections.filter(section => {
    const matchesSearch =
      section.course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTerm = selectedTerm === "all" || section.term.id.toString() === selectedTerm
    const matchesDept = selectedDepartment === "all" || section.course.department?.name === selectedDepartment

    return matchesSearch && matchesTerm && matchesDept
  })

  // Get unique departments
  const departments = Array.from(
    new Set(sections.map(s => s.course.department?.name).filter(Boolean))
  ).sort()

  const totalCredits = cart.reduce((sum, s) => sum + s.course.credits, 0)
  const hasConflicts = detectScheduleConflicts()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Registration</h2>
          <p className="text-muted-foreground">Browse and add courses to your cart</p>
        </div>
        <Button
          variant={cart.length > 0 ? "default" : "outline"}
          onClick={() => setShowCart(!showCart)}
          className="relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart ({cart.length})
          {cart.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {totalCredits} credits
            </Badge>
          )}
        </Button>
      </div>

      {/* Shopping Cart Panel */}
      {showCart && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>
                  {cart.length} course{cart.length !== 1 ? 's' : ''} selected ({totalCredits} credits)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    Clear All
                  </Button>
                )}
                <Button
                  onClick={handleBulkEnroll}
                  disabled={enrolling || cart.length === 0 || hasConflicts}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enroll in All ({cart.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm mt-1">Add courses below to get started</p>
              </div>
            ) : (
              <>
                {hasConflicts && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Schedule conflict detected! Some courses have overlapping times.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  {cart.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {section.course.course_code} - {section.course.course_name}
                          </p>
                          <Badge variant="outline">Section {section.section_number}</Badge>
                          <Badge variant="secondary">{section.course.credits} credits</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.schedule_display || 'TBA'} • {section.term.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(section.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id.toString()}>
                      {term.name} {term.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSections.length} course{filteredSections.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Sections */}
      {filteredSections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSections.map((section) => {
            const spotsAvailable = section.capacity - section.enrolled_count
            const isFull = spotsAvailable <= 0
            const isAlmostFull = spotsAvailable > 0 && spotsAvailable <= 5
            const isInCart = cart.find(s => s.id === section.id)

            return (
              <Card key={section.id} className={`hover:shadow-md transition-shadow ${isInCart ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {section.course.course_code} - {section.course.course_name}
                        </CardTitle>
                        <Badge variant="outline">Section {section.section_number}</Badge>
                        {isFull && <Badge variant="destructive">Full</Badge>}
                        {isAlmostFull && <Badge variant="secondary">Almost Full</Badge>}
                        {section.waitlist_count > 0 && (
                          <Badge variant="outline">{section.waitlist_count} waitlisted</Badge>
                        )}
                        {isInCart && <Badge className="bg-primary">In Cart</Badge>}
                      </div>
                      <CardDescription>{section.course.title}</CardDescription>
                    </div>
                    <Button
                      onClick={() => isInCart ? removeFromCart(section.id) : addToCart(section)}
                      variant={isInCart ? "secondary" : "default"}
                      disabled={isFull && !isInCart}
                    >
                      {isInCart ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          In Cart
                        </>
                      ) : isFull ? (
                        'Full'
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium">{section.schedule_display || 'TBA'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Enrollment</p>
                        <p className="font-medium">
                          {section.enrolled_count}/{section.capacity}
                          {isFull && ' (Full)'}
                        </p>
                      </div>
                    </div>

                    {section.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Instructor</p>
                          <p className="font-medium">{section.instructor.user.name}</p>
                        </div>
                      </div>
                    )}

                    {section.room && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {section.room.building.code} {section.room.room_number}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Credits</p>
                        <p className="font-medium">{section.course.credits}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-medium">{section.course.department?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {section.course.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {section.course.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
