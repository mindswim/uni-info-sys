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

### ➡️ Task 20: Implement API Authentication with Laravel Sanctum

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

### Task 21: Generate API Documentation with Scribe

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

**Goal:** Implement a standardized JSON error response format for all API exceptions.

**Implementation Steps:**

1.  **Customize Exception Handler:**
    - I will open `app/Exceptions/Handler.php`.
    - In the `register()` method, I will use a `renderable` to intercept common exceptions for API routes (`$request->is('api/*')`) and format them into a standard JSON response.
    - I will handle specific exceptions like `NotFoundHttpException`, `AuthenticationException`, `ValidationException`, and `AuthorizationException`.
    - **Crucially, I will also add a fallback for any generic `Throwable` to ensure *all* API errors return a consistent JSON format, preventing unexpected HTML error responses.** The structure will be:
      ```json
      {
        "message": "Error description",
        "errors": { /* Optional: field-specific validation errors */ }
      }
      ```

**Testing Steps:**

1.  **Update Existing Tests:**
    - I will modify existing feature tests to assert the new JSON error structure.
    - For example, in a test that requests a non-existent resource, I will assert the response has the `message` key and a 404 status.
    - In a test for invalid data, I will assert a 422 status and the presence of the `message` and `errors` keys.

**🔍 CHECKPOINT:** All API errors must return a consistent and predictable JSON error format. I will await your approval before committing.

---

## Phase 2C: Advanced Features

### Task 23: Implement a Notification System for Application Updates

**Goal:** Create a database-driven notification system to inform users about changes to their admission application status.

**Implementation Steps:**

1.  **Create Notification Class & Migration:**
    - I will run `php artisan make:notification ApplicationStatusUpdated`.
    - Laravel will prompt to create the `notifications` table migration, which I will confirm. I will then run `php artisan migrate`.

2.  **Configure Notification:**
    - In `ApplicationStatusUpdated.php`, I will set `via` to return `['database']` and define the `toDatabase` array structure.

3.  **Dispatch Notifications:**
    - In the `AdmissionService` (created in Phase 1), I will locate the logic where an application's status is updated and add the line: `$user->notify(new ApplicationStatusUpdated($application));`. This keeps business logic out of the controller.

4.  **Create Notifications API:**
    - I will create a `NotificationController` with `index` and `markAsRead` methods.
    - I will add `GET /api/v1/notifications` and `POST /api/v1/notifications/{id}/read` to `routes/api.php`.

**Testing Steps:**

1.  **Create Test File:**
    - I will create `tests/Feature/Api/V1/NotificationTest.php`.

2.  **Write Tests:**
    - Test that a notification is created in the database when an application status changes.
    - Test that the `/notifications` endpoint returns a user's unread notifications.
    - Test that the `markAsRead` endpoint correctly updates the `read_at` timestamp.

**🔍 CHECKPOINT:** Users must automatically receive a database notification for application updates and be able to manage them via the API. I will await your approval before committing. 