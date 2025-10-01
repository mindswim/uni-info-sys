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
      '/students/me/enrollments',
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
}

export default studentService
