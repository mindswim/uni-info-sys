# API Expansion and Documentation Plan

This document translates the high-level goal of achieving complete API coverage into a series of discrete, actionable development tasks. It continues from the `07_Implementation_Plan.md` and `08_Backend_Polish_and_Deployment_Plan.md` documents. Each task follows the structured workflow defined in the Collaborative Development Task Framework to ensure incremental progress and maintain quality through human-in-the-loop verification.

The primary objective is to expose all remaining data models via the RESTful API and ensure every endpoint is comprehensively documented using OpenAPI (Swagger) annotations.

---

### Key Implementation Notes

*   **Role-Based Authorization**: User role checks should be performed by querying the `roles` relationship directly. The `hasRole()` helper method is not available on the `User` model. Use the following pattern: `in_array('role-name', $user->roles()->pluck('name')->toArray())`.
*   **Testing Environment**: The test suite is configured to use an in-memory SQLite database (`:memory:`). Ensure any database-specific logic is compatible or handled conditionally.

---

## Phase 1: Exposing Missing Resources

This phase focuses on creating API controllers, routes, and tests for core models that are not yet accessible via the API.

### Task 11: Expose and Document `AdmissionApplication` Resource

**Goal**: Create and document secure, full CRUD API endpoints for managing `AdmissionApplication` resources, which are central to the student journey.

**Implementation Steps**:
1.  **Generate Controller**: Create a new API controller for the `AdmissionApplication` model.
    ```bash
    php artisan make:controller Api/V1/AdmissionApplicationController --api --model=AdmissionApplication
    ```
2.  **Generate Validation Requests**: Create dedicated request classes for validation.
    ```bash
    php artisan make:request StoreAdmissionApplicationRequest
    php artisan make:request UpdateAdmissionApplicationRequest
    ```
3.  **Implement Validation Rules**:
    *   In `app/Http/Requests/StoreAdmissionApplicationRequest.php`, add rules to validate `student_id`, `term_id`, and other required fields for a new application.
    *   In `app/Http/Requests/UpdateAdmissionApplicationRequest.php`, add rules for fields that can be updated, such as `status` or `comments`. Ensure that only authorized users (e.g., admins) can change the status.
4.  **Define API Routes**: In `routes/api.php`, add the `apiResource` route for admission applications within the `auth:sanctum` group.
    ```php
    // in routes/api.php
    Route::middleware('auth:sanctum')->group(function () {
        // ... existing routes
        Route::apiResource('admission-applications', \App\Http\Controllers\Api\V1\AdmissionApplicationController::class);
    });
    ```
5.  **Implement Controller Logic**:
    *   In `app/Http/Controllers/Api/V1/AdmissionApplicationController.php`, implement the `index`, `store`, `show`, `update`, and `destroy` methods.
    *   Use the `AdmissionApplicationPolicy` to authorize every action (e.g., `$this->authorize('view', $application);`).
    *   Type-hint the `StoreAdmissionApplicationRequest` and `UpdateAdmissionApplicationRequest` in the `store` and `update` methods, respectively.
    *   Use the existing `AdmissionApplicationResource` to format all JSON responses.
6.  **Add OpenAPI Annotations**: Add comprehensive Swagger annotations (`@OA\Get`, `@OA\Post`, `@OA\Parameter`, etc.) to every method in the `AdmissionApplicationController` to document all endpoints, parameters, request bodies, and possible responses.

**Testing & Verification**:
1.  **Create Feature Test**: Generate a new test file.
    ```bash
    php artisan make:test Api/V1/AdmissionApplicationApiTest
    ```
2.  **Write Test Cases**: In `tests/Feature/Api/V1/AdmissionApplicationApiTest.php`, add tests for:
    *   An authenticated student creating their own application.
    *   An admin listing all applications.
    *   A student viewing their own application.
    *   An admin updating an application's status.
    *   A student being denied access (`403 Forbidden`) when trying to view another student's application.
    *   An unauthenticated user being denied access (`401 Unauthorized`).
3.  **Run Tests**: Execute `php artisan test --filter AdmissionApplicationApiTest` and ensure all tests pass.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 11 is complete. The implementation has been verified, and all associated tests are passing.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 12. Please confirm.**

---

### Task 12: Expose and Document `ProgramChoice` Resource

**Goal**: Create API endpoints for managing `ProgramChoice` resources, which are always associated with a parent `AdmissionApplication`.

**Implementation Steps**:
1.  **Generate Controller**: Create a new API controller.
    ```bash
    php artisan make:controller Api/V1/ProgramChoiceController --api --model=ProgramChoice
    ```
2.  **Define Nested API Routes**: In `routes/api.php`, define `ProgramChoice` as a nested resource of `AdmissionApplication` to reflect their relationship.
    ```php
    // in routes/api.php
    Route::middleware('auth:sanctum')->group(function () {
        // ... existing routes
        Route::apiResource('admission-applications.program-choices', \App\Http\Controllers\Api\V1\ProgramChoiceController::class)->scoped()->shallow();
    });
    ```
3.  **Implement Controller Logic**:
    *   The `scoped()` and `shallow()` methods create routes that are both nested (for `index`, `store`) and direct (for `show`, `update`, `destroy`), which is a RESTful best practice.
    *   Controller methods will receive the parent `AdmissionApplication` model, making authorization checks straightforward.
    *   Leverage the `ProgramChoicePolicy` for authorization.
    *   Use `ProgramChoiceResource` for responses.
4.  **Add OpenAPI Annotations**: Document all methods in `ProgramChoiceController`.

**Testing & Verification**:
1.  **Create Feature Test**: Generate a new test file: `php artisan make:test Api/V1/ProgramChoiceApiTest`.
2.  **Write Test Cases**: Add tests for adding, viewing, updating, and removing program choices from a specific admission application.
3.  **Test Authorization**: Assert that a user can only modify choices on their own application.
4.  **Run Tests**: Execute `php artisan test --filter ProgramChoiceApiTest`.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 12 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 13. Please confirm.**

---

### Task 13: Expose `Role` & `Permission` Resources (Read-Only)

**Goal**: Provide read-only API endpoints for listing roles and permissions, which is necessary for building administrative frontends.

**Implementation Steps**:
1.  **Generate Controllers**:
    ```bash
    php artisan make:controller Api/V1/RoleController --api --model=Role
    php artisan make:controller Api/V1/PermissionController --api --model=Permission
    ```
2.  **Generate Resources**:
    ```bash
    php artisan make:resource RoleResource
    php artisan make:resource PermissionResource
    ```
3.  **Define API Routes**: In `routes/api.php`, add `index` and `show` routes for both resources.
    ```php
    Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class)->only(['index', 'show']);
    Route::apiResource('permissions', \App\Http\Controllers\Api\V1\PermissionController::class)->only(['index', 'show']);
    ```
4.  **Implement Policies**: Create `RolePolicy` and `PermissionPolicy` and implement the `viewAny` and `view` methods. This logic should ensure only users with a specific permission (e.g., `view-roles`) can access these endpoints.
5.  **Implement Controller Logic**: Implement the `index` and `show` methods, ensuring you call `$this->authorize()` at the beginning of each.
6.  **Add OpenAPI Annotations**: Document the new controllers.

**Testing & Verification**:
1.  **Create Feature Tests**: `php artisan make:test Api/V1/RoleApiTest` and `php artisan make:test Api/V1/PermissionApiTest`.
2.  **Write Test Cases**:
    *   Test that a user with an `admin` role can list roles and permissions.
    *   Test that a user with a `student` role receives a `403 Forbidden` error.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 13 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 14. Please confirm.**

---

## Phase 2: Code Standardization and Documentation

This phase consolidates the original documentation plan into a single, structured task. The core principle is to **standardize before documenting**, ensuring that the API we expose is secure, consistent, and follows project-wide best practices *before* we write its official documentation.

### Task 14: Standardize and Document All Remaining API Resources

**Goal**: First, perform a code review and refactoring pass on all remaining API controllers to ensure they meet project standards for authorization and validation. Second, add comprehensive OpenAPI annotations to produce a complete and accurate `api-docs.json` file. This task supersedes the original tasks 14 through 18.

**Resources to Process**:
*   **Academic Structure**: `Program`, `Term`, `Course`
*   **Student-centric**: `Student`, `User`, `AcademicRecord`, `Document`
*   **Course & Enrollment**: `CourseSection`, `Enrollment`
*   **Administrative**: `Faculty`, `Department`, `Staff`
*   **Physical Resources**: `Building`, `Room`

---

#### **Phase 2A: Code Standardization**

For each resource listed above, perform the following standardization checks on its corresponding API controller. The `ProgramController` will be the first to be standardized.

1.  **Authorization Review**:
    *   **Confirm Policy Exists**: Ensure a `Policy` class exists for the model.
    *   **Apply Authorization**: Verify that every controller method calls `$this->authorize()` with the correct action (e.g., `viewAny`, `view`, `create`, `update`, `delete`). If authorization is missing, add it.

2.  **Validation Review**:
    *   **Use Form Requests**: Confirm that `store` and `update` methods use dedicated `Store...Request` and `Update...Request` classes for validation.
    *   **Refactor Inline Validation**: If a controller uses inline validation (e.g., `Validator::make(...)`), refactor it to use a Form Request class.

3.  **Create Missing Controllers**: If an API controller for a resource does not exist in the `Api/V1` namespace, create it. Implement read-only `index` and `show` methods with proper authorization. Write operations can be stubbed to return a `501 Not Implemented` status.

---

#### **Phase 2B: API Documentation**

Once a controller has been standardized, proceed with documenting it and its related resource.

1.  **Systematically Annotate Resource Schemas**: Go through each of the corresponding `...Resource.php` files for the models listed above.
    *   Add a complete `#[OA\Schema(...)]` block to each resource file, defining all of its properties.

2.  **Link Resource Schemas**: As the schemas are defined, update any related resources to use the correct `ref` pointer instead of a generic object type. This will fix the reference errors encountered previously.

3.  **Annotate Controller Endpoints**: For each corresponding `...Controller.php`, add or update the OpenAPI annotations (`@OA\Get`, `@OA\Post`, etc.) for all available methods.

**Verification**:
1.  **Generate Documentation**: After standardizing and annotating all resources, run `php artisan l5-swagger:generate`. The command must complete without any reference errors.
2.  **Visual Inspection**: Navigate to the Swagger UI and manually inspect the documentation. Confirm that all endpoints are present, parameters are correct, and schemas are properly defined and linked.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 14 is complete. All relevant API endpoints are now standardized and documented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .` and `git commit`.**
3.  **AI Request to Proceed**: **The API Expansion and Documentation Plan is now complete. Please confirm.** 