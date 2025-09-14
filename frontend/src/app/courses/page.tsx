"use client"

import { AppShell } from "@/components/layout/app-shell"
import { CoursesTable } from "@/components/data-table/courses-table"
import { Course, TableData } from "@/types/university"

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science including programming basics, algorithms, and problem-solving techniques.",
    credits: 3,
    level: "undergraduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 1,
        course_id: 1,
        section_number: "001",
        term_id: 1,
        instructor_id: 1,
        max_enrollment: 30,
        current_enrollment: 28,
        status: "open",
        schedule: "MWF 9:00-10:00",
        room_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        course_id: 1,
        section_number: "002",
        term_id: 1,
        instructor_id: 2,
        max_enrollment: 30,
        current_enrollment: 30,
        status: "closed",
        schedule: "TTh 2:00-3:30",
        room_id: 2,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 2,
    code: "CS201",
    name: "Data Structures and Algorithms",
    description: "Comprehensive study of data structures and algorithms including arrays, linked lists, trees, graphs, and sorting algorithms.",
    credits: 4,
    level: "undergraduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science"
      }
    ],
    course_sections: [
      {
        id: 3,
        course_id: 2,
        section_number: "001",
        term_id: 1,
        instructor_id: 1,
        max_enrollment: 25,
        current_enrollment: 22,
        status: "open",
        schedule: "MWF 11:00-12:00",
        room_id: 1,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 3,
    code: "MATH101",
    name: "Calculus I",
    description: "Differential and integral calculus of functions of one variable.",
    credits: 4,
    level: "undergraduate",
    department_id: 2,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 2,
      name: "Mathematics",
      code: "MATH",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 4,
        course_id: 3,
        section_number: "001",
        term_id: 1,
        instructor_id: 3,
        max_enrollment: 35,
        current_enrollment: 32,
        status: "open",
        schedule: "MWF 8:00-9:00",
        room_id: 3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      },
      {
        id: 5,
        course_id: 3,
        section_number: "002",
        term_id: 1,
        instructor_id: 4,
        max_enrollment: 35,
        current_enrollment: 30,
        status: "open",
        schedule: "TTh 10:00-11:30",
        room_id: 4,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 4,
    code: "CS501",
    name: "Advanced Machine Learning",
    description: "Advanced topics in machine learning including deep learning, neural networks, and AI applications.",
    credits: 3,
    level: "graduate",
    department_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 1,
      name: "Computer Science",
      code: "CS",
      faculty_id: 1,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 2,
        code: "CS201",
        name: "Data Structures and Algorithms"
      },
      {
        id: 5,
        code: "CS301",
        name: "Statistics and Probability"
      }
    ],
    course_sections: [
      {
        id: 6,
        course_id: 4,
        section_number: "001",
        term_id: 1,
        instructor_id: 5,
        max_enrollment: 15,
        current_enrollment: 12,
        status: "open",
        schedule: "MW 3:00-4:30",
        room_id: 5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 5,
    code: "ENG101",
    name: "English Composition",
    description: "Introduction to academic writing and critical thinking skills.",
    credits: 3,
    level: "undergraduate",
    department_id: 3,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 3,
      name: "English Literature",
      code: "ENG",
      faculty_id: 3,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [],
    course_sections: [
      {
        id: 7,
        course_id: 5,
        section_number: "001",
        term_id: 1,
        instructor_id: 6,
        max_enrollment: 20,
        current_enrollment: 18,
        status: "open",
        schedule: "TTh 1:00-2:30",
        room_id: 6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    id: 6,
    code: "PHYS201",
    name: "Classical Mechanics",
    description: "Principles of classical mechanics including kinematics, dynamics, and conservation laws.",
    credits: 4,
    level: "undergraduate",
    department_id: 4,
    is_active: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    department: {
      id: 4,
      name: "Physics",
      code: "PHYS",
      faculty_id: 2,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    prerequisites: [
      {
        id: 3,
        code: "MATH101",
        name: "Calculus I"
      }
    ],
    course_sections: []
  }
]

const mockTableData: TableData<Course> = {
  data: mockCourses,
  total: 6,
  page: 1,
  per_page: 25,
  last_page: 1
}

const mockUser = {
  name: "Dr. Elizabeth Harper",
  email: "admin@demo.com", 
  role: "Administrator",
  avatar: "/avatars/admin.jpg"
}

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Courses" }
]

export default function CoursesPage() {
  const handleCourseSelect = (course: Course) => {
    console.log("Selected course:", course.code)
  }

  const handleCourseView = (course: Course) => {
    console.log("View course:", course.code)
  }

  const handleCourseEdit = (course: Course) => {
    console.log("Edit course:", course.code)
  }

  const handleCourseDelete = (course: Course) => {
    console.log("Delete course:", course.code)
  }

  return (
    <AppShell user={mockUser} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <CoursesTable
          data={mockTableData}
          loading={false}
          onCourseSelect={handleCourseSelect}
          onCourseView={handleCourseView}
          onCourseEdit={handleCourseEdit}
          onCourseDelete={handleCourseDelete}
        />
      </div>
    </AppShell>
  )
}