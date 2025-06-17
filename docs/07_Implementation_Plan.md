# Backend Implementation Plan

This document translates the Backend Enhancement Roadmap into a series of discrete, actionable development tasks. Each task follows the structured workflow defined in the Collaborative Development Task Framework to ensure incremental progress and maintain quality through human-in-the-loop verification.

---

## [CRITICAL] Priority Tasks

### Task 1: Implement and Enforce Authorization

**Goal**: Remediate a critical security vulnerability by implementing and enforcing a comprehensive authorization layer using Laravel Policies, leveraging the existing but currently unused Role-Based Access Control (RBAC) system.

**Implementation Steps**:
1.  **Generate Policy Files**: Use the `php artisan make:policy` command to generate policy files for all relevant models.
    ```bash
    php artisan make:policy StudentPolicy --model=Student
    php artisan make:policy EnrollmentPolicy --model=Enrollment
    php artisan make:policy CourseSectionPolicy --model=CourseSection
    php artisan make:policy AdmissionApplicationPolicy --model=AdmissionApplication
    php artisan make:policy CoursePolicy --model=Course
    php artisan make:policy ProgramPolicy --model=Program
    php artisan make:policy DepartmentPolicy --model=Department
    php artisan make:policy FacultyPolicy --model=Faculty
    php artisan make:policy TermPolicy --model=Term
    php artisan make:policy BuildingPolicy --model=Building
    php artisan make:policy RoomPolicy --model=Room
    php artisan make:policy StaffPolicy --model=Staff
    php artisan make:policy DocumentPolicy --model=Document
    php artisan make:policy ProgramChoicePolicy --model=ProgramChoice
    php artisan make:policy AcademicRecordPolicy --model=AcademicRecord
    ```
2.  **Register Policies**: In `app/Providers/AuthServiceProvider.php`, register all newly created policies in the `$policies` array.
3.  **Implement Policy Logic**: For each policy, implement the `viewAny`, `view`, `create`, `update`, and `delete` methods. The logic should use the `hasPermission()` and `hasRole()` helpers available on the `User` model, as well as ownership checks (e.g., `$user->id === $enrollment->student->user_id`).
4.  **Enforce Policies in Controllers**: In every controller method that corresponds to a policy, add a call to `$this->authorize()`. For example, in `Api/V1/StudentController::show(Student $student)`, the first line should be `$this->authorize('view', $student);`. This should be done for all CRUD operations in all relevant controllers.
5.  **Remove Manual Checks**: Remove any old, manual authorization checks from controllers (e.g., `if ($application->student_id !== $student->id)`).

**Testing & Verification**:
1.  **Update Feature Tests**: Modify existing feature tests to include assertions for unauthorized access. For each protected endpoint, add a test case with a user who *should not* have access and assert they receive a `403 Forbidden` response.
2.  **Run Full Test Suite**: Execute the entire test suite via `php artisan test`. All existing tests should continue to pass, proving that the authorization logic has not broken existing functionality for users who *do* have the correct permissions.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 1 is complete. The implementation has been verified, and all associated tests are passing.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 2. Please confirm.**

---

### Task 2: Replace Scribe with OpenAPI/Swagger

**Goal**: Replace the Scribe documentation generator with an industry-standard OpenAPI (Swagger) setup to provide a more professional, interactive, and universally recognized API documentation interface.

**Implementation Steps**:
1.  **Remove Scribe**: Run `composer remove scribe-php/scribe`. Manually delete the `config/scribe.php` file, the `resources/views/scribe` directory, `storage/app/scribe` and `storage/responses` directories.
2.  **Install Swagger Package**: Run `composer require darkaonline/l5-swagger`.
3.  **Publish Configuration**: Run `php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"`.
4.  **Add Base Annotations**: Add a main `OA\Info` annotation to the base controller at `app/Http/Controllers/Controller.php` to define the API's title, version, and description.
5.  **Annotate API Controllers**: Systematically go through each API controller in `app/Http/Controllers/Api/V1` and add OpenAPI annotations (`@OA\Get`, `@OA\Post`, `@OA\Parameter`, `@OA\Schema`, etc.) to thoroughly document every endpoint.
6.  **Generate Documentation**: Run `php artisan l5-swagger:generate`.

**Testing & Verification**:
1.  **Access Documentation UI**: Start the local server (`php artisan serve`) and navigate to `/api/documentation`.
2.  **Verify Content**: Confirm that the Swagger UI loads correctly, all API endpoints are listed, and the documentation is accurate.
3.  **Test "Try it out"**: Use the "Try it out" feature to make a live API call to an unauthenticated endpoint (e.g., `GET /api/v1/faculties`) and verify a successful `200 OK` response is received and displayed.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 2 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 3. Please confirm.**

---

### Task 3: Implement API Rate Limiting

**Goal**: Implement API rate limiting as a fundamental security measure to prevent abuse and ensure service stability for all users.

**Implementation Steps**:
1.  **Configure Rate Limiter**: Open `bootstrap/app.php`. In the `withMiddleware` section, find the `throttle` alias and ensure it's configured. For Laravel 11, this is typically handled via `withRouting`. We just need to ensure the `api` middleware group in `routes/api.php` has `throttle:api`.
2.  **Define `api` Limiter**: In `app/Providers/RouteServiceProvider.php` (or `bootstrap/app.php` for new apps), ensure the `api` limiter is defined. A good default is `Limit::perMinute(60)->by($request->user()?->id ?: $request->ip())`.
3.  **Apply Middleware**: In `routes/api.php`, ensure the main API group uses the `throttle:api` middleware.

**Testing & Verification**:
1.  **Manual Verification**: Use an API client (like `curl` or Postman) to make more than 60 requests in a minute to any API endpoint.
2.  **Assert 429 Response**: Verify that after the 60th request, the API returns a `429 Too Many Requests` status code.
3.  **Check Headers**: Inspect the headers of a successful response to ensure `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` are present.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 3 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 4. Please confirm.**

---

## [HIGH] Priority Tasks

### Task 4: Refactor Enrollment Logic into a Dedicated Service

**Goal**: Improve code architecture by centralizing scattered enrollment business logic from `EnrollmentController` and `StoreEnrollmentRequest` into a new `EnrollmentService` class, making it more reusable, testable, and maintainable.

**Implementation Steps**:
1.  **Create Service Class**: Create a new file at `app/Services/EnrollmentService.php`.
2.  **Implement `enrollStudent` Method**: Create a public method `enrollStudent(array $data): Enrollment`. Move all complex business logic (checking for duplicates, student status, course capacity, determining status) from `StoreEnrollmentRequest` into this method. The service should throw custom, specific exceptions for business rule violations (e.g., `EnrollmentCapacityExceededException`, `DuplicateEnrollmentException`).
3.  **Implement `promoteFromWaitlist` Method**: Move the logic from the private `promoteFromWaitlist` method in `EnrollmentController` into a public method in the `EnrollmentService`.
4.  **Simplify Form Request**: Refactor `StoreEnrollmentRequest` to only handle validation of input presence and types (e.g., `student_id` is required and exists in the database). Remove the `after()` hook and complex closures.
5.  **Refactor Controller**: Inject `EnrollmentService` into `EnrollmentController::store()`. Replace the existing logic with a call to `$this->enrollmentService->enrollStudent($request->validated())`. Wrap the call in a `try/catch` block to handle exceptions from the service and return appropriate HTTP error responses.

**Testing & Verification**:
1.  **Create Unit Test**: Create a new unit test: `php artisan make:test Services/EnrollmentServiceTest --unit`.
2.  **Test Business Logic**: In the new test file, write specific tests for each business rule in the `enrollStudent` method (e.g., test that it throws an exception when a course is full, test that it correctly waitlists a student). Mock dependencies as needed.
3.  **Update Feature Test**: Run the existing `EnrollmentTest` feature test (`php artisan test --filter EnrollmentTest`). All tests related to creating enrollments should pass, confirming the refactoring did not alter the API's external behavior.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 4 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 5. Please confirm.**

---

### Task 5: Add Basic Caching Layer

**Goal**: Improve API performance and demonstrate optimization awareness by implementing a strategic caching layer for frequently accessed, semi-static data.

**Implementation Steps**:
1.  **Identify Endpoints**: Target read-heavy, low-volatility endpoints for caching. Good candidates are the `index` methods of `FacultyController`, `DepartmentController`, and `CourseController`.
2.  **Implement Caching**: In the selected controller methods, wrap the Eloquent query in a `Cache::remember()` block. Use a descriptive cache key and a reasonable TTL (Time To Live), for example: `Cache::remember('courses.all', 3600, function () { ... });`.
3.  **Implement Cache Invalidation**: In the `store`, `update`, and `destroy` methods of the same controllers, add logic to invalidate the cache using `Cache::forget('your.cache.key')`. For more complex scenarios involving relationships, consider using model observers to automatically clear relevant caches.

**Testing & Verification**:
1.  **Manual Verification**: Use an API client to make a request to a cached endpoint (e.g., `GET /api/v1/courses`). Note the response time. Make the same request again and verify the response time is significantly faster.
2.  **Programmatic Verification**: Temporarily add `Log::info('Cache miss')` inside the `Cache::remember` closure. Make two identical API requests. Verify that "Cache miss" is logged only on the first request.
3.  **Test Invalidation**: Make a `POST` or `PUT` request to modify a resource, then immediately make a `GET` request. Verify the returned data includes the changes, proving the cache was invalidated correctly.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 5 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 6. Please confirm.**

---
### Task 6: Implement Comprehensive Error Handling

**Goal**: Enhance API professionalism and debuggability by creating custom exceptions and a centralized handler to produce consistent, informative JSON error responses.

**Implementation Steps**:
1.  **Create Custom Exceptions**: Create a new directory `app/Exceptions`. Inside, create new exception classes for domain-specific errors identified during the service refactoring (e.g., `EnrollmentCapacityExceededException.php`, `PrerequisiteNotMetException.php`). These should extend `\Exception`.
2.  **Update Exception Handler**: Open `bootstrap/app.php`. In the `withExceptions` section, use the `$exceptions->renderable()` method to register custom rendering logic for your new exceptions. When the request expects JSON (`$request->expectsJson()`), return a standardized JSON error response with an appropriate message and HTTP status code (e.g., 422 Unprocessable Entity).
3.  **Add Logging**: Within the `renderable` closures, add logging (`Log::error(...)`) to record important context about the exception for easier debugging.

**Testing & Verification**:
1.  **Update Feature Tests**: Add or modify feature tests to assert that specific actions trigger the new custom exceptions and result in the correct JSON error response format and status code. For example, test that attempting to enroll in a full course section returns a 422 status with a `{ "message": "Course section is at full capacity" }` body.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 6 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 7. Please confirm.**

---

### Task 7: Fix Broken `storeDraft` Route

**Goal**: Resolve a bug where a defined API route for creating draft applications points to a non-existent controller method.

**Implementation Steps**:
1.  **Locate Route**: Find the route `POST /applications/draft` in `routes/web.php` or `routes/api.php`. It points to `AdmissionApplicationController::storeDraft`.
2.  **Create Controller Method**: In `app/Http/Controllers/AdmissionApplicationController.php`, create the missing `public function storeDraft(Request $request)` method.
3.  **Implement Logic**: The method should retrieve the authenticated user's student model. It will then inject and call the existing `AdmissionService::createDraftApplication` method, passing the student model to it.
4.  **Return Response**: Return a `201 Created` response containing the newly created draft application, wrapped in an `AdmissionApplicationResource`.

**Testing & Verification**:
1.  **Create Feature Test**: Create a new test in `tests/Feature/AdmissionApplicationControllerTest.php` named `test_can_create_a_draft_application`.
2.  **Test Implementation**: The test should authenticate as a student, make a `POST` request to `/applications/draft`, and assert a `201 Created` status code and that the response contains the correct application structure with a 'draft' status.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 7 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 8. Please confirm.**

---

## [MEDIUM] Priority Tasks

### Task 8: Refactor Controller Query Filtering

**Goal**: Clean up "fat" controller methods by refactoring complex query filtering logic into a dedicated, reusable filter class.

**Implementation Steps**:
1.  **Create Filter Class**: Create a new file: `app/Filters/EnrollmentFilter.php`.
2.  **Implement `apply` Method**: Inside the class, create a public method `apply(Builder $query, array $filters): Builder`.
3.  **Move Logic**: Move the conditional `if (isset($request->...))` blocks for filtering from `EnrollmentController::index()` into the `apply` method. The method should check for keys in the `$filters` array and apply the corresponding `where` or `whereHas` clauses to the query builder instance.
4.  **Refactor Controller**: In `EnrollmentController::index()`, inject the new `EnrollmentFilter`. Replace the old `if` block with a single call: `$enrollments = $filter->apply($query, $request->all())->paginate();`.

**Testing & Verification**:
1.  **Run Feature Test**: Run the existing `EnrollmentTest` feature test. The tests for the `index` method, especially those that use query parameters for filtering, should pass without modification, confirming the refactor was successful.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 8 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 9. Please confirm.**

### Task 9: Add Background Job Processing

**Goal**: Improve API response times and system robustness by offloading time-intensive operations, like sending notifications, to a background queue.

**Implementation Steps**:
1.  **Configure Queue Driver**: Set the `QUEUE_CONNECTION` in the `.env` file to `database`. Run `php artisan queue:table` to create a migration for the `jobs` table, then run `php artisan migrate`.
2.  **Create Queued Jobs**: Create new job classes like `app/Jobs/SendEnrollmentConfirmation.php` and `app/Jobs/ProcessWaitlistPromotion.php` using `php artisan make:job`. Ensure they implement the `ShouldQueue` interface.
3.  **Implement Job Logic**: In the `handle()` method of the jobs, place the logic that needs to be run asynchronously (e.g., sending an email or notification).
4.  **Dispatch Jobs**: In the services (`EnrollmentService`, `AdmissionService`), replace direct calls to synchronous operations (like `Notification::send()`) with `MyJob::dispatch(...)`.

**Testing & Verification**:
1.  **Use `Queue::fake()`**: In feature tests, use `Queue::fake()` to prevent jobs from actually being dispatched.
2.  **Assert Jobs are Pushed**: After performing an action that should trigger a job, use `Queue::assertPushed(MyJob::class)` to verify that the job was correctly added to the queue.
3.  **Manual Verification**: Run a queue worker locally with `php artisan queue:work`. Perform an action (e.g., enroll in a course) and check the application log or mail output (if using MailHog) to confirm the job was processed successfully.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 9 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 10. Please confirm.**

---

### Task 10: Add Integration Tests

**Goal**: Increase confidence in the system's stability and correctness by adding high-level integration tests that verify complete user workflows from start to finish.

**Implementation Steps**:
1.  **Create Test Class**: Create a new feature test file, e.g., `tests/Feature/StudentEnrollmentFlowTest.php`.
2.  **Define Workflow**: Outline a critical user path. For example: A new user registers, their associated student record is created, they successfully apply for admission, an admin approves the application, and then the student can enroll in a course.
3.  **Write Test**: Implement the `test_complete_enrollment_flow` method. This will involve making a series of sequential API calls, asserting the success of each step, and passing data from one step to the next (e.g., using the ID of the newly created student for the admission application).
4.  **Verify Authorization**: Throughout the test, ensure that actions are performed by the correctly authenticated and authorized user for that step (e.g., the student themself, then an admin user).

**Testing & Verification**:
1.  **Run New Test**: Execute the new integration test: `php artisan test --filter StudentEnrollmentFlowTest`.
2.  **Assert Success**: The test should pass, indicating that the entire user flow is functioning correctly, including routing, authentication, authorization, business logic, and database interactions.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 10 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 11. Please confirm.**

---

## [LOW] Priority Tasks

### Task 11: Implement an Auditing Trail

**Goal**: Enhance security and accountability by adding an audit trail that automatically logs all changes to critical data models.

**Implementation Steps**:
1.  **Install Package**: Run `composer require owen-it/laravel-auditing`.
2.  **Publish Configuration**: Run `php artisan vendor:publish --provider="OwenIt\Auditing\AuditingServiceProvider" --tag="config"`.
3.  **Run Migration**: Run `php artisan vendor:publish --provider="OwenIt\Auditing\AuditingServiceProvider" --tag="migrations"` and then `php artisan migrate`.
4.  **Implement Interface**: For each model that requires auditing (e.g., `Enrollment`, `Student`, `AdmissionApplication`), implement the `OwenIt\Auditing\Contracts\Auditable` interface and add the `use \OwenIt\Auditing\Auditable;` trait.

**Testing & Verification**:
1.  **Manual Verification**: Start `php artisan tinker`. Find a model instance (e.g., `Student::find(1)`), update an attribute, and save it. Then query the `audits` table: `\OwenIt\Auditing\Models\Audit::all()`. Verify that a new record exists logging the change, including the old and new values.
2.  **Feature Test**: Write a test that updates an auditable model and then asserts that a corresponding record was created in the `audits` table.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 11 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 12. Please confirm.**

---

### Task 12: Add Health Check Endpoint

**Goal**: Create a standard health check endpoint for monitoring and automated deployment checks.

**Implementation Steps**:
1.  **Create Route**: In `routes/api.php`, add a new unauthenticated route: `Route::get('/health', function () { ... });`.
2.  **Implement Logic**: Inside the route's closure, check the status of critical dependencies like the database (`DB::connection()->getPdo()`) and cache. Return a JSON response with an overall status (`healthy` or `unhealthy`) and the status of individual services.

**Testing & Verification**:
1.  **Manual Verification**: Access `GET /api/health` via a browser or API client and assert a `200 OK` response with the expected JSON structure.
2.  **Feature Test**: Create a simple feature test that makes a GET request to `/api/health` and asserts a 200 status and the expected JSON content.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 12 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 13. Please confirm.**

---

### Task 13: Enhance Database Seeders

**Goal**: Improve the development and testing environment by seeding the database with a large, realistic dataset.

**Implementation Steps**:
1.  **Review Factories**: Go through all model factories in `database/factories` and ensure they use the `faker` library to generate realistic-looking data for all attributes.
2.  **Update `DatabaseSeeder`**: Open `database/seeders/DatabaseSeeder.php`. Modify the `run` method to create a large number of records (e.g., 1000 students, 100 courses, 5000 enrollments). Use loops and factories to generate the data.
3.  **Handle Relationships**: Ensure the seeder correctly creates related data (e.g., for each student, create an admission application; for courses, create multiple course sections).
4.  **Consider Edge Cases**: Add logic to seed specific edge-case data, such as courses that are completely full and have a waitlist.

**Testing & Verification**:
1.  **Run Seeder**: Run `php artisan migrate:fresh --seed`. The command should complete without errors.
2.  **Manual Verification**: Connect to the database with a client and inspect the tables. Verify that they are populated with a large and varied set of data as expected.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 13 is complete. The implementation has been verified.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **This was the final task. The implementation plan is now complete.** 