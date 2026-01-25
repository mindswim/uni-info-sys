import { apiClient } from '@/lib/api-client'
import type {
  Staff,
  APIResponse,
  PaginatedResponse,
  QueryParams,
  GradebookResponse,
  CourseSection,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  CourseMaterial,
  Announcement,
  ClassGradebookResponse,
  StudentGradebookResponse,
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

  /**
   * Get a single assignment
   */
  getAssignment: async (assignmentId: number): Promise<Assignment> => {
    const response = await apiClient.get<APIResponse<Assignment>>(`/assignments/${assignmentId}`)
    return response.data.data
  },

  /**
   * Publish an assignment
   */
  publishAssignment: async (assignmentId: number): Promise<Assignment> => {
    const response = await apiClient.post<APIResponse<Assignment>>(`/assignments/${assignmentId}/publish`)
    return response.data.data
  },

  /**
   * Unpublish an assignment
   */
  unpublishAssignment: async (assignmentId: number): Promise<Assignment> => {
    const response = await apiClient.post<APIResponse<Assignment>>(`/assignments/${assignmentId}/unpublish`)
    return response.data.data
  },

  // === Submission Management ===

  /**
   * Get submissions for an assignment
   */
  getSubmissions: async (assignmentId: number): Promise<AssignmentSubmission[]> => {
    const response = await apiClient.get<APIResponse<AssignmentSubmission[]>>(
      `/assignments/${assignmentId}/submissions`
    )
    return response.data.data
  },

  /**
   * Get a single submission
   */
  getSubmission: async (submissionId: number): Promise<AssignmentSubmission> => {
    const response = await apiClient.get<APIResponse<AssignmentSubmission>>(`/submissions/${submissionId}`)
    return response.data.data
  },

  /**
   * Grade a submission
   */
  gradeSubmission: async (
    submissionId: number,
    data: { points_earned: number; feedback?: string }
  ): Promise<AssignmentSubmission> => {
    const response = await apiClient.post<APIResponse<AssignmentSubmission>>(
      `/submissions/${submissionId}/grade`,
      data
    )
    return response.data.data
  },

  /**
   * Batch grade submissions
   */
  batchGradeSubmissions: async (
    assignmentId: number,
    grades: Array<{ submission_id: number; points_earned: number; feedback?: string }>
  ): Promise<{ successful: number; failed: number }> => {
    const response = await apiClient.post<APIResponse<{ successful: number; failed: number }>>(
      `/assignments/${assignmentId}/submissions/batch-grade`,
      { grades }
    )
    return response.data.data
  },

  /**
   * Request resubmission
   */
  requestResubmission: async (
    submissionId: number,
    feedback: string
  ): Promise<AssignmentSubmission> => {
    const response = await apiClient.post<APIResponse<AssignmentSubmission>>(
      `/submissions/${submissionId}/request-resubmission`,
      { feedback }
    )
    return response.data.data
  },

  // === Enhanced Gradebook ===

  /**
   * Get detailed class gradebook with all assignments
   */
  getClassGradebook: async (courseSectionId: number): Promise<ClassGradebookResponse> => {
    const response = await apiClient.get<APIResponse<ClassGradebookResponse>>(
      `/course-sections/${courseSectionId}/gradebook`
    )
    return response.data.data
  },

  /**
   * Export gradebook to CSV
   */
  exportGradebook: async (courseSectionId: number): Promise<Blob> => {
    const response = await apiClient.get(`/course-sections/${courseSectionId}/gradebook/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Finalize grades for a course section
   */
  finalizeGrades: async (courseSectionId: number): Promise<{ finalized: number }> => {
    const response = await apiClient.post<APIResponse<{ finalized: number }>>(
      `/course-sections/${courseSectionId}/gradebook/finalize`
    )
    return response.data.data
  },

  // === Course Materials Management ===

  /**
   * Get materials for a course section
   */
  getMaterials: async (courseSectionId: number): Promise<CourseMaterial[]> => {
    const response = await apiClient.get<APIResponse<CourseMaterial[]>>(
      `/course-sections/${courseSectionId}/materials`
    )
    return response.data.data
  },

  /**
   * Create a new course material
   */
  createMaterial: async (data: Partial<CourseMaterial>): Promise<CourseMaterial> => {
    const response = await apiClient.post<APIResponse<CourseMaterial>>('/course-materials', data)
    return response.data.data
  },

  /**
   * Update a course material
   */
  updateMaterial: async (materialId: number, data: Partial<CourseMaterial>): Promise<CourseMaterial> => {
    const response = await apiClient.put<APIResponse<CourseMaterial>>(`/course-materials/${materialId}`, data)
    return response.data.data
  },

  /**
   * Delete a course material
   */
  deleteMaterial: async (materialId: number): Promise<void> => {
    await apiClient.delete(`/course-materials/${materialId}`)
  },

  /**
   * Publish a course material
   */
  publishMaterial: async (materialId: number): Promise<CourseMaterial> => {
    const response = await apiClient.post<APIResponse<CourseMaterial>>(`/course-materials/${materialId}/publish`)
    return response.data.data
  },

  /**
   * Reorder materials
   */
  reorderMaterials: async (
    courseSectionId: number,
    materialIds: number[]
  ): Promise<void> => {
    await apiClient.post(`/course-sections/${courseSectionId}/materials/reorder`, {
      material_ids: materialIds,
    })
  },

  // === Announcements Management ===

  /**
   * Get announcements (all or filtered)
   */
  getAnnouncements: async (params?: {
    target_type?: 'university' | 'course_section' | 'department'
    target_id?: number
    visible_only?: boolean
  }): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>('/announcements', { params })
    return response.data.data
  },

  /**
   * Get announcements created by current staff
   */
  getMyAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>('/announcements/me/created')
    return response.data.data
  },

  /**
   * Get announcements for a course section
   */
  getSectionAnnouncements: async (courseSectionId: number): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>(
      `/course-sections/${courseSectionId}/announcements`
    )
    return response.data.data
  },

  /**
   * Create an announcement
   */
  createAnnouncement: async (data: {
    title: string
    content: string
    target_type?: 'course_section' | 'department'
    target_id?: number
    priority?: 'normal' | 'important' | 'urgent'
    is_published?: boolean
    published_at?: string
    expires_at?: string
    is_pinned?: boolean
  }): Promise<Announcement> => {
    const response = await apiClient.post<APIResponse<Announcement>>('/announcements', data)
    return response.data.data
  },

  /**
   * Update an announcement
   */
  updateAnnouncement: async (announcementId: number, data: Partial<Announcement>): Promise<Announcement> => {
    const response = await apiClient.put<APIResponse<Announcement>>(`/announcements/${announcementId}`, data)
    return response.data.data
  },

  /**
   * Delete an announcement
   */
  deleteAnnouncement: async (announcementId: number): Promise<void> => {
    await apiClient.delete(`/announcements/${announcementId}`)
  },

  /**
   * Publish an announcement
   */
  publishAnnouncement: async (announcementId: number): Promise<Announcement> => {
    const response = await apiClient.post<APIResponse<Announcement>>(`/announcements/${announcementId}/publish`)
    return response.data.data
  },

  /**
   * Unpublish an announcement
   */
  unpublishAnnouncement: async (announcementId: number): Promise<Announcement> => {
    const response = await apiClient.post<APIResponse<Announcement>>(`/announcements/${announcementId}/unpublish`)
    return response.data.data
  },

  /**
   * Pin an announcement
   */
  pinAnnouncement: async (announcementId: number): Promise<Announcement> => {
    const response = await apiClient.post<APIResponse<Announcement>>(`/announcements/${announcementId}/pin`)
    return response.data.data
  },

  /**
   * Unpin an announcement
   */
  unpinAnnouncement: async (announcementId: number): Promise<Announcement> => {
    const response = await apiClient.post<APIResponse<Announcement>>(`/announcements/${announcementId}/unpin`)
    return response.data.data
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
