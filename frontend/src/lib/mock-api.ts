// Mock API service that simulates real backend responses
// This provides a realistic foundation that can easily be replaced with real API calls

export interface CourseSection {
  id: number
  course_id: number
  section_number: string
  term_id: number
  instructor_id: number
  room_id: number
  max_enrollment: number
  current_enrollment: number
  waitlist_count: number
  status: 'open' | 'full' | 'cancelled'
  schedule: string
  created_at: string
  updated_at: string
  course: {
    id: number
    code: string
    name: string
    credits: number
    level: string
    description: string
    prerequisites: string[]
    department: {
      id: number
      name: string
      code: string
    }
  }
  term: {
    id: number
    name: string
    code: string
    start_date: string
    end_date: string
  }
  instructor: {
    id: number
    name: string
    email: string
  }
  room: {
    id: number
    room_number: string
    building: {
      id: number
      name: string
    }
  }
}

export interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  enrollment_status: 'enrolled' | 'waitlisted' | 'dropped'
  grade: string | null
  enrollment_date: string
  credits_earned: number
  final_grade: string | null
  course_section: CourseSection
}

export interface Student {
  id: number
  user_id: number
  student_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  completed_courses: string[]
  current_enrollments: number[]
}

// Mock data
const mockCourseSections: CourseSection[] = [
  {
    id: 1,
    course_id: 1,
    section_number: "001",
    term_id: 1,
    instructor_id: 2,
    room_id: 1,
    max_enrollment: 30,
    current_enrollment: 25,
    waitlist_count: 0,
    status: "open",
    schedule: "MWF 09:00-10:00",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-15T14:30:00Z",
    course: {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming", 
      credits: 3,
      level: "undergraduate",
      description: "Basic programming concepts using Python. Learn variables, control structures, functions, and object-oriented programming fundamentals.",
      prerequisites: [],
      department: { id: 1, name: "Computer Science", code: "CS" }
    },
    term: { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15" },
    instructor: { id: 2, name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { id: 1, room_number: "ENG101", building: { id: 1, name: "Engineering Complex" } }
  },
  {
    id: 2,
    course_id: 1,
    section_number: "002", 
    term_id: 1,
    instructor_id: 2,
    room_id: 2,
    max_enrollment: 30,
    current_enrollment: 30,
    waitlist_count: 5,
    status: "full",
    schedule: "TT 14:00-15:30",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-20T09:15:00Z",
    course: {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      credits: 3,
      level: "undergraduate", 
      description: "Basic programming concepts using Python. Learn variables, control structures, functions, and object-oriented programming fundamentals.",
      prerequisites: [],
      department: { id: 1, name: "Computer Science", code: "CS" }
    },
    term: { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15" },
    instructor: { id: 2, name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { id: 2, room_number: "ENG205", building: { id: 1, name: "Engineering Complex" } }
  },
  {
    id: 3,
    course_id: 2,
    section_number: "001",
    term_id: 1,
    instructor_id: 2,
    room_id: 3,
    max_enrollment: 25,
    current_enrollment: 18,
    waitlist_count: 0,
    status: "open",
    schedule: "MWF 11:00-12:00",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-18T16:45:00Z",
    course: {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      credits: 3,
      level: "undergraduate",
      description: "Advanced data structures including linked lists, stacks, queues, trees, and hash tables. Algorithm analysis and implementation in Java.",
      prerequisites: ["CS101"],
      department: { id: 1, name: "Computer Science", code: "CS" }
    },
    term: { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15" },
    instructor: { id: 2, name: "Prof. Sarah Kim", email: "sarah.kim@demo.com" },
    room: { id: 3, room_number: "SCI301", building: { id: 2, name: "Science Center" } }
  },
  {
    id: 4,
    course_id: 3,
    section_number: "001",
    term_id: 1,
    instructor_id: 3,
    room_id: 4,
    max_enrollment: 35,
    current_enrollment: 32,
    waitlist_count: 2,
    status: "open",
    schedule: "MTWTF 10:00-11:00",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-22T11:20:00Z",
    course: {
      id: 3,
      code: "MATH101",
      name: "Calculus I",
      credits: 4,
      level: "undergraduate",
      description: "Differential calculus including limits, derivatives, and applications. Introduction to integral calculus.",
      prerequisites: [],
      department: { id: 2, name: "Mathematics", code: "MATH" }
    },
    term: { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15" },
    instructor: { id: 3, name: "Prof. John Davis", email: "john.davis@demo.com" },
    room: { id: 4, room_number: "SCI201", building: { id: 2, name: "Science Center" } }
  },
  {
    id: 5,
    course_id: 4,
    section_number: "001",
    term_id: 1,
    instructor_id: 4,
    room_id: 5,
    max_enrollment: 20,
    current_enrollment: 15,
    waitlist_count: 0,
    status: "open",
    schedule: "MW 15:00-16:30",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-19T08:30:00Z",
    course: {
      id: 4,
      code: "ENG101",
      name: "English Composition",
      credits: 3,
      level: "undergraduate",
      description: "Academic writing, research methods, and critical thinking. Develop clear and effective communication skills.",
      prerequisites: [],
      department: { id: 3, name: "English", code: "ENG" }
    },
    term: { id: 1, name: "Fall 2024", code: "F2024", start_date: "2024-09-01", end_date: "2024-12-15" },
    instructor: { id: 4, name: "Prof. Lisa Chen", email: "lisa.chen@demo.com" },
    room: { id: 5, room_number: "LIB301", building: { id: 3, name: "Library Building" } }
  }
]

const mockCurrentStudent: Student = {
  id: 1,
  user_id: 2,
  student_number: "STU2025001",
  first_name: "Maria",
  last_name: "Rodriguez",
  email: "maria@demo.com",
  phone: "+52-555-123-4567",
  completed_courses: [], // Maria is a first-year student
  current_enrollments: [4] // Currently enrolled in MATH101
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulate occasional API errors for testing
const shouldSimulateError = (errorRate = 0.1) => Math.random() < errorRate

export class MockCourseAPI {
  static async getCourseSections(params?: {
    department?: string
    level?: string
    term_id?: number
    search?: string
  }) {
    await delay(300) // Simulate network delay

    if (shouldSimulateError(0.05)) { // 5% error rate
      throw new Error('Failed to fetch course sections')
    }

    let filtered = [...mockCourseSections]

    if (params?.department && params.department !== 'all') {
      filtered = filtered.filter(section => 
        section.course.department.code === params.department
      )
    }

    if (params?.level && params.level !== 'all') {
      filtered = filtered.filter(section => 
        section.course.level === params.level
      )
    }

    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(section => 
        section.course.code.toLowerCase().includes(search) ||
        section.course.name.toLowerCase().includes(search)
      )
    }

    return {
      data: filtered,
      meta: {
        total: filtered.length,
        per_page: 50,
        current_page: 1,
        last_page: 1
      }
    }
  }

  static async enrollInSection(sectionId: number) {
    await delay(800) // Simulate processing time

    if (shouldSimulateError(0.1)) { // 10% error rate
      throw new Error('Enrollment failed. Please try again.')
    }

    const section = mockCourseSections.find(s => s.id === sectionId)
    if (!section) {
      throw new Error('Course section not found')
    }

    // Check prerequisites
    const missingPrereqs = section.course.prerequisites.filter(
      prereq => !mockCurrentStudent.completed_courses.includes(prereq)
    )

    if (missingPrereqs.length > 0) {
      throw new Error(`Missing prerequisites: ${missingPrereqs.join(', ')}`)
    }

    // Check if already enrolled
    if (mockCurrentStudent.current_enrollments.includes(sectionId)) {
      throw new Error('You are already enrolled in this section')
    }

    // Check capacity
    if (section.current_enrollment >= section.max_enrollment) {
      throw new Error('This section is full')
    }

    // Simulate successful enrollment
    section.current_enrollment += 1
    mockCurrentStudent.current_enrollments.push(sectionId)

    return {
      message: 'Successfully enrolled',
      enrollment: {
        id: Date.now(), // Mock ID
        student_id: mockCurrentStudent.id,
        course_section_id: sectionId,
        enrollment_status: 'enrolled',
        enrollment_date: new Date().toISOString(),
        credits_earned: section.course.credits
      }
    }
  }

  static async joinWaitlist(sectionId: number) {
    await delay(600)

    if (shouldSimulateError(0.08)) {
      throw new Error('Failed to join waitlist. Please try again.')
    }

    const section = mockCourseSections.find(s => s.id === sectionId)
    if (!section) {
      throw new Error('Course section not found')
    }

    // Check prerequisites
    const missingPrereqs = section.course.prerequisites.filter(
      prereq => !mockCurrentStudent.completed_courses.includes(prereq)
    )

    if (missingPrereqs.length > 0) {
      throw new Error(`Cannot join waitlist: Missing prerequisites: ${missingPrereqs.join(', ')}`)
    }

    section.waitlist_count += 1

    return {
      message: `Added to waitlist. Position: ${section.waitlist_count}`,
      waitlist_position: section.waitlist_count
    }
  }

  static async dropFromSection(sectionId: number) {
    await delay(500)

    if (shouldSimulateError(0.05)) {
      throw new Error('Failed to drop course. Please try again.')
    }

    const section = mockCourseSections.find(s => s.id === sectionId)
    if (!section) {
      throw new Error('Course section not found')
    }

    const enrollmentIndex = mockCurrentStudent.current_enrollments.indexOf(sectionId)
    if (enrollmentIndex === -1) {
      throw new Error('You are not enrolled in this section')
    }

    // Simulate successful drop
    section.current_enrollment -= 1
    mockCurrentStudent.current_enrollments.splice(enrollmentIndex, 1)

    return {
      message: 'Successfully dropped from course'
    }
  }

  static async getCurrentStudent() {
    await delay(200)
    return mockCurrentStudent
  }
}

export { mockCourseSections, mockCurrentStudent }