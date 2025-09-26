// This data aligns with the database schema for buildings, rooms, and facilities

export interface Building {
  id: number
  code: string
  name: string
  address: string
  floors: number
  has_elevator: boolean
  has_parking: boolean
  accessibility_features: string[]
  year_built: number
  departments?: string[]
  facilities?: string[]
}

export interface Room {
  id: number
  building_id: number
  room_number: string
  capacity: number
  type: "classroom" | "lab" | "lecture_hall" | "seminar" | "office" | "conference" | "study"
  features: string[]
  equipment?: string[]
}

export const buildings: Building[] = [
  {
    id: 1,
    code: "NAC",
    name: "North Academic Center",
    address: "515 West 181st Street",
    floors: 8,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Wheelchair accessible", "Automatic doors", "Accessible restrooms", "Braille signage"],
    year_built: 1991,
    departments: ["Mathematics", "Computer Science", "Physics"],
    facilities: ["Computer labs", "Research labs", "Lecture halls", "Study lounges"]
  },
  {
    id: 2,
    code: "SB",
    name: "Science Building",
    address: "520 West 181st Street",
    floors: 6,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Wheelchair accessible", "Accessible labs", "Height-adjustable workstations"],
    year_built: 1995,
    departments: ["Biology", "Chemistry", "Environmental Science"],
    facilities: ["Research labs", "Greenhouse", "Equipment rooms", "Chemical storage"]
  },
  {
    id: 3,
    code: "ET",
    name: "Chen School of Engineering & Technology",
    address: "525 West 181st Street",
    floors: 10,
    has_elevator: true,
    has_parking: true,
    accessibility_features: ["Full ADA compliance", "Accessible maker spaces", "Assistive technology"],
    year_built: 2005,
    departments: ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
    facilities: ["Maker space", "3D printing lab", "Robotics lab", "Wind tunnel", "Clean room"]
  },
  {
    id: 4,
    code: "LA",
    name: "Liberal Arts Building",
    address: "510 West 181st Street",
    floors: 5,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Wheelchair accessible", "Hearing loops in classrooms"],
    year_built: 1998,
    departments: ["English", "History", "Philosophy", "Languages"],
    facilities: ["Language labs", "Writing center", "Seminar rooms", "Faculty offices"]
  },
  {
    id: 5,
    code: "BUS",
    name: "Martinez Business School",
    address: "530 West 181st Street",
    floors: 7,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Full accessibility", "Adjustable desks", "Screen readers"],
    year_built: 2010,
    departments: ["Finance", "Marketing", "Management", "Accounting"],
    facilities: ["Trading floor", "Case study rooms", "Bloomberg terminal lab", "Executive education center"]
  },
  {
    id: 6,
    code: "ARC",
    name: "Rivera School of Architecture",
    address: "535 West 181st Street",
    floors: 4,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Accessible studios", "Height-adjustable drafting tables"],
    year_built: 2008,
    departments: ["Architecture", "Urban Planning", "Interior Design"],
    facilities: ["Design studios", "Fabrication lab", "Materials library", "Exhibition gallery"]
  },
  {
    id: 7,
    code: "SC",
    name: "Student Center",
    address: "515 West 180th Street",
    floors: 4,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Full accessibility", "Accessible dining", "Quiet rooms"],
    year_built: 2015,
    departments: [],
    facilities: ["Main dining hall", "Food court", "Bookstore", "Student organization offices", "Event spaces"]
  },
  {
    id: 8,
    code: "LIB",
    name: "Cohen Library",
    address: "518 West 181st Street",
    floors: 6,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Accessible workstations", "Assistive technology center", "Large print materials"],
    year_built: 2000,
    departments: [],
    facilities: ["24/7 study space", "Group study rooms", "Computer commons", "Archives", "Media center"]
  },
  {
    id: 9,
    code: "MAC",
    name: "Mindswim Athletic Center",
    address: "540 West 179th Street",
    floors: 3,
    has_elevator: true,
    has_parking: true,
    accessibility_features: ["Accessible gym equipment", "Pool lift", "Accessible locker rooms"],
    year_built: 2012,
    departments: [],
    facilities: ["Basketball courts", "Swimming pool", "Fitness center", "Rock climbing wall", "Indoor track"]
  },
  {
    id: 10,
    code: "PA",
    name: "Performing Arts Center",
    address: "505 West 181st Street",
    floors: 3,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Wheelchair seating", "Assistive listening devices", "Accessible backstage"],
    year_built: 2018,
    departments: ["Music", "Theater", "Dance"],
    facilities: ["800-seat theater", "Black box theater", "Dance studios", "Music practice rooms", "Recording studio"]
  },
  {
    id: 11,
    code: "TH",
    name: "Thompson Hall",
    address: "500 West 180th Street",
    floors: 5,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Accessible dorm rooms", "Visual fire alarms", "Accessible bathrooms"],
    year_built: 2003,
    departments: [],
    facilities: ["Residence hall", "Study lounges", "Laundry", "Kitchen facilities", "Community spaces"]
  },
  {
    id: 12,
    code: "MED",
    name: "Health Sciences Building",
    address: "545 West 181st Street",
    floors: 8,
    has_elevator: true,
    has_parking: false,
    accessibility_features: ["Full ADA compliance", "Accessible simulation labs"],
    year_built: 2020,
    departments: ["Nursing", "Public Health", "Pre-Medical Studies"],
    facilities: ["Simulation labs", "Anatomy lab", "Clinical skills center", "Research labs"]
  }
]

export const sampleRooms: Room[] = [
  // North Academic Center rooms
  { id: 1, building_id: 1, room_number: "101", capacity: 300, type: "lecture_hall", features: ["Projector", "Audio system", "Recording capability"], equipment: ["Smart board", "Document camera"] },
  { id: 2, building_id: 1, room_number: "201", capacity: 40, type: "classroom", features: ["Whiteboard", "Projector"], equipment: ["Computer station"] },
  { id: 3, building_id: 1, room_number: "301", capacity: 30, type: "lab", features: ["Computers", "Software suite"], equipment: ["3D printers", "Servers"] },

  // Engineering Building rooms
  { id: 4, building_id: 3, room_number: "100", capacity: 50, type: "lab", features: ["Workbenches", "Tool storage"], equipment: ["Oscilloscopes", "Soldering stations", "3D printers"] },
  { id: 5, building_id: 3, room_number: "405", capacity: 20, type: "seminar", features: ["Round table", "Video conferencing"], equipment: ["Smart TV", "Whiteboard"] },

  // Library study rooms
  { id: 6, building_id: 8, room_number: "G01", capacity: 8, type: "study", features: ["Whiteboard", "Power outlets"], equipment: ["Monitor for presentations"] },
  { id: 7, building_id: 8, room_number: "G02", capacity: 6, type: "study", features: ["Quiet zone", "Natural light"], equipment: [] },
]

export const academicTerms = [
  { id: 1, name: "Fall 2024", start_date: "2024-09-01", end_date: "2024-12-20", registration_start: "2024-04-15", registration_end: "2024-08-15" },
  { id: 2, name: "Spring 2025", start_date: "2025-01-15", end_date: "2025-05-15", registration_start: "2024-10-15", registration_end: "2025-01-05" },
  { id: 3, name: "Summer 2025", start_date: "2025-06-01", end_date: "2025-08-15", registration_start: "2025-03-01", registration_end: "2025-05-20" },
]

export const buildingHours = {
  academic: { weekday: "7:00 AM - 11:00 PM", weekend: "8:00 AM - 8:00 PM" },
  library: { weekday: "24/7", weekend: "24/7" },
  athletic: { weekday: "6:00 AM - 11:00 PM", weekend: "7:00 AM - 10:00 PM" },
  dining: { weekday: "7:00 AM - 9:00 PM", weekend: "8:00 AM - 8:00 PM" },
  residential: { weekday: "24/7", weekend: "24/7" }
}

export function getBuildingByCode(code: string): Building | undefined {
  return buildings.find(b => b.code === code)
}

export function getRoomsByBuilding(buildingId: number): Room[] {
  return sampleRooms.filter(r => r.building_id === buildingId)
}

export function formatRoomLocation(buildingCode: string, roomNumber: string): string {
  return `${buildingCode} ${roomNumber}`
}