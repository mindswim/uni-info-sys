# Phase 2: Backend Excellence Plan

This document outlines the detailed tasks for **Phase 2B (Professional API Architecture)** and **Phase 2C (Advanced Features)**. The goal is to elevate our solid API foundation into a production-grade, secure, and maintainable system.

**My Workflow for Each Task:**

1.  **Implement**: I will write the code exactly as described in the task's implementation steps.
2.  **Test**: I will run the tests associated with the task to ensure everything is working correctly. All tests must pass.
3.  **Await Approval**: I will stop and explicitly ask for your approval to proceed.
4.  **Commit & Push**: Once you provide approval (e.g., "approved"), I will `git add .`, `git commit`, and `git push` the changes.
5.  **Proceed**: Only after a successful push will I move to the next task.

---

## Phase 2B: Professional API Architecture

This phase focuses on hardening the API, improving developer experience, and optimizing performance.

### ✅ Task 20: Implement API Authentication with Laravel Sanctum - COMPLETED ✅

**Goal:** Secure all `v1` API endpoints, ensuring that only authenticated clients can access them.

**Implementation Steps:**

1.  **Install & Configure Sanctum:**
    - I will run `composer require laravel/sanctum`.
    - I will publish the configuration and migration files with `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`.
    - I will run the migration: `php artisan migrate`.

2.  **Update User Model:**
    - I will add the `use Laravel\Sanctum\HasApiTokens;` trait to the `app/Models/User.php` model.

3.  **Protect API Routes:**
    - In `routes/api.php`, I will wrap all existing `v1` routes in a `middleware('auth:sanctum')` group.

4.  **Create Authentication Controller & Route:**
    - To keep our `routes/api.php` file clean and adhere to MVC principles, I will first create a dedicated controller for this logic: `php artisan make:controller Api/V1/AuthController`.
    - I will then add a `login` method to `app/Http/Controllers/Api/V1/AuthController.php` containing the token generation logic.

    ```php
    <?php

    namespace App\Http\Controllers\Api\V1;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Validation\ValidationException;

    class AuthController extends Controller
    {
        public function login(Request $request)
        {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
                'device_name' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are not correct.'],
                ]);
            }

            return response()->json(['token' => $user->createToken($request->device_name)->plainTextToken]);
        }
    }
    ```
    - Finally, I will add the new route in `routes/api.php` outside the protected group.
    ```php
    use App\Http\Controllers\Api\V1\AuthController;

    Route::post('/v1/tokens/create', [AuthController::class, 'login']);
    ```

**Testing Steps:**

1.  **Create Test File:**
    - I will create a new feature test: `tests/Feature/Api/V1/AuthenticationTest.php`.

2.  **Write Tests:**
    - **Test Endpoint Protection:** Assert that a request to a protected endpoint (e.g., `/api/v1/faculties`) without a token fails with a `401 Unauthorized` status.
    - **Test Token Creation:** Assert that a valid user can post to `/api/v1/tokens/create` and receive a token.
    - **Test Authentication:** Assert that a request to a protected endpoint with a valid `Authorization: Bearer <token>` header succeeds with a `200 OK` status.
    - **Test Failed Authentication:** Assert that a request with an invalid token fails.

**🔍 CHECKPOINT:** All API endpoints must be inaccessible without a valid Sanctum token. I will await your approval before committing.

---

### ✅ Task 21: Generate API Documentation with Scribe - COMPLETED ✅

**Goal:** Automatically generate clean, comprehensive, and interactive API documentation from our existing code and annotations.

**Implementation Steps:**

1.  **Install & Configure Scribe:**
    - I will run `composer require --dev knuckleswtf/scribe`.
    - I will publish the configuration file: `php artisan vendor:publish --tag=scribe-config`.

2.  **Generate Initial Documentation:**
    - I will run `php artisan scribe:generate`. This creates the documentation in `public/docs`.

3.  **Annotate Controllers:**
    - I will go through each controller in `app/Http/Controllers/Api/V1` and add PHPDoc annotations:
      - `@group`: To group related endpoints (e.g., `@group "Faculty Management"`).
      - `@authenticated`: To mark endpoints that require authentication.
      - `@responseFile`: To link to example JSON responses. I will create example response files in `storage/responses/` for key endpoints.

**Testing Steps:**

1.  **Manual Verification:**
    - I will start the local server and navigate to `/docs`.
    - I will verify that all endpoints are present and correctly grouped.
    - I will check that authentication requirements are clearly marked.
    - I will ensure that example requests and responses are accurate.

**🔍 CHECKPOINT:** The generated documentation should be a complete and accurate guide for our API. I will await your approval before committing.

**📝 NOTE:** Due to Scribe's model instantiation conflicts with certain factories, the following `PUT/PATCH` endpoints are excluded from auto-generated documentation but remain fully functional:
- `PUT /api/v1/terms/{term}` - Update term information
- `PUT /api/v1/buildings/{building}` - Update building information  
- `PUT /api/v1/rooms/{room}` - Update room information

These endpoints work normally and can be tested via API clients. They are marked with `@hideFromAPIDocumentation` in their respective controllers. Future enhancement: Consider manual documentation or custom Scribe strategies for these endpoints.

---

### Task 22: Centralize API Error Handling

**Goal:** Implement a standardized JSON error response format for all API exceptions, ensuring a predictable and consistent experience for API consumers.

**Implementation Steps:**

1.  **Customize Exception Handler:**
    - I will open `app/Exceptions/Handler.php`.
    - In the `register()` method, I will add a `renderable` for all API routes (`$request->is('api/*')`).
    - This handler will catch specific exceptions (`NotFoundHttpException`, `AuthenticationException`, `ValidationException`, `AuthorizationException`) and format them into a standard JSON response.
    - **Crucially, I will also add a fallback for any generic `Throwable` to ensure *all* API errors return a consistent JSON format, preventing unexpected HTML error pages.**

2.  **Add Code to `app/Exceptions/Handler.php`:**
    - I will add the following code inside the `register()` method:
    ```php
    use Illuminate\Http\Request;
    use Illuminate\Auth\AuthenticationException;
    use Illuminate\Validation\ValidationException;
    use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
    use Illuminate\Auth\Access\AuthorizationException;
    use Throwable;

    // ...

    $this->renderable(function (Throwable $e, Request $request) {
        if ($request->is('api/*')) {
            $message = 'An unexpected error occurred.';
            $statusCode = 500;
            $errors = [];

            if ($e instanceof NotFoundHttpException) {
                $message = 'The requested resource was not found.';
                $statusCode = 404;
            } elseif ($e instanceof AuthenticationException) {
                $message = 'Unauthenticated.';
                $statusCode = 401;
            } elseif ($e instanceof AuthorizationException) {
                $message = 'This action is unauthorized.';
                $statusCode = 403;
            } elseif ($e instanceof ValidationException) {
                $message = 'The given data was invalid.';
                $statusCode = 422;
                $errors = $e->errors();
            }

            $response = ['message' => $message];

            if (!empty($errors)) {
                $response['errors'] = $errors;
            }

            if (config('app.debug')) {
                $response['exception'] = get_class($e);
                $response['file'] = $e->getFile();
                $response['line'] = $e->getLine();
                $response['trace'] = collect($e->getTrace())->pluck('file', 'line')->all();
            }

            return response()->json($response, $statusCode);
        }
    });
    ```

**Testing Steps:**

1.  **Create New Tests and Update Existing Ones:**
    - I will create a new test file `tests/Feature/Api/V1/ErrorHandlingTest.php` to specifically test these scenarios.
    - **Test Not Found (404):** I will make a request to a non-existent API endpoint (e.g., `/api/v1/non-existent-route`) and assert that the response has a `404` status and the `{"message": "The requested resource was not found."}` structure.
    - **Test Unauthorized (401):** I will modify `AuthenticationTest.php` to assert that a request to a protected endpoint without a token returns the new `{"message": "Unauthenticated."}` structure.
    - **Test Validation (422):** I will modify a test that submits invalid data (e.g., in `FacultyControllerTest`) to assert a `422` status and the presence of both `message` and `errors` keys.
    - **Test Authorization (403):** I will create a test where a user without the correct permissions tries to perform an action and assert a `403` status with the `{"message": "This action is unauthorized."}` structure. (This may require setting up a basic role/permission).

**🔍 CHECKPOINT:** All API errors, including 404s, validation errors, and authentication failures, must return a consistent and predictable JSON error format. I will await your approval before committing.

---

## Phase 2C: Advanced Features

### Task 23: Implement a Notification System for Application Updates

**Goal:** Create a database-driven notification system to inform users about changes to their admission application status.

**Implementation Steps:**

1.  **Create Notification Class & Migration:**
    - I will run `php artisan make:notification ApplicationStatusUpdated`.
    - When prompted, I will confirm `yes` to create the `notifications` table migration.
    - I will then run `php artisan migrate`.

2.  **Configure Notification Class:**
    - I will open `app/Notifications/ApplicationStatusUpdated.php` and define its structure. It will accept an `AdmissionApplication` in its constructor.
    ```php
    <?php
    namespace App\Notifications;

    use App\Models\AdmissionApplication;
    use Illuminate\Bus\Queueable;
    use Illuminate\Notifications\Notification;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Messages\MailMessage;

    class ApplicationStatusUpdated extends Notification
    {
        use Queueable;

        protected $application;

        public function __construct(AdmissionApplication $application)
        {
            $this->application = $application;
        }

        public function via($notifiable)
        {
            return ['database']; // We only need database notifications for now
        }

        public function toDatabase($notifiable)
        {
            return [
                'application_id' => $this->application->id,
                'status' => $this->application->status,
                'message' => "Your application status has been updated to: {$this->application->status}",
            ];
        }
    }
    ```

3.  **Dispatch Notifications from Service:**
    - I will open the `app/Services/AdmissionService.php`.
    - In the method responsible for updating an application's status (or create one if it doesn't exist), I will add the notification dispatch logic.
    - The code will look like this: `$application->student->user->notify(new ApplicationStatusUpdated($application));`. This ensures our business logic remains cleanly separated.

4.  **Create Notifications API:**
    - I will create `app/Http/Controllers/Api/V1/NotificationController.php`.
    - It will have two methods: `index` (to list unread notifications) and `markAsRead` (to mark a specific notification as read).
    ```php
    // In NotificationController.php
    public function index(Request $request)
    {
        return $request->user()->unreadNotifications;
    }

    public function markAsRead(Request $request, $notificationId)
    {
        $notification = $request->user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        return response()->noContent();
    }
    ```
    - I will add the corresponding routes to `routes/api.php`:
    ```php
    // In routes/api.php within the auth:sanctum group
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    ```

**Testing Steps:**

1.  **Create Test File:**
    - I will create `tests/Feature/Api/V1/NotificationTest.php`.

2.  **Write Tests:**
    - **Test Notification Creation:** I will write a test that updates an admission application's status and then asserts that a new notification record is created in the `notifications` table for the correct user. `Notification::fake()` will be very useful here.
    - **Test Listing Notifications:** I will create a test that authenticates as a user, creates a few notifications for them, and then asserts that a `GET` request to `/api/v1/notifications` returns the correct unread notifications.
    - **Test Marking as Read:** I will create a test that makes a `POST` request to `/api/v1/notifications/{id}/read` and asserts that the `read_at` column for that notification is no longer null in the database.
    - **Test Authorization:** I will assert that a user cannot view or mark as read notifications belonging to another user.

**🔍 CHECKPOINT:** Users must automatically receive a database notification for application updates and be able to manage them via the API. I will await your approval before committing. 