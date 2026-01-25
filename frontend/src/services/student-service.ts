import { apiClient } from '@/lib/api-client'
import type {
  Student,
  APIResponse,
  PaginatedResponse,
  StudentQueryParams,
  AcademicRecord,
  Enrollment,
  TranscriptResponse,
  Document,
  Assignment,
  AssignmentSubmission,
  CourseMaterial,
  Announcement,
  StudentGradebookResponse,
} from '@/types/api-types'

/**
 * Student Service
 * Handles all student-related API calls
 */
export const studentService = {
  /**
   * Get all students with optional filters
   */
  getAll: async (params?: StudentQueryParams): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>('/students', { params })
    return response.data
  },

  /**
   * Get a single student by ID
   */
  getById: async (id: number): Promise<Student> => {
    const response = await apiClient.get<APIResponse<Student>>(`/students/${id}`)
    return response.data.data
  },

  /**
   * Get current authenticated student profile
   */
  getCurrentProfile: async (): Promise<Student> => {
    const response = await apiClient.get<APIResponse<Student>>('/students/me')
    return response.data.data
  },

  /**
   * Create a new student
   */
  create: async (data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.post<APIResponse<Student>>('/students', data)
    return response.data.data
  },

  /**
   * Update a student
   */
  update: async (id: number, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put<APIResponse<Student>>(`/students/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a student
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`)
  },

  /**
   * Get student's enrollments
   */
  getEnrollments: async (id: number, termId?: number): Promise<Enrollment[]> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<Enrollment[]>>(
      `/students/${id}/enrollments`,
      { params }
    )
    return response.data.data
  },

  /**
   * Get current student's enrollments
   */
  getCurrentEnrollments: async (termId?: number): Promise<Enrollment[]> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<Enrollment[]>>(
      '/enrollments/me',
      { params }
    )
    return response.data.data
  },

  /**
   * Get student's academic records
   */
  getAcademicRecords: async (id: number): Promise<AcademicRecord[]> => {
    const response = await apiClient.get<APIResponse<AcademicRecord[]>>(
      `/students/${id}/academic-records`
    )
    return response.data.data
  },

  /**
   * Get current student's academic records
   */
  getCurrentAcademicRecords: async (): Promise<AcademicRecord[]> => {
    const response = await apiClient.get<APIResponse<AcademicRecord[]>>(
      '/students/me/academic-records'
    )
    return response.data.data
  },

  /**
   * Get student's transcript
   */
  getTranscript: async (id: number): Promise<TranscriptResponse> => {
    const response = await apiClient.get<APIResponse<TranscriptResponse>>(
      `/students/${id}/transcript`
    )
    return response.data.data
  },

  /**
   * Get current student's transcript
   */
  getCurrentTranscript: async (): Promise<TranscriptResponse> => {
    const response = await apiClient.get<APIResponse<TranscriptResponse>>(
      '/students/me/transcript'
    )
    return response.data.data
  },

  /**
   * Get student's documents
   */
  getDocuments: async (id: number): Promise<Document[]> => {
    const response = await apiClient.get<APIResponse<Document[]>>(
      `/students/${id}/documents`
    )
    return response.data.data
  },

  /**
   * Upload a document for student
   */
  uploadDocument: async (
    id: number,
    file: File,
    documentType: string
  ): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await apiClient.post<APIResponse<Document>>(
      `/students/${id}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  /**
   * Get student statistics
   */
  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/students/statistics')
    return response.data.data
  },

  /**
   * Search students by query
   */
  search: async (query: string): Promise<Student[]> => {
    const response = await apiClient.get<APIResponse<Student[]>>('/students/search', {
      params: { q: query },
    })
    return response.data.data
  },

  // === Assignments ===

  /**
   * Get assignments for a course section (student view - published only)
   */
  getAssignments: async (courseSectionId: number): Promise<Assignment[]> => {
    const response = await apiClient.get<APIResponse<Assignment[]>>(
      `/course-sections/${courseSectionId}/assignments`,
      { params: { published_only: true } }
    )
    return response.data.data
  },

  /**
   * Get all assignments for current student's enrollments
   */
  getMyAssignments: async (): Promise<Array<{
    enrollment: Enrollment
    assignments: Assignment[]
  }>> => {
    const response = await apiClient.get<APIResponse<any>>('/students/me/assignments')
    return response.data.data
  },

  /**
   * Get upcoming assignments across all enrolled courses
   */
  getUpcomingAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<APIResponse<Assignment[]>>(
      '/students/me/assignments/upcoming'
    )
    return response.data.data
  },

  // === Submissions ===

  /**
   * Submit an assignment
   */
  submitAssignment: async (
    assignmentId: number,
    data: { content?: string; file?: File }
  ): Promise<AssignmentSubmission> => {
    const formData = new FormData()
    if (data.content) formData.append('content', data.content)
    if (data.file) formData.append('file', data.file)

    const response = await apiClient.post<APIResponse<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data
  },

  /**
   * Resubmit an assignment
   */
  resubmitAssignment: async (
    submissionId: number,
    data: { content?: string; file?: File }
  ): Promise<AssignmentSubmission> => {
    const formData = new FormData()
    if (data.content) formData.append('content', data.content)
    if (data.file) formData.append('file', data.file)

    const response = await apiClient.post<APIResponse<AssignmentSubmission>>(
      `/submissions/${submissionId}/resubmit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data
  },

  /**
   * Get student's submissions for an assignment
   */
  getMySubmissions: async (assignmentId: number): Promise<AssignmentSubmission[]> => {
    const response = await apiClient.get<APIResponse<AssignmentSubmission[]>>(
      `/assignments/${assignmentId}/submissions/me`
    )
    return response.data.data
  },

  /**
   * Get a specific submission
   */
  getSubmission: async (submissionId: number): Promise<AssignmentSubmission> => {
    const response = await apiClient.get<APIResponse<AssignmentSubmission>>(
      `/submissions/${submissionId}`
    )
    return response.data.data
  },

  // === Gradebook ===

  /**
   * Get student's gradebook for an enrollment
   */
  getGradebook: async (enrollmentId: number): Promise<StudentGradebookResponse> => {
    const response = await apiClient.get<APIResponse<StudentGradebookResponse>>(
      `/enrollments/${enrollmentId}/gradebook`
    )
    return response.data.data
  },

  /**
   * Get grades summary for all current enrollments
   */
  getGradesSummary: async (): Promise<Array<{
    enrollment: Enrollment
    current_grade: {
      percentage: number
      letter_grade: string
    }
  }>> => {
    const response = await apiClient.get<APIResponse<any>>('/students/me/grades')
    return response.data.data
  },

  // === Course Materials ===

  /**
   * Get materials for a course section (published only)
   */
  getMaterials: async (courseSectionId: number): Promise<CourseMaterial[]> => {
    const response = await apiClient.get<APIResponse<CourseMaterial[]>>(
      `/course-sections/${courseSectionId}/materials`,
      { params: { published_only: true } }
    )
    return response.data.data
  },

  /**
   * Get all materials for current student's enrollments
   */
  getAllMaterials: async (): Promise<Array<{
    enrollment: Enrollment
    materials: CourseMaterial[]
  }>> => {
    const response = await apiClient.get<APIResponse<any>>('/students/me/materials')
    return response.data.data
  },

  // === Announcements ===

  /**
   * Get announcements relevant to current student
   */
  getMyAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>('/announcements/me')
    return response.data.data
  },

  /**
   * Get university-wide announcements
   */
  getUniversityAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>(
      '/announcements/university-wide'
    )
    return response.data.data
  },

  /**
   * Get announcements for a specific course section
   */
  getSectionAnnouncements: async (courseSectionId: number): Promise<Announcement[]> => {
    const response = await apiClient.get<APIResponse<Announcement[]>>(
      `/course-sections/${courseSectionId}/announcements`
    )
    return response.data.data
  },
}

export default studentService
