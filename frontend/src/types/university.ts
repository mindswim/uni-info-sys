// Core entity types based on Laravel models
export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  password_algorithm?: string
  created_at: string
  updated_at: string
  // Relations
  roles?: Role[]
  staff?: Staff
  student?: Student
  // Computed fields
  role_names?: string[]
  all_permissions?: Permission[]
}

export interface Role {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  // Relations
  users?: User[]
  permissions?: Permission[]
  // Computed fields
  user_count?: number
  permission_count?: number
}

export interface Permission {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  // Relations
  roles?: Role[]
  // Computed fields
  role_count?: number
}

export interface AcademicRecord {
  id: number
  student_id: number
  institution_name: string
  qualification_type: 'high_school' | 'bachelor' | 'master' | 'phd' | 'diploma' | 'certificate'
  gpa: number
  max_gpa: number
  graduation_date?: string
  is_verified: boolean
  verification_date?: string
  created_at: string
  updated_at: string
  // Relations
  student?: Student
}

export interface Document {
  id: number
  student_id: number
  document_type: 'transcript' | 'recommendation' | 'personal_statement' | 'test_scores' | 'id_document' | 'other'
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  is_verified: boolean
  version: number
  created_at: string
  updated_at: string
  // Relations
  student?: Student
}

export interface ProgramChoice {
  id: number
  admission_application_id: number
  program_id: number
  preference_order: number
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted'
  created_at: string
  updated_at: string
  // Relations
  admission_application?: AdmissionApplication
  program?: Program
}

export interface Student {
  id: number
  user_id: number
  student_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  emergency_contact_name: string
  emergency_contact_phone: string
  created_at: string
  updated_at: string
  // Relations
  user?: User
  enrollments?: Enrollment[]
  admission_applications?: AdmissionApplication[]
}

export interface Staff {
  id: number
  user_id: number
  staff_number: string
  department_id: number
  first_name: string
  last_name: string
  phone: string
  office_location: string
  created_at: string
  updated_at: string
  // Relations
  user?: User
  department?: Department
}

export interface Faculty {
  id: number
  name: string
  code: string
  dean_id?: number
  description?: string
  created_at: string
  updated_at: string
  // Relations
  departments?: Department[]
}

export interface Department {
  id: number
  faculty_id: number
  name: string
  code: string
  head_id?: number
  description?: string
  created_at: string
  updated_at: string
  // Relations
  faculty?: Faculty
  programs?: Program[]
  courses?: Course[]
}

export interface Program {
  id: number
  department_id: number
  name: string
  code: string
  degree_type: 'bachelor' | 'master' | 'phd' | 'certificate'
  duration_years: number
  credits_required: number
  description?: string
  created_at: string
  updated_at: string
  // Relations
  department?: Department
}

export interface Course {
  id: number
  department_id: number
  code: string
  title: string
  description?: string
  credits: number
  prerequisites?: string
  created_at: string
  updated_at: string
  // Relations
  department?: Department
  course_sections?: CourseSection[]
}

export interface CourseSection {
  id: number
  course_id: number
  term_id: number
  section_number: string
  instructor_id?: number
  room_id?: number
  schedule_days: string
  schedule_time: string
  capacity: number
  enrolled_count: number
  status: 'open' | 'closed' | 'cancelled'
  created_at: string
  updated_at: string
  // Relations
  course?: Course
  term?: Term
  instructor?: Staff
  room?: Room
  enrollments?: Enrollment[]
}

export interface Enrollment {
  id: number
  student_id: number
  course_section_id: number
  status: 'enrolled' | 'waitlisted' | 'completed' | 'withdrawn'
  grade?: string
  enrollment_date: string
  completion_date?: string
  created_at: string
  updated_at: string
  // Relations
  student?: Student
  course_section?: CourseSection
}

export interface AdmissionApplication {
  id: number
  student_id: number
  term_id: number
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted'
  application_date: string
  decision_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  student?: Student
  term?: Term
  program_choices?: ProgramChoice[]
}

export interface ProgramChoice {
  id: number
  admission_application_id: number
  program_id: number
  priority: number
  created_at: string
  updated_at: string
  // Relations
  admission_application?: AdmissionApplication
  program?: Program
}

export interface Term {
  id: number
  name: string
  type: 'fall' | 'spring' | 'summer' | 'winter'
  year: number
  start_date: string
  end_date: string
  registration_start: string
  registration_end: string
  created_at: string
  updated_at: string
}

export interface Building {
  id: number
  name: string
  code: string
  address: string
  created_at: string
  updated_at: string
  // Relations
  rooms?: Room[]
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  capacity: number
  room_type: 'classroom' | 'lab' | 'office' | 'auditorium' | 'other'
  created_at: string
  updated_at: string
  // Relations
  building?: Building
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface Permission {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

// Data table types
export interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

// Missing interfaces for Course Sections and related entities
export interface Term {
  id: number
  name: string
  start_date: string
  end_date: string
  add_drop_deadline: string
  registration_start: string
  created_at: string
  updated_at: string
}

export interface Building {
  id: number
  name: string
  code: string
  address: string
  created_at: string
  updated_at: string
  rooms?: Room[]
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  capacity: number
  type: 'classroom' | 'laboratory' | 'office' | 'auditorium' | 'library' | 'other'
  equipment?: string[]
  created_at: string
  updated_at: string
  building?: Building
}

export interface CourseSection {
  id: number
  course_id: number
  term_id: number
  instructor_id: number
  room_id: number
  section_number: string
  capacity: number
  schedule_days: string[]
  start_time: string
  end_time: string
  status: 'active' | 'cancelled' | 'full'
  created_at: string
  updated_at: string
  // Relations
  course?: Course
  term?: Term
  instructor?: Staff
  room?: Room
  enrollments?: Enrollment[]
  // Computed fields
  enrolled_count?: number
  available_spots?: number
  waitlist_count?: number
}

export interface TableData<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  last_page: number
}

export interface TableFilters {
  search?: string
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  page?: number
  filters?: Record<string, any>
}

// Status badge variants
export type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface StatusConfig {
  label: string
  variant: StatusVariant
  className?: string
}