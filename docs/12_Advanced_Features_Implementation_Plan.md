# Advanced Features & Production Hardening Plan

## Executive Summary
This document provides a comprehensive, step-by-step technical guide for implementing advanced features and hardening the University Admissions System for production. It expands upon the initial checklist by providing granular details for each development task, including specific roles and permissions, data schemas, controller logic, testing strategies, and code snippets. The goal is to create an unambiguous, actionable plan to streamline development, ensure quality, and facilitate incremental progress.

---

## Phase 4: Advanced Functional Features (MVP)

This phase implements critical features required for a fully functional "MVP".

### Task 1: Implement Roles & Permissions Management API ✅ COMPLETED

**Goal**: To create a dynamic RBAC system by enabling administrators to manage Roles and assign Permissions via the API after deployment.

**Status**: ✅ **COMPLETED** - Implementation successfully tested and verified

**Defined Roles & Permissions**:
The following roles and permissions form the foundation of our access control policy.

*   **Roles**:
    *   `Super Admin`: Full system access, including the ability to manage other admins and system-level settings. The ultimate authority.
    *   `Admin`: Manages core academic structure (Faculties, Departments, Programs), courses, terms, staff, and student records. Can view audit logs.
    *   `Admissions Officer`: Manages admission applications, reviews submitted documents, and updates application statuses.
    *   `Faculty`: Manages course sections they are assigned to, including uploading grades and viewing enrollments for their sections.
    *   `Student`: Manages their own profile, applications, documents, and course enrollments.

*   **Permissions (granular actions)**:
    *   `roles.manage`: Create, read, update, delete, and assign roles.
    *   `permissions.view`: View available permissions in the system.
    *   `users.manage`: Manage user accounts.
    *   `hierarchy.manage`: Manage Faculties, Departments, and Programs.
    *   `courses.manage`: CRUD operations for courses and their prerequisites.
    *   `course-sections.manage`: CRUD operations for course sections, including assigning instructors.
    *   `students.manage`: Access and manage student data.
    *   `enrollments.manage`: Admin-level management of all student enrollments.
    *   `enrollments.manage.own`: Student-level ability to enroll in or drop courses.
    *   `grades.upload`: Ability to upload grades for an assigned course section (Faculty).
    *   `applications.manage`: Manage admission applications.
    *   `documents.manage`: Admin-level access to all user documents.
    *   `documents.manage.own`: Student-level access to their own documents.

**Implementation Steps**:
1.  **Generate Scaffolding**: Create the necessary controllers and requests. Permissions will be read-only from the API side (defined in code).
    ```bash
    php artisan make:controller Api/V1/RoleController --api --model=Role
    php artisan make:controller Api/V1/PermissionController --api
    php artisan make:request StoreRoleRequest
    php artisan make:request UpdateRoleRequest
    php artisan make:request SyncPermissionsRequest
    ```
2.  **Define API Routes**: In `routes/api.php`, add endpoints for roles and permissions.
    ```php
    // In routes/api.php, within the auth:sanctum and admin middleware group
    Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class);
    Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\V1\RoleController::class, 'syncPermissions']);
    Route::apiResource('permissions', \App\Http\Controllers\Api\V1\PermissionController::class)->only(['index']);
    ```
3.  **Implement Controller Logic**:
    *   `RoleController`: Implement full CRUD (`index`, `store`, `show`, `update`, `destroy`). The `syncPermissions` method will accept an array of permission IDs and use the existing `permissions()->sync()` method on the `Role` model. Authorize all methods using `RolePolicy`.
    *   `PermissionController`: The `index` method will return a list of all available permissions, seeded from your `RolePermissionSeeder`. This is for UIs to dynamically display available permissions.
4.  **Implement Policies & Requests**:
    *   `RolePolicy`: All methods should check if `auth()->user()->can('roles.manage')`.
    *   `StoreRoleRequest` / `UpdateRoleRequest`: Validate `name` is unique and a string.
    *   `SyncPermissionsRequest`: Validate that the `permissions` field is an array of existing permission IDs.
5.  **Create API Resources**: Generate `RoleResource` and `PermissionResource` to standardize the JSON output, including nested permissions for a role.
6.  **Add OpenAPI Annotations**: Fully document all endpoints in `RoleController` and `PermissionController`, specifying request bodies, responses, and security requirements.

**Testing & Verification**:
*   Create `tests/Feature/Api/V1/RoleManagementApiTest.php`.
*   **Test Cases**:
    *   Assert that a non-admin user receives a 403 Forbidden error when trying to access any role or permission endpoints.
    *   Assert that an admin can successfully list, create, view, update, and delete roles.
    *   Assert that an admin can successfully attach and detach permissions from a role using the `syncPermissions` endpoint.
    *   Assert that a user assigned a new role gains the intended permissions.

---

### Task 2: Implement Bulk Course Import via CSV

**Goal**: To allow administrators to efficiently create or update hundreds of courses from a single CSV file.

**User Story / Role**: This feature is exclusively for users with the `Admin` role.

**Data Schema (CSV Format)**: The CSV file must contain the following headers:
*   `course_code` (string, required, unique)
*   `title` (string, required)
*   `description` (string, optional)
*   `credits` (integer, required, min:1)
*   `department_code` (string, required, must exist in `departments` table)
*   `prerequisite_course_codes` (string, optional, comma-separated list of existing `course_code`s)

**Implementation Steps**:
1.  **Generate Components**:
    ```bash
    php artisan make:controller Api/V1/CourseImportController
    php artisan make:request StoreCourseImportRequest
    php artisan make:job ProcessCourseImport
    ```
2.  **Define Route**: In `routes/api.php`:
    ```php
    Route::post('imports/courses', [\App\Http\Controllers\Api\V1\CourseImportController::class, 'store'])->middleware('can:courses.manage');
    ```
3.  **Implement Controller Logic**:
    *   The `store` method in `CourseImportController` will authorize the user, validate the request using `StoreCourseImportRequest`, store the uploaded CSV in a private directory (e.g., `storage/app/imports`), and dispatch the `ProcessCourseImport` job.
    *   Return a `202 Accepted` response with a message indicating the import has started.
4.  **Implement Job Logic (`ProcessCourseImport`)**:
    *   The job's `handle` method will parse the stored CSV file.
    *   Iterate through each row. For each row, use `DB::transaction()` to:
        1.  Validate the data (e.g., `department_code` exists, `credits` is numeric).
        2.  Use `Course::updateOrCreate(['course_code' => $row['course_code']], ...)` to add/update the course.
        3.  If `prerequisite_course_codes` are present, parse them, find the corresponding `Course` models, and sync the prerequisites.
    *   **Error Handling**: Log any rows that fail validation to a separate log file, including the row number and error message. Do not stop the import for invalid rows.
    *   **Notification**: Upon completion, send a notification (e.g., email) to the initiating user summarizing the results (e.g., "Successfully imported 95 courses. 5 rows failed. See error log for details.").
5.  **Add OpenAPI Annotations**: Document the `multipart/form-data` endpoint, including the expected file format and the `202 Accepted` response.

**Testing & Verification**:
*   **Unit Test**: Create `tests/Unit/Jobs/ProcessCourseImportTest.php`. Test the job's `handle` method with a mock CSV containing both valid and invalid data. Assert that valid courses are created/updated and invalid ones are logged.
*   **Feature Test**: Create `tests/Feature/Api/V1/CourseImportApiTest.php`. Test the upload endpoint using `Storage::fake()` for the CSV and `Queue::fake()` to assert `ProcessCourseImport` is dispatched. Test authorization rules.

---

### Task 3: Implement Bulk Grade Upload via CSV

**Goal**: To enable faculty to efficiently upload final grades for an entire course section from a single CSV file.

**User Story / Role**: This feature is for users with the `Faculty` role who are assigned as the instructor for the target course section.

**Data Schema (CSV Format)**: The CSV must contain the following headers:
*   `student_id` (integer, required, must correspond to a student enrolled in the section)
*   `grade` (string, required, e.g., 'A', 'B+', 'C-', 'F')

**Implementation Steps**:
1.  **Generate Components**:
    ```bash
    php artisan make:controller Api/V1/GradeImportController
    php artisan make:request StoreGradeImportRequest
    php artisan make:job ProcessGradeImport
    ```
2.  **Define Route**: In `routes/api.php`:
    ```php
    Route::post('course-sections/{courseSection}/import-grades', [\App\Http\Controllers\Api\V1\GradeImportController::class, 'store']);
    ```
3.  **Implement Controller Logic**:
    *   The `store` method in `GradeImportController` will use `CourseSectionPolicy` to authorize that the authenticated user is the instructor for the given `{courseSection}`.
    *   It will then validate the file upload, store it, and dispatch `ProcessGradeImport`, passing the course section and user to the job.
4.  **Implement Job Logic (`ProcessGradeImport`)**:
    *   The job will parse the CSV.
    *   For each row, it will find the `Enrollment` record for the given `student_id` within the specific `course_section_id`.
    *   It will validate the `grade` against a predefined list of valid grades.
    *   If valid, it will update the `grade` on the `Enrollment` model.
    *   Log errors for any student not found or invalid grades.
    *   Send a completion notification to the faculty member.
5.  **Add OpenAPI Annotations**: Document the new endpoint, specifying the route model binding and security requirements.

**Testing & Verification**:
*   **Unit Test**: Test `ProcessGradeImport` with valid/invalid student IDs and grade formats.
*   **Feature Test**: Create `tests/Feature/Api/V1/GradeImportApiTest.php`. Test that only the authorized instructor can upload grades for their section. Assert that other users (admins, other faculty, students) receive a 403 error.

---

## Phase 5: Enterprise Polish Features

### Task 4: Implement Wait-list Auto-Promotion

**Goal**: To automate enrollment by promoting the next student from the waitlist when a spot becomes available in a full course section.

**Implementation Steps**:
1.  **Refactor Existing Job**: The `ProcessWaitlistPromotion` job already exists and handles waitlist promotion logic. Review and enhance it if needed to ensure it properly promotes the next student from the waitlist when a spot becomes available.
    *   The job's `handle` method accepts a `CourseSection` model and uses the `EnrollmentService->promoteFromWaitlist()` method to find and promote the highest-priority waitlisted student (FIFO - first in, first out based on `created_at`).
2.  **Dispatch Job on Withdrawal**: In `EnrollmentService@withdrawStudent`, after successfully removing a student from a course section (which frees up a spot), dispatch the job.
    ```php
    // In EnrollmentService.php
    public function withdrawStudent(...) {
        // ... withdrawal logic ...
        if ($courseSection->is_full === false) {
             ProcessWaitlistPromotion::dispatch($courseSection);
        }
        return true;
    }
    ```
3.  **Create Scheduled Command**: Create a command to periodically check all waitlists. This acts as a failsafe.
    ```bash
    php artisan make:command CheckWaitlists --command=waitlists:check
    ```
    *   **Logic**: The command will find all `CourseSection`s that are not full but have students on their waitlist. For each section, it will dispatch `ProcessWaitlistPromotion::dispatch($section)`.
    *   **Schedule**: In `app/Console/Kernel.php`, schedule the command to run frequently during peak registration periods.
    ```php
    // In Kernel.php
    $schedule->command('waitlists:check')->everyFiveMinutes();
    ```

**Testing & Verification**:
*   **Unit Test**: Test the `ProcessWaitlistPromotion` job logic directly (already exists in `tests/Unit/Jobs/BackgroundJobsTest.php`).
*   **Integration Test**: Update `EnrollmentServiceTest` to assert the job is dispatched on withdrawal.
*   **Feature Test**: Test the scheduled command.

---

### Task 5: Implement Grade-Change Audit Trail

**Goal**: For compliance and academic integrity, create an immutable audit trail for all grade changes.

**Implementation Steps**:
1.  **Use Existing Auditing Package**: The `owen-it/laravel-auditing` package is already installed and configured.
2.  **Make `Enrollment` Auditable**: In `app/Models/Enrollment.php`, implement the `Auditable` contract and use the trait.
    ```php
    // In app/Models/Enrollment.php
    use OwenIt\Auditing\Contracts\Auditable;

    class Enrollment extends Model implements Auditable
    {
        use \OwenIt\Auditing\Auditable;
        // ...
    }
    ```
3.  **Configure Audited Fields**: In the `Enrollment` model, specify that only `updated` events for the `grade` field should be audited.
    ```php
    // In app/Models/Enrollment.php
    protected $auditableEvents = [
        'updated',
    ];

    protected $auditInclude = [
        'grade',
        'status', // Also good to audit status changes e.g., 'enrolled' -> 'completed'
    ];
    ```
4.  **Enforce Reason for Change**:
    *   The existing `PUT /api/v1/enrollments/{enrollment}` endpoint is used to update grades.
    *   Modify `UpdateEnrollmentRequest` to require a `reason_for_change` field *only when the grade is being changed*.
    ```php
    // In UpdateEnrollmentRequest.php
    public function rules(): array
    {
        return [
            'grade' => 'sometimes|string|max:4',
            'reason_for_change' => 'required_with:grade|string|max:255',
        ];
    }
    ```
5.  **Store Custom Field in `EnrollmentController`**: Before saving the update, attach the reason to the audit record.
    ```php
    // In EnrollmentController@update
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        $enrollment->setCustomField('reason_for_change', $request->input('reason_for_change'));
        
        $enrollment->update($request->validated());

        return new EnrollmentResource($enrollment);
    }
    ```

**Testing & Verification**:
*   Create `tests/Feature/AuditingTest.php`.
*   **Test Case**: Make a `PUT` request to update an enrollment's grade, including a `reason_for_change`. Assert the grade was updated. Then, query the `audits` table and assert that a new record was created with the correct `auditable_type`, `auditable_id`, `old_values`, `new_values`, and that the `reason_for_change` is present in the `custom_fields` column.

---

### Task 6: Implement Enrollment Swap/Drop Window

**Goal**: To enforce academic deadlines by allowing course swaps and drops only within the official window defined in the `Term` model.

**Implementation Steps**:
1.  **Create Migration**: Add `add_drop_deadline` (datetime) to the `terms` table.
    ```bash
    php artisan make:migration add_add_drop_deadline_to_terms_table --table=terms
    ```
    ```php
    // In the migration file
    $table->timestamp('add_drop_deadline')->nullable()->after('end_date');
    ```
2.  **Update `EnrollmentPolicy`**: Modify the `create` (enroll) and `delete` (drop) methods to check the deadline.
    ```php
    // In app/Policies/EnrollmentPolicy.php
    public function create(User $user, CourseSection $courseSection): bool
    {
        return now()->lt($courseSection->term->add_drop_deadline);
    }

    public function delete(User $user, Enrollment $enrollment): bool
    {
        return now()->lt($enrollment->courseSection->term->add_drop_deadline);
    }
    ```
3.  **Implement Swap Endpoint**: A "swap" is an atomic drop-and-add operation.
    *   `php artisan make:controller Api/V1/EnrollmentSwapController`
    *   `php artisan make:request StoreEnrollmentSwapRequest`
    *   **Route**: `POST /enrollments/swap`, handled by `EnrollmentSwapController@store`.
    *   **Request**: `StoreEnrollmentSwapRequest` should validate `from_enrollment_id` and `to_course_section_id`.
    *   **Logic**: The `store` method wraps the entire operation in a `DB::transaction()`.
        1.  Find the "from" enrollment and "to" course section.
        2.  Authorize that the user can `delete` the "from" enrollment (checks owner and deadline).
        3.  Authorize that the user can `create` an enrollment in the "to" section (checks deadline).
        4.  Call the `EnrollmentService` to perform the withdrawal.
        5.  Call the `EnrollmentService` to perform the new enrollment. If it fails (e.g., section is now full), the transaction will roll back the withdrawal.

**Testing & Verification**:
*   Create `tests/Feature/Api/V1/EnrollmentSwapApiTest.php`.
*   **Test Cases**:
    *   Test that a swap succeeds before the deadline.
    *   Test that a swap fails after the deadline, returning a 403.
    *   Test that if the "add" part of a swap fails (e.g., target section is full), the "drop" part is correctly rolled back and the student remains in their original course.

---

### Task 7: Implement Document Versioning

**Goal**: To maintain a history of student-submitted documents (e.g., transcripts) by versioning them instead of overwriting them.

**Implementation Steps**:
1.  **Create Migration**: Add `version` (integer, default 1) and `is_active` (boolean, default true, with an index) to the `documents` table.
    ```bash
    php artisan make:migration add_versioning_to_documents_table --table=documents
    ```
    ```php
    // In the migration file
    $table->unsignedInteger('version')->default(1);
    $table->boolean('is_active')->default(true)->index();
    ```
2.  **Refactor `DocumentController@store`**: When a student uploads a file for a document type they've already submitted:
    *   Within a `DB::transaction()`:
        1.  Find the highest existing version for that student and `document_type`. The new version is `max(version) + 1`.
        2.  Set `is_active` to `false` on all previous document versions for that student and `document_type`.
        3.  Save the new file record with the new version number and `is_active = true`.
3.  **Update Relationships in `Student` model**:
    *   The existing `documents()` relationship should only return the *active* versions for normal use.
    *   Create a new relationship `allDocuments()` for admins to view the full history.
    ```php
    // In app/Models/Student.php
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class)->where('is_active', true);
    }

    public function allDocuments(): HasMany
    {
        return $this->hasMany(Document::class)->orderBy('version', 'desc');
    }
    ```

**Testing & Verification**:
*   Update `tests/Feature/DocumentCrudTest.php`.
*   **Test Cases**:
    *   A student uploads a transcript for the first time. Assert it is version 1 and active.
    *   The student uploads a new transcript of the same type. Assert the old one is now `is_active = false`, and the new one is `is_active = true` and `version = 2`.
    *   Assert the standard student API endpoint only returns the active document.

---

### Task 8: Implement API-based Password Reset

**Goal**: To provide a secure, stateless "forgot password" flow for API consumers, distinct from the web UI flow.

**Implementation Steps**:
1.  **Create Controller**: Use a dedicated controller for this API flow.
    ```bash
    php artisan make:controller Api/V1/Auth/PasswordResetController
    ```
2.  **Define API Routes**: In `routes/api.php` (outside the `auth:sanctum` group).
    ```php
    use App\Http\Controllers\Api\V1\Auth\PasswordResetController;

    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->name('api.password.email');
    Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('api.password.update');
    ```
3.  **Implement Logic**: Use Laravel's built-in `Password` broker, which handles token generation and storage securely.
    *   `sendResetLinkEmail(Request $request)`: Validate the `email` field. Call `Password::sendResetLink($request->only('email'))`. Return a JSON response based on the status (e.g., `Password::RESET_LINK_SENT`).
    *   `reset(Request $request)`: Validate `email`, `password`, `password_confirmation`, and `token`. Call `Password::reset($request->only(...))`. Return a JSON response based on the status.
4.  **Add OpenAPI Annotations**: Document both endpoints, clearly explaining the expected request payloads and possible success/error responses.

**Testing & Verification**:
*   Create `tests/Feature/Api/V1/PasswordResetApiTest.php`.
*   **Test Case**: Simulate the full flow:
    1.  Call `POST /forgot-password`. Assert a `200 OK` response.
    2.  (Cannot test email sending directly, but can mock the `Password` broker).
    3.  Extract the token (in a real test, you might need to query the `password_reset_tokens` table).
    4.  Call `POST /reset-password` with the token and a new password. Assert a `200 OK` and that the user can now log in with the new password.

---

## Phase 6: Non-Functional Hardening

### Task 9: Implement Structured Logging & Tracing

**Goal**: To improve monitoring and debugging by transitioning to structured (JSON) logs with a unique trace ID for every request.

**Implementation Steps**:
1.  **Configure JSON Logging**: In `config/logging.php`, create a new `json` channel and add it to the `api` stack.
    ```php
    // In config/logging.php
    'channels' => [
        'json' => [
            'driver' => 'monolog',
            'handler' => Monolog\Handler\StreamHandler::class,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
            'with' => [
                'stream' => storage_path('logs/laravel.log'),
            ],
        ],
        // ...
        'api' => [
            'driver' => 'stack',
            'channels' => ['json'],
            'ignore_exceptions' => false,
        ],
    ],
    ```
2.  **Add Trace ID Middleware**:
    ```bash
    php artisan make:middleware AddTraceIdToLogs
    ```
    *   **Logic**: Generate a UUID if the `X-Request-ID` header isn't present. Push it to the logging context. It will then be automatically included in all subsequent logs for that request.
    ```php
    // In app/Http/Middleware/AddTraceIdToLogs.php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Log;

    public function handle($request, Closure $next)
    {
        $traceId = $request->header('X-Request-ID') ?: (string) Str::uuid();
        Log::withContext(['request_id' => $traceId]);
        return $next($request);
    }
    ```
3.  **Register Middleware**: Add to the `api` group in `app/Http/Kernel.php`.

**Testing & Verification**: This is primarily a manual verification task.
*   Make an API request using a tool like Postman.
*   Inspect `storage/logs/laravel.log`. Verify that the log entry is a JSON object and contains the `request_id` in its `context` property.

---

### Task 10: Implement Standardized Error Envelopes (RFC 7807)

**Goal**: To professionalize the API by making all error responses conform to the IETF's RFC 7807 "Problem Details for HTTP APIs" standard.

**Implementation Steps**:
1.  **Update Exception Handler**: In `bootstrap/app.php`, modify the `renderable` for API requests.
    ```php
    // In bootstrap/app.php -> using(function (Exceptions $exceptions) { ... })
    $exceptions->renderable(function (Throwable $e, Request $request) {
        if ($request->is('api/*')) {
            $problem = \App\Exceptions\ProblemDetails::fromException($e);
            return $problem->toResponse();
        }
    });
    ```
2.  **Create `ProblemDetails` Class**: Create a dedicated class to build the response.
    ```php
    // In app/Exceptions/ProblemDetails.php (new file)
    class ProblemDetails {
        public function __construct(public string $type, public string $title, public int $status, public string $detail) {}

        public static function fromException(Throwable $e): self {
            // Logic to map different exception types (NotFoundHttpException, ValidationException, etc.) to a ProblemDetails object.
        }

        public function toResponse(): JsonResponse {
            return response()->json([
                'type' => $this->type,
                'title' => $this->title,
                'status' => $this->status,
                'detail' => $this->detail,
            ], $this->status);
        }
    }
    ```
3.  **Map Exceptions**: In `fromException`, handle common exceptions:
    *   `NotFoundHttpException`: status 404, title 'Resource Not Found'.
    *   `AuthenticationException`: status 401, title 'Unauthenticated'.
    *   `AuthorizationException`: status 403, title 'Forbidden'.
    *   `ValidationException`: status 422, title 'Validation Error', and add an `errors` array to the JSON response.
    *   Default/`Throwable`: status 500, title 'Internal Server Error'.

**Testing & Verification**:
*   Update existing feature tests that check for 404, 403, 422, etc., errors.
*   Instead of asserting `response->assertJson(['message' => ...])`, assert the new RFC 7807 structure: `response->assertJson(['type' => ..., 'title' => ..., ...])`.

---

### Task 11: Implement Prometheus Metrics Endpoint

**Goal**: To expose key application metrics (e.g., request latency, counts, job throughput) for monitoring via a Prometheus scraper.

**Implementation Steps**:
1.  **Install Package**: `composer require promphp/prometheus_client_php`
2.  **Create Metrics Service**: Create `app/Services/MetricsService.php` as a singleton to register and hold Prometheus metrics.
    *   Register a `http_requests_total` counter and `http_request_duration_seconds` histogram in the service provider.
3.  **Create Middleware**: `php artisan make:middleware PrometheusMetrics`.
    *   In the `handle` method, start a timer.
    *   In a `terminate` method (which runs after the response is sent), stop the timer, record the duration in the histogram, and increment the request counter, including labels for route, method, and status code.
4.  **Define Route & Controller**:
    *   `php artisan make:controller MetricsController`
    *   Route: `GET /metrics`, handled by `MetricsController@index`.
    *   The controller will fetch the registry from `MetricsService` and use the `RenderTextFormat` from the Prometheus package to return the metrics in the correct text format.
5.  **Register Middleware**: Add to the `api` group in `app/Http/Kernel.php`.

**Testing & Verification**:
*   Create `tests/Feature/MetricsEndpointTest.php`.
*   **Test Case**: Hit a few different API endpoints. Then, make a `GET` request to `/metrics`. Assert that the response body contains strings like `http_requests_total` and that the counter value reflects the number of requests made.

---

### Task 12: Implement Security Headers Middleware

**Goal**: To harden the application against common web vulnerabilities like clickjacking and XSS by adding security-related HTTP headers to all responses.

**Implementation Steps**:
1.  **Create Middleware**: `php artisan make:middleware AddSecurityHeaders`.
2.  **Add Headers**: In the middleware's `handle` method, add headers to the outgoing response.
    ```php
    // In app/Http/Middleware/AddSecurityHeaders.php
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        // A restrictive Content-Security-Policy is a good idea, but requires careful tuning.
        // $response->headers->set('Content-Security-Policy', "default-src 'self'");
        return $response;
    }
    ```
3.  **Register Middleware**: Add it to the global middleware stack in `app/Http/Kernel.php` to apply it to all web and API responses.

**Testing & Verification**:
*   Create `tests/Feature/SecurityHeadersTest.php`.
*   **Test Case**: Make a simple `GET` request to a public endpoint (like `/`). Use `$response->assertHeader('X-Frame-Options', 'SAMEORIGIN');` and assert the presence and value of the other headers. 