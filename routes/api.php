<?php

use App\Http\Controllers\Api\V1\ActionItemController;
use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AnnouncementController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AssignmentController;
use App\Http\Controllers\Api\V1\AssignmentSubmissionController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\DegreeRequirementController;
use App\Http\Controllers\Api\V1\TuitionRateController;
use App\Http\Controllers\Api\V1\ClassSessionController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CourseImportController;
use App\Http\Controllers\Api\V1\CourseMaterialController;
use App\Http\Controllers\Api\V1\CourseSectionController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\FacultyController;
use App\Http\Controllers\Api\V1\FinancialAidController;
use App\Http\Controllers\Api\V1\GradebookController;
use App\Http\Controllers\Api\V1\GradeImportController;
use App\Http\Controllers\Api\V1\HoldController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProgramController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\TermController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/**
 * @OA\Get(
 *     path="/api/v1/health",
 *     summary="Check application health",
 *     description="Provides the health status of the application and its connected services (database, cache).",
 *     tags={"System"},
 *
 *     @OA\Response(
 *         response=200,
 *         description="System is healthy",
 *
 *         @OA\JsonContent(
 *
 *             @OA\Property(property="status", type="string", example="healthy"),
 *             @OA\Property(property="timestamp", type="string", format="date-time"),
 *             @OA\Property(property="services", type="object"),
 *             @OA\Property(property="application", type="object")
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=503,
 *         description="System is unhealthy",
 *
 *         @OA\JsonContent(
 *
 *             @OA\Property(property="status", type="string", example="unhealthy"),
 *             @OA\Property(property="timestamp", type="string", format="date-time"),
 *             @OA\Property(property="services", type="object"),
 *             @OA\Property(property="application", type="object")
 *         )
 *     )
 * )
 */
// Health Check Endpoint - Unauthenticated for monitoring
Route::get('/health', function () {
    $status = 'healthy';
    $services = [];
    $httpCode = 200;

    // Check Database Connection
    try {
        DB::connection()->getPdo();
        $services['database'] = [
            'status' => 'healthy',
            'message' => 'Database connection successful',
        ];
    } catch (Exception $e) {
        $status = 'unhealthy';
        $httpCode = 503;
        $services['database'] = [
            'status' => 'unhealthy',
            'message' => 'Database connection failed: '.$e->getMessage(),
        ];
    }

    // Check Cache Connection
    try {
        $testKey = 'health_check_'.time();
        Cache::put($testKey, 'test', 10);
        $retrievedValue = Cache::get($testKey);
        Cache::forget($testKey);

        if ($retrievedValue === 'test') {
            $services['cache'] = [
                'status' => 'healthy',
                'message' => 'Cache connection successful',
            ];
        } else {
            throw new Exception('Cache write/read test failed');
        }
    } catch (Exception $e) {
        $status = 'unhealthy';
        $httpCode = 503;
        $services['cache'] = [
            'status' => 'unhealthy',
            'message' => 'Cache connection failed: '.$e->getMessage(),
        ];
    }

    return response()->json([
        'status' => $status,
        'timestamp' => now()->toISOString(),
        'services' => $services,
        'application' => [
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'version' => '1.0.0',
        ],
    ], $httpCode);
})->middleware('throttle:100,1'); // Allow 100 requests per minute for health checks

Route::get('/user', function (Request $request) {
    $user = $request->user();
    $user->load('roles.permissions');

    return new \App\Http\Resources\UserResource($user);
})->middleware(['auth:sanctum', 'throttle:api']);

// API routes for students that return JSON resources
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/students/{student}', [StudentController::class, 'showApi'])->name('api.students.show');
});

// Unprotected route for creating tokens (still rate limited)
Route::post('/v1/tokens/create', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'login'])
    ->middleware('throttle:api');

// Public registration endpoint
Route::post('/v1/auth/register', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'register'])
    ->middleware('throttle:api');

// Password reset routes (unauthenticated)
Route::post('/v1/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])
    ->middleware('throttle:api')
    ->name('api.password.email');
Route::post('/v1/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware('throttle:api')
    ->name('api.password.update');

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'logout']);
    Route::get('/auth/user', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'user']);

    // Faculties with CSV
    Route::apiResource('faculties', FacultyController::class);
    Route::post('faculties/csv/import', [FacultyController::class, 'importCsv']);
    Route::get('faculties/csv/export', [FacultyController::class, 'exportCsv']);
    Route::get('faculties/csv/template', [FacultyController::class, 'downloadTemplate']);

    // Departments with CSV
    Route::apiResource('departments', DepartmentController::class);
    Route::post('departments/csv/import', [DepartmentController::class, 'importCsv']);
    Route::get('departments/csv/export', [DepartmentController::class, 'exportCsv']);
    Route::get('departments/csv/template', [DepartmentController::class, 'downloadTemplate']);

    // Programs with CSV
    Route::apiResource('programs', ProgramController::class);
    Route::post('programs/csv/import', [ProgramController::class, 'importCsv']);
    Route::get('programs/csv/export', [ProgramController::class, 'exportCsv']);
    Route::get('programs/csv/template', [ProgramController::class, 'downloadTemplate']);

    // Degree Requirements (nested under programs for list/create, standalone for show/update/delete)
    Route::get('programs/{program}/degree-requirements', [DegreeRequirementController::class, 'index']);
    Route::post('programs/{program}/degree-requirements', [DegreeRequirementController::class, 'store']);
    Route::get('degree-requirements/{degreeRequirement}', [DegreeRequirementController::class, 'show']);
    Route::put('degree-requirements/{degreeRequirement}', [DegreeRequirementController::class, 'update']);
    Route::delete('degree-requirements/{degreeRequirement}', [DegreeRequirementController::class, 'destroy']);

    // Tuition Rates
    Route::apiResource('tuition-rates', TuitionRateController::class);

    Route::get('course-catalog', [CourseController::class, 'catalog']);
    // Course CSV operations
    Route::post('courses/csv/import', [CourseController::class, 'importCsv'])->middleware('permission:create_courses');
    Route::get('courses/csv/export', [CourseController::class, 'exportCsv'])->middleware('permission:view_courses');
    Route::get('courses/csv/template', [CourseController::class, 'downloadTemplate']);
    // Course management with permission-based authorization
    Route::get('courses', [CourseController::class, 'index'])->middleware('permission:view_courses');
    Route::post('courses', [CourseController::class, 'store'])->middleware('permission:create_courses');
    Route::get('courses/{course}', [CourseController::class, 'show'])->middleware('permission:view_courses');
    Route::put('courses/{course}', [CourseController::class, 'update'])->middleware('permission:update_courses');
    Route::delete('courses/{course}', [CourseController::class, 'destroy'])->middleware('permission:delete_courses');

    // Staff-centric resources (must be before apiResource, protected by staff role middleware)
    Route::middleware('role.staff')->group(function () {
        Route::get('staff/me', [\App\Http\Controllers\Api\V1\StaffController::class, 'me']);
        Route::get('staff/me/sections', [\App\Http\Controllers\Api\V1\StaffController::class, 'mySections']);
        Route::get('staff/me/students', [\App\Http\Controllers\Api\V1\StaffController::class, 'myStudents']);
    });
    Route::apiResource('staff', StaffController::class);
    Route::post('staff/csv/import', [StaffController::class, 'importCsv']);
    Route::get('staff/csv/export', [StaffController::class, 'exportCsv']);
    Route::get('staff/csv/template', [StaffController::class, 'downloadTemplate']);

    Route::apiResource('terms', TermController::class);
    Route::post('terms/csv/import', [TermController::class, 'importCsv']);
    Route::get('terms/csv/export', [TermController::class, 'exportCsv']);
    Route::get('terms/csv/template', [TermController::class, 'downloadTemplate']);

    Route::apiResource('buildings', BuildingController::class);
    Route::post('buildings/csv/import', [BuildingController::class, 'importCsv']);
    Route::get('buildings/csv/export', [BuildingController::class, 'exportCsv']);
    Route::get('buildings/csv/template', [BuildingController::class, 'downloadTemplate']);

    Route::apiResource('rooms', RoomController::class);
    Route::post('rooms/csv/import', [RoomController::class, 'importCsv']);
    Route::get('rooms/csv/export', [RoomController::class, 'exportCsv']);
    Route::get('rooms/csv/template', [RoomController::class, 'downloadTemplate']);

    Route::apiResource('course-sections', CourseSectionController::class);
    Route::post('course-sections/csv/import', [CourseSectionController::class, 'importCsv']);
    Route::get('course-sections/csv/export', [CourseSectionController::class, 'exportCsv']);
    Route::get('course-sections/csv/template', [CourseSectionController::class, 'downloadTemplate']);
    // Admission application management with permission-based authorization
    // Bulk actions and stats (must be before resourceful routes to avoid route conflicts)
    Route::post('admission-applications/bulk-actions', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'bulkAction'])->middleware('permission:update_applications');
    Route::get('admission-applications/stats', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'getStats'])->middleware('permission:view_applications');

    // CRUD operations
    Route::get('admission-applications', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'index'])->middleware('permission:view_applications');
    Route::post('admission-applications', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'store'])->middleware('permission:create_applications');
    Route::get('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'show'])->middleware('permission:view_applications');
    Route::put('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'update'])->middleware('permission:update_applications');
    Route::delete('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'destroy'])->middleware('permission:update_applications');

    // Workflow actions
    Route::post('admission-applications/{admission_application}/accept', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'accept'])->middleware('permission:update_applications');
    Route::post('admission-applications/{admission_application}/reject', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'reject'])->middleware('permission:update_applications');
    Route::post('admission-applications/{admission_application}/waitlist', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'waitlist'])->middleware('permission:update_applications');
    Route::post('admission-applications/{admission_application}/enroll', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'enroll'])->middleware('permission:update_applications');
    Route::post('admission-applications/{admission_application}/confirm-enrollment', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'confirmEnrollment']);

    // Nested ProgramChoice routes - both nested and shallow for RESTful best practices
    Route::apiResource('admission-applications.program-choices', \App\Http\Controllers\Api\V1\ProgramChoiceController::class)->scoped()->shallow();

    // Role and Permission management resources (admin-only)
    Route::middleware('role.admin')->group(function () {
        Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class);
        Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\V1\RoleController::class, 'syncPermissions']);
        Route::apiResource('permissions', \App\Http\Controllers\Api\V1\PermissionController::class)->only(['index', 'show']);

        // Admin dashboard endpoints
        Route::get('admin/dashboard/holds-summary', [HoldController::class, 'adminSummary']);

        // Audit log
        Route::get('audits', [AuditController::class, 'index']);

        // Graduation applications (admin review)
        Route::get('graduation-applications', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'index']);
        Route::post('graduation-applications/{graduationApplication}/approve', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'approve']);
        Route::post('graduation-applications/{graduationApplication}/deny', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'deny']);
    });

    // User management (for admin to list users without student records)
    Route::get('users/{user}/roles', [UserController::class, 'roles']);
    Route::apiResource('users', UserController::class)->only(['index', 'show']);

    // Holds management
    Route::get('holds/summary', [HoldController::class, 'summary']); // Student's own holds summary
    Route::post('holds/{hold}/resolve', [HoldController::class, 'resolve']);
    Route::apiResource('holds', HoldController::class);

    // Action items (to-do list)
    Route::get('action-items/dashboard', [ActionItemController::class, 'dashboard']); // Student's dashboard summary
    Route::post('action-items/{actionItem}/complete', [ActionItemController::class, 'complete']);
    Route::post('action-items/{actionItem}/dismiss', [ActionItemController::class, 'dismiss']);
    Route::apiResource('action-items', ActionItemController::class);

    // Student-centric resources (protected by student role middleware)
    Route::middleware('role.student')->group(function () {
        Route::get('students/me', [\App\Http\Controllers\Api\V1\StudentController::class, 'me']);
        Route::get('students/me/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'myRecords']);

        // Graduation applications (student)
        Route::get('graduation-applications/me', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'myApplications']);
        Route::post('graduation-applications', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'store']);
        Route::get('graduation-applications/{graduationApplication}', [\App\Http\Controllers\Api\V1\GraduationApplicationController::class, 'show']);
    });

    // Student management with permission-based authorization
    Route::get('students', [\App\Http\Controllers\Api\V1\StudentController::class, 'index'])->middleware('permission:view_students');
    Route::post('students', [\App\Http\Controllers\Api\V1\StudentController::class, 'store'])->middleware('permission:create_students');
    Route::get('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'show'])->middleware('permission:view_students');
    Route::put('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'update'])->middleware('permission:update_students');
    Route::delete('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'destroy'])->middleware('permission:delete_students');
    Route::post('students/{student}/restore', [\App\Http\Controllers\Api\V1\StudentController::class, 'restore'])->withTrashed()->middleware('permission:update_students');
    Route::delete('students/{student}/force', [\App\Http\Controllers\Api\V1\StudentController::class, 'forceDelete'])->withTrashed()->middleware('permission:delete_students');

    // Student CSV Import/Export
    Route::post('students/csv/import', [\App\Http\Controllers\Api\V1\StudentController::class, 'importCsv'])->middleware('permission:create_students');
    Route::get('students/csv/export', [\App\Http\Controllers\Api\V1\StudentController::class, 'exportCsv'])->middleware('permission:view_students');
    Route::get('students/csv/template', [\App\Http\Controllers\Api\V1\StudentController::class, 'downloadTemplate']);

    // Academic records with permission-based authorization
    Route::get('students/{student}/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'index'])->middleware('permission:view_academic_records');
    Route::post('students/{student}/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'store'])->middleware('permission:update_grades');
    Route::get('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'show'])->middleware('permission:view_academic_records');
    Route::put('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'update'])->middleware('permission:update_grades');
    Route::delete('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'destroy'])->middleware('permission:update_grades');
    Route::apiResource('students.documents', \App\Http\Controllers\Api\V1\DocumentController::class)->scoped()->shallow();
    Route::get('students/{student}/documents/all-versions', [\App\Http\Controllers\Api\V1\DocumentController::class, 'allVersions']);

    // Document restore routes
    Route::post('students/{student}/documents/{document}/verify', [\App\Http\Controllers\Api\V1\DocumentController::class, 'verify']);
    Route::post('students/{student}/documents/{document}/reject', [\App\Http\Controllers\Api\V1\DocumentController::class, 'reject']);

    Route::post('documents/{document}/restore', [\App\Http\Controllers\Api\V1\DocumentController::class, 'restore'])->withTrashed();
    Route::delete('documents/{document}/force', [\App\Http\Controllers\Api\V1\DocumentController::class, 'forceDelete'])->withTrashed();

    // Enrollment CSV operations
    Route::post('enrollments/csv/import', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'importCsv'])->middleware('permission:create_enrollments');
    Route::get('enrollments/csv/export', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'exportCsv'])->middleware('permission:view_enrollments');
    Route::get('enrollments/csv/template', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'downloadTemplate']);
    // Enrollment management with custom business logic endpoints (must be before apiResource)
    Route::middleware('role.student')->group(function () {
        Route::get('enrollments/me', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'myEnrollments']);
    });
    Route::post('enrollments/{enrollment}/withdraw', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'withdraw']);
    Route::post('enrollments/{enrollment}/complete', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'complete']);
    Route::get('students/{student}/enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'byStudent']);
    Route::get('course-sections/{courseSection}/enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'byCourseSection']);

    // Enrollment API routes with permission-based authorization
    Route::get('enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'index'])->middleware('permission:view_enrollments');
    Route::post('enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'store'])->middleware('permission:create_enrollments');
    Route::get('enrollments/{enrollment}', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'show'])->middleware('permission:view_enrollments');
    Route::put('enrollments/{enrollment}', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'update'])->middleware('permission:update_enrollments');
    Route::delete('enrollments/{enrollment}', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'destroy'])->middleware('permission:delete_enrollments');
    Route::post('enrollments/{enrollment}/restore', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'restore'])->withTrashed()->middleware('permission:update_enrollments');
    Route::delete('enrollments/{enrollment}/force', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'forceDelete'])->withTrashed()->middleware('permission:delete_enrollments');

    // Course restore routes
    Route::post('courses/{course}/restore', [\App\Http\Controllers\Api\V1\CourseController::class, 'restore'])->withTrashed();
    Route::delete('courses/{course}/force', [\App\Http\Controllers\Api\V1\CourseController::class, 'forceDelete'])->withTrashed();

    // Admission application restore routes
    Route::post('admission-applications/{admission_application}/restore', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'restore'])->withTrashed();
    Route::delete('admission-applications/{admission_application}/force', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'forceDelete'])->withTrashed();

    // Enrollment swap endpoint
    Route::post('enrollments/swap', [\App\Http\Controllers\Api\V1\EnrollmentSwapController::class, 'store']);

    // Notification routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Grade management routes
    Route::put('enrollments/{enrollment}/grade', [\App\Http\Controllers\Api\V1\GradeController::class, 'submitGrade']);
    Route::post('course-sections/{courseSection}/grades/bulk', [\App\Http\Controllers\Api\V1\GradeController::class, 'bulkSubmitGrades']);
    Route::get('course-sections/{courseSection}/grade-distribution', [\App\Http\Controllers\Api\V1\GradeController::class, 'getGradeDistribution']);
    Route::get('course-sections/{courseSection}/grading-progress', [\App\Http\Controllers\Api\V1\GradeController::class, 'getGradingProgress']);
    Route::get('grades/valid-grades', [\App\Http\Controllers\Api\V1\GradeController::class, 'getValidGrades']);

    // Grade change request routes
    Route::get('grade-change-requests', [\App\Http\Controllers\Api\V1\GradeController::class, 'listGradeChangeRequests']);
    Route::post('grade-change-requests', [\App\Http\Controllers\Api\V1\GradeController::class, 'requestGradeChange']);
    Route::post('grade-change-requests/{gradeChangeRequest}/approve', [\App\Http\Controllers\Api\V1\GradeController::class, 'approveGradeChange']);
    Route::post('grade-change-requests/{gradeChangeRequest}/deny', [\App\Http\Controllers\Api\V1\GradeController::class, 'denyGradeChange']);

    // Import routes (requires specific permissions)
    Route::post('imports/courses', [CourseImportController::class, 'store']);
    Route::post('course-sections/{courseSection}/import-grades', [GradeImportController::class, 'store']);

    // Billing and payment routes
    Route::get('invoices/student-summary', [InvoiceController::class, 'studentSummary']);
    Route::post('invoices/{invoice}/discount', [InvoiceController::class, 'addDiscount']);
    Route::post('invoices/{invoice}/adjustment', [InvoiceController::class, 'addAdjustment']);
    Route::apiResource('invoices', InvoiceController::class);

    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);
    Route::apiResource('payments', PaymentController::class);

    // Attendance CSV operations
    Route::post('attendance/csv/import', [AttendanceController::class, 'importCsv']);
    Route::get('attendance/csv/export', [AttendanceController::class, 'exportCsv']);
    Route::get('attendance/csv/template', [AttendanceController::class, 'downloadTemplate']);
    // Attendance routes
    Route::post('attendance/bulk', [AttendanceController::class, 'bulkStore']);
    Route::get('attendance/student-report', [AttendanceController::class, 'studentReport']);
    Route::get('course-sections/{courseSection}/attendance-statistics', [AttendanceController::class, 'courseStatistics']);
    Route::apiResource('attendance', AttendanceController::class)->parameters(['attendance' => 'attendanceRecord']);

    // Class Session routes
    // Student/staff-centric session views
    Route::middleware('role.student')->group(function () {
        Route::get('class-sessions/me', [ClassSessionController::class, 'mySessions']);
    });
    Route::middleware('role.staff')->group(function () {
        Route::get('class-sessions/me/instructor', [ClassSessionController::class, 'myInstructorSessions']);
    });

    // Session queries
    Route::get('class-sessions/for-date', [ClassSessionController::class, 'forDate']);
    Route::get('class-sessions/student', [ClassSessionController::class, 'studentSessions']);
    Route::get('class-sessions/instructor', [ClassSessionController::class, 'instructorSessions']);

    // Course section specific session routes
    Route::get('course-sections/{courseSection}/sessions', [ClassSessionController::class, 'byCourseSection']);
    Route::post('course-sections/{courseSection}/sessions/generate', [ClassSessionController::class, 'generateForSection']);
    Route::get('course-sections/{courseSection}/session-stats', [ClassSessionController::class, 'sectionStats']);

    // Term-wide session generation
    Route::post('terms/{term}/sessions/generate', [ClassSessionController::class, 'generateForTerm']);

    // Session actions
    Route::post('class-sessions/{classSession}/complete', [ClassSessionController::class, 'complete']);
    Route::post('class-sessions/{classSession}/cancel', [ClassSessionController::class, 'cancel']);
    Route::post('class-sessions/{classSession}/reschedule', [ClassSessionController::class, 'reschedule']);
    Route::post('class-sessions/{classSession}/substitute', [ClassSessionController::class, 'assignSubstitute']);

    // Standard CRUD
    Route::apiResource('class-sessions', ClassSessionController::class);

    // Assignment routes
    // Student-centric assignment views
    Route::middleware('role.student')->group(function () {
        Route::get('assignments/me', [AssignmentController::class, 'myAssignments']);
        Route::get('assignments/me/upcoming', [AssignmentController::class, 'myUpcoming']);
    });

    // Assignment queries
    Route::get('assignments/types', [AssignmentController::class, 'types']);
    Route::get('assignments/student', [AssignmentController::class, 'forStudent']);

    // Course section specific assignment routes
    Route::get('course-sections/{courseSection}/assignments', [AssignmentController::class, 'byCourseSection']);

    // Assignment actions
    Route::post('assignments/{assignment}/publish', [AssignmentController::class, 'publish']);
    Route::post('assignments/{assignment}/unpublish', [AssignmentController::class, 'unpublish']);
    Route::post('assignments/{assignment}/duplicate', [AssignmentController::class, 'duplicate']);
    Route::get('assignments/{assignment}/grading-progress', [AssignmentController::class, 'gradingProgress']);

    // Standard CRUD
    Route::apiResource('assignments', AssignmentController::class);

    // Assignment Submission routes
    // Student-centric submission views
    Route::middleware('role.student')->group(function () {
        Route::get('submissions/me', [AssignmentSubmissionController::class, 'mySubmissions']);
        Route::get('assignments/{assignment}/my-submission', [AssignmentSubmissionController::class, 'mySubmissionForAssignment']);
    });

    // Submission queries
    Route::get('submissions/pending-grading', [AssignmentSubmissionController::class, 'pendingGrading']);
    Route::get('assignments/{assignment}/submissions', [AssignmentSubmissionController::class, 'forAssignment']);
    Route::get('assignments/{assignment}/submission-stats', [AssignmentSubmissionController::class, 'assignmentStats']);

    // Submission actions
    Route::post('submissions/submit', [AssignmentSubmissionController::class, 'submit']);
    Route::post('submissions/draft', [AssignmentSubmissionController::class, 'saveDraft']);
    Route::post('submissions/{assignmentSubmission}/grade', [AssignmentSubmissionController::class, 'grade']);
    Route::post('submissions/batch-grade', [AssignmentSubmissionController::class, 'batchGrade']);
    Route::post('submissions/{assignmentSubmission}/return', [AssignmentSubmissionController::class, 'returnForRevision']);
    Route::post('submissions/{assignmentSubmission}/resubmit', [AssignmentSubmissionController::class, 'resubmit']);

    // Standard CRUD (limited - mostly read operations)
    Route::get('submissions', [AssignmentSubmissionController::class, 'index']);
    Route::get('submissions/{assignmentSubmission}', [AssignmentSubmissionController::class, 'show']);
    Route::delete('submissions/{assignmentSubmission}', [AssignmentSubmissionController::class, 'destroy']);

    // Gradebook routes
    // Student-centric gradebook views
    Route::middleware('role.student')->group(function () {
        Route::get('gradebook/me', [GradebookController::class, 'myGrades']);
        Route::get('course-sections/{courseSection}/gradebook/me', [GradebookController::class, 'myGradebook']);
    });

    // Gradebook queries
    Route::get('enrollments/{enrollment}/gradebook', [GradebookController::class, 'studentGradebook']);
    Route::get('enrollments/{enrollment}/gradebook/categories', [GradebookController::class, 'gradesByCategory']);
    Route::get('enrollments/{enrollment}/gradebook/needed', [GradebookController::class, 'calculateNeeded']);

    // Class gradebook (instructor view)
    Route::get('course-sections/{courseSection}/gradebook', [GradebookController::class, 'classGradebook']);
    Route::get('course-sections/{courseSection}/gradebook/export', [GradebookController::class, 'exportGradebook']);
    Route::get('course-sections/{courseSection}/gradebook/statistics', [GradebookController::class, 'classStatistics']);
    Route::post('course-sections/{courseSection}/gradebook/finalize', [GradebookController::class, 'finalizeGrades']);

    // Course Materials routes
    // Student-centric material views
    Route::middleware('role.student')->group(function () {
        Route::get('course-materials/me', [CourseMaterialController::class, 'myMaterials']);
        Route::get('course-sections/{courseSection}/materials/me', [CourseMaterialController::class, 'myCourseMaterials']);
    });

    // Material queries
    Route::get('course-materials/types', [CourseMaterialController::class, 'types']);
    Route::get('course-sections/{courseSection}/materials', [CourseMaterialController::class, 'byCourseSection']);
    Route::get('course-sections/{courseSection}/syllabus', [CourseMaterialController::class, 'syllabus']);
    Route::get('class-sessions/{classSession}/materials', [CourseMaterialController::class, 'byClassSession']);

    // Material actions
    Route::post('course-materials/{courseMaterial}/publish', [CourseMaterialController::class, 'publish']);
    Route::post('course-materials/{courseMaterial}/unpublish', [CourseMaterialController::class, 'unpublish']);
    Route::post('course-materials/reorder', [CourseMaterialController::class, 'reorder']);

    // Standard CRUD
    Route::apiResource('course-materials', CourseMaterialController::class);

    // Announcement routes
    // Student-centric announcement views
    Route::middleware('role.student')->group(function () {
        Route::get('announcements/me', [AnnouncementController::class, 'myAnnouncements']);
    });

    // Staff-centric announcement views
    Route::middleware('role.staff')->group(function () {
        Route::get('announcements/me/created', [AnnouncementController::class, 'myCreatedAnnouncements']);
    });

    // Announcement queries
    Route::get('announcements/priorities', [AnnouncementController::class, 'priorities']);
    Route::get('announcements/university-wide', [AnnouncementController::class, 'universityWide']);
    Route::get('course-sections/{courseSection}/announcements', [AnnouncementController::class, 'forCourseSection']);
    Route::get('departments/{department}/announcements', [AnnouncementController::class, 'forDepartment']);

    // Announcement actions
    Route::post('announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);
    Route::post('announcements/{announcement}/unpublish', [AnnouncementController::class, 'unpublish']);
    Route::post('announcements/{announcement}/pin', [AnnouncementController::class, 'pin']);
    Route::post('announcements/{announcement}/unpin', [AnnouncementController::class, 'unpin']);

    // Standard CRUD
    Route::apiResource('announcements', AnnouncementController::class);

    // Financial Aid routes
    // Student-centric financial aid views
    Route::middleware('role.student')->group(function () {
        Route::get('financial-aid/me', [FinancialAidController::class, 'myPackage']);
    });

    // Financial aid queries
    Route::get('financial-aid/scholarships', [FinancialAidController::class, 'scholarships']);
    Route::get('financial-aid/scholarships/{scholarship}', [FinancialAidController::class, 'scholarship']);
    Route::get('financial-aid/stats', [FinancialAidController::class, 'stats'])->middleware('role.admin');
    Route::get('students/{student}/financial-aid', [FinancialAidController::class, 'studentPackages'])->middleware('permission:view_students');

    // Calendar/Event routes
    // User-centric event views
    Route::get('events/me', [EventController::class, 'myEvents']);
    Route::get('events/upcoming', [EventController::class, 'upcoming']);
    Route::get('events/types', [EventController::class, 'types']);

    // Event RSVP
    Route::post('events/{event}/rsvp', [EventController::class, 'rsvp']);

    // Event cancellation
    Route::post('events/{event}/cancel', [EventController::class, 'cancel']);

    // Standard CRUD
    Route::apiResource('events', EventController::class);

    // Appointment routes
    // Student appointment views
    Route::get('appointments/me', [AppointmentController::class, 'myAppointments']);
    Route::get('students/me/advisor', [AppointmentController::class, 'myAdvisor']);

    // Staff/advisor appointment views
    Route::get('staff/me/advisees', [AppointmentController::class, 'myAdvisees']);
    Route::get('staff/me/appointments', [AppointmentController::class, 'advisorAppointments']);

    // Appointment actions
    Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
    Route::post('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm']);
    Route::post('appointments/{appointment}/complete', [AppointmentController::class, 'complete']);
    Route::post('appointments/{appointment}/no-show', [AppointmentController::class, 'noShow']);

    // Standard CRUD for appointments
    Route::apiResource('appointments', AppointmentController::class);

    // Messaging routes
    Route::get('messages/conversations', [MessageController::class, 'conversations']);
    Route::get('messages/conversations/{conversation}', [MessageController::class, 'conversation']);
    Route::post('messages/conversations', [MessageController::class, 'startConversation']);
    Route::post('messages/conversations/{conversation}/messages', [MessageController::class, 'sendMessage']);
    Route::post('messages/conversations/{conversation}/read', [MessageController::class, 'markAsRead']);
    Route::post('messages/conversations/{conversation}/archive', [MessageController::class, 'archive']);
    Route::get('messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('messages/search-users', [MessageController::class, 'searchUsers']);

    // User Settings routes
    Route::get('settings/me', [SettingController::class, 'mySettings']);
    Route::patch('settings/me', [SettingController::class, 'updateMySettings']);
    Route::patch('settings/me/notifications', [SettingController::class, 'updateNotifications']);
    Route::patch('settings/me/appearance', [SettingController::class, 'updateAppearance']);

    // System Settings routes (admin only)
    Route::get('settings/system', [SettingController::class, 'index']);
    Route::get('settings/system/info', [SettingController::class, 'systemInfo']);
    Route::get('settings/system/{group}', [SettingController::class, 'getGroup']);
    Route::patch('settings/system/{group}', [SettingController::class, 'updateGroup']);
    Route::get('settings/system/{group}/{key}', [SettingController::class, 'getSetting']);
    Route::put('settings/system/{group}/{key}', [SettingController::class, 'setSetting']);
    Route::post('settings/system/cache/clear', [SettingController::class, 'clearCache']);
    Route::post('settings/system/maintenance', [SettingController::class, 'toggleMaintenance']);

});

// Prometheus metrics endpoint (unauthenticated for monitoring systems)
Route::get('/metrics', [\App\Http\Controllers\Api\V1\MetricsController::class, 'index'])
    ->middleware('throttle:60,1'); // Allow 60 requests per minute for metrics scraping
