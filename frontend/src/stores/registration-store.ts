import { create } from 'zustand'

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  instructor: string
  schedule: {
    days: string[]
    startTime: string
    endTime: string
  }
  enrollment: {
    current: number
    max: number
  }
  prerequisites: string[]
  description?: string
  section: string
  location: string
}

export interface ScheduleConflict {
  course1: Course
  course2: Course
  type: 'time' | 'prerequisite' | 'capacity'
  message: string
}

export interface PrerequisiteStatus {
  courseId: string
  met: boolean
  missing: string[]
}

interface RegistrationState {
  // Course selection
  selectedCourses: Course[]
  shoppingCart: Course[]

  // Validation
  conflicts: ScheduleConflict[]
  prerequisites: PrerequisiteStatus[]

  // Actions
  addToCart: (course: Course) => void
  removeFromCart: (courseId: string) => void
  moveToSelected: (courseId: string) => void
  moveToCart: (courseId: string) => void

  // Validation
  checkConflicts: () => void
  checkPrerequisites: (course: Course) => boolean

  // Utils
  clearAll: () => void
  getTotalCredits: () => number
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  selectedCourses: [],
  shoppingCart: [],
  conflicts: [],
  prerequisites: [],

  addToCart: (course) => {
    set((state) => ({
      shoppingCart: [...state.shoppingCart.filter(c => c.id !== course.id), course]
    }))
  },

  removeFromCart: (courseId) => {
    set((state) => ({
      shoppingCart: state.shoppingCart.filter(c => c.id !== courseId)
    }))
  },

  moveToSelected: (courseId) => {
    const { shoppingCart } = get()
    const course = shoppingCart.find(c => c.id === courseId)
    if (course) {
      set((state) => ({
        selectedCourses: [...state.selectedCourses, course],
        shoppingCart: state.shoppingCart.filter(c => c.id !== courseId)
      }))
      get().checkConflicts()
    }
  },

  moveToCart: (courseId) => {
    const { selectedCourses } = get()
    const course = selectedCourses.find(c => c.id === courseId)
    if (course) {
      set((state) => ({
        shoppingCart: [...state.shoppingCart, course],
        selectedCourses: state.selectedCourses.filter(c => c.id !== courseId)
      }))
      get().checkConflicts()
    }
  },

  checkConflicts: () => {
    const { selectedCourses } = get()
    const conflicts: ScheduleConflict[] = []

    // Check time conflicts
    for (let i = 0; i < selectedCourses.length; i++) {
      for (let j = i + 1; j < selectedCourses.length; j++) {
        const course1 = selectedCourses[i]
        const course2 = selectedCourses[j]

        // Check if days overlap
        const daysOverlap = course1.schedule.days.some(day =>
          course2.schedule.days.includes(day)
        )

        if (daysOverlap) {
          // Check if times overlap
          const start1 = new Date(`2024-01-01 ${course1.schedule.startTime}`)
          const end1 = new Date(`2024-01-01 ${course1.schedule.endTime}`)
          const start2 = new Date(`2024-01-01 ${course2.schedule.startTime}`)
          const end2 = new Date(`2024-01-01 ${course2.schedule.endTime}`)

          if (
            (start1 >= start2 && start1 < end2) ||
            (end1 > start2 && end1 <= end2) ||
            (start1 <= start2 && end1 >= end2)
          ) {
            conflicts.push({
              course1,
              course2,
              type: 'time',
              message: `${course1.code} and ${course2.code} have overlapping schedules`
            })
          }
        }
      }
    }

    set({ conflicts })
  },

  checkPrerequisites: (course) => {
    // Mock prerequisite check - in real app would check against completed courses
    const completedCourses = ['CS101', 'MATH101', 'ENG101'] // Mock completed courses

    const missing = course.prerequisites.filter(
      prereq => !completedCourses.includes(prereq)
    )

    const status: PrerequisiteStatus = {
      courseId: course.id,
      met: missing.length === 0,
      missing
    }

    set((state) => ({
      prerequisites: [
        ...state.prerequisites.filter(p => p.courseId !== course.id),
        status
      ]
    }))

    return status.met
  },

  clearAll: () => {
    set({
      selectedCourses: [],
      shoppingCart: [],
      conflicts: [],
      prerequisites: []
    })
  },

  getTotalCredits: () => {
    const { selectedCourses } = get()
    return selectedCourses.reduce((sum, course) => sum + course.credits, 0)
  }
}))