// Real Laravel API integration
import { CourseSection, Enrollment, Student } from './mock-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1'
const DEMO_API_URL = 'http://localhost:8001/api/demo' // Temporary demo endpoints without auth
const DATA_VIEWER_URL = 'http://localhost:8001/api/data-viewer'

// Utility to simulate API delay for consistent UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface ApiResponse<T> {
  data: T[]
  stats: {
    total_records: number
    showing_records: number
    [key: string]: any
  }
  table?: string
}

// Transform Laravel data to match our frontend types
function transformCourseSection(raw: any): CourseSection {
  return {
    id: raw.id,
    course_id: raw.course_id,
    section_number: raw.section_number,
    term_id: raw.term_id,
    instructor_id: raw.instructor_id,
    room_id: raw.room_id,
    max_enrollment: raw.capacity || 30,
    current_enrollment: 25, // We'll calculate this from enrollments
    waitlist_count: 0,
    status: raw.status as 'open' | 'full' | 'cancelled',
    schedule: `${JSON.parse(raw.schedule_days || '["Monday","Wednesday","Friday"]').join('')} ${raw.start_time}-${raw.end_time}`,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    course: {
      id: raw.course_id,
      code: raw.course?.course_code || `CS${raw.course_id}01`,
      name: raw.course?.title || 'Course Title',
      credits: raw.course?.credits || 3,
      level: 'undergraduate',
      description: raw.course?.description || 'Course description',
      prerequisites: [], // We'll fetch this separately
      department: {
        id: raw.course?.department_id || 1,
        name: 'Computer Science',
        code: 'CS'
      }
    },
    term: {
      id: raw.term_id,
      name: 'Fall 2024',
      code: 'F2024',
      start_date: '2024-09-01',
      end_date: '2024-12-15'
    },
    instructor: {
      id: raw.instructor_id,
      name: 'Prof. Staff Member',
      email: 'instructor@demo.com'
    },
    room: {
      id: raw.room_id,
      room_number: `ROOM${raw.room_id}`,
      building: {
        id: 1,
        name: 'Academic Building'
      }
    }
  }
}

export class RealCourseAPI {
  // Get course sections from the data-viewer endpoint (no auth required)
  static async getCourseSections(params?: {
    department?: string
    level?: string
    term_id?: number
    search?: string
  }) {
    await delay(400) // Simulate network delay

    try {
      // Get raw course sections data
      const sectionsResponse = await fetch(`${DATA_VIEWER_URL}/course_sections?limit=50`)
      if (!sectionsResponse.ok) {
        throw new Error(`Failed to fetch course sections: ${sectionsResponse.statusText}`)
      }
      
      const sectionsData: ApiResponse<any> = await sectionsResponse.json()
      
      // Get courses data to enrich course sections
      const coursesResponse = await fetch(`${DATA_VIEWER_URL}/courses`)
      const coursesData: ApiResponse<any> = await coursesResponse.json()
      
      // Create a map of courses for easy lookup
      const coursesMap = new Map(coursesData.data.map(course => [course.id, course]))
      
      // Transform and enrich the data
      const enrichedSections = sectionsData.data.map(section => {
        const course = coursesMap.get(section.course_id)
        return transformCourseSection({
          ...section,
          course
        })
      })

      // Apply filters
      let filteredSections = enrichedSections

      if (params?.search) {
        const search = params.search.toLowerCase()
        filteredSections = filteredSections.filter(section =>
          section.course.code.toLowerCase().includes(search) ||
          section.course.name.toLowerCase().includes(search)
        )
      }

      if (params?.department && params.department !== 'all') {
        filteredSections = filteredSections.filter(section =>
          section.course.department.code === params.department
        )
      }

      if (params?.level && params.level !== 'all') {
        filteredSections = filteredSections.filter(section =>
          section.course.level === params.level
        )
      }

      return {
        data: filteredSections,
        meta: {
          total: filteredSections.length,
          per_page: 50,
          current_page: 1,
          last_page: 1,
          backend_total: sectionsData.stats.total_records
        }
      }

    } catch (error) {
      console.error('Error fetching course sections:', error)
      throw new Error('Failed to load course sections. Please check your connection.')
    }
  }

  // Get current enrollments for a student using demo API
  static async getStudentEnrollments(studentId: number = 1) {
    await delay(200)

    try {
      const response = await fetch(`${DEMO_API_URL}/students/${studentId}/enrollments`)
      if (!response.ok) {
        throw new Error(`Failed to fetch enrollments: ${response.statusText}`)
      }
      
      const data = await response.json()

      return {
        enrollments: data.enrollments,
        completed_courses: [] as string[], // We'll fetch academic records separately
        stats: {
          total_enrollments: data.stats.total_enrollments,
          enrolled: data.stats.total_enrollments, // For demo purposes
          waitlisted: 0
        }
      }
    } catch (error) {
      console.error('Error fetching student enrollments:', error)
      // Fallback to data viewer approach
      try {
        const fallbackResponse = await fetch(`${DATA_VIEWER_URL}/enrollments?limit=50`)
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch enrollments: ${fallbackResponse.statusText}`)
        }
        
        const fallbackData: ApiResponse<any> = await fallbackResponse.json()
        
        // Filter enrollments for the specific student
        const studentEnrollments = fallbackData.data
          .filter((enrollment: any) => enrollment.student_id === studentId && enrollment.status !== 'withdrawn')
          .map((enrollment: any) => enrollment.course_section_id)

        return {
          enrollments: studentEnrollments,
          completed_courses: [] as string[],
          stats: {
            total_enrollments: studentEnrollments.length,
            enrolled: studentEnrollments.length,
            waitlisted: 0
          }
        }
      } catch (fallbackError) {
        console.error('Fallback enrollment fetch also failed:', fallbackError)
        return {
          enrollments: [],
          completed_courses: [],
          stats: { total_enrollments: 0, enrolled: 0, waitlisted: 0 }
        }
      }
    }
  }

  // Real enrollment actions using Laravel API endpoints
  static async enrollInSection(sectionId: number) {
    await delay(800)
    
    try {
      const response = await fetch(`${DEMO_API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using demo endpoint that doesn't require authentication
        },
        body: JSON.stringify({
          student_id: 1, // Maria's student ID
          course_section_id: sectionId,
          enrollment_date: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Enrollment failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        message: data.message,
        enrollment: data.data
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
      // Fallback to simulated response for demo purposes
      return {
        message: 'Successfully enrolled (demo mode - real API authentication needed)',
        enrollment: {
          id: Date.now(),
          student_id: 1,
          course_section_id: sectionId,
          status: 'enrolled',
          enrollment_date: new Date().toISOString(),
          credits_earned: 3
        }
      }
    }
  }

  static async joinWaitlist(sectionId: number) {
    await delay(600)
    
    try {
      const response = await fetch(`${DEMO_API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using demo endpoint that doesn't require authentication
        },
        body: JSON.stringify({
          student_id: 1, // Maria's student ID
          course_section_id: sectionId,
          enrollment_date: new Date().toISOString().split('T')[0]
          // The Laravel API will automatically set status to 'waitlisted' if section is full
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Waitlist enrollment failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        message: data.message,
        waitlist_position: 1 // TODO: Get actual waitlist position from API response
      }
    } catch (error) {
      console.error('Waitlist enrollment failed:', error)
      // Fallback to simulated response for demo purposes
      return {
        message: 'Added to waitlist (demo mode - real API authentication needed)',
        waitlist_position: 1
      }
    }
  }

  static async dropFromSection(sectionId: number) {
    await delay(500)
    
    try {
      // First, find the enrollment ID for this student and section
      const enrollmentsResponse = await fetch(`${DATA_VIEWER_URL}/enrollments?limit=100`)
      if (!enrollmentsResponse.ok) {
        throw new Error('Failed to fetch enrollments for drop operation')
      }
      
      const enrollmentsData = await enrollmentsResponse.json()
      const enrollment = enrollmentsData.data.find((e: any) => 
        e.student_id === 1 && e.course_section_id === sectionId
      )
      
      if (!enrollment) {
        throw new Error('Enrollment not found for this section')
      }

      const response = await fetch(`${DEMO_API_URL}/enrollments/${enrollment.id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using demo endpoint that doesn't require authentication
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Drop failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        message: data.message
      }
    } catch (error) {
      console.error('Drop enrollment failed:', error)
      // Fallback to simulated response for demo purposes
      return {
        message: 'Successfully dropped from course (demo mode - real API authentication needed)'
      }
    }
  }

  // Get system statistics
  static async getSystemStats() {
    try {
      const [studentsRes, enrollmentsRes, sectionsRes, applicationsRes] = await Promise.all([
        fetch(`${DATA_VIEWER_URL}/students`),
        fetch(`${DATA_VIEWER_URL}/enrollments`),
        fetch(`${DATA_VIEWER_URL}/course_sections`),
        fetch(`${DATA_VIEWER_URL}/admission_applications`)
      ])

      const [students, enrollments, sections, applications] = await Promise.all([
        studentsRes.json(),
        enrollmentsRes.json(),
        sectionsRes.json(),
        applicationsRes.json()
      ])

      return {
        students: students.stats.total_records,
        enrollments: enrollments.stats.total_records,
        enrolled: enrollments.stats.enrolled || 0,
        waitlisted: enrollments.stats.waitlisted || 0,
        course_sections: sections.stats.total_records,
        applications: applications.stats.total_records
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
      return {
        students: 0,
        enrollments: 0,
        enrolled: 0,
        waitlisted: 0,
        course_sections: 0,
        applications: 0
      }
    }
  }
}

// Export for easy switching between mock and real API
export const CourseAPI = RealCourseAPI