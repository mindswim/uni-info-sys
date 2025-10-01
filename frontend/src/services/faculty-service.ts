import { apiClient } from '@/lib/api-client'
import type {
  Staff,
  APIResponse,
  PaginatedResponse,
  QueryParams,
  GradebookResponse,
  CourseSection,
  Enrollment,
} from '@/types/api-types'

/**
 * Faculty Service
 * Handles all faculty/instructor-related API calls
 */
export const facultyService = {
  /**
   * Get all staff/faculty with optional filters
   */
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<Staff>> => {
    const response = await apiClient.get<PaginatedResponse<Staff>>('/staff', { params })
    return response.data
  },

  /**
   * Get a single staff member by ID
   */
  getById: async (id: number): Promise<Staff> => {
    const response = await apiClient.get<APIResponse<Staff>>(`/staff/${id}`)
    return response.data.data
  },

  /**
   * Get current faculty member's profile
   */
  getCurrentProfile: async (): Promise<Staff> => {
    const response = await apiClient.get<APIResponse<Staff>>('/staff/me')
    return response.data.data
  },

  /**
   * Create a new staff member
   */
  create: async (data: Partial<Staff>): Promise<Staff> => {
    const response = await apiClient.post<APIResponse<Staff>>('/staff', data)
    return response.data.data
  },

  /**
   * Update a staff member
   */
  update: async (id: number, data: Partial<Staff>): Promise<Staff> => {
    const response = await apiClient.put<APIResponse<Staff>>(`/staff/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a staff member
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/staff/${id}`)
  },

  // === Course Section Management ===

  /**
   * Get all course sections taught by current faculty
   */
  getMySections: async (termId?: number): Promise<CourseSection[]> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/staff/me/sections', {
      params,
    })
    return response.data.data
  },

  /**
   * Get course sections taught by a specific instructor
   */
  getSectionsByInstructor: async (instructorId: number, termId?: number): Promise<CourseSection[]> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<CourseSection[]>>(
      `/staff/${instructorId}/sections`,
      { params }
    )
    return response.data.data
  },

  // === Gradebook Management ===

  /**
   * Get gradebook for a course section
   */
  getGradebook: async (courseSectionId: number): Promise<GradebookResponse> => {
    const response = await apiClient.get<APIResponse<GradebookResponse>>(
      `/course-sections/${courseSectionId}/gradebook`
    )
    return response.data.data
  },

  /**
   * Update a student's grade
   */
  updateGrade: async (
    enrollmentId: number,
    grade: string,
    gradePoints?: number
  ): Promise<Enrollment> => {
    const response = await apiClient.put<APIResponse<Enrollment>>(
      `/enrollments/${enrollmentId}/grade`,
      {
        grade,
        grade_points: gradePoints,
      }
    )
    return response.data.data
  },

  /**
   * Batch update grades for multiple students
   */
  batchUpdateGrades: async (
    courseSectionId: number,
    grades: Array<{ enrollment_id: number; grade: string; grade_points?: number }>
  ): Promise<void> => {
    await apiClient.post(`/course-sections/${courseSectionId}/grades/batch`, {
      grades,
    })
  },

  /**
   * Submit final grades for a course section
   */
  submitFinalGrades: async (courseSectionId: number): Promise<void> => {
    await apiClient.post(`/course-sections/${courseSectionId}/grades/submit`)
  },

  /**
   * Get grade statistics for a course section
   */
  getGradeStatistics: async (courseSectionId: number): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>(
      `/course-sections/${courseSectionId}/grades/statistics`
    )
    return response.data.data
  },

  // === Attendance Management ===

  /**
   * Get attendance records for a course section
   */
  getAttendance: async (courseSectionId: number): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>(
      `/course-sections/${courseSectionId}/attendance`
    )
    return response.data.data
  },

  /**
   * Record attendance for a class session
   */
  recordAttendance: async (
    courseSectionId: number,
    date: string,
    records: Array<{ student_id: number; status: 'present' | 'absent' | 'late' | 'excused' }>
  ): Promise<void> => {
    await apiClient.post(`/course-sections/${courseSectionId}/attendance`, {
      date,
      records,
    })
  },

  /**
   * Get attendance summary for a student
   */
  getStudentAttendance: async (courseSectionId: number, studentId: number): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>(
      `/course-sections/${courseSectionId}/attendance/${studentId}`
    )
    return response.data.data
  },

  // === Roster Management ===

  /**
   * Get class roster for a course section
   */
  getRoster: async (courseSectionId: number): Promise<any[]> => {
    const response = await apiClient.get<APIResponse<any[]>>(
      `/course-sections/${courseSectionId}/roster`
    )
    return response.data.data
  },

  /**
   * Export roster to CSV
   */
  exportRoster: async (courseSectionId: number): Promise<Blob> => {
    const response = await apiClient.get(`/course-sections/${courseSectionId}/roster/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  // === Assignment Management ===

  /**
   * Get assignments for a course section
   */
  getAssignments: async (courseSectionId: number): Promise<any[]> => {
    const response = await apiClient.get<APIResponse<any[]>>(
      `/course-sections/${courseSectionId}/assignments`
    )
    return response.data.data
  },

  /**
   * Create a new assignment
   */
  createAssignment: async (courseSectionId: number, data: any): Promise<any> => {
    const response = await apiClient.post<APIResponse<any>>(
      `/course-sections/${courseSectionId}/assignments`,
      data
    )
    return response.data.data
  },

  /**
   * Update an assignment
   */
  updateAssignment: async (assignmentId: number, data: any): Promise<any> => {
    const response = await apiClient.put<APIResponse<any>>(
      `/assignments/${assignmentId}`,
      data
    )
    return response.data.data
  },

  /**
   * Delete an assignment
   */
  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`/assignments/${assignmentId}`)
  },

  // === Office Hours & Advising ===

  /**
   * Get office hours schedule
   */
  getOfficeHours: async (): Promise<any[]> => {
    const response = await apiClient.get<APIResponse<any[]>>('/staff/me/office-hours')
    return response.data.data
  },

  /**
   * Set office hours
   */
  setOfficeHours: async (schedule: any[]): Promise<void> => {
    await apiClient.post('/staff/me/office-hours', { schedule })
  },

  /**
   * Get advising caseload (for advisors)
   */
  getAdvisingCaseload: async (): Promise<any[]> => {
    const response = await apiClient.get<APIResponse<any[]>>('/staff/me/advisees')
    return response.data.data
  },

  /**
   * Get faculty statistics
   */
  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/staff/statistics')
    return response.data.data
  },
}

export default facultyService
