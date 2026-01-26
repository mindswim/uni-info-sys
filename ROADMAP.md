# Feature Roadmap: Real-time, Analytics, Testing & CI/CD

This document outlines the implementation plan for four key features to elevate the University Admissions System from a portfolio project to a polished, professional demo.

**Estimated Total Effort:** 3-4 weeks

---

## Table of Contents

1. [Real-time Notifications](#1-real-time-notifications)
2. [Analytics Dashboard](#2-analytics-dashboard)
3. [E2E Testing with Playwright](#3-e2e-testing-with-playwright)
4. [GitHub Actions CI/CD](#4-github-actions-cicd)

---

## 1. Real-time Notifications

**Goal:** Show users live updates without page refresh - new messages, hold alerts, enrollment confirmations, grade posts.

**Effort:** 4-5 days

### Technology Choice: Server-Sent Events (SSE) vs WebSockets vs Polling

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Polling** | Simple, works everywhere | Inefficient, delayed | Good for MVP |
| **SSE** | Simple, one-way, auto-reconnect | One-way only | Best for notifications |
| **WebSockets** | Full duplex, real-time | Complex, needs server | Overkill for this use case |

**Recommendation:** Start with **polling** (simplest), then upgrade to **SSE** for production feel.

### Implementation Plan

#### Phase 1: Backend - Notification System Enhancement

**File:** `app/Models/Notification.php` (exists, enhance it)

```php
// Add scopes for efficient querying
public function scopeUnread($query) {
    return $query->whereNull('read_at');
}

public function scopeForUser($query, $userId) {
    return $query->where('user_id', $userId);
}

public function scopeRecent($query, $minutes = 5) {
    return $query->where('created_at', '>=', now()->subMinutes($minutes));
}
```

**File:** `app/Http/Controllers/Api/V1/NotificationController.php` (enhance existing)

Add these endpoints:
```
GET  /api/v1/notifications/poll          - Get new notifications since timestamp
GET  /api/v1/notifications/unread-count  - Get count for badge
POST /api/v1/notifications/mark-all-read - Mark all as read
```

**File:** `app/Services/NotificationService.php` (create new)

```php
class NotificationService
{
    // Centralized notification creation with types
    public function notify(User $user, string $type, array $data): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
            'created_at' => now(),
        ]);
    }

    // Trigger points throughout the app
    public function enrollmentConfirmed(Enrollment $enrollment): void;
    public function holdPlaced(Hold $hold): void;
    public function gradePosted(Enrollment $enrollment): void;
    public function assignmentDue(Assignment $assignment, Student $student): void;
    public function messageReceived(Message $message): void;
    public function applicationStatusChanged(AdmissionApplication $app): void;
}
```

#### Phase 2: Backend - Event Dispatching

**File:** `app/Events/` (create notification events)

```
NotificationCreated.php     - Fired when any notification is created
EnrollmentConfirmed.php     - Fired after successful enrollment
GradePosted.php             - Fired when instructor posts grade
HoldPlaced.php              - Fired when admin places hold
MessageReceived.php         - Fired on new message
```

**Integration Points** (add dispatch calls):
- `EnrollmentService.php:enrollStudent()` - dispatch EnrollmentConfirmed
- `GradeController.php:submitGrade()` - dispatch GradePosted
- `HoldController.php:store()` - dispatch HoldPlaced
- `MessageController.php:sendMessage()` - dispatch MessageReceived

#### Phase 3: Frontend - Polling Implementation

**File:** `frontend/src/hooks/use-notifications.ts` (create new)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface Notification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(pollInterval = 30000) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastPoll, setLastPoll] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    const params = lastPoll ? `?since=${lastPoll}` : '';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/poll${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const data = await res.json();
      setNotifications(prev => [...data.notifications, ...prev]);
      setUnreadCount(data.unread_count);
      setLastPoll(new Date().toISOString());
    }
  }, [token, lastPoll]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  const markAsRead = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead, refresh: fetchNotifications };
}
```

**File:** `frontend/src/components/notifications/notification-bell.tsx` (create new)

```typescript
// Bell icon with badge showing unread count
// Dropdown showing recent notifications
// Click to mark as read
// "View all" link to notifications page
```

**File:** `frontend/src/components/notifications/notification-toast.tsx` (create new)

```typescript
// Toast popup when new notification arrives
// Auto-dismiss after 5 seconds
// Click to navigate to relevant page
```

#### Phase 4: Integration Points

Add notification bell to:
- `frontend/src/components/layout/app-shell.tsx` - header area
- All dashboard pages - student, faculty, admin

Add toast container to:
- `frontend/src/app/layout.tsx` - root layout

### Notification Types to Implement

| Type | Trigger | Message | Link |
|------|---------|---------|------|
| `enrollment.confirmed` | Student enrolls | "You're enrolled in CS 101" | `/student/schedule` |
| `enrollment.waitlisted` | Added to waitlist | "Added to waitlist for CS 101 (position 3)" | `/student/registration` |
| `enrollment.promoted` | Moved off waitlist | "You've been enrolled in CS 101!" | `/student/schedule` |
| `grade.posted` | Instructor posts grade | "Grade posted for CS 101" | `/student/grades` |
| `hold.placed` | Admin places hold | "A hold has been placed on your account" | `/student/holds` |
| `hold.resolved` | Hold removed | "Your financial hold has been resolved" | `/student/holds` |
| `assignment.due` | 24h before due | "Assignment due tomorrow: Homework 3" | `/student/assignments` |
| `message.received` | New message | "New message from Dr. Smith" | `/messages` |
| `application.status` | Status change | "Your application status has been updated" | `/student/application` |

---

## 2. Analytics Dashboard

**Goal:** Rich data visualizations showing enrollment trends, admissions funnel, grade distributions, and system health.

**Effort:** 5-6 days

### Technology Stack

- **Charts:** [Recharts](https://recharts.org/) - React-native, composable, works with shadcn
- **Data:** Server-side aggregation via dedicated analytics endpoints
- **Caching:** Redis/database caching for expensive queries

### Implementation Plan

#### Phase 1: Backend - Analytics Service

**File:** `app/Services/AnalyticsService.php` (create new)

```php
class AnalyticsService
{
    // Enrollment Analytics
    public function getEnrollmentTrends(int $termId = null): array
    {
        // Daily enrollment counts over time
        // Compare to previous term
        // By department breakdown
    }

    public function getCapacityUtilization(): array
    {
        // Sections at capacity
        // Average fill rate by department
        // Waitlist pressure
    }

    // Admissions Analytics
    public function getAdmissionsFunnel(string $cycle = null): array
    {
        // Applications -> Under Review -> Accepted -> Enrolled
        // Conversion rates at each stage
        // Yield rate trends
    }

    public function getApplicantDemographics(): array
    {
        // By country, program interest
        // First-gen status
        // Application timeline (when do apps come in)
    }

    // Academic Analytics
    public function getGradeDistribution(int $termId = null): array
    {
        // Overall GPA distribution
        // By department
        // Comparison to previous terms
    }

    public function getAcademicStanding(): array
    {
        // Students by standing (good, warning, probation)
        // Trends over time
    }

    public function getRetentionMetrics(): array
    {
        // Term-to-term retention
        // Graduation rates
        // At-risk student identification
    }

    // Operational Analytics
    public function getHoldsOverview(): array
    {
        // By type
        // Average resolution time
        // Impact on registration
    }

    public function getFinancialSummary(): array
    {
        // Tuition collected vs outstanding
        // Financial aid disbursed
        // Payment plan utilization
    }
}
```

**File:** `app/Http/Controllers/Api/V1/AnalyticsController.php` (create new)

```php
// Endpoints - all admin-only
GET /api/v1/analytics/enrollment/trends
GET /api/v1/analytics/enrollment/capacity
GET /api/v1/analytics/admissions/funnel
GET /api/v1/analytics/admissions/demographics
GET /api/v1/analytics/academic/grades
GET /api/v1/analytics/academic/standing
GET /api/v1/analytics/academic/retention
GET /api/v1/analytics/operational/holds
GET /api/v1/analytics/operational/financial
GET /api/v1/analytics/summary  // Combined overview for dashboard
```

#### Phase 2: Frontend - Chart Components

**Install Recharts:**
```bash
cd frontend && npm install recharts
```

**File:** `frontend/src/components/charts/` (create directory)

```
line-chart.tsx           - Time series (enrollment trends)
bar-chart.tsx            - Comparisons (grade distribution)
pie-chart.tsx            - Breakdowns (demographics)
funnel-chart.tsx         - Conversion (admissions pipeline)
area-chart.tsx           - Stacked trends (capacity over time)
stat-card.tsx            - KPI with trend indicator
```

**Example: Line Chart Component**

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  date: string;
  value: number;
  previousValue?: number;
}

interface TrendChartProps {
  title: string;
  data: DataPoint[];
  showComparison?: boolean;
}

export function TrendChart({ title, data, showComparison = false }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              name="Current"
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                name="Previous"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

#### Phase 3: Analytics Dashboard Page

**File:** `frontend/src/app/admin/analytics/page.tsx` (rewrite existing)

```typescript
// Layout:
// Row 1: KPI Cards (4 columns)
//   - Total Students (trend arrow)
//   - Enrollment Rate (vs last term)
//   - Yield Rate (admissions)
//   - Avg GPA (current term)

// Row 2: Main Charts (2 columns)
//   - Enrollment Trends (line chart, 12 months)
//   - Admissions Funnel (funnel chart)

// Row 3: Breakdowns (3 columns)
//   - Grade Distribution (bar chart)
//   - Capacity by Department (horizontal bar)
//   - Student Standing (pie chart)

// Row 4: Tables
//   - At-Risk Students (low GPA, holds)
//   - Sections Near Capacity
```

#### Phase 4: Data Fetching & Caching

**File:** `frontend/src/hooks/use-analytics.ts`

```typescript
import useSWR from 'swr';

export function useAnalytics() {
  const { data: summary } = useSWR('/api/v1/analytics/summary');
  const { data: enrollmentTrends } = useSWR('/api/v1/analytics/enrollment/trends');
  const { data: admissionsFunnel } = useSWR('/api/v1/analytics/admissions/funnel');
  // ... etc

  return {
    summary,
    enrollmentTrends,
    admissionsFunnel,
    isLoading: !summary,
  };
}
```

**Backend Caching** (add to AnalyticsService):

```php
public function getEnrollmentTrends(int $termId = null): array
{
    $cacheKey = "analytics:enrollment:trends:{$termId}";

    return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($termId) {
        // Expensive aggregation query
    });
}
```

### Dashboard Mockup

```
+------------------+------------------+------------------+------------------+
|   Total Students |  Enrollment Rate |    Yield Rate    |    Avg GPA       |
|      1,247       |      94.2%       |      67.8%       |      3.24        |
|    +12 vs last   |   +2.1% vs last  |   -1.2% vs last  |   +0.08 vs last  |
+------------------+------------------+------------------+------------------+

+----------------------------------------+----------------------------------------+
|         Enrollment Trends              |          Admissions Funnel             |
|  [Line chart: 12 months of data]       |  [Funnel: Applied->Review->Accept->    |
|  - Current term line                   |           Enrolled]                    |
|  - Previous term dashed                |  - Conversion % at each stage          |
+----------------------------------------+----------------------------------------+

+---------------------------+---------------------------+---------------------------+
|    Grade Distribution     |   Capacity by Department  |    Student Standing       |
|  [Bar: A/B/C/D/F counts]  |  [Horiz bar: CS 95%,      |  [Pie: Good/Warning/      |
|                           |   Math 87%, etc.]         |        Probation]         |
+---------------------------+---------------------------+---------------------------+

+-----------------------------------------------------------------------------+
|                         At-Risk Students                                      |
|  Name              | GPA  | Standing   | Holds | Advisor    | Action         |
|  John Smith        | 1.8  | Probation  | 2     | Dr. Lee    | [View]         |
|  Jane Doe          | 2.1  | Warning    | 1     | Dr. Park   | [View]         |
+-----------------------------------------------------------------------------+
```

---

## 3. E2E Testing with Playwright

**Goal:** Automated browser tests that verify complete user workflows - login, enroll in course, view grades, etc.

**Effort:** 4-5 days

### What is Playwright?

Playwright is a browser automation tool that:
- Controls real browsers (Chrome, Firefox, Safari)
- Simulates user actions (click, type, navigate)
- Verifies outcomes (text appears, URL changes)
- Runs in CI/CD pipelines automatically

Think of it as a robot that uses your app like a real user and checks that everything works.

### Setup

**Install Playwright in frontend:**

```bash
cd frontend
npm init playwright@latest
```

Choose:
- TypeScript: Yes
- Tests folder: `e2e`
- GitHub Actions: Yes
- Install browsers: Yes

**File structure created:**

```
frontend/
  e2e/
    example.spec.ts      # Delete this
    auth.spec.ts         # Login tests
    enrollment.spec.ts   # Student enrollment tests
    grades.spec.ts       # Faculty grading tests
    admin.spec.ts        # Admin workflow tests
  playwright.config.ts   # Configuration
```

### Configuration

**File:** `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Start frontend dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Files

**File:** `frontend/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('student can log in with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill login form
    await page.fill('input[name="email"]', 'david@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Should redirect to student dashboard
    await expect(page).toHaveURL('/student');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('admin can log in and see admin dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Overview')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=credentials')).toBeVisible();
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
```

**File:** `frontend/e2e/enrollment.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Student Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as student before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'david@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/student');
  });

  test('can view available courses', async ({ page }) => {
    await page.click('text=Register for Classes');
    await expect(page).toHaveURL('/student/registration');

    // Course catalog should load
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=CS 101')).toBeVisible();
  });

  test('can enroll in an open course', async ({ page }) => {
    await page.goto('/student/registration');

    // Find a course and click enroll
    await page.click('button:has-text("Enroll"):near(:text("CS 101"))');

    // Confirmation should appear
    await expect(page.locator('text=successfully enrolled')).toBeVisible();
  });

  test('shows waitlist option for full course', async ({ page }) => {
    await page.goto('/student/registration');

    // Find a full course
    const fullCourseRow = page.locator('tr:has-text("Full")').first();
    await expect(fullCourseRow.locator('button:has-text("Waitlist")')).toBeVisible();
  });

  test('can view enrolled courses in schedule', async ({ page }) => {
    await page.click('text=My Schedule');
    await expect(page).toHaveURL('/student/schedule');

    // Should show enrolled courses
    await expect(page.locator('text=My Classes')).toBeVisible();
  });

  test('can drop a course', async ({ page }) => {
    await page.goto('/student/drop-add');

    // Find enrolled course and drop
    await page.click('button:has-text("Drop"):first');

    // Confirmation dialog
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=successfully dropped')).toBeVisible();
  });
});
```

**File:** `frontend/e2e/grades.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Faculty Grading', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as faculty
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'faculty@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('can view course roster', async ({ page }) => {
    await page.click('text=Rosters');
    await expect(page.locator('table')).toBeVisible();
  });

  test('can submit a grade for a student', async ({ page }) => {
    await page.goto('/faculty/grades');

    // Select a course section
    await page.click('text=CS 101 - Section 001');

    // Find student row and enter grade
    const studentRow = page.locator('tr:has-text("John Smith")');
    await studentRow.locator('select').selectOption('A');

    // Save
    await page.click('button:has-text("Save Grades")');

    await expect(page.locator('text=Grades saved')).toBeVisible();
  });
});
```

**File:** `frontend/e2e/admin.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('dashboard shows key metrics', async ({ page }) => {
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Pending Review')).toBeVisible();
    await expect(page.locator('text=Active Holds')).toBeVisible();
  });

  test('can view and filter students', async ({ page }) => {
    await page.click('text=Students');
    await expect(page).toHaveURL('/admin/students');

    // Search for a student
    await page.fill('input[placeholder*="Search"]', 'Smith');
    await expect(page.locator('table tr')).toHaveCount(await page.locator('table tr:has-text("Smith")').count() + 1);
  });

  test('can place a hold on a student', async ({ page }) => {
    await page.goto('/admin/students');

    // Click on a student
    await page.click('text=John Smith');

    // Add hold
    await page.click('button:has-text("Add Hold")');
    await page.selectOption('select[name="type"]', 'financial');
    await page.fill('textarea[name="reason"]', 'Unpaid tuition balance');
    await page.click('button:has-text("Create Hold")');

    await expect(page.locator('text=Hold created')).toBeVisible();
  });

  test('can review admission application', async ({ page }) => {
    await page.click('text=Applications');
    await expect(page).toHaveURL('/admin/admissions');

    // Click on pending application
    await page.click('tr:has-text("Pending"):first');

    // Accept button should be visible
    await expect(page.locator('button:has-text("Accept")')).toBeVisible();
  });
});
```

### Running Tests

**Local development:**

```bash
cd frontend

# Run all tests
npx playwright test

# Run with UI (see browser)
npx playwright test --ui

# Run specific file
npx playwright test e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

**View test report:**

```bash
npx playwright show-report
```

### Add to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

---

## 4. GitHub Actions CI/CD

**Goal:** Automatically run tests, check code quality, and verify builds whenever code is pushed.

**Effort:** 2-3 days

### What is GitHub Actions?

GitHub Actions is a CI/CD (Continuous Integration/Continuous Deployment) service built into GitHub. It:

1. **Triggers** on events (push, pull request, schedule)
2. **Runs** jobs in virtual machines (Ubuntu, Windows, macOS)
3. **Executes** steps (install deps, run tests, build, deploy)
4. **Reports** success/failure with status badges

**Why use it?**
- Catches bugs before they reach main branch
- Ensures code quality (linting, type checking)
- Runs tests automatically on every PR
- Builds confidence in code changes
- Shows professionalism in your repo (green checkmarks!)

### Workflow Files

GitHub Actions uses YAML files in `.github/workflows/` directory.

**File:** `.github/workflows/ci.yml` (main CI pipeline)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Backend Tests (Laravel/PHP)
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_mysql
          coverage: xdebug

      - name: Install Composer dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Copy environment file
        run: cp .env.example .env

      - name: Generate application key
        run: php artisan key:generate

      - name: Run database migrations
        run: php artisan migrate --force
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password

      - name: Run PHPUnit tests
        run: vendor/bin/phpunit --coverage-text
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password

      - name: Run Laravel Pint (code style)
        run: vendor/bin/pint --test

  # Job 2: Frontend Tests (Next.js/React)
  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost

  # Job 3: E2E Tests (Playwright)
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]  # Run after unit tests pass

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_mysql

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install backend dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Setup backend
        run: |
          cp .env.example .env
          php artisan key:generate
          php artisan migrate --seed --force
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password

      - name: Start backend server
        run: php artisan serve &
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password

      - name: Install frontend dependencies
        working-directory: frontend
        run: npm ci

      - name: Install Playwright browsers
        working-directory: frontend
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        working-directory: frontend
        run: npx playwright test
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 7
```

**File:** `.github/workflows/deploy.yml` (optional - deploy on merge to main)

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Add your deployment steps here
      # Examples:
      # - Deploy to Vercel (frontend)
      # - Deploy to Laravel Forge
      # - Deploy to AWS
      # - Deploy via SSH

      - name: Deploy Frontend to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
```

### Status Badge

Add to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
```

This shows a green "passing" or red "failing" badge based on your latest CI run.

### Workflow Visualization

```
Push to main or PR opened
         |
         v
+--------+--------+
|                 |
v                 v
Backend Tests     Frontend Tests
(PHPUnit,         (ESLint, TypeScript,
 Pint)            Build)
|                 |
+--------+--------+
         |
         v (if both pass)
    E2E Tests
    (Playwright)
         |
         v (if all pass)
    Deploy (optional)
```

### Branch Protection (Recommended)

In GitHub repo settings, enable branch protection for `main`:

1. Go to Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require a pull request before merging
   - Require status checks to pass (select `backend-tests`, `frontend-tests`, `e2e-tests`)
   - Require branches to be up to date

This prevents merging code that fails tests.

---

## Implementation Order

**Week 1: Foundation**
1. Set up GitHub Actions CI (backend + frontend tests)
2. Set up Playwright with basic auth tests
3. Get green CI badge on repo

**Week 2: Real-time**
4. Backend notification service
5. Frontend polling hook
6. Notification bell component
7. Toast notifications

**Week 3: Analytics**
8. Backend analytics service
9. Install Recharts
10. Build chart components
11. Complete analytics dashboard

**Week 4: Polish & E2E**
12. Expand E2E test coverage
13. Add E2E to CI pipeline
14. Fix any bugs found by E2E tests
15. Documentation updates

---

## Success Metrics

After implementation, you should have:

- [ ] Green CI badge on GitHub repo
- [ ] All PRs require passing tests to merge
- [ ] Notification bell shows real-time updates
- [ ] Analytics dashboard with 5+ charts
- [ ] 10+ E2E tests covering critical paths
- [ ] < 2 minute CI pipeline runtime
- [ ] Test coverage report in CI output

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Laravel Events](https://laravel.com/docs/events)
- [Next.js with Playwright](https://nextjs.org/docs/testing#playwright)
