# Role & Permission Structure

**Generated:** $(date)  
**Purpose:** Complete RBAC system documentation for frontend development team

## Overview

The system uses a comprehensive Role-Based Access Control (RBAC) system with granular permissions. Users can have multiple roles, and each role can have multiple permissions.

## GET /api/v1/roles (with permissions included)

**Complete Role Structure:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "description": "Full system access, including the ability to manage other admins and system-level settings",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "permissions": [
        {
          "id": 1,
          "name": "roles.manage",
          "description": "Create, read, update, delete, and assign roles"
        },
        {
          "id": 2,
          "name": "permissions.view",
          "description": "View available permissions in the system"
        },
        {
          "id": 3,
          "name": "users.manage",
          "description": "Manage user accounts"
        }
        // ... all other permissions
      ]
    },
    {
      "id": 2,
      "name": "Admin",
      "description": "Manages core academic structure, courses, terms, staff, and student records",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "permissions": [
        {
          "id": 1,
          "name": "roles.manage",
          "description": "Create, read, update, delete, and assign roles"
        },
        {
          "id": 2,
          "name": "permissions.view",
          "description": "View available permissions in the system"
        },
        {
          "id": 3,
          "name": "users.manage",
          "description": "Manage user accounts"
        },
        {
          "id": 4,
          "name": "hierarchy.manage",
          "description": "Manage Faculties, Departments, and Programs"
        },
        {
          "id": 5,
          "name": "courses.manage",
          "description": "CRUD operations for courses and their prerequisites"
        },
        {
          "id": 6,
          "name": "course-sections.manage",
          "description": "CRUD operations for course sections, including assigning instructors"
        },
        {
          "id": 7,
          "name": "students.manage",
          "description": "Access and manage student data"
        },
        {
          "id": 8,
          "name": "enrollments.manage",
          "description": "Admin-level management of all student enrollments"
        },
        {
          "id": 10,
          "name": "applications.manage",
          "description": "Manage admission applications"
        },
        {
          "id": 11,
          "name": "documents.manage",
          "description": "Admin-level access to all user documents"
        }
      ]
    },
    {
      "id": 3,
      "name": "Admissions Officer",
      "description": "Manages admission applications, reviews submitted documents, and updates application statuses",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "permissions": [
        {
          "id": 7,
          "name": "students.manage",
          "description": "Access and manage student data"
        },
        {
          "id": 10,
          "name": "applications.manage",
          "description": "Manage admission applications"
        },
        {
          "id": 11,
          "name": "documents.manage",
          "description": "Admin-level access to all user documents"
        }
      ]
    },
    {
      "id": 4,
      "name": "Faculty",
      "description": "Manages course sections they are assigned to, including uploading grades and viewing enrollments",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "permissions": [
        {
          "id": 6,
          "name": "course-sections.manage",
          "description": "CRUD operations for course sections, including assigning instructors"
        },
        {
          "id": 8,
          "name": "enrollments.manage",
          "description": "Admin-level management of all student enrollments"
        },
        {
          "id": 9,
          "name": "grades.upload",
          "description": "Ability to upload grades for an assigned course section (Faculty)"
        }
      ]
    },
    {
      "id": 5,
      "name": "Student",
      "description": "Manages their own profile, applications, documents, and course enrollments",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z",
      "permissions": [
        {
          "id": 9,
          "name": "enrollments.manage.own",
          "description": "Student-level ability to enroll in or drop courses"
        },
        {
          "id": 12,
          "name": "documents.manage.own",
          "description": "Student-level access to their own documents"
        }
      ]
    }
  ]
}
```

## Permission Categories

### 1. Role & Permission Management
- **roles.manage** - Create, read, update, delete, and assign roles
- **permissions.view** - View available permissions in the system

*Granted to:* Super Admin, Admin

### 2. User Management
- **users.manage** - Manage user accounts

*Granted to:* Super Admin, Admin

### 3. Academic Hierarchy Management
- **hierarchy.manage** - Manage Faculties, Departments, and Programs

*Granted to:* Super Admin, Admin

### 4. Course Management
- **courses.manage** - CRUD operations for courses and their prerequisites
- **course-sections.manage** - CRUD operations for course sections, including assigning instructors

*Granted to:* Super Admin, Admin, Faculty (limited to own sections)

### 5. Student Management
- **students.manage** - Access and manage student data

*Granted to:* Super Admin, Admin, Admissions Officer

### 6. Enrollment Management
- **enrollments.manage** - Admin-level management of all student enrollments
- **enrollments.manage.own** - Student-level ability to enroll in or drop courses

*Granted to:* 
- **enrollments.manage**: Super Admin, Admin, Faculty (for their sections)
- **enrollments.manage.own**: Student

### 7. Grade Management
- **grades.upload** - Ability to upload grades for an assigned course section

*Granted to:* Super Admin, Faculty

### 8. Application Management
- **applications.manage** - Manage admission applications

*Granted to:* Super Admin, Admin, Admissions Officer

### 9. Document Management
- **documents.manage** - Admin-level access to all user documents
- **documents.manage.own** - Student-level access to their own documents

*Granted to:*
- **documents.manage**: Super Admin, Admin, Admissions Officer
- **documents.manage.own**: Student

## Role Hierarchy & Capabilities

### Super Admin
**Full System Access**
- Can manage all aspects of the system
- Can create and manage other admin accounts
- Has all permissions in the system
- System-level configuration access

### Admin
**Core Academic Management**
- Manages academic structure (faculties, departments, programs)
- Manages courses and course sections
- Manages staff and student records
- Full enrollment and application management
- Cannot manage other admin accounts

### Admissions Officer
**Application & Document Management**
- Reviews and manages admission applications
- Verifies and manages student documents
- Updates application statuses
- Limited student data access for application purposes

### Faculty
**Course & Grade Management**
- Manages only their assigned course sections
- Uploads grades for their courses
- Views enrollments for their sections
- Limited enrollment management for their courses

### Student
**Self-Service Portal**
- Manages their own profile and documents
- Enrolls in and drops courses (within deadlines)
- Views their own academic records
- Submits admission applications

## Frontend Implementation Notes

### Permission Checking
```typescript
// Check if user has specific permission
const hasPermission = (permission: string) => {
  return user.roles.some(role => 
    role.permissions.some(p => p.name === permission)
  );
};

// Check if user has any of multiple permissions
const hasAnyPermission = (permissions: string[]) => {
  return permissions.some(permission => hasPermission(permission));
};

// Check if user has specific role
const hasRole = (roleName: string) => {
  return user.roles.some(role => role.name === roleName);
};
```

### Component Visibility
```typescript
// Show/hide components based on permissions
{hasPermission('students.manage') && (
  <StudentManagementPanel />
)}

{hasRole('Student') && (
  <StudentDashboard />
)}

{hasAnyPermission(['enrollments.manage', 'enrollments.manage.own']) && (
  <EnrollmentSection />
)}
```

### Navigation Menu Structure
```typescript
const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['Super Admin', 'Admin', 'Admissions Officer', 'Faculty', 'Student']
  },
  {
    label: 'Students',
    path: '/students',
    permissions: ['students.manage']
  },
  {
    label: 'Courses',
    path: '/courses',
    permissions: ['courses.manage', 'course-sections.manage']
  },
  {
    label: 'Applications',
    path: '/applications',
    permissions: ['applications.manage']
  },
  {
    label: 'My Enrollments',
    path: '/my-enrollments',
    permissions: ['enrollments.manage.own']
  },
  {
    label: 'System Settings',
    path: '/settings',
    roles: ['Super Admin']
  }
];
```

### API Request Headers
All API requests should include the user's authentication token:
```typescript
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});
```

### Error Handling for Permissions
```typescript
// Handle 403 Forbidden responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      // Show permission denied message
      showNotification('You do not have permission to access this resource', 'error');
      // Optionally redirect to dashboard
      router.push('/dashboard');
    }
    return Promise.reject(error);
  }
);
```

## Legacy Compatibility

The system maintains backward compatibility with legacy role names:
- **admin** (legacy) → **Admin** (new)
- **staff** (legacy) → **Admissions Officer** (new)  
- **student** (legacy) → **Student** (new)
- **moderator** (legacy) → **Admissions Officer** (new)

Both old and new role names are supported in the API, but frontend should use the new standardized names. 