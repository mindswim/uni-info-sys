// Central export for all services
export { studentService, default as StudentService } from './student-service'
export { courseService, default as CourseService } from './course-service'
export { enrollmentService, default as EnrollmentService } from './enrollment-service'
export { facultyService, default as FacultyService } from './faculty-service'
export { adminService, default as AdminService } from './admin-service'

// Re-export types for convenience
export type * from '@/types/api-types'
