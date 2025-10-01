import { apiClient } from '@/lib/api-client'
import type {
  User,
  Faculty,
  Department,
  Program,
  Term,
  Building,
  Room,
  Role,
  Permission,
  AdmissionApplication,
  APIResponse,
  PaginatedResponse,
  QueryParams,
} from '@/types/api-types'

/**
 * Admin Service
 * Handles all administrative and system management API calls
 */
export const adminService = {
  // === User Management ===

  /**
   * Get all users
   */
  getAllUsers: async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params })
    return response.data
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<APIResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  /**
   * Create a new user
   */
  createUser: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post<APIResponse<User>>('/users', data)
    return response.data.data
  },

  /**
   * Update a user
   */
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<APIResponse<User>>(`/users/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  /**
   * Get all students
   */
  getStudents: async (params?: QueryParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/students', { params })
    return response.data
  },

  // === Academic Structure Management ===

  /**
   * Get all faculties
   */
  getAllFaculties: async (params?: QueryParams): Promise<PaginatedResponse<Faculty>> => {
    const response = await apiClient.get<PaginatedResponse<Faculty>>('/faculties', { params })
    return response.data
  },

  /**
   * Create a faculty
   */
  createFaculty: async (data: Partial<Faculty>): Promise<Faculty> => {
    const response = await apiClient.post<APIResponse<Faculty>>('/faculties', data)
    return response.data.data
  },

  /**
   * Update a faculty
   */
  updateFaculty: async (id: number, data: Partial<Faculty>): Promise<Faculty> => {
    const response = await apiClient.put<APIResponse<Faculty>>(`/faculties/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a faculty
   */
  deleteFaculty: async (id: number): Promise<void> => {
    await apiClient.delete(`/faculties/${id}`)
  },

  /**
   * Get all departments
   */
  getAllDepartments: async (params?: QueryParams): Promise<PaginatedResponse<Department>> => {
    const response = await apiClient.get<PaginatedResponse<Department>>('/departments', {
      params,
    })
    return response.data
  },

  /**
   * Create a department
   */
  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.post<APIResponse<Department>>('/departments', data)
    return response.data.data
  },

  /**
   * Update a department
   */
  updateDepartment: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.put<APIResponse<Department>>(`/departments/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a department
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`)
  },

  /**
   * Get all programs
   */
  getAllPrograms: async (params?: QueryParams): Promise<PaginatedResponse<Program>> => {
    const response = await apiClient.get<PaginatedResponse<Program>>('/programs', { params })
    return response.data
  },

  /**
   * Create a program
   */
  createProgram: async (data: Partial<Program>): Promise<Program> => {
    const response = await apiClient.post<APIResponse<Program>>('/programs', data)
    return response.data.data
  },

  /**
   * Update a program
   */
  updateProgram: async (id: number, data: Partial<Program>): Promise<Program> => {
    const response = await apiClient.put<APIResponse<Program>>(`/programs/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a program
   */
  deleteProgram: async (id: number): Promise<void> => {
    await apiClient.delete(`/programs/${id}`)
  },

  // === Term Management ===

  /**
   * Get all terms
   */
  getAllTerms: async (params?: QueryParams): Promise<PaginatedResponse<Term>> => {
    const response = await apiClient.get<PaginatedResponse<Term>>('/terms', { params })
    return response.data
  },

  /**
   * Get current term
   */
  getCurrentTerm: async (): Promise<Term> => {
    const response = await apiClient.get<APIResponse<Term>>('/terms/current')
    return response.data.data
  },

  /**
   * Create a term
   */
  createTerm: async (data: Partial<Term>): Promise<Term> => {
    const response = await apiClient.post<APIResponse<Term>>('/terms', data)
    return response.data.data
  },

  /**
   * Update a term
   */
  updateTerm: async (id: number, data: Partial<Term>): Promise<Term> => {
    const response = await apiClient.put<APIResponse<Term>>(`/terms/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a term
   */
  deleteTerm: async (id: number): Promise<void> => {
    await apiClient.delete(`/terms/${id}`)
  },

  // === Building & Room Management ===

  /**
   * Get all buildings
   */
  getAllBuildings: async (params?: QueryParams): Promise<PaginatedResponse<Building>> => {
    const response = await apiClient.get<PaginatedResponse<Building>>('/buildings', { params })
    return response.data
  },

  /**
   * Create a building
   */
  createBuilding: async (data: Partial<Building>): Promise<Building> => {
    const response = await apiClient.post<APIResponse<Building>>('/buildings', data)
    return response.data.data
  },

  /**
   * Update a building
   */
  updateBuilding: async (id: number, data: Partial<Building>): Promise<Building> => {
    const response = await apiClient.put<APIResponse<Building>>(`/buildings/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a building
   */
  deleteBuilding: async (id: number): Promise<void> => {
    await apiClient.delete(`/buildings/${id}`)
  },

  /**
   * Get all rooms
   */
  getAllRooms: async (params?: QueryParams): Promise<PaginatedResponse<Room>> => {
    const response = await apiClient.get<PaginatedResponse<Room>>('/rooms', { params })
    return response.data
  },

  /**
   * Create a room
   */
  createRoom: async (data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.post<APIResponse<Room>>('/rooms', data)
    return response.data.data
  },

  /**
   * Update a room
   */
  updateRoom: async (id: number, data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.put<APIResponse<Room>>(`/rooms/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a room
   */
  deleteRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },

  // === Role & Permission Management ===

  /**
   * Get all roles
   */
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<APIResponse<Role[]>>('/roles')
    return response.data.data
  },

  /**
   * Create a role
   */
  createRole: async (data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post<APIResponse<Role>>('/roles', data)
    return response.data.data
  },

  /**
   * Update a role
   */
  updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<APIResponse<Role>>(`/roles/${id}`, data)
    return response.data.data
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`)
  },

  /**
   * Get all permissions
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<APIResponse<Permission[]>>('/permissions')
    return response.data.data
  },

  /**
   * Assign role to user
   */
  assignRole: async (userId: number, roleId: number): Promise<void> => {
    await apiClient.post(`/users/${userId}/roles`, { role_id: roleId })
  },

  /**
   * Remove role from user
   */
  removeRole: async (userId: number, roleId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/roles/${roleId}`)
  },

  /**
   * Assign permission to role
   */
  assignPermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.post(`/roles/${roleId}/permissions`, { permission_id: permissionId })
  },

  /**
   * Remove permission from role
   */
  removePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`)
  },

  // === Admission Management ===

  /**
   * Get all admission applications
   */
  getAllApplications: async (params?: QueryParams): Promise<PaginatedResponse<AdmissionApplication>> => {
    const response = await apiClient.get<PaginatedResponse<AdmissionApplication>>(
      '/admission-applications',
      { params }
    )
    return response.data
  },

  /**
   * Get application by ID
   */
  getApplicationById: async (id: number): Promise<AdmissionApplication> => {
    const response = await apiClient.get<APIResponse<AdmissionApplication>>(
      `/admission-applications/${id}`
    )
    return response.data.data
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (
    id: number,
    status: string,
    notes?: string
  ): Promise<AdmissionApplication> => {
    const response = await apiClient.put<APIResponse<AdmissionApplication>>(
      `/admission-applications/${id}/status`,
      { status, notes }
    )
    return response.data.data
  },

  // === System Statistics & Reports ===

  /**
   * Get system dashboard statistics
   */
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/admin/dashboard/statistics')
    return response.data.data
  },

  /**
   * Get enrollment statistics
   */
  getEnrollmentStats: async (termId?: number): Promise<any> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<any>>('/admin/statistics/enrollments', {
      params,
    })
    return response.data.data
  },

  /**
   * Get student statistics
   */
  getStudentStats: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/admin/statistics/students')
    return response.data.data
  },

  /**
   * Get course statistics
   */
  getCourseStats: async (termId?: number): Promise<any> => {
    const params = termId ? { term_id: termId } : {}
    const response = await apiClient.get<APIResponse<any>>('/admin/statistics/courses', {
      params,
    })
    return response.data.data
  },

  /**
   * Export data to CSV
   */
  exportData: async (type: string, params?: QueryParams): Promise<Blob> => {
    const response = await apiClient.get(`/admin/export/${type}`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  // === System Health & Monitoring ===

  /**
   * Get system health check
   */
  getHealth: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/health')
    return response.data.data
  },

  /**
   * Get system metrics
   */
  getMetrics: async (): Promise<any> => {
    const response = await apiClient.get<APIResponse<any>>('/metrics')
    return response.data.data
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params?: QueryParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/admin/audit-logs', {
      params,
    })
    return response.data
  },
}

export default adminService
