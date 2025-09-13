# University Admissions API Endpoints Reference

## Authentication
```http
POST /api/v1/tokens/create
Body: {
  "email": "student@university.edu",
  "password": "password",
  "device_name": "web-app"
}
Response: {
  "token": "1|laravel_sanctum_token_here..."
}
```

## Core Resources

### Students
```http
GET /api/v1/students
GET /api/v1/students/{id}
POST /api/v1/students
PUT /api/v1/students/{id}
DELETE /api/v1/students/{id}
POST /api/v1/students/{id}/restore (with soft deletes)
DELETE /api/v1/students/{id}/force (permanent delete)

# Example Response Structure:
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
      "roles": [
        {
          "id": 3,
          "name": "Student"
        }
      ]
    }
  }
}
```

### Enrollments (Complex Business Logic)
```http
GET /api/v1/enrollments?student_id=1&term_id=3&status=enrolled
POST /api/v1/enrollments
GET /api/v1/enrollments/{id}
PUT /api/v1/enrollments/{id}
DELETE /api/v1/enrollments/{id}

# Special endpoints:
POST /api/v1/enrollments/{id}/withdraw
POST /api/v1/enrollments/{id}/complete
GET /api/v1/students/{id}/enrollments
GET /api/v1/course-sections/{id}/enrollments
POST /api/v1/enrollments/swap

# Enrollment Response:
{
  "data": {
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
      "course": {
        "id": 1,
        "course_code": "CS101",
        "title": "Introduction to Programming",
        "credits": 3
      },
      "term": {
        "id": 1,
        "name": "Fall 2024",
        "academic_year": 2024,
        "semester": "Fall"
      },
      "instructor": {
        "id": 1,
        "job_title": "Associate Professor",
        "user": {
          "name": "Dr. John Smith"
        }
      },
      "room": {
        "id": 1,
        "room_number": "101",
        "building": {
          "name": "Science Hall"
        }
      }
    }
  }
}
```

### Admission Applications
```http
GET /api/v1/admission-applications
POST /api/v1/admission-applications
GET /api/v1/admission-applications/{id}
PUT /api/v1/admission-applications/{id}
DELETE /api/v1/admission-applications/{id}

# Nested program choices:
GET /api/v1/admission-applications/{id}/program-choices
POST /api/v1/admission-applications/{id}/program-choices
```

### Documents (File Upload)
```http
GET /api/v1/documents
POST /api/v1/documents (multipart/form-data)
GET /api/v1/documents/{id}
PUT /api/v1/documents/{id}
DELETE /api/v1/documents/{id}

# Upload constraints:
- File types: PDF, DOC, DOCX
- Max size: 5MB
- Supports versioning
```

### Academic Structure
```http
# Hierarchical: Faculty → Department → Program → Course → CourseSection

GET /api/v1/faculties
GET /api/v1/departments?faculty_id=1
GET /api/v1/programs?department_id=1
GET /api/v1/courses?department_id=1
GET /api/v1/course-sections?term_id=1&course_id=1
```

### Notifications
```http
GET /api/v1/notifications
POST /api/v1/notifications/{id}/read
```

### Roles & Permissions
```http
GET /api/v1/roles
GET /api/v1/permissions
POST /api/v1/roles/{role}/permissions

# Available Roles:
- Super Admin
- Admin
- Admissions Officer
- Faculty
- Student

# Key Permissions:
- roles.manage
- users.manage
- hierarchy.manage
- courses.manage
- students.manage
- enrollments.manage
- enrollments.manage.own
- grades.upload
- applications.manage
- documents.manage.own
```

### Bulk Operations
```http
POST /api/v1/imports/courses (CSV upload)
POST /api/v1/course-sections/{id}/import-grades (CSV upload)
```

### System
```http
GET /api/v1/health
GET /api/v1/metrics
```

## Error Response Format (RFC 7807)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 422,
  "detail": "The given data was invalid.",
  "instance": "/api/v1/students",
  "errors": {
    "field_name": ["Validation error message"]
  }
}

// Business Rule Violations include context:
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

## Pagination Format
```json
{
  "data": [...],
  "links": {
    "first": "http://localhost/api/v1/students?page=1",
    "last": "http://localhost/api/v1/students?page=10",
    "prev": null,
    "next": "http://localhost/api/v1/students?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "path": "http://localhost/api/v1/students",
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

## Business Rules from API

### Enrollment Rules
1. **Capacity Management**: When course is full → automatic waitlist
2. **Prerequisites**: Must be checked before enrollment
3. **Add/Drop Deadline**: Enforced by term.add_drop_deadline
4. **Waitlist Promotion**: FIFO based on created_at
5. **Enrollment Swap**: Atomic operation (drop + add)

### Application Rules
1. **One Draft**: Student can only have one draft application
2. **Status Flow**: draft → submitted → under_review → accepted/rejected
3. **Document Requirements**: Vary by program
4. **Multiple Program Choices**: Ranked preferences

### Grade Management
1. **Instructor Only**: Only assigned instructor can upload grades
2. **Audit Trail**: All grade changes tracked with reason
3. **Bulk Upload**: CSV format with student_id and grade

### Document Management
1. **Versioning**: New uploads create new versions
2. **Active Flag**: Only latest version is active
3. **File Types**: PDF, DOC, DOCX only
4. **Size Limit**: 5MB per file

## Authentication Headers
```javascript
// All API requests require:
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

// File uploads require:
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'multipart/form-data'
}
```