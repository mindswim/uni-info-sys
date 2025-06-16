# Phase 2: Backend Excellence Plan

This document outlines the tasks for **Phase 2B (Professional API Architecture)** and **Phase 2C (Advanced Features)**. The goal is to elevate our solid API foundation into a production-grade, secure, and maintainable system.

---

## Phase 2B: Professional API Architecture

This phase focuses on hardening the API, improving developer experience, and optimizing performance.

### Task 20: Implement API Authentication with Laravel Sanctum

**Goal:** Secure all `v1` API endpoints, ensuring that only authenticated clients can access them.

1.  **Install & Configure Sanctum:**
    - Run `composer require laravel/sanctum`
    - Publish the configuration and migration files: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
    - Run the migration: `php artisan migrate`

2.  **Update User Model:**
    - Add the `HasApiTokens` trait to the `app/Models/User.php` model.

3.  **Create Token Generation Route:**
    - Add a new route in `routes/api.php` (e.g., `/tokens/create`) that allows a user to generate an API token based on their login credentials. This should only be used for testing and for trusted third-party services.

4.  **Protect API Routes:**
    - In `routes/api.php`, wrap all the `v1` routes in a `middleware('auth:sanctum')` group.

5.  **Create Tests:**
    - Write a new feature test `tests/Feature/Api/V1/AuthenticationTest.php`.
    - Test that unauthenticated requests to a protected endpoint (e.g., `/api/v1/faculties`) fail with a `401 Unauthorized` status.
    - Test that a user can generate a token.
    - Test that requests with a valid token succeed.
    - Test that requests with an invalid token fail.

**🔍 CHECKPOINT:** All API endpoints must be inaccessible without a valid Sanctum token.

---

### Task 21: Generate API Documentation with Scribe

**Goal:** Automatically generate clean, comprehensive, and interactive API documentation from our existing code and annotations.

1.  **Install & Configure Scribe:**
    - Run `composer require --dev knuckleswtf/scribe`
    - Publish the configuration file: `php artisan vendor:publish --tag=scribe-config`

2.  **Generate Initial Documentation:**
    - Run `php artisan scribe:generate`. This will create a `public/docs` folder with the documentation.

3.  **Annotate Controllers & Form Requests:**
    - Go through each controller in `app/Http/Controllers/Api/V1`.
    - Add `@group` annotations to group related endpoints (e.g., `@group "Faculty Management"`).
    - Add `@responseFile` annotations to link to example JSON responses for `index`, `show`, and `store` methods.
    - Review Form Requests to ensure Scribe correctly picks up validation rules for the "Body Parameters" section.

4.  **Update and Refine:**
    - Regenerate the documentation (`php artisan scribe:generate`) and review the output.
    - Customize the introduction and authentication sections in `config/scribe.php` and the markdown files in `resources/docs`.

**🔍 CHECKPOINT:** The generated documentation at `/docs` should accurately reflect all `v1` endpoints, parameters, and responses, providing a clear guide for any API consumer.

---

### Task 22: Centralize API Error Handling

**Goal:** Implement a standardized JSON error response format for all API exceptions.

1.  **Customize Exception Handler:**
    - Open `app/Exceptions/Handler.php`.
    - In the `register` method, use `renderable` to catch common exceptions (`NotFoundHttpException`, `AuthenticationException`, `ValidationException`, `AuthorizationException`) when the request expects JSON.
    - For each exception type, return a `JsonResponse` with a standardized structure:
      ```json
      {
        "message": "Error description",
        "errors": { /* Optional: field-specific validation errors */ }
      }
      ```
    - Ensure correct HTTP status codes (404, 401, 422, 403) are returned.

2.  **Create a General API Exception:**
    - Create a custom exception, e.g., `App\Exceptions\ApiException`, for general-purpose API errors.
    - Add it to the handler to return a 400 or 500 status code with the standard JSON format.

3.  **Test Exception Handling:**
    - Add tests to `AuthenticationTest.php` and other relevant test files.
    - Test that requesting a non-existent resource (e.g., `/api/v1/faculties/999`) returns a JSON 404 response.
    - Test that a validation failure returns a JSON 422 response with a structured `errors` object.
    - Test that an unauthorized action returns a JSON 403 response.

**🔍 CHECKPOINT:** All API errors, from 404s to validation failures, must return a consistent and predictable JSON error format.

---
## Phase 2C: Advanced Features

This phase builds on our robust backend to deliver high-value features like notifications and reporting.

### Task 23: Implement a Notification System for Application Updates

**Goal:** Create a database-driven notification system to inform users about changes to their admission application status.

1.  **Create Notification Class:**
    - Run `php artisan make:notification ApplicationStatusUpdated`.

2.  **Configure the Notification:**
    - In `ApplicationStatusUpdated.php`, configure the `via` method to return `['database']`.
    - In the `toDatabase` method, define the data structure for the notification, including the application ID and the new status.

3.  **Dispatch Notifications:**
    - In `AdmissionApplicationController` (or a dedicated service), when an application's status is updated, send the notification to the relevant user: `$user->notify(new ApplicationStatusUpdated($application));`

4.  **Create API Endpoint for Notifications:**
    - Create a new `NotificationController`.
    - Add an `index` method to fetch the authenticated user's notifications.
    - Add a `markAsRead` method to update the `read_at` timestamp.
    - Add the routes to `routes/api.php`.

5.  **Create Tests:**
    - Create `tests/Feature/Api/V1/NotificationTest.php`.
    - Test that a notification is created when an application status changes.
    - Test that the notifications endpoint correctly returns unread notifications for a user.
    - Test that notifications can be marked as read.

**🔍 CHECKPOINT:** Users must automatically receive a database notification when their application status is updated, and be able to retrieve and manage these via the API. 