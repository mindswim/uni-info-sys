# Phase 4: Core Functionality Implementation Plan

This document outlines the development tasks required to address the critical functionality gaps identified in the project audit. The goal is to implement the business logic for key API endpoints that currently return a `501 Not Implemented` error, transforming the application into a fully operational system.

Each task follows the structured workflow defined in the Collaborative Development Task Framework.

---

## [CRITICAL] Priority Tasks

### Task 18: Implement Student Profile Management API

**Goal**: Implement the `store`, `update`, and `destroy` methods in `StudentController` to allow students and administrators to create and manage student profiles, resolving the current `501 Not Implemented` responses for these core actions.

**Implementation Steps**:
1.  **Locate Controller**: Open `app/Http/Controllers/Api/V1/StudentController.php`.
2.  **Implement `store` Method**:
    *   Remove the `return response()->json(['message' => 'Not Implemented'], 501);` line.
    *   The method should accept a `StoreStudentRequest`.
    *   Add logic to create a new `Student` instance using `$request->validated()`.
    *   Ensure the `user_id` is correctly associated, potentially linking to a newly created `User` or an existing one based on the request data.
    *   Return a `201 Created` response using `StudentResource`.
3.  **Implement `update` Method**:
    *   Remove the `501` response.
    *   The method should accept an `UpdateStudentRequest`.
    *   Add logic to update the given `$student` model using `$request->validated()`.
    *   Return a `200 OK` response using `StudentResource`.
4.  **Implement `destroy` Method**:
    *   Remove the `501` response.
    *   Add logic to delete the `$student`. Consider the implications (e.g., should associated user/applications be deleted? For now, a simple delete is fine).
    *   Return a `204 No Content` response.
5.  **Authorization**: Verify that the `StudentPolicy` is correctly applied to each method using `$this->authorize()`.

**Testing & Verification**:
1.  **Update Feature Test**: Open `tests/Feature/Api/V1/StudentApiTest.php`.
2.  **Add `store` Test**: Write a test where an authenticated user (with appropriate permissions) successfully creates a new student profile via a `POST` request. Assert a `21` status and that the student exists in the database.
3.  **Add `update` Test**: Write a test where a user updates their own profile via a `PUT/PATCH` request. Assert a `200` status and that the database reflects the changes.
4.  **Add `destroy` Test**: Write a test where an admin deletes a student profile. Assert a `204` status and that the student is removed from the database.
5.  **Test Authorization**: Add tests to ensure a user cannot update or delete another user's profile unless they are an admin.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 18 is complete. Student profile management APIs are now fully implemented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 19. Please confirm.**

---

## [HIGH] Priority Tasks

### Task 19: Implement Document Upload API

**Goal**: Implement the document `store` method to allow students to upload files (transcripts, essays, etc.) as part of their application, resolving a key `501` error in the admissions workflow.

**Implementation Steps**:
1.  **Locate Controller**: Open `app/Http/Controllers/Api/V1/DocumentController.php`.
2.  **Implement `store` Method**:
    *   Remove the `501` response.
    *   The method should accept a `StoreDocumentRequest`. The request class will need validation rules for the uploaded file (e.g., `required|file|mimes:pdf,docx|max:2048`).
    *   The request should also validate the `student_id` and `document_type`.
    *   Add logic to handle the file upload using Laravel's `Storage` facade. The file should be stored in a private directory (e.g., `storage/app/student_documents/{student_id}`).
    *   Create a new `Document` model instance, saving the `file_path`, `original_filename`, `mime_type`, `file_size`, and other relevant data to the database.
    *   Return a `201 Created` response using `DocumentResource`.
3.  **Configure Filesystem**: Ensure the `filesystems.php` config has a `local` disk configured correctly. For this task, local storage is sufficient.
4.  **Authorization**: Ensure the `DocumentPolicy` is used to verify that a user can only upload documents for their own student profile.

**Testing & Verification**:
1.  **Update Feature Test**: Open `tests/Feature/Api/V1/DocumentApiTest.php`.
2.  **Use `Storage::fake()`**: In the test setup, use `Storage::fake('local')` to prevent actual file writes and allow for assertions on stored files.
3.  **Create Upload Test**: Write a test that authenticates as a student and makes a `POST` request to the document endpoint with a simulated uploaded file (`UploadedFile::fake()`).
4.  **Assert File Stored**: Use `Storage::disk('local')->assertExists(...)` to verify the file was "stored" at the correct path.
5.  **Assert Database Record**: Assert that a new record was created in the `documents` table with the correct metadata.
6.  **Assert Response**: Assert a `201 Created` status code.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 19 is complete. Document upload functionality is now implemented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **Ready to proceed to Task 20. Please confirm.**

---

### Task 20: Implement Academic Record Management API

**Goal**: Implement full CRUD functionality for `AcademicRecord` resources to allow administrators to manage student academic histories, resolving the final high-priority `501` gap.

**Implementation Steps**:
1.  **Locate Controller**: Open `app/Http/Controllers/Api/V1/AcademicRecordController.php`.
2.  **Implement `store`, `update`, `destroy` Methods**: Following the same pattern as Task 18, implement the logic for all three methods, removing the `501` responses.
3.  **Use Form Requests**: Ensure `StoreAcademicRecordRequest` and `UpdateAcademicRecordRequest` are created and used for validation.
4.  **Authorization**: Enforce the `AcademicRecordPolicy` in every method. Logic should ensure that only administrators can create, update, or delete academic records, while students may only have view access.
5.  **Return Resources**: Use `AcademicRecordResource` for all responses that return model data.

**Testing & Verification**:
1.  **Update Feature Test**: Open `tests/Feature/Api/V1/AcademicRecordApiTest.php`.
2.  **Write Test Cases**: Add tests for an admin user successfully creating, updating, and deleting an academic record for a student.
3.  **Test Authorization**: Write tests to ensure that a non-admin (e.g., a student) receives a `403 Forbidden` error when attempting to use the `store`, `update`, or `destroy` endpoints.
4.  **Run Tests**: Confirm all new and existing tests pass.

**Checkpoint & Human Approval (Mandatory Stop)**:
1.  **AI Statement of Completion**: Task 20 is complete. Academic record management is now fully implemented.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.**
3.  **AI Request to Proceed**: **This was the final task. The Core Functionality Implementation Plan is now complete.** 