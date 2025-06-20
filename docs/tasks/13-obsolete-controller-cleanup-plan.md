# Task 13: Obsolete Controller and Route Cleanup

## Goal
To safely remove obsolete controller classes and route files from the project. This will eliminate code redundancy, reduce ambiguity, and prevent future bugs caused by "code rot." This task is based on the findings documented in the `Area for Investigation: Redundant Controllers` section of the main developer's guide.

---

## Implementation Plan

This task will be executed in a methodical, three-step process to ensure no active code is removed.

### Step 1: Final Code Review & Route Cleanup

**Action**: Perform a final cleanup of the `routes/api.php` file to remove the single identified redundant route.

1.  Open the `routes/api.php` file.
2.  Locate and delete the entire `use App\Http\Controllers\StudentController;` statement from the top of the file.
3.  Locate and delete the following block of code, which incorrectly points to the root `StudentController`:
    ```php
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::get('/students/{student}', [StudentController::class, 'showApi'])->name('api.students.show');
    });
    ```
    *   **Justification**: This route is fully superseded by the `Route::apiResource('students', \App\Http\Controllers\Api\V1\StudentController::class);` declaration, which correctly handles the `show` action.

### Step 2: Delete Obsolete Files

**Action**: Delete the main `web.php` route file and all of the identified obsolete controller files from the root `app/Http/Controllers` directory.

1.  Delete the file `routes/web.php`.
2.  Delete the following list of controller files:
    *   `app/Http/Controllers/AcademicRecordController.php`
    *   `app/Http/Controllers/AdmissionApplicationController.php`
    *   `app/Http/Controllers/BuildingController.php`
    *   `app/Http/Controllers/CourseController.php`
    *   `app/Http/Controllers/CourseSectionController.php`
    *   `app/Http/Controllers/DashboardController.php`
    *   `app/Http/Controllers/DepartmentController.php`
    *   `app/Http/Controllers/DocumentController.php`
    *   `app/Http/Controllers/EnrollmentController.php`
    *   `app/Http/Controllers/FacultyController.php`
    *   `app/Http/Controllers/MetricsController.php`
    *   `app/Http/Controllers/ProfileController.php`
    *   `app/Http/Controllers/ProgramChoiceController.php`
    *   `app/Http/Controllers/ProgramController.php`
    *   `app/Http/Controllers/RoomController.php`
    *   `app/Http/Controllers/StaffController.php`
    *   `app/Http/Controllers/StudentController.php`
    *   `app/Http/Controllers/TermController.php`

### Step 3: Verification via Automated Testing

**Action**: Run the entire existing test suite to verify that the removal of the obsolete files has not impacted any of the application's core API functionality.

1.  Execute the following command from the project root:
    ```bash
    php artisan test
    ```
2.  **Expected Outcome**: The test suite must complete successfully with all tests passing.
3.  **Justification**: A successful test run provides high confidence that the deleted controllers and routes were not being used by any part of the active application that is covered by tests. It confirms that the `Api/V1/` controllers are correctly handling all tested functionality.

---

## Checkpoint & Human Approval (Mandatory Stop)

1.  **AI Statement of Completion**: Task 13 is complete. The obsolete files have been removed, and the entire test suite passes, verifying that the application remains fully functional.
2.  **AI Request for Approval to Commit**: **Awaiting your approval to proceed with `git add .`, `git commit`, and `git push`.** 