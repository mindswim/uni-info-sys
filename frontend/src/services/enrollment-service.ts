import { apiClient } from '@/lib/api-client'
import type {
  Enrollment,
  APIResponse,
  PaginatedResponse,
  EnrollmentQueryParams,
  ScheduleResponse,
} from '@/types/api-types'

/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 */
export const enrollmentService = {
  /**
   * Get all enrollments with optional filters
   */
  getAll: async (params?: EnrollmentQueryParams): Promise<PaginatedResponse<Enrollment>> => {
    const response = await apiClient.get<PaginatedResponse<Enrollment>>('/enrollments', {
      params,
    })
    return response.data
  },

  /**
   * Get a single enrollment by ID
   */
  getById: async (id: number): Promise<Enrollment> => {
    const response = await apiClient.get<APIResponse<Enrollment>>(`/enrollments/${id}`)
    return response.data.data
  },

  /**
   * Create a new enrollment (enroll in a course section)
   */
  create: async (data: {
    student_id: number
    course_section_id: number
  }): Promise<Enrollment> => {
    const response = await apiClient.post<APIResponse<Enrollment>>('/enrollments', data)
    return response.data.data
  },

  /**
   * Enroll current student in a course section
   */
  enrollCurrent: async (courseSectionId: number): Promise<Enrollment> => {
    const response = await apiClient.post<APIResponse<Enrollment>>('/enrollments', {
      course_section_id: courseSectionId,
    })
    return response.data.data
  },

  /**
   * Drop an enrollment
   */
  drop: async (id: number): Promise<void> => {
    await apiClient.post(`/enrollments/${id}/drop`)
  },

  /**
   * Withdraw from an enrollment
   */
  withdraw: async (id: number): Promise<Enrollment> => {
    const response = await apiClient.post<APIResponse<Enrollment>>(
      `/enrollments/${id}/withdraw`
    )
    return response.data.data
  },

  /**
   * Swap between two course sections
   */
  swap: async (fromEnrollmentId: number, toCourseSectionId: number): Promise<Enrollment> => {
    const response = await apiClient.post<APIResponse<Enrollment>>(
      `/enrollments/${fromEnrollmentId}/swap`,
      {
        to_course_section_id: toCourseSectionId,
      }
    )
    return response.data.data
  },

  /**
   * Update enrollment grade
   */
  updateGrade: async (id: number, grade: string, gradePoints?: number): Promise<Enrollment> => {
    const response = await apiClient.put<APIResponse<Enrollment>>(
      `/enrollments/${id}/grade`,
      {
        grade,
        grade_points: gradePoints,
      }
    )
    return response.data.data
  },

  /**
   * Get enrollments for a specific student
   */
  getByStudent: async (studentId: number, termId?: number): Promise<Enrollment[]> => {
    const params = termId ? { student_id: studentId, term_id: termId } : { student_id: studentId }
    const response = await apiClient.get<APIResponse<Enrollment[]>>('/enrollments', {
      params,
    })
    return response.data.data
  },

  /**
   * Get enrollments for a specific course section
   */
  getByCourseSection: async (courseSectionId: number): Promise<Enrollment[]> => {
    const response = await apiClient.get<APIResponse<Enrollment[]>>('/enrollments', {
      params: { course_section_id: courseSectionId },
    })
    return response.data.data
  },

  /**
   * Get current student's enrollments
   */
  getCurrentEnrollments: async (termId?: number): Promise<Enrollment[]> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<Enrollment[]>>('/enrollments/me', {
      params,
    })
    return response.data.data
  },

  /**
   * Get current student's schedule
   */
  getCurrentSchedule: async (termId?: number): Promise<ScheduleResponse> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<ScheduleResponse>>('/enrollments/me/schedule', {
      params,
    })
    return response.data.data
  },

  /**
   * Check if student can enroll in a course section
   */
  checkEligibility: async (courseSectionId: number): Promise<{
    eligible: boolean
    reason?: string
    conflicts?: any[]
  }> => {
    const response = await apiClient.post<APIResponse<any>>(
      '/enrollments/check-eligibility',
      {
        course_section_id: courseSectionId,
      }
    )
    return response.data.data
  },

  /**
   * Get enrollment statistics
   */
  getStatistics: async (termId?: number): Promise<any> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<any>>('/enrollments/statistics', {
      params,
    })
    return response.data.data
  },

  /**
   * Join waitlist for a course section
   */
  joinWaitlist: async (courseSectionId: number): Promise<any> => {
    const response = await apiClient.post<APIResponse<any>>('/enrollments/waitlist', {
      course_section_id: courseSectionId,
    })
    return response.data.data
  },

  /**
   * Leave waitlist
   */
  leaveWaitlist: async (courseSectionId: number): Promise<void> => {
    await apiClient.delete(`/enrollments/waitlist/${courseSectionId}`)
  },

  /**
   * Get waitlist position
   */
  getWaitlistPosition: async (courseSectionId: number): Promise<number> => {
    const response = await apiClient.get<APIResponse<{ position: number }>>(
      `/enrollments/waitlist/${courseSectionId}/position`
    )
    return response.data.data.position
  },

  /**
   * Check for schedule conflicts
   */
  checkScheduleConflicts: async (courseSectionId: number): Promise<{
    hasConflicts: boolean
    conflicts: any[]
  }> => {
    const response = await apiClient.post<APIResponse<any>>(
      '/enrollments/check-conflicts',
      {
        course_section_id: courseSectionId,
      }
    )
    return response.data.data
  },
}

export default enrollmentService
