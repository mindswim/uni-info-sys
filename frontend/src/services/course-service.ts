import { apiClient } from '@/lib/api-client'
import type {
  Course,
  CourseSection,
  APIResponse,
  PaginatedResponse,
  CourseQueryParams,
  QueryParams,
} from '@/types/api-types'

/**
 * Course Service
 * Handles all course and course section related API calls
 */
export const courseService = {
  /**
   * Get all courses with optional filters
   */
  getAll: async (params?: CourseQueryParams): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses', { params })
    return response.data
  },

  /**
   * Get a single course by ID
   */
  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<APIResponse<Course>>(`/courses/${id}`)
    return response.data.data
  },

  /**
   * Create a new course
   */
  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post<APIResponse<Course>>('/courses', data)
    return response.data.data
  },

  /**
   * Update a course
   */
  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.put<APIResponse<Course>>(`/courses/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a course
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}`)
  },

  /**
   * Get course prerequisites
   */
  getPrerequisites: async (id: number): Promise<Course[]> => {
    const response = await apiClient.get<APIResponse<Course[]>>(
      `/courses/${id}/prerequisites`
    )
    return response.data.data
  },

  /**
   * Search courses by query
   */
  search: async (query: string, filters?: CourseQueryParams): Promise<Course[]> => {
    const response = await apiClient.get<APIResponse<Course[]>>('/courses/search', {
      params: { q: query, ...filters },
    })
    return response.data.data
  },

  // === Course Section Methods ===

  /**
   * Get all course sections with filters
   */
  getAllSections: async (params?: CourseQueryParams): Promise<PaginatedResponse<CourseSection>> => {
    const response = await apiClient.get<PaginatedResponse<CourseSection>>('/course-sections', {
      params,
    })
    return response.data
  },

  /**
   * Get a single course section by ID
   */
  getSectionById: async (id: number): Promise<CourseSection> => {
    const response = await apiClient.get<APIResponse<CourseSection>>(`/course-sections/${id}`)
    return response.data.data
  },

  /**
   * Get sections for a specific course
   */
  getSectionsByCourse: async (courseId: number, termId?: number): Promise<CourseSection[]> => {
    const params = termId ? { course_id: courseId, term_id: termId } : { course_id: courseId }
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/course-sections', {
      params,
    })
    return response.data.data
  },

  /**
   * Create a new course section
   */
  createSection: async (data: Partial<CourseSection>): Promise<CourseSection> => {
    const response = await apiClient.post<APIResponse<CourseSection>>('/course-sections', data)
    return response.data.data
  },

  /**
   * Update a course section
   */
  updateSection: async (id: number, data: Partial<CourseSection>): Promise<CourseSection> => {
    const response = await apiClient.put<APIResponse<CourseSection>>(
      `/course-sections/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Delete a course section
   */
  deleteSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/course-sections/${id}`)
  },

  /**
   * Get section enrollment information
   */
  getSectionEnrollment: async (id: number): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>(
      `/course-sections/${id}/enrollment-info`
    )
    return response.data.data
  },

  /**
   * Get available seats for a section
   */
  getAvailableSeats: async (id: number): Promise<number> => {
    const section = await courseService.getSectionById(id)
    const enrolled = section.enrolled_count || 0
    return Math.max(0, section.capacity - enrolled)
  },

  /**
   * Check if section is full
   */
  isSectionFull: async (id: number): Promise<boolean> => {
    const availableSeats = await courseService.getAvailableSeats(id)
    return availableSeats === 0
  },

  /**
   * Get course catalog (public courses available for enrollment)
   */
  getCatalog: async (params?: CourseQueryParams): Promise<CourseSection[]> => {
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/course-catalog', {
      params,
    })
    return response.data.data
  },

  /**
   * Get sections by department
   */
  getSectionsByDepartment: async (departmentId: number, termId?: number): Promise<CourseSection[]> => {
    const params = termId
      ? { department_id: departmentId, term_id: termId }
      : { department_id: departmentId }
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/course-sections', {
      params,
    })
    return response.data.data
  },

  /**
   * Get sections by instructor
   */
  getSectionsByInstructor: async (instructorId: number, termId?: number): Promise<CourseSection[]> => {
    const params = termId
      ? { instructor_id: instructorId, term_id: termId }
      : { instructor_id: instructorId }
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/course-sections', {
      params,
    })
    return response.data.data
  },

  /**
   * Get sections by term
   */
  getSectionsByTerm: async (termId: number): Promise<CourseSection[]> => {
    const response = await apiClient.get<APIResponse<CourseSection[]>>('/course-sections', {
      params: { term_id: termId },
    })
    return response.data.data
  },
}

export default courseService
