# University Admissions System

A comprehensive full-stack university management system built with Laravel 11 (backend API) and Next.js 15 (frontend). Manages the complete student lifecycle from application through graduation.

## Project Status

- **Backend API**: ✅ Fully functional (100+ endpoints, 32 database tables)
- **Frontend UI**: ⚠️ 65% complete (~80 pages, 33K lines of code)
- **API Integration**: ⚠️ 5% complete (mostly mock data currently)
- **Current Focus**: Connecting frontend to backend APIs

See [CURRENT_STATE.md](./CURRENT_STATE.md) for detailed status and [API_INTEGRATION_PLAN.md](./API_INTEGRATION_PLAN.md) for implementation roadmap.

## Technology Stack

### Backend
- **Framework**: Laravel 11.9 with PHP 8.2+
- **Database**: MySQL (via Docker)
- **Authentication**: Laravel Sanctum (token-based)
- **Testing**: PHPUnit with feature/unit tests
- **Environment**: Laravel Sail (Docker)

### Frontend
- **Framework**: Next.js 15.5.3 with React 19
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v3
- **State**: Zustand stores
- **HTTP**: Axios

## Quick Start

### Backend Setup

1. **Prerequisites**: Docker Desktop installed and running

2. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd university-admissions
   cp .env.example .env
   ```

3. **Start services**:
   ```bash
   ./vendor/bin/sail up -d
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```

4. **Backend running at**: `http://localhost`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Frontend running at**: `http://localhost:3000`

## Demo Credentials

All users have password: `password`

- **Admin**: `admin@university.edu`
- **Faculty**: `john.smith@university.edu`
- **Students**: Multiple accounts seeded (check database)

## Project Structure

```
university-admissions/
├── app/                      # Laravel backend
│   ├── Http/Controllers/     # API controllers
│   ├── Models/              # 32 Eloquent models
│   ├── Services/            # Business logic
│   └── Jobs/                # Background jobs
├── database/
│   ├── migrations/          # Schema migrations
│   └── seeders/             # Demo data
├── frontend/
│   ├── src/app/            # 80 Next.js pages
│   ├── src/components/     # UI components
│   ├── src/lib/            # Utilities
│   └── src/stores/         # Zustand stores
└── tests/                  # PHPUnit tests
```

## Key Features

### Backend (100% Complete)
✅ Student management with 30+ profile fields
✅ Course catalog and section scheduling
✅ Enrollment system with prerequisites and waitlists
✅ Admissions application processing
✅ Role-based access control (RBAC)
✅ Audit logging
✅ Document management
✅ Building and room management

### Frontend (65% Complete)
✅ Student portal (dashboard, courses, grades, schedule)
✅ Faculty portal (gradebook, attendance, course management)
✅ Admin dashboards (advisor, registrar, financial aid)
✅ Responsive UI with shadcn components
⚠️ Authentication flow (needs work)
⚠️ API integration (mostly mock data)

## Development Commands

### Backend
```bash
# Start all services
./vendor/bin/sail up -d

# Run migrations
./vendor/bin/sail artisan migrate

# Seed database
./vendor/bin/sail artisan db:seed

# Run tests
./vendor/bin/sail artisan test

# View logs
./vendor/bin/sail artisan pail

# Code style
vendor/bin/pint
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## API Documentation

API documentation available at: `http://localhost/api/documentation`

Generate docs:
```bash
./vendor/bin/sail artisan l5-swagger:generate
```

## Documentation

- [CURRENT_STATE.md](./CURRENT_STATE.md) - Detailed project status
- [API_INTEGRATION_PLAN.md](./API_INTEGRATION_PLAN.md) - Integration roadmap
- [CLAUDE.md](./CLAUDE.md) - Development guide
- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - Schema documentation
- [PROJECT_FEATURES.md](./PROJECT_FEATURES.md) - Feature inventory

## Current Focus: API Integration

We're currently connecting the frontend to the backend APIs. See [API_INTEGRATION_PLAN.md](./API_INTEGRATION_PLAN.md) for:
- Authentication setup
- API service layer creation
- Page-by-page integration plan
- Testing strategy

## Contributing

This is a portfolio project. Contributions welcome for:
- API integration improvements
- Test coverage
- Documentation updates
- Bug fixes

## License

This is a portfolio/educational project.
