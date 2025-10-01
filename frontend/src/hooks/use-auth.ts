// Re-export auth hooks from context for convenience
export { useAuth, usePermission, useRole, type User } from '@/contexts/auth-context'

// Demo users for easy testing (keep this for convenience)
export const demoUsers = [
  {
    id: 1,
    name: "Dr. Elizabeth Harper",
    email: "admin@university.edu",
    role: "Administrator"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria@demo.com",
    role: "Student"
  },
  {
    id: 3,
    name: "David Park",
    email: "david@demo.com",
    role: "Student"
  },
  {
    id: 4,
    name: "Prof. Sarah Kim",
    email: "sarah.kim@university.edu",
    role: "Faculty"
  }
]