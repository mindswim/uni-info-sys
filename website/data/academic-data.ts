// This data aligns with the database schema for academic entities

export interface Faculty {
  id: number
  name: string
  code: string
  dean: string
  established_date: string
  building_code: string
  description: string
}

export interface Department {
  id: number
  faculty_id: number
  name: string
  code: string
  head: string
  office_location: string
  phone: string
  email: string
}

export interface Program {
  id: number
  department_id: number
  name: string
  code: string
  degree_level: "undergraduate" | "graduate" | "doctoral" | "certificate"
  duration: string
  credits: number
  tuition_per_credit: number
  description: string
  requirements?: string[]
}

export interface Course {
  id: number
  department_id: number
  course_code: string
  title: string
  credits: number
  description: string
  prerequisites: string[]
  offered_terms: string[]
}

export const faculties: Faculty[] = [
  {
    id: 1,
    name: "Chen School of Engineering & Technology",
    code: "ENG",
    dean: "Dr. Michael Chen",
    established_date: "1995-09-01",
    building_code: "ET",
    description: "Leading innovation in engineering education with state-of-the-art facilities and industry partnerships."
  },
  {
    id: 2,
    name: "Martinez Business School",
    code: "BUS",
    dean: "Dr. Sofia Martinez",
    established_date: "1993-09-01",
    building_code: "BUS",
    description: "Preparing tomorrow's business leaders with practical experience and global perspectives."
  },
  {
    id: 3,
    name: "College of Liberal Arts & Sciences",
    code: "LAS",
    dean: "Dr. James Wilson",
    established_date: "1991-09-01",
    building_code: "LA",
    description: "Fostering critical thinking and creative expression across humanities and sciences."
  },
  {
    id: 4,
    name: "Rivera School of Architecture & Design",
    code: "ARCH",
    dean: "Prof. Isabella Rivera",
    established_date: "1998-09-01",
    building_code: "ARC",
    description: "Shaping the built environment through innovative design and sustainable practices."
  },
  {
    id: 5,
    name: "Thompson School for Public Affairs",
    code: "PA",
    dean: "Dr. Robert Thompson",
    established_date: "2000-09-01",
    building_code: "LA",
    description: "Developing public service leaders committed to social justice and civic engagement."
  },
  {
    id: 6,
    name: "School of Health Sciences",
    code: "HS",
    dean: "Dr. Patricia Lee",
    established_date: "2010-09-01",
    building_code: "MED",
    description: "Advancing healthcare education through interdisciplinary collaboration and clinical excellence."
  }
]

export const departments: Department[] = [
  // Engineering & Technology
  { id: 1, faculty_id: 1, name: "Computer Science", code: "CS", head: "Dr. Alan Kay", office_location: "ET 501", phone: "(212) 555-3001", email: "cs@mindswim.edu" },
  { id: 2, faculty_id: 1, name: "Electrical Engineering", code: "EE", head: "Dr. Nikola Edison", office_location: "ET 401", phone: "(212) 555-3002", email: "ee@mindswim.edu" },
  { id: 3, faculty_id: 1, name: "Mechanical Engineering", code: "ME", head: "Dr. Marie Curie", office_location: "ET 301", phone: "(212) 555-3003", email: "me@mindswim.edu" },

  // Business School
  { id: 4, faculty_id: 2, name: "Finance", code: "FIN", head: "Prof. Warren Graham", office_location: "BUS 601", phone: "(212) 555-3101", email: "finance@mindswim.edu" },
  { id: 5, faculty_id: 2, name: "Marketing", code: "MKT", head: "Dr. Philip Kotler", office_location: "BUS 501", phone: "(212) 555-3102", email: "marketing@mindswim.edu" },
  { id: 6, faculty_id: 2, name: "Management", code: "MGT", head: "Dr. Peter Drucker", office_location: "BUS 401", phone: "(212) 555-3103", email: "management@mindswim.edu" },

  // Liberal Arts & Sciences
  { id: 7, faculty_id: 3, name: "Mathematics", code: "MATH", head: "Dr. Carl Gauss", office_location: "NAC 801", phone: "(212) 555-3201", email: "math@mindswim.edu" },
  { id: 8, faculty_id: 3, name: "Biology", code: "BIO", head: "Dr. Charles Darwin", office_location: "SB 501", phone: "(212) 555-3202", email: "biology@mindswim.edu" },
  { id: 9, faculty_id: 3, name: "English", code: "ENG", head: "Prof. Maya Angelou", office_location: "LA 401", phone: "(212) 555-3203", email: "english@mindswim.edu" },
  { id: 10, faculty_id: 3, name: "Psychology", code: "PSY", head: "Dr. Sigmund Freud", office_location: "LA 301", phone: "(212) 555-3204", email: "psychology@mindswim.edu" },
]

export const programs: Program[] = [
  // Computer Science Programs
  {
    id: 1,
    department_id: 1,
    name: "Bachelor of Science in Computer Science",
    code: "BS-CS",
    degree_level: "undergraduate",
    duration: "4 years",
    credits: 120,
    tuition_per_credit: 850,
    description: "Comprehensive program covering software development, algorithms, AI, and systems.",
    requirements: ["High school diploma", "SAT/ACT scores", "3.0 GPA minimum", "Math through pre-calculus"]
  },
  {
    id: 2,
    department_id: 1,
    name: "Master of Science in Computer Science",
    code: "MS-CS",
    degree_level: "graduate",
    duration: "2 years",
    credits: 36,
    tuition_per_credit: 1200,
    description: "Advanced study in computer science with specializations in AI, cybersecurity, or data science.",
    requirements: ["Bachelor's degree in CS or related field", "3.0 GPA", "GRE scores", "Letters of recommendation"]
  },

  // Business Programs
  {
    id: 3,
    department_id: 4,
    name: "Bachelor of Business Administration",
    code: "BBA",
    degree_level: "undergraduate",
    duration: "4 years",
    credits: 120,
    tuition_per_credit: 900,
    description: "Comprehensive business education with concentrations in finance, marketing, or management.",
    requirements: ["High school diploma", "SAT/ACT scores", "2.8 GPA minimum"]
  },
  {
    id: 4,
    department_id: 4,
    name: "Master of Business Administration",
    code: "MBA",
    degree_level: "graduate",
    duration: "2 years",
    credits: 60,
    tuition_per_credit: 1500,
    description: "Executive MBA program for working professionals with weekend and evening options.",
    requirements: ["Bachelor's degree", "3+ years work experience", "GMAT/GRE scores", "Professional references"]
  },

  // Engineering Programs
  {
    id: 5,
    department_id: 2,
    name: "Bachelor of Science in Electrical Engineering",
    code: "BS-EE",
    degree_level: "undergraduate",
    duration: "4 years",
    credits: 128,
    tuition_per_credit: 950,
    description: "ABET-accredited program in electrical engineering with focus on power systems and electronics."
  },

  // Certificate Programs
  {
    id: 6,
    department_id: 1,
    name: "Certificate in Data Science",
    code: "CERT-DS",
    degree_level: "certificate",
    duration: "1 year",
    credits: 18,
    tuition_per_credit: 800,
    description: "Professional certificate covering machine learning, statistics, and big data analytics."
  }
]

export const sampleCourses: Course[] = [
  // Computer Science Courses
  {
    id: 1,
    department_id: 1,
    course_code: "CS101",
    title: "Introduction to Computer Science",
    credits: 3,
    description: "Fundamental concepts of programming and computational thinking.",
    prerequisites: [],
    offered_terms: ["Fall", "Spring", "Summer"]
  },
  {
    id: 2,
    department_id: 1,
    course_code: "CS201",
    title: "Data Structures",
    credits: 3,
    description: "Arrays, linked lists, trees, graphs, and algorithm analysis.",
    prerequisites: ["CS101"],
    offered_terms: ["Fall", "Spring"]
  },
  {
    id: 3,
    department_id: 1,
    course_code: "CS301",
    title: "Algorithms",
    credits: 3,
    description: "Design and analysis of efficient algorithms for complex problems.",
    prerequisites: ["CS201", "MATH201"],
    offered_terms: ["Fall", "Spring"]
  },

  // Math Courses
  {
    id: 4,
    department_id: 7,
    course_code: "MATH101",
    title: "Calculus I",
    credits: 4,
    description: "Limits, derivatives, and applications of differential calculus.",
    prerequisites: [],
    offered_terms: ["Fall", "Spring", "Summer"]
  },
  {
    id: 5,
    department_id: 7,
    course_code: "MATH201",
    title: "Discrete Mathematics",
    credits: 3,
    description: "Logic, sets, relations, graphs, and combinatorics for computer science.",
    prerequisites: ["MATH101"],
    offered_terms: ["Fall", "Spring"]
  },

  // Business Courses
  {
    id: 6,
    department_id: 4,
    course_code: "FIN101",
    title: "Introduction to Finance",
    credits: 3,
    description: "Financial markets, investments, and corporate finance fundamentals.",
    prerequisites: [],
    offered_terms: ["Fall", "Spring"]
  },
  {
    id: 7,
    department_id: 5,
    course_code: "MKT101",
    title: "Principles of Marketing",
    credits: 3,
    description: "Marketing strategy, consumer behavior, and market research.",
    prerequisites: [],
    offered_terms: ["Fall", "Spring"]
  }
]

export function getFacultyByCode(code: string): Faculty | undefined {
  return faculties.find(f => f.code === code)
}

export function getDepartmentsByFaculty(facultyId: number): Department[] {
  return departments.filter(d => d.faculty_id === facultyId)
}

export function getProgramsByDepartment(departmentId: number): Program[] {
  return programs.filter(p => p.department_id === departmentId)
}

export function getCoursesByDepartment(departmentId: number): Course[] {
  return sampleCourses.filter(c => c.department_id === departmentId)
}

export function formatTuition(credits: number, perCreditCost: number): string {
  const total = credits * perCreditCost
  return `$${total.toLocaleString()}`
}