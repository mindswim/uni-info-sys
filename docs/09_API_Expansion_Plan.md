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

## Phase 2: Documenting Existing Resources

This phase focuses on adding OpenAPI annotations and comprehensive feature tests to all existing API controllers that are currently undocumented. The goal is to make the generated `api-docs.json` file a complete and accurate representation of the entire API surface.

### Task 14: Document Student-centric Resources

**Goal**: Add comprehensive OpenAPI documentation and ensure full test coverage for the `Student`, `AcademicRecord`, and `Document` API endpoints.

**Implementation Steps**:
1.  **Review Controllers and Resources**: Systematically go through `Api/V1/StudentController.php`, `Api/V1/AcademicRecordController.php`, `Api/V1/DocumentController.php` and their corresponding Resource classes (`StudentResource.php`, etc.).
2.  **Add Resource Schemas**: Add `#[OA\Schema]` annotations to `StudentResource`, `AcademicRecordResource`, and `DocumentResource` to define their structure for the OpenAPI specification.
3.  **Add Controller Annotations**: For each method (`index`, `show`, `store`, `update`, `destroy`), add detailed OpenAPI annotations (`@OA\Get`, `@OA\Post`, etc.). Document all query parameters for filtering, path parameters, request body schemas, and all possible success and error responses.
4.  **Update Related Resources**: After adding the schema to `StudentResource`, update `AdmissionApplicationResource` to use `ref: "#/components/schemas/StudentResource"` instead of the temporary `type: "object"` definition.
5.  **Create/Enhance Tests**: If they don't exist, create feature tests: `Api/V1/StudentApiTest.php`, `Api/V1/AcademicRecordApiTest.php`, and `Api/V1/DocumentApiTest.php`. Ensure tests cover all documented parameters and responses.

**Testing & Verification**:
1.  **Run Tests**: Execute all related tests and ensure they pass.
2.  **Generate and Verify Docs**: Run `php artisan l5-swagger:generate`. Navigate to the documentation UI and confirm that the "Student", "Academic Record", and "Document" sections are now complete and that the `AdmissionApplication` schema correctly references the `Student` schema.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 14 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 15. Please confirm.**

---

### Task 15: Document Academic Structure Resources

**Goal**: Add documentation and tests for `Program` and `Term` API endpoints.

**Implementation Steps**:
1.  **Add Resource Schemas**: Add `#[OA\Schema]` annotations to `ProgramResource.php` and `TermResource.php`.
2.  **Annotate Controllers**: Add full OpenAPI annotations to `Api/V1/ProgramController.php` and `Api/V1/TermController.php`.
3.  **Update Related Resources**:
    *   In `ProgramChoiceResource.php`, update the `program` property to use `ref: "#/components/schemas/ProgramResource"`.
    *   In `AdmissionApplicationResource.php`, update the `term` property to use `ref: "#/components/schemas/TermResource"`.
4.  **Create/Enhance Tests**: Create or improve `Api/V1/ProgramApiTest.php` and `Api/V1/TermApiTest.php`.

**Testing & Verification**:
1.  **Run Tests & Verify Docs**: Run tests, regenerate documentation, and verify the "Program" and "Term" sections in the Swagger UI. Confirm that the `AdmissionApplication` and `ProgramChoice` schemas now correctly reference their related schemas.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 15 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 16. Please confirm.**

---

### Task 16: Document Course & Enrollment Resources

**Goal**: Add documentation and tests for `CourseSection` and `Enrollment` API endpoints.

**Implementation Steps**:
1.  **Add Resource Schemas**: Add `#[OA\Schema]` annotations to `CourseSectionResource.php` and `EnrollmentResource.php`.
2.  **Annotate Controllers**: Add full OpenAPI annotations to `Api/V1/CourseSectionController.php` and `Api/V1/EnrollmentController.php`. These are complex controllers, so pay special attention to documenting the extensive filtering capabilities.
3.  **Create/Enhance Tests**: Create or improve `Api/V1/CourseSectionApiTest.php` and review the existing `Api/V1/EnrollmentApiTest.php` to ensure it covers all documented functionality.

**Testing & Verification**:
1.  **Run Tests & Verify Docs**: Run tests, regenerate documentation, and verify the "Course Section" and "Enrollment" sections in the Swagger UI.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 16 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 17. Please confirm.**

---

### Task 17: Document Administrative Resources

**Goal**: Add documentation and tests for the `Staff` API endpoint.

**Implementation Steps**:
1.  **Add Resource Schema**: Add an `#[OA\Schema]` annotation to `StaffResource.php`.
2.  **Annotate Controller**: Add full OpenAPI annotations to `Api/V1/StaffController.php`.
3.  **Create/Enhance Tests**: Create or improve `Api/V1/StaffApiTest.php`.

**Testing & Verification**:
1.  **Run Tests & Verify Docs**: Run tests, regenerate documentation, and verify the "Staff" section in the Swagger UI.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 17 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 18. Please confirm.**

---

### Task 18: Document Physical Resources

**Goal**: Add documentation and tests for `Building` and `Room` API endpoints.

**Implementation Steps**:
1.  **Add Resource Schemas**: Add `#[OA\Schema]` annotations to `BuildingResource.php` and `RoomResource.php`.
2.  **Annotate Controllers**: Add full OpenAPI annotations to `Api/V1/BuildingController.php` and `Api/V1/RoomController.php`.
3.  **Create/Enhance Tests**: Create or improve `Api/V1/BuildingApiTest.php` and `Api/V1/RoomApiTest.php`.

**Testing & Verification**:
1.  **Run Tests & Verify Docs**: Run tests, regenerate documentation, and verify the "Building" and "Room" sections in the Swagger UI.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 18 is complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **This was the final task. The API Expansion and Documentation Plan is now complete.** 