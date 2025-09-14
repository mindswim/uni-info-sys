"use client"

import { AppShell } from "@/components/layout/app-shell"
import { CourseSectionsTable } from "@/components/data-table/course-sections-table"
import { CourseSection, TableData } from "@/types/university"

// Mock data for course sections
const mockCourseSections: CourseSection[] = [
  {
    id: 1,
    course_id: 1,
    term_id: 1,
    instructor_id: 1,
    room_id: 1,
    section_number: "001",
    capacity: 30,
    schedule_days: ["M", "W", "F"],
    start_time: "10:00",
    end_time: "11:00",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    course: {
      id: 1,
      course_code: "CS101",
      title: "Introduction to Computer Science",
      credits: 3,
      department_id: 1,
      prerequisites: [],
      description: "Fundamental concepts of computer science and programming",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    term: {
      id: 1,
      name: "Fall 2025",
      start_date: "2025-08-25",
      end_date: "2025-12-15",
      add_drop_deadline: "2025-09-08",
      registration_start: "2025-07-01",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    instructor: {
      id: 1,
      employee_id: "CS001",
      first_name: "Dr. Alan",
      last_name: "Turing",
      title: "Professor",
      email: "turing@university.edu",
      phone: "(555) 0201",
      hire_date: "2018-08-15",
      department_id: 1,
      salary: 85000,
      is_active: true,
      created_at: "2018-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    room: {
      id: 1,
      building_id: 1,
      room_number: "101",
      capacity: 35,
      type: "classroom",
      equipment: ["projector", "whiteboard", "computers"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      building: {
        id: 1,
        name: "Science Building",
        code: "SCI",
        address: "123 University Ave",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    },
    enrolled_count: 28,
    available_spots: 2,
    waitlist_count: 5
  },
  {
    id: 2,
    course_id: 1,
    term_id: 1,
    instructor_id: 2,
    room_id: 2,
    section_number: "002",
    capacity: 25,
    schedule_days: ["T", "R"],
    start_time: "14:00",
    end_time: "15:30",
    status: "full",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    course: {
      id: 1,
      course_code: "CS101",
      title: "Introduction to Computer Science",
      credits: 3,
      department_id: 1,
      prerequisites: [],
      description: "Fundamental concepts of computer science and programming",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    term: {
      id: 1,
      name: "Fall 2025",
      start_date: "2025-08-25",
      end_date: "2025-12-15",
      add_drop_deadline: "2025-09-08",
      registration_start: "2025-07-01",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    instructor: {
      id: 2,
      employee_id: "CS002",
      first_name: "Dr. Ada",
      last_name: "Lovelace",
      title: "Associate Professor",
      email: "lovelace@university.edu",
      phone: "(555) 0202",
      hire_date: "2019-01-15",
      department_id: 1,
      salary: 78000,
      is_active: true,
      created_at: "2019-01-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    room: {
      id: 2,
      building_id: 1,
      room_number: "102",
      capacity: 30,
      type: "laboratory",
      equipment: ["computers", "network", "projector"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      building: {
        id: 1,
        name: "Science Building",
        code: "SCI",
        address: "123 University Ave",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    },
    enrolled_count: 25,
    available_spots: 0,
    waitlist_count: 8
  },
  {
    id: 3,
    course_id: 2,
    term_id: 1,
    instructor_id: 1,
    room_id: 3,
    section_number: "001",
    capacity: 20,
    schedule_days: ["M", "W", "F"],
    start_time: "09:00",
    end_time: "10:00",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    course: {
      id: 2,
      course_code: "CS201",
      title: "Data Structures and Algorithms",
      credits: 4,
      department_id: 1,
      prerequisites: ["CS101"],
      description: "Advanced programming concepts with data structures",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    term: {
      id: 1,
      name: "Fall 2025",
      start_date: "2025-08-25",
      end_date: "2025-12-15",
      add_drop_deadline: "2025-09-08",
      registration_start: "2025-07-01",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    instructor: {
      id: 1,
      employee_id: "CS001",
      first_name: "Dr. Alan",
      last_name: "Turing",
      title: "Professor",
      email: "turing@university.edu",
      phone: "(555) 0201",
      hire_date: "2018-08-15",
      department_id: 1,
      salary: 85000,
      is_active: true,
      created_at: "2018-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    room: {
      id: 3,
      building_id: 2,
      room_number: "205",
      capacity: 25,
      type: "classroom",
      equipment: ["projector", "whiteboard"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      building: {
        id: 2,
        name: "Engineering Building",
        code: "ENG",
        address: "456 Campus Drive",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    },
    enrolled_count: 18,
    available_spots: 2,
    waitlist_count: 0
  },
  {
    id: 4,
    course_id: 3,
    term_id: 1,
    instructor_id: 3,
    room_id: 4,
    section_number: "001",
    capacity: 35,
    schedule_days: ["M", "W"],
    start_time: "11:00",
    end_time: "12:30",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    course: {
      id: 3,
      course_code: "MATH201",
      title: "Calculus II",
      credits: 4,
      department_id: 2,
      prerequisites: ["MATH101"],
      description: "Integral calculus and series",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    term: {
      id: 1,
      name: "Fall 2025",
      start_date: "2025-08-25",
      end_date: "2025-12-15",
      add_drop_deadline: "2025-09-08",
      registration_start: "2025-07-01",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    instructor: {
      id: 3,
      employee_id: "MATH001",
      first_name: "Dr. Emmy",
      last_name: "Noether",
      title: "Professor",
      email: "noether@university.edu",
      phone: "(555) 0301",
      hire_date: "2017-08-15",
      department_id: 2,
      salary: 88000,
      is_active: true,
      created_at: "2017-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    room: {
      id: 4,
      building_id: 1,
      room_number: "301",
      capacity: 40,
      type: "auditorium",
      equipment: ["projector", "microphone", "podium"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      building: {
        id: 1,
        name: "Science Building",
        code: "SCI",
        address: "123 University Ave",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    },
    enrolled_count: 32,
    available_spots: 3,
    waitlist_count: 2
  },
  {
    id: 5,
    course_id: 4,
    term_id: 2,
    instructor_id: 4,
    room_id: 5,
    section_number: "001",
    capacity: 15,
    schedule_days: ["T", "R"],
    start_time: "16:00",
    end_time: "17:30",
    status: "cancelled",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    course: {
      id: 4,
      course_code: "ENG301",
      title: "Advanced Literature Analysis",
      credits: 3,
      department_id: 3,
      prerequisites: ["ENG201"],
      description: "Critical analysis of literary works",
      is_active: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    term: {
      id: 2,
      name: "Spring 2026",
      start_date: "2026-01-15",
      end_date: "2026-05-15",
      add_drop_deadline: "2026-01-28",
      registration_start: "2025-11-01",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    instructor: {
      id: 4,
      employee_id: "ENG001",
      first_name: "Dr. Virginia",
      last_name: "Woolf",
      title: "Associate Professor",
      email: "woolf@university.edu",
      phone: "(555) 0401",
      hire_date: "2020-08-15",
      department_id: 3,
      salary: 72000,
      is_active: true,
      created_at: "2020-08-15T09:00:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    room: {
      id: 5,
      building_id: 3,
      room_number: "150",
      capacity: 20,
      type: "classroom",
      equipment: ["whiteboard"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      building: {
        id: 3,
        name: "Humanities Building",
        code: "HUM",
        address: "789 Liberal Arts Way",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z"
      }
    },
    enrolled_count: 0,
    available_spots: 15,
    waitlist_count: 0
  }
]

const mockTableData: TableData<CourseSection> = {
  data: mockCourseSections,
  total: 5,
  page: 1,
  per_page: 25,
  last_page: 1
}


const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Course Sections" }
]

export default function CourseSectionsPage() {
  const handleSectionSelect = (section: CourseSection) => {
    console.log("Selected section:", section.section_number)
  }

  const handleSectionView = (section: CourseSection) => {
    console.log("View section:", section.section_number)
  }

  const handleSectionEdit = (section: CourseSection) => {
    console.log("Edit section:", section.section_number)
  }

  const handleSectionDelete = (section: CourseSection) => {
    console.log("Delete section:", section.section_number)
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <CourseSectionsTable
          data={mockTableData}
          loading={false}
          onSectionSelect={handleSectionSelect}
          onSectionView={handleSectionView}
          onSectionEdit={handleSectionEdit}
          onSectionDelete={handleSectionDelete}
        />
      </div>
    </AppShell>
  )
}