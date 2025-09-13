# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive University Admissions and Management System built as a professional portfolio project. It consists of a Laravel 11 backend API and a React TypeScript frontend demo application. The system manages the complete student lifecycle from application to enrollment, including course management, academic records, and administrative functions.

## Technology Stack

### Backend (Laravel API)
- **Framework**: Laravel 11.9 with PHP 8.2+
- **Database**: MySQL with comprehensive schema
- **Authentication**: Laravel Sanctum (token-based API authentication)
- **Documentation**: L5-Swagger for OpenAPI documentation
- **Auditing**: OwenIt/Laravel-Auditing for change tracking
- **Metrics**: Prometheus metrics collection
- **Queue System**: Laravel queues for background processing
- **Development Environment**: Laravel Sail (Docker)

### Frontend (React Demo)
- **Framework**: React 19 + TypeScript + Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: Lucide React

## Development Commands

### Backend Development
```bash
# Start all services (recommended)
composer run dev

# Manual startup (from project root)
./vendor/bin/sail up -d        # Start Docker services
./vendor/bin/sail artisan serve # Start Laravel development server
php artisan queue:listen       # Start queue worker
php artisan pail              # View logs

# Database operations
./vendor/bin/sail artisan migrate           # Run migrations
./vendor/bin/sail artisan migrate:fresh    # Fresh migration
./vendor/bin/sail artisan migrate:fresh --seed  # Fresh migration with demo data
./vendor/bin/sail artisan db:seed         # Run seeders only

# Testing and code quality
./vendor/bin/sail artisan test            # Run PHPUnit tests
./vendor/bin/sail artisan test --filter TestName  # Run specific test
vendor/bin/pint                          # Run Laravel Pint (code style)
vendor/bin/pint --test                    # Check code style without fixing

# API documentation
php artisan l5-swagger:generate           # Generate API documentation
# Visit: http://localhost/api/documentation
```

### Frontend Development
```bash
# From frontend/ directory
npm install                    # Install dependencies
npm run dev                   # Start Vite dev server (http://localhost:5174)
npm run build                 # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

### Development Workflow
Start both backend and frontend simultaneously:
```bash
# Terminal 1: Backend (from project root)
./vendor/bin/sail artisan migrate:fresh --seed && ./vendor/bin/sail up -d

# Terminal 2: Frontend (from frontend/ directory)
npm run dev
```

## Architecture Overview

### Backend Architecture
- **API Versioning**: All endpoints under `/api/v1/`
- **Service Layer**: Business logic in `app/Services/` (AdmissionService, EnrollmentService, MetricsService)
- **Repository Pattern**: Eloquent models with clear relationships in `app/Models/`
- **RBAC**: Role-Based Access Control with roles, permissions, and pivot tables
- **Auditing**: Comprehensive change tracking on critical models
- **Queue Jobs**: Background processing for notifications and heavy operations

### Frontend Architecture
- **Component-Based**: shadcn/ui components for consistent design
- **State Management**: Zustand stores for API data and UI state
- **API Integration**: Axios with interceptors for request/response logging
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Demo Flow**: Step-by-step guided demo showcasing system capabilities

### Key Database Entities
- **Core Users**: `users`, `students`, `staff`
- **Academic Structure**: `faculties` → `departments` → `programs`
- **Course System**: `courses`, `course_sections`, `enrollments`
- **Admissions**: `admission_applications`, `program_choices`, `academic_records`, `documents`
- **Infrastructure**: `buildings`, `rooms`, `terms`
- **Security**: `roles`, `permissions` with RBAC pivot tables

## Demo System

The frontend serves as an interactive demo showcasing the backend API capabilities through real user scenarios:

### Demo Personas (password: `password`)
- **Dr. Elizabeth Harper** (`admin@demo.com`) - System administrator
- **Maria Rodriguez** (`maria@demo.com`) - Prospective student from Mexico
- **David Park** (`david@demo.com`) - Enrolled Korean student
- **Sophie Turner** (`sophie@demo.com`) - Waitlisted American student

### Demo Features
- **API Activity Logging**: Real-time display of API requests/responses
- **Persona Switching**: Seamless role switching to demonstrate different user experiences
- **Live Data**: All operations use real backend API endpoints
- **Student Journey**: Complete flow from application to enrollment
- **Error Handling**: Demonstrates proper validation and error responses

## Testing

### Backend Testing
- **Framework**: PHPUnit with Feature and Unit tests
- **Coverage**: Tests for services, jobs, filters, and API endpoints
- **Database**: Uses SQLite for testing with factories and seeders
- **Commands**: `./vendor/bin/sail artisan test`

### Frontend Testing
- **Setup**: ESLint configured with TypeScript rules
- **Future**: Jest + React Testing Library can be added for component testing

## Key Business Logic

### Enrollment System (EnrollmentService)
- **Capacity Management**: Automatic waitlist when course sections are full
- **Prerequisites**: Validates course prerequisites before enrollment
- **Schedule Conflicts**: Prevents overlapping course schedules
- **Add/Drop Periods**: Enforces academic calendar deadlines
- **Waitlist Promotion**: Automatic promotion when spots become available

### Admission System (AdmissionService)
- **Application Processing**: Manages application status workflow
- **Document Management**: Handles supporting documents with versioning
- **Program Choices**: Multiple program selection with ranking
- **Background Jobs**: Asynchronous notifications and processing

### Audit System
- **Change Tracking**: Automatic auditing on Student, AdmissionApplication, CourseSection, Enrollment models
- **User Attribution**: Tracks who made changes and when
- **Data Integrity**: Maintains complete audit trail for compliance

## API Endpoints Structure

### Authentication Required (Sanctum)
- `/api/v1/students`, `/api/v1/staff` - User management
- `/api/v1/faculties`, `/api/v1/departments`, `/api/v1/programs` - Academic structure
- `/api/v1/courses`, `/api/v1/course-sections` - Course management
- `/api/v1/enrollments` - Student enrollments with custom actions (withdraw, swap)
- `/api/v1/admission-applications` - Application processing
- `/api/v1/roles`, `/api/v1/permissions` - RBAC management

### Public Endpoints
- `/api/health` - Health check for monitoring
- `/api/metrics` - Prometheus metrics (unauthenticated for monitoring tools)

## Environment Setup

### Required Environment Variables
```bash
# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=university_admissions
DB_USERNAME=sail
DB_PASSWORD=password

# Application
APP_NAME="University Admissions System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Authentication
SANCTUM_STATEFUL_DOMAINS=localhost:5174

# Queue (for background jobs)
QUEUE_CONNECTION=database
```

### Docker Setup
- **Laravel Sail**: Provides MySQL, Redis, and application containers
- **Port Mapping**: Backend on port 80, frontend on 5174
- **Volume Mounting**: Source code mounted for development
- **Database Persistence**: MySQL data persisted in Docker volumes

## Common Development Tasks

### Adding New API Endpoints
1. Create route in `routes/api.php`
2. Create controller in `app/Http/Controllers/Api/V1/`
3. Add request validation in `app/Http/Requests/`
4. Update API documentation annotations
5. Write feature tests in `tests/Feature/`

### Adding Frontend Components
1. Use shadcn CLI: `npx shadcn@latest add [component-name]`
2. Create custom components in `frontend/src/components/`
3. Follow TypeScript strict mode conventions
4. Use Tailwind for styling, maintain responsive design

### Database Changes
1. Create migration: `./vendor/bin/sail artisan make:migration`
2. Update model relationships if needed
3. Update factory and seeder files
4. Run migration: `./vendor/bin/sail artisan migrate`
5. Update tests to reflect schema changes

## Deployment Considerations

### Backend Production
- Use MySQL/PostgreSQL instead of SQLite
- Configure proper queue driver (Redis/database)
- Set up Supervisor for queue workers
- Enable API rate limiting
- Configure proper logging

### Frontend Production
- Build: `npm run build`
- Serve via Laravel or separate static hosting
- Configure proper API base URL
- Enable error reporting/monitoring

## Security Notes

- API authentication via Laravel Sanctum tokens
- RBAC system prevents unauthorized access
- Input validation on all API endpoints
- SQL injection protection via Eloquent ORM
- XSS protection via proper data sanitization
- CSRF protection for authenticated requests