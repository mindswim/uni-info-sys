# University Admissions System

A comprehensive full-stack university Student Information System (SIS) built with Laravel 11 (backend API) and Next.js 15 (frontend). Manages the complete student lifecycle from application through graduation.

## Project Status

**Current Phase:** MVP with Real Data ✅
- ✅ Backend API: 100+ endpoints, 32 database tables
- ✅ Frontend: Student/Faculty/Admin portals with working navigation
- ✅ Data: 103 students, 411 enrollments, 242 with grades
- ✅ API Integration: Student/Faculty views connected
- 🚧 Next: Grade management and course registration workflows

See [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md) for complete feature roadmap (5.5-7.5 month timeline).

## Technology Stack

### Backend
- **Framework**: Laravel 11.9 with PHP 8.2+
- **Database**: PostgreSQL (via Docker Sail)
- **Authentication**: Laravel Sanctum (token-based)
- **Testing**: PHPUnit with feature/unit tests

### Frontend
- **Framework**: Next.js 15.5.3 with React 19
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **State**: Zustand + React hooks
- **HTTP**: Axios with API client

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for frontend)

### Backend Setup

```bash
# Clone and navigate to project
cd university-admissions

# Copy environment file
cp .env.example .env

# Start Docker services (PostgreSQL, Redis, Mailhog)
./vendor/bin/sail up -d

# Run migrations and seed demo data
./vendor/bin/sail artisan migrate:fresh --seed

# Backend API now running at http://localhost
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend now running at http://localhost:3002
```

## Demo Accounts

After seeding, use these credentials to test:

**Password for all accounts:** `password`

### Admin
- Email: `admin@demo.com`
- Role: Full system access

### Faculty
- Email: `faculty@test.com` (may need to check database for actual email)
- Role: View sections, manage grades, see enrolled students

### Students (Demo Personas)
- **David Park**: `david@demo.com` - Korean student with 2 enrollments
- **Maria Garcia**: `maria@demo.com` - Just submitted application
- **Sophie Chen**: `sophie@demo.com` - Waitlisted student

Or use any seeded student account from the database.

## Current Features

### ✅ Working Now

**Student Portal:**
- Dashboard with GPA, credits, progress (real data!)
- Enrollments list (8 courses with details)
- Visual weekly schedule calendar
- Grades view with completed/in-progress courses
- Academic records with GPA calculation

**Faculty Portal:**
- Sections management showing enrolled students
- MATH101 section with 5/29 students
- Student roster with names, IDs, emails
- Grade status tracking

**Admin Portal:**
- Student directory (103 students)
- Search and filter functionality
- Enrollment statistics

### 🚧 In Development (See PRODUCTION_ROADMAP.md)

**Phase 1 - Core Academic:**
- Grade submission workflow for faculty
- Course registration system
- Attendance tracking
- Degree audit tool

**Phase 2 - Faculty Tools:**
- Assignment management
- Course materials upload
- Advising appointments

**Phase 3 - Admin Tools:**
- Admissions workflow
- Financial/billing system
- Analytics dashboard

## Project Structure

```
university-admissions/
├── app/                      # Laravel backend
│   ├── Http/
│   │   ├── Controllers/      # API controllers (100+ endpoints)
│   │   └── Resources/        # API transformers
│   ├── Models/               # 32 Eloquent models
│   └── Services/             # Business logic
├── database/
│   ├── migrations/           # Schema (32 tables)
│   └── seeders/              # Demo data with grades
├── frontend/
│   ├── src/app/              # Next.js 15 pages
│   │   ├── student/          # 11 student routes
│   │   ├── faculty/          # 7 faculty routes
│   │   └── admin/            # 8 admin routes
│   ├── src/components/       # React components
│   ├── src/services/         # API client layer
│   └── src/lib/              # Utilities
├── docs/
│   └── archive/              # Historical documentation
├── PRODUCTION_ROADMAP.md     # ⭐ Source of truth (22-31 week plan)
├── CLAUDE.md                 # Development instructions
└── README.md                 # This file
```

## Development Commands

### Backend

```bash
# Start services
./vendor/bin/sail up -d

# Run migrations
./vendor/bin/sail artisan migrate

# Fresh database with demo data (103 students, 411 enrollments, 242 grades)
./vendor/bin/sail artisan migrate:fresh --seed

# Run tests
./vendor/bin/sail artisan test

# Check API endpoints
./vendor/bin/sail artisan route:list

# Tinker (REPL)
./vendor/bin/sail artisan tinker

# Stop services
./vendor/bin/sail down
```

### Frontend

```bash
cd frontend

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## API Documentation

The backend provides OpenAPI/Swagger documentation:

```bash
# Generate API docs
./vendor/bin/sail artisan l5-swagger:generate

# View at http://localhost/api/documentation
```

## Data Model Overview

**Core Entities:**
- **Students** (103) → Academic Records (with GPA) + Enrollments (411)
- **Staff** (26) → Course Sections (46)
- **Courses** (13) → Course Sections → Enrollments
- **Terms** (3: Fall 2024, Spring 2025, Summer 2025)
- **Programs** → Departments → Faculties
- **Buildings** → Rooms → Course Sections

**Current Data:**
- 103 Students with academic records
- 411 Enrollments (242 with grades, 169 in progress)
- 46 Course sections across 3 terms
- 26 Faculty/Staff members
- 13 Courses in 5 departments
- Realistic grade distribution (60% completed)

## Authentication Flow

1. User logs in via `/auth/login`
2. Backend validates credentials, returns Sanctum token
3. Frontend stores token, redirects based on role
4. API requests include `Authorization: Bearer {token}` header
5. Backend validates token and returns user data

## Testing

```bash
# Backend tests
./vendor/bin/sail artisan test

# Frontend tests (when added)
cd frontend
npm run test

# E2E tests (Playwright - when added)
npm run test:e2e
```

## Deployment

See `PRODUCTION_ROADMAP.md` Phase 5 and 7 for:
- Production environment setup
- CI/CD pipeline configuration
- Security hardening
- Performance optimization
- Launch checklist

## Documentation

- **[PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md)** - Complete 7-phase roadmap to production (⭐ PRIMARY)
- **[CLAUDE.md](./CLAUDE.md)** - Development notes and instructions
- **[docs/archive/](./docs/archive/)** - Historical planning documents

## Roadmap Highlights

**Completed:**
- ✅ Full Laravel backend with 100+ API endpoints
- ✅ Next.js frontend with 3 role-based portals
- ✅ Database seeding with realistic demo data
- ✅ Grade distribution (242 graded enrollments)
- ✅ Student dashboard with real GPA calculations
- ✅ Faculty section management with student rosters

**Next Up (Phase 1 - Core Academic):**
1. Grade submission API for faculty
2. Faculty grade entry interface
3. Course registration workflow
4. Attendance tracking system
5. Degree audit tool

**Estimated Timeline to Production:** 5.5-7.5 months
**See PRODUCTION_ROADMAP.md for detailed breakdown**

## Contributing

This is an active development project. Key areas:
- Implementing features from PRODUCTION_ROADMAP.md
- Test coverage improvement
- Documentation updates
- Bug fixes and performance optimization

## License

This is a portfolio/educational project demonstrating full-stack SIS development.

---

**Current Focus:** Executing Phase 1 of PRODUCTION_ROADMAP.md - completing core academic data and grade management workflows.
