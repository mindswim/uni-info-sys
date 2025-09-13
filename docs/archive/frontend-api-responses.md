# Frontend Development Guide - API Responses & Data Structures

**Generated:** $(date)  
**Purpose:** Complete API response examples for frontend development team

## Core User Data Structures

### GET /api/v1/students/{id}

**Student Resource Structure:**
```json
{
  "data": {
    "id": 1,
    "user_id": 2,
    "student_id": "STU2024001",
    "status": "active",
    "enrollment_date": "2024-09-01",
    "graduation_date": null,
    "gpa": 3.75,
    "total_credits": 45,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z",
    "user": {
      "id": 2,
      "name": "Maria Rodriguez",
      "email": "maria@demo.com",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "roles": [
        {
          "id": 3,
          "name": "Student",
          "created_at": "2024-01-15T10:30:00.000000Z",
          "updated_at": "2024-01-15T10:30:00.000000Z"
        }
      ]
    }
  }
}
```

### GET /api/v1/staff/{id}

**Staff Resource Structure:**
```json
{
  "data": {
    "id": 1,
    "user_id": 5,
    "department_id": 1,
    "job_title": "Associate Professor",
    "bio": "Dr. Smith specializes in computer science and artificial intelligence research.",
    "office_location": "Building A, Room 205",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z",
    "user": {
      "id": 5,
      "name": "Dr. John Smith",
      "email": "john.smith@university.edu",
      "email_verified_at": "2024-01-15T10:30:00.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "roles": [
        {
          "id": 2,
          "name": "Staff",
          "created_at": "2024-01-15T10:30:00.000000Z",
          "updated_at": "2024-01-15T10:30:00.000000Z"
        }
      ]
    },
    "department": {
      "id": 1,
      "faculty_id": 1,
      "code": "CS",
      "name": "Computer Science",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  }
}
```

## Dashboard Data

### GET /api/v1/students/{id}/enrollments

**Student Enrollments with Relationships:**
```json
{
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "course_section_id": 1,
      "status": "enrolled",
      "enrollment_date": "2024-08-15T09:00:00.000000Z",
      "grade": null,
      "grade_points": null,
      "waitlist_position": null,
      "reason_for_change": null,
      "created_at": "2024-08-15T09:00:00.000000Z",
      "updated_at": "2024-08-15T09:00:00.000000Z",
      "course_section": {
        "id": 1,
        "course_id": 1,
        "term_id": 1,
        "instructor_id": 1,
        "room_id": 1,
        "section_number": "001",
        "capacity": 30,
        "enrolled_count": 25,
        "waitlisted_count": 3,
        "status": "open",
        "schedule_days": ["Monday", "Wednesday", "Friday"],
        "start_time": "10:00:00",
        "end_time": "11:00:00",
        "add_drop_deadline": "2024-09-15T23:59:59.000000Z",
        "withdrawal_deadline": "2024-11-01T23:59:59.000000Z",
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "course": {
          "id": 1,
          "department_id": 1,
          "course_code": "CS101",
          "title": "Introduction to Programming",
          "description": "A comprehensive course covering fundamental programming concepts.",
          "credits": 3,
          "prerequisites": [],
          "created_at": "2024-01-15T10:30:00.000000Z",
          "updated_at": "2024-01-15T10:30:00.000000Z"
        },
        "term": {
          "id": 1,
          "name": "Fall 2024",
          "academic_year": 2024,
          "semester": "Fall",
          "start_date": "2024-09-01",
          "end_date": "2024-12-15",
          "created_at": "2024-01-15T10:30:00.000000Z",
          "updated_at": "2024-01-15T10:30:00.000000Z"
        },
        "instructor": {
          "id": 1,
          "user_id": 5,
          "department_id": 1,
          "job_title": "Associate Professor",
          "bio": "Dr. Smith specializes in computer science.",
          "office_location": "Building A, Room 205",
          "user": {
            "id": 5,
            "name": "Dr. John Smith",
            "email": "john.smith@university.edu"
          }
        },
        "room": {
          "id": 1,
          "building_id": 1,
          "room_number": "101",
          "capacity": 40,
          "type": "classroom",
          "building": {
            "id": 1,
            "name": "Science Hall",
            "address": "123 University Ave"
          }
        }
      }
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/students/1/enrollments?page=1",
    "last": "http://localhost/api/v1/students/1/enrollments?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [],
    "path": "http://localhost/api/v1/students/1/enrollments",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### GET /api/v1/notifications

**Notifications Structure:**
```json
{
  "data": [
    {
      "id": "9d2e4c8a-1234-5678-9abc-123456789def",
      "type": "App\\Notifications\\ApplicationStatusUpdated",
      "notifiable_type": "App\\Models\\User",
      "notifiable_id": 2,
      "data": {
        "application_id": 1,
        "old_status": "submitted",
        "new_status": "accepted",
        "message": "Your application has been accepted! Welcome to the program."
      },
      "read_at": null,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ]
}
```

## List Data (Tables)

### GET /api/v1/courses

**Course List with Pagination:**
```json
{
  "data": [
    {
      "id": 1,
      "department_id": 1,
      "course_code": "CS101",
      "title": "Introduction to Programming",
      "description": "A comprehensive course covering fundamental programming concepts and practical applications.",
      "credits": 3,
      "prerequisites": [],
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "department": {
        "id": 1,
        "faculty_id": 1,
        "code": "CS",
        "name": "Computer Science",
        "faculty": {
          "id": 1,
          "name": "Faculty of Engineering"
        }
      }
    },
    {
      "id": 2,
      "department_id": 1,
      "course_code": "CS201",
      "title": "Data Structures",
      "description": "Advanced programming concepts focusing on data structures and algorithms.",
      "credits": 3,
      "prerequisites": [
        {
          "id": 1,
          "course_code": "CS101",
          "title": "Introduction to Programming"
        }
      ],
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "department": {
        "id": 1,
        "faculty_id": 1,
        "code": "CS",
        "name": "Computer Science",
        "faculty": {
          "id": 1,
          "name": "Faculty of Engineering"
        }
      }
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/courses?page=1",
    "last": "http://localhost/api/v1/courses?page=3",
    "prev": null,
    "next": "http://localhost/api/v1/courses?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://localhost/api/v1/courses?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "http://localhost/api/v1/courses?page=2",
        "label": "2",
        "active": false
      }
    ],
    "path": "http://localhost/api/v1/courses",
    "per_page": 15,
    "to": 15,
    "total": 35
  }
}
```

### GET /api/v1/admission-applications

**Admission Applications List:**
```json
{
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "term_id": 1,
      "status": "submitted",
      "submitted_at": "2024-01-10T14:30:00.000000Z",
      "reviewed_at": null,
      "decision_date": null,
      "personal_statement": "I am passionate about computer science and eager to contribute to your program...",
      "academic_history": "Graduated from XYZ High School with honors...",
      "extracurricular_activities": "President of Programming Club, Volunteer at local coding bootcamp...",
      "created_at": "2024-01-08T10:30:00.000000Z",
      "updated_at": "2024-01-10T14:30:00.000000Z",
      "student": {
        "id": 1,
        "user_id": 2,
        "student_id": "STU2024001",
        "status": "active",
        "user": {
          "id": 2,
          "name": "Maria Rodriguez",
          "email": "maria@demo.com"
        }
      },
      "term": {
        "id": 1,
        "name": "Fall 2024",
        "academic_year": 2024,
        "semester": "Fall",
        "start_date": "2024-09-01",
        "end_date": "2024-12-15"
      },
      "program_choices": [
        {
          "id": 1,
          "admission_application_id": 1,
          "program_id": 1,
          "preference_order": 1,
          "status": "pending",
          "program": {
            "id": 1,
            "department_id": 1,
            "name": "Bachelor of Computer Science",
            "degree_level": "bachelor",
            "duration": 4,
            "department": {
              "id": 1,
              "code": "CS",
              "name": "Computer Science"
            }
          }
        }
      ]
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/admission-applications?page=1",
    "last": "http://localhost/api/v1/admission-applications?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [],
    "path": "http://localhost/api/v1/admission-applications",
    "per_page": 15,
    "to": 5,
    "total": 5
  }
}
```

### GET /api/v1/course-sections (with filters)

**Course Sections with Full Relationships:**
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "term_id": 1,
      "instructor_id": 1,
      "room_id": 1,
      "section_number": "001",
      "capacity": 30,
      "enrolled_count": 25,
      "waitlisted_count": 3,
      "status": "open",
      "schedule_days": ["Monday", "Wednesday", "Friday"],
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "add_drop_deadline": "2024-09-15T23:59:59.000000Z",
      "withdrawal_deadline": "2024-11-01T23:59:59.000000Z",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "course": {
        "id": 1,
        "department_id": 1,
        "course_code": "CS101",
        "title": "Introduction to Programming",
        "description": "A comprehensive course covering fundamental programming concepts.",
        "credits": 3,
        "prerequisites": [],
        "department": {
          "id": 1,
          "faculty_id": 1,
          "code": "CS",
          "name": "Computer Science",
          "faculty": {
            "id": 1,
            "name": "Faculty of Engineering"
          }
        }
      },
      "term": {
        "id": 1,
        "name": "Fall 2024",
        "academic_year": 2024,
        "semester": "Fall",
        "start_date": "2024-09-01",
        "end_date": "2024-12-15"
      },
      "instructor": {
        "id": 1,
        "user_id": 5,
        "department_id": 1,
        "job_title": "Associate Professor",
        "bio": "Dr. Smith specializes in computer science and artificial intelligence research.",
        "office_location": "Building A, Room 205",
        "user": {
          "id": 5,
          "name": "Dr. John Smith",
          "email": "john.smith@university.edu"
        }
      },
      "room": {
        "id": 1,
        "building_id": 1,
        "room_number": "101",
        "capacity": 40,
        "type": "classroom",
        "building": {
          "id": 1,
          "name": "Science Hall",
          "address": "123 University Ave"
        }
      },
      "enrollments": [
        {
          "id": 1,
          "student_id": 1,
          "status": "enrolled",
          "enrollment_date": "2024-08-15T09:00:00.000000Z",
          "grade": null,
          "waitlist_position": null,
          "student": {
            "id": 1,
            "student_id": "STU2024001",
            "user": {
              "id": 2,
              "name": "Maria Rodriguez",
              "email": "maria@demo.com"
            }
          }
        }
      ]
    }
  ],
  "links": {
    "first": "http://localhost/api/v1/course-sections?page=1",
    "last": "http://localhost/api/v1/course-sections?page=2",
    "prev": null,
    "next": "http://localhost/api/v1/course-sections?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 2,
    "links": [],
    "path": "http://localhost/api/v1/course-sections",
    "per_page": 15,
    "to": 15,
    "total": 30
  }
}
```

## Error Response Formats

### Validation Errors (422)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 422,
  "detail": "The given data was invalid.",
  "instance": "/api/v1/students",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field is required.", "The email must be a valid email address."],
    "student_id": ["The student id has already been taken."]
  }
}
```

### Business Rule Violations (400)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Business Rule Violation",
  "status": 400,
  "detail": "Course section has reached maximum capacity",
  "instance": "/api/v1/enrollments",
  "context": {
    "course_section_id": 1,
    "current_capacity": 30,
    "max_capacity": 30,
    "waitlist_available": true
  }
}
```

### Not Found Errors (404)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "The requested student could not be found.",
  "instance": "/api/v1/students/999"
}
```

### Unauthorized Access (403)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to access this resource.",
  "instance": "/api/v1/students/2"
}
```

## Important Notes for Frontend Development

### Status Enums
- **Student Status:** `active`, `inactive`, `graduated`, `withdrawn`
- **Enrollment Status:** `enrolled`, `waitlisted`, `withdrawn`, `completed`
- **Application Status:** `draft`, `submitted`, `under_review`, `accepted`, `rejected`, `deferred`
- **Course Section Status:** `open`, `closed`, `cancelled`, `full`

### Date Formats
- All dates are in ISO 8601 format with timezone: `2024-01-15T10:30:00.000000Z`
- Date-only fields use: `2024-01-15`
- Time-only fields use: `10:30:00`

### Pagination
- All list endpoints support pagination with `page` and `per_page` parameters
- Default `per_page` is 15, maximum is 100
- Pagination metadata follows Laravel conventions

### Filtering
Most list endpoints support filtering:
- `?status=active` - Filter by status
- `?department_id=1` - Filter by department
- `?term_id=1` - Filter by term
- `?student_id=1` - Filter by student (where applicable)

### Relationships
Use `?include=` parameter to load relationships:
- `?include=user,department,course` - Load multiple relationships
- Available relationships are documented in each model's API resource 