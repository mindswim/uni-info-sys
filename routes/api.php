<?php

use App\Http\Controllers\Api\V1\StudentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Api\V1\FacultyController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\ProgramController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\TermController;
use App\Http\Controllers\Api\V1\BuildingController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\CourseSectionController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\CourseImportController;
use App\Http\Controllers\Api\V1\GradeImportController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\ImpersonationController;

// Load demo routes
require __DIR__.'/demo.php';

/**
 * @OA\Get(
 *     path="/api/v1/health",
 *     summary="Check application health",
 *     description="Provides the health status of the application and its connected services (database, cache).",
 *     tags={"System"},
 *     @OA\Response(
 *         response=200,
 *         description="System is healthy",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="string", example="healthy"),
 *             @OA\Property(property="timestamp", type="string", format="date-time"),
 *             @OA\Property(property="services", type="object"),
 *             @OA\Property(property="application", type="object")
 *         )
 *     ),
 *     @OA\Response(
 *         response=503,
 *         description="System is unhealthy",
 *         @OA\JsonContent(
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
            'message' => 'Database connection successful'
        ];
    } catch (Exception $e) {
        $status = 'unhealthy';
        $httpCode = 503;
        $services['database'] = [
            'status' => 'unhealthy',
            'message' => 'Database connection failed: ' . $e->getMessage()
        ];
    }

    // Check Cache Connection
    try {
        $testKey = 'health_check_' . time();
        Cache::put($testKey, 'test', 10);
        $retrievedValue = Cache::get($testKey);
        Cache::forget($testKey);
        
        if ($retrievedValue === 'test') {
            $services['cache'] = [
                'status' => 'healthy',
                'message' => 'Cache connection successful'
            ];
        } else {
            throw new Exception('Cache write/read test failed');
        }
    } catch (Exception $e) {
        $status = 'unhealthy';
        $httpCode = 503;
        $services['cache'] = [
            'status' => 'unhealthy',
            'message' => 'Cache connection failed: ' . $e->getMessage()
        ];
    }

    return response()->json([
        'status' => $status,
        'timestamp' => now()->toISOString(),
        'services' => $services,
        'application' => [
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'version' => '1.0.0'
        ]
    ], $httpCode);
})->middleware('throttle:100,1'); // Allow 100 requests per minute for health checks

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'throttle:api']);

// API routes for students that return JSON resources
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/students/{student}', [StudentController::class, 'showApi'])->name('api.students.show');
});

// Unprotected route for creating tokens (still rate limited)
Route::post('/v1/tokens/create', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'login'])
    ->middleware('throttle:api');

// Password reset routes (unauthenticated)
Route::post('/v1/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])
    ->middleware('throttle:api')
    ->name('api.password.email');
Route::post('/v1/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware('throttle:api')
    ->name('api.password.update');

// God Mode / Impersonation routes (development only)
Route::post('/v1/quick-login', [ImpersonationController::class, 'quickLogin'])
    ->middleware('throttle:api');

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'logout']);
    Route::get('/auth/user', [\App\Http\Controllers\Api\V1\Auth\AuthController::class, 'user']);
    Route::apiResource('faculties', FacultyController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::get('course-catalog', [CourseController::class, 'catalog']);
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
    });
    Route::apiResource('staff', StaffController::class);

    Route::apiResource('terms', TermController::class);
    Route::apiResource('buildings', BuildingController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('course-sections', CourseSectionController::class);
    // Admission application management with permission-based authorization
    Route::get('admission-applications', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'index'])->middleware('permission:view_applications');
    Route::post('admission-applications', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'store'])->middleware('permission:create_applications');
    Route::get('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'show'])->middleware('permission:view_applications');
    Route::put('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'update'])->middleware('permission:update_applications');
    Route::delete('admission-applications/{admission_application}', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'destroy'])->middleware('permission:update_applications');
    
    // Nested ProgramChoice routes - both nested and shallow for RESTful best practices
    Route::apiResource('admission-applications.program-choices', \App\Http\Controllers\Api\V1\ProgramChoiceController::class)->scoped()->shallow();
    
    // Role and Permission management resources (admin-only)
    Route::middleware('role.admin')->group(function () {
        Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class);
        Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\V1\RoleController::class, 'syncPermissions']);
        Route::apiResource('permissions', \App\Http\Controllers\Api\V1\PermissionController::class)->only(['index', 'show']);
    });
    
    // Student-centric resources (protected by student role middleware)
    Route::middleware('role.student')->group(function () {
        Route::get('students/me', [\App\Http\Controllers\Api\V1\StudentController::class, 'me']);
        Route::get('students/me/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'myRecords']);
    });

    // Student management with permission-based authorization
    Route::get('students', [\App\Http\Controllers\Api\V1\StudentController::class, 'index'])->middleware('permission:view_students');
    Route::post('students', [\App\Http\Controllers\Api\V1\StudentController::class, 'store'])->middleware('permission:create_students');
    Route::get('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'show'])->middleware('permission:view_students');
    Route::put('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'update'])->middleware('permission:update_students');
    Route::delete('students/{student}', [\App\Http\Controllers\Api\V1\StudentController::class, 'destroy'])->middleware('permission:delete_students');
    Route::post('students/{student}/restore', [\App\Http\Controllers\Api\V1\StudentController::class, 'restore'])->withTrashed()->middleware('permission:update_students');
    Route::delete('students/{student}/force', [\App\Http\Controllers\Api\V1\StudentController::class, 'forceDelete'])->withTrashed()->middleware('permission:delete_students');

    // Academic records with permission-based authorization
    Route::get('students/{student}/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'index'])->middleware('permission:view_academic_records');
    Route::post('students/{student}/academic-records', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'store'])->middleware('permission:update_grades');
    Route::get('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'show'])->middleware('permission:view_academic_records');
    Route::put('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'update'])->middleware('permission:update_grades');
    Route::delete('academic-records/{academic_record}', [\App\Http\Controllers\Api\V1\AcademicRecordController::class, 'destroy'])->middleware('permission:update_grades');
    Route::apiResource('students.documents', \App\Http\Controllers\Api\V1\DocumentController::class)->scoped()->shallow();
    Route::get('students/{student}/documents/all-versions', [\App\Http\Controllers\Api\V1\DocumentController::class, 'allVersions']);
    
    // Document restore routes
    Route::post('documents/{document}/restore', [\App\Http\Controllers\Api\V1\DocumentController::class, 'restore'])->withTrashed();
    Route::delete('documents/{document}/force', [\App\Http\Controllers\Api\V1\DocumentController::class, 'forceDelete'])->withTrashed();

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
    
    // Import routes (requires specific permissions)
    Route::post('imports/courses', [CourseImportController::class, 'store']);
    Route::post('course-sections/{courseSection}/import-grades', [GradeImportController::class, 'store']);

    // God Mode routes (admin only)
    Route::prefix('god-mode')->group(function () {
        Route::get('/users', [ImpersonationController::class, 'index']);
        Route::post('/impersonate/{user}', [ImpersonationController::class, 'impersonate']);
        Route::get('/statistics', [ImpersonationController::class, 'statistics']);
    });
}); 

// Prometheus metrics endpoint (unauthenticated for monitoring systems)
Route::get('/metrics', [\App\Http\Controllers\Api\V1\MetricsController::class, 'index'])
    ->middleware('throttle:60,1'); // Allow 60 requests per minute for metrics scraping

// TEMPORARY: Demo enrollment endpoints for frontend testing (REMOVE BEFORE PRODUCTION!)
Route::prefix('demo')->middleware('throttle:60,1')->group(function () {
    Route::post('/enrollments', function(Request $request) {
        // Simulate enrollment success/failure based on section capacity
        $studentId = $request->input('student_id', 1);
        $sectionId = $request->input('course_section_id');
        
        // Get current enrollment count for the section
        $currentEnrollments = DB::table('enrollments')
            ->where('course_section_id', $sectionId)
            ->where('status', 'enrolled')
            ->count();
            
        // Get section capacity
        $section = DB::table('course_sections')->find($sectionId);
        if (!$section) {
            return response()->json(['message' => 'Course section not found'], 404);
        }
        
        // Check if student is already enrolled
        $existingEnrollment = DB::table('enrollments')
            ->where('student_id', $studentId)
            ->where('course_section_id', $sectionId)
            ->whereNull('deleted_at')
            ->first();
            
        if ($existingEnrollment) {
            return response()->json(['message' => 'Student is already enrolled in this section'], 422);
        }
        
        $status = $currentEnrollments >= $section->capacity ? 'waitlisted' : 'enrolled';
        
        // Create enrollment record
        $enrollmentId = DB::table('enrollments')->insertGetId([
            'student_id' => $studentId,
            'course_section_id' => $sectionId,
            'enrollment_date' => now()->toDateString(),
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $message = $status === 'waitlisted' 
            ? 'Student has been added to the waitlist for this course section.'
            : 'Student has been successfully enrolled in the course section.';
            
        return response()->json([
            'message' => $message,
            'data' => [
                'id' => $enrollmentId,
                'student_id' => $studentId,
                'course_section_id' => $sectionId,
                'status' => $status,
                'enrollment_date' => now()->toDateString()
            ]
        ], 201);
    });
    
    Route::post('/enrollments/{enrollmentId}/withdraw', function($enrollmentId) {
        $enrollment = DB::table('enrollments')->find($enrollmentId);
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }
        
        if ($enrollment->status === 'withdrawn') {
            return response()->json(['message' => 'Enrollment is already withdrawn'], 422);
        }
        
        DB::table('enrollments')
            ->where('id', $enrollmentId)
            ->update([
                'status' => 'withdrawn',
                'updated_at' => now()
            ]);
            
        return response()->json(['message' => 'Student has been withdrawn from the course section.']);
    });
    
    Route::get('/students/{studentId}/enrollments', function($studentId) {
        $enrollments = DB::table('enrollments')
            ->where('student_id', $studentId)
            ->whereNull('deleted_at')
            ->pluck('course_section_id')
            ->toArray();
            
        return response()->json([
            'enrollments' => $enrollments,
            'stats' => ['total_enrollments' => count($enrollments)]
        ]);
    });
    
    // Pipeline analytics endpoint
    Route::get('/pipeline/analytics', function() {
        // Get application statistics
        $totalApplications = DB::table('admission_applications')->count();
        $acceptedApplications = DB::table('admission_applications')->where('status', 'accepted')->count();
        
        // Get enrollment statistics 
        $totalEnrollments = DB::table('enrollments')->where('status', 'enrolled')->count();
        $uniqueEnrolledStudents = DB::table('enrollments')
            ->where('status', 'enrolled')
            ->distinct('student_id')
            ->count();
            
        // Get student and course statistics
        $totalStudents = DB::table('students')->count();
        $totalCourseSections = DB::table('course_sections')->count();
        
        // Calculate conversion rates
        $applicationToAcceptanceRate = $totalApplications > 0 ? ($acceptedApplications / $totalApplications) * 100 : 0;
        $acceptanceToEnrollmentRate = $acceptedApplications > 0 ? ($uniqueEnrolledStudents / $acceptedApplications) * 100 : 0;
        $overallSuccessRate = $totalApplications > 0 ? ($uniqueEnrolledStudents / $totalApplications) * 100 : 0;
        
        // Get recent pipeline activity (students with applications and enrollments)
        $pipelineActivity = DB::table('students')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->leftJoin('admission_applications', 'admission_applications.student_id', '=', 'students.id')
            ->leftJoin('enrollments', 'enrollments.student_id', '=', 'students.id')
            ->select([
                'students.id',
                'users.name',
                'users.email',
                'admission_applications.status as application_status',
                'admission_applications.application_date',
                DB::raw('COUNT(CASE WHEN enrollments.status = "enrolled" THEN 1 END) as current_enrollments')
            ])
            ->whereNotNull('admission_applications.id')
            ->groupBy('students.id', 'users.name', 'users.email', 'admission_applications.status', 'admission_applications.application_date')
            ->orderBy('admission_applications.application_date', 'desc')
            ->limit(10)
            ->get();
            
        return response()->json([
            'stats' => [
                'total_applications' => $totalApplications,
                'accepted_applications' => $acceptedApplications,
                'enrolled_students' => $uniqueEnrolledStudents,
                'total_enrollments' => $totalEnrollments,
                'total_students' => $totalStudents,
                'course_sections' => $totalCourseSections
            ],
            'conversion_rates' => [
                'application_to_acceptance' => round($applicationToAcceptanceRate, 2),
                'acceptance_to_enrollment' => round($acceptanceToEnrollmentRate, 2),
                'overall_success_rate' => round($overallSuccessRate, 2)
            ],
            'recent_activity' => $pipelineActivity
        ]);
    });
});

// TEMPORARY: Data viewer for development (REMOVE BEFORE PRODUCTION!)
Route::prefix('data-viewer')->middleware('throttle:60,1')->group(function () {
    Route::get('/{table}', function ($table, Request $request) {
        $allowedTables = [
            'students', 'users', 'courses', 'course_sections', 'enrollments',
            'departments', 'faculties', 'programs', 'staff', 'terms',
            'buildings', 'rooms', 'admission_applications', 'program_choices',
            'academic_records', 'documents', 'roles', 'permissions'
        ];
        
        if (!in_array($table, $allowedTables)) {
            return response()->json(['error' => 'Table not allowed'], 400);
        }
        
        $limit = min($request->get('limit', 25), 100);
        
        try {
            $data = DB::table($table)->limit($limit)->get();
            
            $stats = [
                'total_records' => DB::table($table)->count(),
                'showing_records' => count($data),
            ];
            
            // Add table-specific stats
            switch ($table) {
                case 'students':
                    $stats['with_enrollments'] = DB::table('students')
                        ->join('enrollments', 'students.id', '=', 'enrollments.student_id')
                        ->distinct('students.id')
                        ->count();
                    break;
                case 'enrollments':
                    $stats['enrolled'] = DB::table($table)->where('status', 'enrolled')->count();
                    $stats['waitlisted'] = DB::table($table)->where('status', 'waitlisted')->count();
                    break;
                case 'courses':
                    $stats['with_sections'] = DB::table('courses')
                        ->join('course_sections', 'courses.id', '=', 'course_sections.course_id')
                        ->distinct('courses.id')
                        ->count();
                    break;
            }
            
            return response()->json([
                'data' => $data,
                'stats' => $stats,
                'table' => $table
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    });
}); 