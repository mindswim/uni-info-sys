# Production-Ready Transformation Plan

## Goal
Build a real Student Information System that can be deployed and used by actual institutions.

**Time Estimate:** 6-8 months with 2-3 developers full-time
**Outcome:** Production SaaS product

**⚠️ WARNING:** This is a massive undertaking. Only pursue this path if you intend to launch a real product or have significant development resources.

---

## Critical Path: Priority-Ordered Phases

### Phase 1: Security Fixes (BLOCKING - 1-2 weeks)

**Nothing else matters if the system isn't secure.**

#### 1.1 Remove Development Code
```bash
# Files to delete:
rm app/Http/Controllers/ImpersonationController.php
rm app/Http/Controllers/DemoController.php

# Routes to remove (api.php):
- Lines 246-395: Demo enrollment endpoints
- Lines 397-453: Data viewer /{table} endpoint
```

#### 1.2 Implement Real Frontend Authentication
**File:** `frontend/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token with backend
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { user, roles, permissions } = await response.json()

    // Role-based route protection
    const path = request.nextUrl.pathname

    if (path.startsWith('/admin') && !roles.includes('admin')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/faculty') && !roles.includes('faculty')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/student') && !roles.includes('student')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Attach user data to request headers for client components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id.toString())
    requestHeaders.set('x-user-roles', roles.join(','))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Auth verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/faculty/:path*', '/student/:path*'],
}
```

**Backend endpoint needed:** `GET /api/v1/auth/verify`
```php
// app/Http/Controllers/Api/V1/AuthController.php

public function verify(Request $request): JsonResponse
{
    $user = $request->user();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ],
        'roles' => $user->roles->pluck('name'),
        'permissions' => $user->getAllPermissions()->pluck('name'),
    ]);
}
```

#### 1.3 Configure Token Expiration & Refresh
**File:** `config/sanctum.php`
```php
'expiration' => 60, // 60 minutes

// Add to .env:
SANCTUM_TOKEN_EXPIRATION=60
```

**Implement refresh token endpoint:**
```php
// POST /api/v1/auth/refresh
public function refresh(Request $request): JsonResponse
{
    // Revoke old token
    $request->user()->currentAccessToken()->delete();

    // Issue new token
    $token = $request->user()->createToken('auth-token', ['*'], now()->addMinutes(60));

    return response()->json([
        'token' => $token->plainTextToken,
        'expires_at' => now()->addMinutes(60)->toISOString(),
    ]);
}
```

#### 1.4 Security Headers & CORS
**File:** `config/cors.php`
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5174')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

**Add to** `app/Http/Middleware/AddSecurityHeaders.php`:
```php
public function handle(Request $request, Closure $next): Response
{
    $response = $next($request);

    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    if (app()->environment('production')) {
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return $response;
}
```

#### 1.5 Input Sanitization
**Create:** `app/Http/Middleware/SanitizeInput.php`
```php
namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TransformsRequest;

class SanitizeInput extends TransformsRequest
{
    protected function transform($key, $value)
    {
        if (is_string($value)) {
            // Remove null bytes
            $value = str_replace("\0", '', $value);

            // Trim whitespace
            $value = trim($value);

            // For rich text fields, use HTMLPurifier
            // For now, just escape HTML entities for simple text fields
            if (!$this->isJsonField($key)) {
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
        }

        return $value;
    }

    protected function isJsonField($key): bool
    {
        // Fields that should allow JSON
        return in_array($key, ['metadata', 'preferences', 'settings']);
    }
}
```

**Deliverables:**
- [ ] All dev routes removed
- [ ] Frontend auth verifies with backend on every protected request
- [ ] Token expiration enforced (60 minutes)
- [ ] Refresh token endpoint working
- [ ] Security headers on all responses
- [ ] Input sanitization middleware applied globally
- [ ] Penetration test results (use OWASP ZAP or similar)

---

### Phase 2: Core Feature Completion (8-10 weeks)

Complete the 23+ TODO placeholders and missing business logic.

#### 2.1 Grade Management System (Week 3-4)
**New Files:**
- `app/Services/GradeService.php`
- `app/Http/Controllers/Api/V1/GradeController.php`
- `app/Http/Requests/SubmitGradeRequest.php`
- `app/Policies/GradePolicy.php`

**Features:**
```php
// GradeService methods:
- submitGrade(Enrollment $enrollment, string $grade): void
- submitBulkGrades(CourseSection $section, array $grades): void
- requestGradeChange(Enrollment $enrollment, string $newGrade, string $reason): GradeChangeRequest
- approveGradeChange(GradeChangeRequest $request): void
- calculateGradeDistribution(CourseSection $section): array
- enforceGradingDeadline(CourseSection $section): bool
```

**Business Rules:**
- Only instructor of course section can submit grades
- Grades must be submitted by deadline (term->grade_deadline)
- Grade changes after deadline require approval (department chair or registrar)
- Audit log every grade submission and change
- Automatically update student GPA on grade submission
- Prevent enrollment deletion if grade exists

**Frontend:**
- Faculty: Gradebook table with inline editing
- Faculty: Bulk CSV upload for grades
- Student: Grade viewing (current + historical)
- Admin: Grade change approval workflow

**Tests:**
- [ ] Grade submission within deadline
- [ ] Grade submission after deadline (should fail)
- [ ] Grade change request creation
- [ ] Grade change approval flow
- [ ] GPA recalculation on grade change
- [ ] Authorization (only instructor can grade their students)

**Data Migration:**
Populate 389 existing enrollments with realistic grades:
```php
// database/seeders/GradeSeeder.php
// Use grade distribution: 15% A, 25% B, 40% C, 15% D, 5% F
// Account for student academic standing (good students get better grades)
```

#### 2.2 Attendance System (Week 5)
**New Tables:**
```php
// Migration: create_attendance_table
Schema::create('attendance', function (Blueprint $table) {
    $table->id();
    $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
    $table->date('class_date');
    $table->enum('status', ['present', 'absent', 'excused', 'tardy']);
    $table->text('notes')->nullable();
    $table->foreignId('recorded_by')->constrained('users');
    $table->timestamps();

    $table->unique(['enrollment_id', 'class_date']);
    $table->index(['class_date']);
});
```

**Service:**
```php
// AttendanceService methods:
- recordAttendance(Enrollment $enrollment, Carbon $date, string $status): Attendance
- bulkRecordAttendance(CourseSection $section, Carbon $date, array $attendance): void
- getAttendanceRate(Enrollment $enrollment): float
- getAbsenceCount(Enrollment $enrollment): int
- flagLowAttendance(): Collection // Students < 75% attendance
```

**Frontend:**
- Faculty: Attendance roster by date (checkboxes for present/absent)
- Student: Attendance record view with percentage
- Admin: Low attendance alerts

#### 2.3 Financial System (Week 6-7)
**New Tables:**
```php
// Tuition, FinancialAid, Payment, AccountBalance, PaymentPlan
```

**Service:**
```php
// FinancialService methods:
- calculateTuition(Student $student, Term $term): Money
- applyFinancialAid(Student $student, FinancialAid $aid): void
- processPayment(Student $student, Money $amount, string $method): Payment
- getAccountBalance(Student $student): Money
- createPaymentPlan(Student $student, Term $term, int $installments): PaymentPlan
- placeFinancialHold(Student $student): void
- removeFinancialHold(Student $student): void
```

**Integration:**
- Stripe for payment processing (test mode)
- Webhook handling for payment status updates
- PDF invoice generation
- Email receipts

**Business Rules:**
- Students with balance > $500 get financial hold (can't register)
- Payment plans must be approved by bursar
- Financial aid reduces tuition owed
- Refund calculation based on add/drop deadline

**Frontend:**
- Student: Account balance, payment history, make payment
- Admin: Payment processing, refund management, financial aid approval

#### 2.4 Document Management & File Uploads (Week 8)
**Infrastructure:**
- AWS S3 bucket or MinIO (self-hosted S3-compatible)
- Virus scanning integration (ClamAV)
- File validation (type, size, extension)
- Document versioning (already have table, need implementation)

**Service:**
```php
// DocumentService methods:
- uploadDocument(Documentable $entity, UploadedFile $file, string $type): Document
- createNewVersion(Document $document, UploadedFile $file): DocumentVersion
- generateSignedUrl(Document $document, int $expirationMinutes = 60): string
- scanForVirus(UploadedFile $file): bool
- deleteDocument(Document $document): void
```

**Configuration:**
```env
FILESYSTEM_DISK=s3
AWS_BUCKET=university-documents-prod
AWS_REGION=us-east-1
```

**Business Rules:**
- Max file size: 10MB
- Allowed types: PDF, JPG, PNG, DOCX
- Virus scanning before storage
- Document retention policy (7 years for transcripts, etc.)
- Version history for auditing

**Frontend:**
- Student: Upload application documents (transcripts, essays, recommendations)
- Faculty: Upload syllabus, course materials
- Admin: Document approval workflow

#### 2.5 Notification System (Week 9)
**Infrastructure:**
- AWS SES or SendGrid for email
- Notification preferences table
- Email templates (Blade or MJML)

**Service:**
```php
// NotificationService methods:
- sendEnrollmentConfirmation(Enrollment $enrollment): void
- sendGradePosted(Enrollment $enrollment): void
- sendAdmissionDecision(AdmissionApplication $application): void
- sendPaymentReminder(Student $student): void
- sendWaitlistPromotion(Enrollment $enrollment): void
- batchNotifications(Collection $users, string $template, array $data): void
```

**Configuration:**
```env
MAIL_MAILER=ses
MAIL_FROM_ADDRESS=noreply@university.edu
MAIL_FROM_NAME="University Registrar"
```

**Templates:**
- Enrollment confirmation
- Grade posted
- Payment due
- Admission decision
- Waitlist promotion
- Financial hold placed

**Frontend:**
- Student/Faculty: Notification preferences (email frequency, types)
- Admin: Broadcast messaging

#### 2.6 Advising & Degree Audit (Week 10)
**New Tables:**
```php
// advisor_student (pivot), appointments, advising_notes, degree_requirements
```

**Service:**
```php
// AdvisingService methods:
- assignAdvisor(Student $student, Staff $advisor): void
- scheduleAppointment(Student $student, Staff $advisor, Carbon $dateTime): Appointment
- createAdvisingNote(Student $student, string $note): AdvisingNote
- getDegreeAudit(Student $student): DegreeAudit
- identifyMissingRequirements(Student $student): Collection
```

**Degree Audit:**
```php
// DegreeAudit class:
{
    'program': 'BS Computer Science',
    'credits_required': 120,
    'credits_completed': 87,
    'requirements': [
        'General Education' => ['status' => 'complete', 'credits' => 45],
        'Major Core' => ['status' => 'in_progress', 'credits' => 30/54],
        'Major Electives' => ['status' => 'not_started', 'credits' => 0/18],
    ],
    'expected_graduation': '2026-05',
}
```

**Frontend:**
- Student: View advisor, schedule appointments, degree progress
- Faculty: Advising notes, appointment calendar, advisee list
- Admin: Assign advisors, approve advisor changes

#### 2.7 Reporting & Analytics (Week 11-12)
**New Features:**
- Transcript generation (PDF)
- Enrollment reports (by term, department, program)
- Grade distribution reports
- Retention analytics
- Financial reports (revenue, outstanding balances)

**Service:**
```php
// ReportingService methods:
- generateTranscript(Student $student): PDF
- getEnrollmentStatistics(Term $term): array
- getRetentionRate(int $cohortYear): float
- getGradeDistribution(CourseSection $section): array
- getFinancialSummary(Term $term): array
```

**Frontend:**
- Student: Request official transcript
- Faculty: Course roster, grade distribution
- Admin: Dashboards with charts (enrollment trends, retention, revenue)

---

### Phase 3: Infrastructure & DevOps (3-4 weeks)

#### 3.1 Production Configuration (Week 13)
**Switch all dev configs to production services:**

```env
# .env.production
APP_ENV=production
APP_DEBUG=false

# Queue
QUEUE_CONNECTION=redis  # or sqs
REDIS_HOST=redis-cluster.production.local
REDIS_PASSWORD=secure_password

# Cache
CACHE_STORE=redis
REDIS_CACHE_DB=1

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Mail
MAIL_MAILER=ses
AWS_SES_REGION=us-east-1

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=warning
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### 3.2 Docker Production Setup
**Create:** `docker/production/Dockerfile`
```dockerfile
FROM php:8.2-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Application
WORKDIR /var/www/html
COPY . .

# Optimize
RUN composer install --no-dev --optimize-autoloader
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
```

**Create:** `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/production/Dockerfile
    environment:
      - APP_ENV=production
    volumes:
      - storage:/var/www/html/storage
    depends_on:
      - redis
      - mysql

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ./public:/var/www/html/public:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data

  queue-worker:
    build:
      context: .
      dockerfile: docker/production/Dockerfile
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    depends_on:
      - redis
      - mysql

volumes:
  mysql-data:
  redis-data:
  storage:
```

#### 3.3 CI/CD Pipeline (Week 14)
**Create:** `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Run tests
        run: php artisan test --coverage --min=80

      - name: Code style check
        run: vendor/bin/pint --test

      - name: Security audit
        run: composer audit

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          ssh deploy@staging.university.edu "cd /var/www && ./deploy.sh staging"

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          ssh deploy@production.university.edu "cd /var/www && ./deploy.sh production"

      - name: Run migrations
        run: |
          ssh deploy@production.university.edu "cd /var/www && php artisan migrate --force"

      - name: Smoke tests
        run: |
          curl -f https://university.edu/api/health || exit 1

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
```

**Deployment script:** `deploy.sh`
```bash
#!/bin/bash
set -e

ENVIRONMENT=$1

echo "Deploying to $ENVIRONMENT..."

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
php artisan queue:restart
sudo supervisorctl restart all

# Health check
curl -f http://localhost/api/health || exit 1

echo "Deployment complete!"
```

#### 3.4 Monitoring & Logging (Week 15-16)
**Sentry Integration:**
```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=https://xxx@sentry.io/xxx
```

**Prometheus Metrics:**
```php
// Expand MetricsService to track:
- Request rate by endpoint
- Response time percentiles (p50, p95, p99)
- Error rate
- Queue depth
- Active sessions
- Database query time
```

**Grafana Dashboards:**
- API Performance
- Database Performance
- Queue Health
- Business Metrics (enrollments/day, applications/day)

**Log Aggregation:**
```env
# CloudWatch Logs
AWS_CLOUDWATCH_LOG_GROUP=university-sis-prod
AWS_CLOUDWATCH_LOG_STREAM=laravel
```

**Health Checks:**
```php
// routes/api.php
Route::get('/health', HealthController::class);

// HealthController
public function __invoke(): JsonResponse
{
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'checks' => [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ],
    ]);
}
```

**Uptime Monitoring:**
- StatusCake or UptimeRobot
- Check `/api/health` every 5 minutes
- Alert on downtime > 2 minutes

---

### Phase 4: Testing to 80%+ Coverage (2-3 weeks)

#### 4.1 Backend Testing (Week 17-18)
**Unit Tests (all services):**
```php
// tests/Unit/Services/GradeServiceTest.php
// tests/Unit/Services/AttendanceServiceTest.php
// tests/Unit/Services/FinancialServiceTest.php
// tests/Unit/Services/AdvisingServiceTest.php
// tests/Unit/Services/DocumentServiceTest.php
```

**Integration Tests (workflows):**
```php
// tests/Feature/Workflows/StudentEnrollmentWorkflowTest.php
// tests/Feature/Workflows/GradeSubmissionWorkflowTest.php
// tests/Feature/Workflows/AdmissionWorkflowTest.php
// tests/Feature/Workflows/PaymentWorkflowTest.php
```

**Load Testing:**
```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  // Test enrollment endpoint
  let res = http.post('https://api.university.edu/v1/enrollments', {
    student_id: 1,
    course_section_id: 42,
  }, {
    headers: { 'Authorization': 'Bearer xxx' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Coverage Target:**
```bash
php artisan test --coverage --min=80
```

#### 4.2 Frontend Testing (Week 19)
**Setup:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test
```

**Component Tests:**
```typescript
// __tests__/components/GradesTab.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { GradesTab } from '@/components/student/grades-tab'

describe('GradesTab', () => {
  it('displays loading state initially', () => {
    render(<GradesTab />)
    expect(screen.getByText('Loading grades...')).toBeInTheDocument()
  })

  it('displays grades after loading', async () => {
    render(<GradesTab />)
    await waitFor(() => {
      expect(screen.getByText('CS 101')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })
})
```

**E2E Tests (Playwright):**
```typescript
// e2e/student-enrollment.spec.ts
import { test, expect } from '@playwright/test'

test('student can enroll in course', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5174/login')
  await page.fill('input[name="email"]', 'student@test.edu')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to enrollment
  await page.click('text=Enroll in Courses')

  // Select course
  await page.click('text=CS 201 - Data Structures')
  await page.click('button:has-text("Enroll")')

  // Verify success
  await expect(page.locator('.toast')).toContainText('Successfully enrolled')
})
```

---

### Phase 5: Security Audit & Hardening (1-2 weeks)

#### 5.1 Penetration Testing (Week 20)
**Use OWASP ZAP:**
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.university.edu
```

**Manual Testing:**
- [ ] SQL injection attempts on all inputs
- [ ] XSS attempts (stored, reflected, DOM-based)
- [ ] CSRF token validation
- [ ] Authorization bypass attempts (horizontal + vertical privilege escalation)
- [ ] Session fixation/hijacking
- [ ] File upload vulnerabilities (malicious files, path traversal)
- [ ] Rate limiting bypass
- [ ] Insecure direct object references

#### 5.2 Dependency Audit
```bash
composer audit
npm audit
```

Fix all critical and high-severity vulnerabilities.

#### 5.3 Secrets Management
**Use AWS Secrets Manager or HashiCorp Vault:**
```php
// config/database.php
'password' => env('DB_PASSWORD') ?: AWS::getSecret('prod/db/password'),
```

**Never commit:**
- .env files
- Private keys
- API keys
- Passwords

---

### Phase 6: Performance Optimization (1-2 weeks)

#### 6.1 Database Optimization (Week 21)
**Index Analysis:**
```sql
EXPLAIN SELECT * FROM enrollments
  WHERE student_id = 1 AND status = 'enrolled';

-- Add missing indexes
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status);
```

**Query Optimization:**
```php
// Before (N+1 query):
$students = Student::all();
foreach ($students as $student) {
    echo $student->user->name; // N queries
}

// After (eager loading):
$students = Student::with('user')->get();
foreach ($students as $student) {
    echo $student->user->name; // 1 query
}
```

**Caching:**
```php
// Cache frequently accessed data
Cache::remember('courses.active', 3600, function () {
    return Course::where('is_active', true)->get();
});
```

#### 6.2 API Performance
**Response Caching:**
```php
// Use ETags for conditional requests
return response()
    ->json($data)
    ->setEtag(md5(json_encode($data)))
    ->setPublic()
    ->setMaxAge(3600);
```

**Pagination:**
```php
// Never return all records without pagination
$courses = Course::paginate(50); // NOT Course::all()
```

#### 6.3 Frontend Performance
**Code Splitting:**
```typescript
// Lazy load routes
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard'))
```

**Image Optimization:**
```bash
npm install next-image-export-optimizer
```

**Lighthouse Targets:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Summary Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Security Fixes | 1-2 weeks | No critical vulnerabilities |
| 2. Core Features | 8-10 weeks | All 23 TODOs implemented |
| 3. Infrastructure | 3-4 weeks | Production deployment ready |
| 4. Testing | 2-3 weeks | 80%+ coverage, E2E tests |
| 5. Security Audit | 1-2 weeks | Pen test results, fixes applied |
| 6. Performance | 1-2 weeks | <500ms API, Lighthouse >90 |

**Total:** 16-23 weeks (4-6 months)

---

## Post-Launch Checklist

- [ ] SSL/TLS certificate installed (Let's Encrypt or commercial)
- [ ] Database backups automated (daily, 30-day retention)
- [ ] Disaster recovery plan tested
- [ ] Monitoring dashboards configured (Grafana)
- [ ] Error tracking active (Sentry)
- [ ] Uptime monitoring configured (StatusCake)
- [ ] Log aggregation working (CloudWatch)
- [ ] Rate limiting configured (60 req/min per user)
- [ ] GDPR compliance (data export, deletion)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] User documentation complete
- [ ] Admin training completed
- [ ] Support email/ticketing system configured
- [ ] Incident response playbook created

---

## Estimated Costs (Monthly)

**For ~1000 active users:**
- AWS EC2 (t3.large): $60
- AWS RDS (db.t3.medium): $70
- AWS S3 + CloudFront: $20
- AWS SES (email): $10
- Redis (ElastiCache): $40
- Sentry (errors): $26
- SendGrid (backup email): $15
- Domain + SSL: $5
- Monitoring tools: $20

**Total: ~$266/month**

Scale up as user base grows.

---

## When to Launch?

**MVP (Minimum Viable Product):**
- Phase 1 complete (security)
- Core workflows working (enrollment, grades, admission)
- Testing at 60%+
- Deployed to staging
- Beta testers feedback incorporated

**Production Ready:**
- All phases complete
- Testing at 80%+
- Pen test passed
- Load test passed (1000 concurrent users)
- Monitoring configured
- Backup/recovery tested
- Documentation complete

---

**Bottom Line:** This is a 6-8 month commitment with 2-3 developers to go from current state to production-ready SIS platform. Only pursue if you have the resources and market demand.
