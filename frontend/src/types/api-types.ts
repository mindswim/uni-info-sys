// API Response Types
export interface APIResponse<T> {
  data: T
  message?: string
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface APIError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// User & Authentication Types
export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
  expires_at?: string
}

// Student Types
export interface Student {
  id: number
  student_number: string
  user_id: number
  first_name: string
  last_name: string
  preferred_name?: string
  pronouns?: string
  date_of_birth: string
  gender?: string
  nationality?: string

  // Contact Information
  email?: string
  phone: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string

  // Academic Information
  gpa: number
  total_credits_earned: number
  credits_in_progress: number
  semester_gpa?: number
  academic_status: string
  class_standing: string
  enrollment_status: string
  expected_graduation_date?: string
  admission_date?: string

  // Program Information
  major_program_id?: number
  minor_program_id?: number
  major_program?: Program
  minor_program?: Program

  // Test Scores
  sat_score?: number
  act_score?: number
  high_school?: string
  high_school_graduation_year?: number

  // Emergency Contacts
  emergency_contact_name: string
  emergency_contact_phone: string
  parent_guardian_name?: string
  parent_guardian_phone?: string

  // Financial
  receives_financial_aid: boolean
  financial_hold: boolean

  // Relationships
  user?: User
  enrollments?: Enrollment[]
  academic_records?: AcademicRecord[]
  documents?: Document[]

  // Timestamps
  created_at: string
  updated_at: string
}

// Staff Types
export interface Staff {
  id: number
  user_id: number
  staff_number: string
  job_title: string
  department_id?: number
  hire_date: string
  office_location?: string
  office_phone?: string

  // Relationships
  user?: User
  department?: Department

  // Timestamps
  created_at: string
  updated_at: string
}

// Course Types
export interface Course {
  id: number
  course_code: string
  course_number?: string
  title: string
  description: string
  credits: number
  level?: string
  prerequisites?: string
  department_id: number

  // Relationships
  department?: Department
  course_sections?: CourseSection[]
  prerequisite_courses?: Course[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface CourseSection {
  id: number
  course_id: number
  section_number: string
  term_id: number
  instructor_id: number
  room_id?: number
  capacity: number
  enrolled_count?: number
  waitlist_count?: number
  status: 'open' | 'closed' | 'cancelled' | 'waitlist'
  schedule_days: string[]
  start_time: string
  end_time: string
  start_date?: string
  end_date?: string

  // Relationships
  course?: Course
  term?: Term
  instructor?: Staff
  room?: Room
  enrollments?: Enrollment[]

  // Timestamps
  created_at: string
  updated_at: string
}

// Enrollment Types
export interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  status: 'enrolled' | 'dropped' | 'withdrawn' | 'completed' | 'waitlisted'
  enrollment_date: string
  drop_date?: string
  grade?: string
  grade_points?: number
  credits_earned?: number

  // Relationships
  student?: Student
  course_section?: CourseSection

  // Timestamps
  created_at: string
  updated_at: string
}

// Academic Record Types
export interface AcademicRecord {
  id: number
  student_id: number
  term_id: number
  course_code: string
  course_title: string
  credits: number
  grade: string
  grade_points: number
  term_gpa?: number
  cumulative_gpa?: number

  // Relationships
  student?: Student
  term?: Term

  // Timestamps
  created_at: string
  updated_at: string
}

// Academic Structure Types
export interface Faculty {
  id: number
  name: string
  code: string
  description?: string
  dean_id?: number

  // Relationships
  departments?: Department[]
  dean?: Staff

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  name: string
  code: string
  abbreviation?: string
  faculty_id: number
  head_id?: number
  description?: string

  // Relationships
  faculty?: Faculty
  head?: Staff
  programs?: Program[]
  courses?: Course[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Program {
  id: number
  name: string
  code: string
  type: 'major' | 'minor' | 'certificate'
  degree_type: 'BA' | 'BS' | 'MA' | 'MS' | 'PhD' | 'Certificate'
  department_id: number
  credits_required: number
  description?: string

  // Relationships
  department?: Department
  degree_requirements?: DegreeRequirement[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface DegreeRequirement {
  id: number
  program_id: number
  category: string
  credits_required: number
  description?: string
  courses?: string[]

  // Relationships
  program?: Program

  // Timestamps
  created_at: string
  updated_at: string
}

// Term Types
export interface Term {
  id: number
  name: string
  academic_year: number
  semester: 'Fall' | 'Spring' | 'Summer' | 'Winter'
  start_date: string
  end_date: string
  registration_start?: string
  registration_end?: string
  is_current: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

// Infrastructure Types
export interface Building {
  id: number
  name: string
  code: string
  address?: string
  description?: string

  // Relationships
  rooms?: Room[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  type: string
  capacity: number
  features?: string[]

  // Relationships
  building?: Building
  course_sections?: CourseSection[]

  // Timestamps
  created_at: string
  updated_at: string
}

// Admission Types
export interface AdmissionApplication {
  id: number
  student_id: number
  term_id: number
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted'
  application_date: string
  decision_date?: string
  decision_notes?: string

  // Relationships
  student?: Student
  term?: Term
  program_choices?: ProgramChoice[]
  documents?: Document[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProgramChoice {
  id: number
  admission_application_id: number
  program_id: number
  preference_order: number

  // Relationships
  admission_application?: AdmissionApplication
  program?: Program

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  student_id?: number
  admission_application_id?: number
  document_type: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by?: number
  verified: boolean
  verified_at?: string
  verified_by?: number
  notes?: string

  // Timestamps
  created_at: string
  updated_at: string
}

// Role & Permission Types
export interface Role {
  id: number
  name: string
  display_name?: string
  description?: string

  // Relationships
  permissions?: Permission[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Permission {
  id: number
  name: string
  display_name?: string
  description?: string

  // Timestamps
  created_at: string
  updated_at: string
}

// Query Parameter Types
export interface PaginationParams {
  page?: number
  per_page?: number
  limit?: number
}

export interface SortParams {
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  filter?: Record<string, any>
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// Course Query Params
export interface CourseQueryParams extends QueryParams {
  department_id?: number
  department?: string
  level?: string
  term_id?: number
  instructor_id?: number
  status?: string
}

// Student Query Params
export interface StudentQueryParams extends QueryParams {
  program_id?: number
  class_standing?: string
  enrollment_status?: string
  academic_status?: string
}

// Enrollment Query Params
export interface EnrollmentQueryParams extends QueryParams {
  student_id?: number
  course_section_id?: number
  term_id?: number
  status?: string
}

// Specialized Response Types
export interface TranscriptResponse {
  student: Student
  terms: Array<{
    term: Term
    courses: AcademicRecord[]
    term_gpa: number
    credits_earned: number
  }>
  cumulative_gpa: number
  total_credits: number
  generated_at: string
}

export interface ScheduleResponse {
  student: Student
  term: Term
  enrollments: Array<{
    enrollment: Enrollment
    course_section: CourseSection
    course: Course
    instructor: Staff
    room: Room
  }>
}

export interface GradebookResponse {
  course_section: CourseSection
  course: Course
  enrollments: Array<{
    student: Student
    enrollment: Enrollment
    grade?: string
    attendance_count?: number
  }>
  statistics: {
    enrolled: number
    average_grade?: number
    grade_distribution: Record<string, number>
  }
}
