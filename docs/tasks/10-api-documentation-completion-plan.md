# API Documentation Completion Plan (Part 2)

This document is a continuation of the `09_API_Expansion_Plan.md` and addresses the gaps identified in the API documentation after the initial standardization pass. The primary objective is to achieve 100% API documentation coverage by annotating all remaining undocumented endpoints using the established patterns and `#[OA\Attribute]` syntax.

Each task will follow the structured workflow defined in the Collaborative Development Task Framework.

---

## Phase 3: Completing API Documentation Coverage

This phase will systematically address all controllers and endpoints that are currently implemented and routed but are missing from the `api-docs.json` file.

### Task 15: Document Administrative & Infrastructure Resources

**Goal**: Add comprehensive OpenAPI annotations for the `Staff`, `Building`, and `Room` resources. These are essential for administrative users managing university personnel and physical infrastructure.

**Implementation Steps**:

1.  **Staff Resource**:
    *   **Resource Schema**: Add `#[OA\Schema]` to `app/Http/Resources/StaffResource.php`. Define all properties, ensuring you define nested objects for the `user` and `department` relationships.
    *   **Request Schemas**: Add `#[OA\Schema]` to `app/Http/Requests/StoreStaffRequest.php` and `app/Http/Requests/UpdateStaffRequest.php` to define their properties.
    *   **Controller Annotations**:
        *   In `app/Http/Controllers/Api/V1/StaffController.php`, add `#[OA\Tag(name: "Staff", ...)]` to the class.
        *   Add `#[OA\Get]`, `#[OA\Post]`, `#[OA\Put]`, `#[OA\Delete]` annotations to the `index`, `store`, `show`, `update`, and `destroy` methods.
        *   The `store` and `update` methods' annotations must include a `requestBody` that correctly points to the schemas defined in `StoreStaffRequest` and `UpdateStaffRequest` respectively (e.g., `ref: "#/components/schemas/StoreStaffRequest"`).
        *   Ensure all possible responses (`200`, `201`, `204`, `401`, `403`, `404`, `422`) are documented.

2.  **Building Resource**:
    *   **Resource Schema**: Add `#[OA\Schema]` to `app/Http/Resources/BuildingResource.php`, including its base properties and the nested `rooms` array.
    *   **Request Schemas**: Add schemas to `StoreBuildingRequest` and `UpdateBuildingRequest`.
    *   **Controller Annotations**:
        *   In `app/Http/Controllers/Api/V1/BuildingController.php`, add `#[OA\Tag(name: "Buildings", ...)]`.
        *   **Remove the `@hideFromAPIDocumentation` annotation** from the `update` method.
        *   Add full annotations for all CRUD methods, linking to the correct request and resource schemas.

3.  **Room Resource**:
    *   **Resource Schema**: Add `#[OA\Schema]` to `app/Http/Resources/RoomResource.php`, including the nested `building` object.
    *   **Request Schemas**: Add schemas to `StoreRoomRequest` and `UpdateRoomRequest`.
    *   **Controller Annotations**:
        *   In `app/Http/Controllers/Api/V1/RoomController.php`, add `#[OA\Tag(name: "Rooms", ...)]`.
        *   **Remove the `@hideFromAPIDocumentation` annotation** from the `update` method.
        *   Add full annotations for all CRUD methods, linking to the correct request and resource schemas.

**Verification**:
1.  **Generate Documentation**: Run `php artisan l5-swagger:generate`. The command must complete without any `$ref` errors.
2.  **Visual Inspection**: Navigate to the Swagger UI. Confirm that "Staff", "Buildings", and "Rooms" tags appear with all their respective endpoints (`GET`, `POST`, `PUT`, `DELETE`, `SHOW`).
3.  **Schema Check**: Verify that the schemas for requests and responses are correctly defined and linked.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 15 is complete. Administrative and infrastructure API endpoints are now documented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .` and `git commit`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 16. Please confirm.**

---

### Task 16: Document Core Academic Operations

**Goal**: Add OpenAPI annotations for the `CourseSection` and `Enrollment` resources. These are the most complex and critical endpoints for the application's academic workflow.

**Implementation Steps**:

1.  **CourseSection Resource**:
    *   **Resource Schema**: Add `#[OA\Schema]` to `app/Http/Resources/CourseSectionResource.php`, detailing all its properties and nested relationships (`course`, `term`, `instructor.user`, `room.building`).
    *   **Request Schemas**: Add schemas to `StoreCourseSectionRequest` and `UpdateCourseSectionRequest`.
    *   **Controller Annotations**: In `app/Http/Controllers/Api/V1/CourseSectionController.php`, add a `#[OA\Tag]` and fully annotate all CRUD endpoints.

2.  **Enrollment Resource**:
    *   **Resource Schema**: Add `#[OA\Schema]` to `app/Http/Resources/EnrollmentResource.php`. This should be a very detailed schema reflecting the complex nested structure shown in the architecture guide (`student`, `course_section` with its own nested relations).
    *   **Request Schemas**: Add schemas to `StoreEnrollmentRequest` and `UpdateEnrollmentRequest`.
    *   **Controller Annotations**:
        *   In `app/Http/Controllers/Api/V1/EnrollmentController.php`, add `#[OA\Tag(name: "Enrollments", ...)]`.
        *   Document the standard CRUD endpoints (`index`, `store`, `show`, `update`, `destroy`).
        *   **Crucially, add specific `#[OA\Post]` and `#[OA\Get]` annotations for the custom business logic endpoints**:
            *   `POST enrollments/{enrollment}/withdraw`
            *   `POST enrollments/{enrollment}/complete`
            *   `GET students/{student}/enrollments`
            *   `GET course-sections/{courseSection}/enrollments`
        *   Each custom route annotation must define its own `path`, `summary`, `parameters` (with correct `in: 'path'`), and `responses`.

**Verification**:
1.  **Generate Documentation**: Run `php artisan l5-swagger:generate`.
2.  **Visual Inspection**: Navigate to the Swagger UI. Confirm that "Course Sections" and "Enrollments" tags appear with all endpoints, including the custom ones with correct paths.
3.  **Complex Schema Check**: Pay close attention to the `EnrollmentResource` schema to ensure all nested objects are rendered correctly. Check that path parameters for custom routes are documented.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 16 is complete. Core academic operation endpoints are now documented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .` and `git commit`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 17. Please confirm.**

---

### Task 17: Document System & Utility Endpoints

**Goal**: Document the remaining utility endpoints for `Authentication`, `Notifications`, and system `Health Checks` to provide a truly complete API reference.

**Implementation Steps**:

1.  **Authentication**:
    *   In `app/Http/Controllers/Api/V1/AuthController.php`, add `#[OA\Tag(name: "Authentication", ...)]` to the class.
    *   Add `#[OA\Post]` to the `login` method.
    *   The annotation must include a `requestBody` with a schema defining the `email`, `password`, and `device_name` fields.
    *   Document the `200 OK` response containing the `token` and the `422 Unprocessable Entity` error response.
    *   This endpoint should **not** be marked as secured.

2.  **Notifications**:
    *   In `app/Http/Controllers/Api/V1/NotificationController.php`, add `#[OA\Tag(name: "Notifications", ...)]`.
    *   Add annotations for `index` and `markAsRead`.
    *   Define a schema for the notification object directly in the `index` response annotation, as no `NotificationResource` exists. The schema should include `id`, `type`, `data` (as an object), and `read_at`.

3.  **Health Check**:
    *   The Health Check logic is in a closure in `routes/api.php`. Add annotations directly above the route definition in that file.
    *   Use the `/** ... */` docblock style for annotating routes in `routes/*.php` files.
        ```php
        /**
         * @OA\Get(
         *     path="/api/v1/health",
         *     summary="Check application health",
         *     description="Provides the health status of the application and its connected services.",
         *     tags={"System"},
         *     @OA\Response(response=200, description="System is healthy"),
         *     @OA\Response(response=503, description="System is unhealthy")
         * )
         */
        Route::get('/health', function () { ... });
        ```

**Verification**:
1.  **Generate Documentation**: Run `php artisan l5-swagger:generate`.
2.  **Visual Inspection**: Navigate to the Swagger UI. Confirm that a "System" tag now exists containing the Health Check. Verify the "Authentication" and "Notifications" tags are present and correct.
3.  **Test Unauthenticated**: Ensure the documented Auth and Health Check endpoints do not have the "lock" icon, indicating they are open.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 17 is complete. All system and utility endpoints are now documented. The API documentation is now 100% complete.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .` and `git commit`.**
3.  **AI Request to Proceed**: **The API Documentation Completion Plan is now complete. Please confirm.** 