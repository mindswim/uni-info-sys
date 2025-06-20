<?php

use App\Http\Controllers\StudentController;
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
Route::post('/v1/tokens/create', [\App\Http\Controllers\Api\V1\AuthController::class, 'login'])
    ->middleware('throttle:api');

// Password reset routes (unauthenticated)
Route::post('/v1/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])
    ->middleware('throttle:api')
    ->name('api.password.email');
Route::post('/v1/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware('throttle:api')
    ->name('api.password.update');

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::apiResource('faculties', FacultyController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('staff', StaffController::class);
    Route::apiResource('terms', TermController::class);
    Route::apiResource('buildings', BuildingController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('course-sections', CourseSectionController::class);
    Route::apiResource('admission-applications', \App\Http\Controllers\Api\V1\AdmissionApplicationController::class);
    
    // Nested ProgramChoice routes - both nested and shallow for RESTful best practices
    Route::apiResource('admission-applications.program-choices', \App\Http\Controllers\Api\V1\ProgramChoiceController::class)->scoped()->shallow();
    
    // Role and Permission management resources - full CRUD for roles, read-only for permissions
    Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class);
    Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\V1\RoleController::class, 'syncPermissions']);
    Route::apiResource('permissions', \App\Http\Controllers\Api\V1\PermissionController::class)->only(['index', 'show']);
    
    // Student-centric resources
    Route::apiResource('students', \App\Http\Controllers\Api\V1\StudentController::class);
    Route::post('students/{student}/restore', [\App\Http\Controllers\Api\V1\StudentController::class, 'restore'])->withTrashed();
    Route::delete('students/{student}/force', [\App\Http\Controllers\Api\V1\StudentController::class, 'forceDelete'])->withTrashed();
    
    Route::apiResource('students.academic-records', \App\Http\Controllers\Api\V1\AcademicRecordController::class)->scoped()->shallow();
    Route::apiResource('students.documents', \App\Http\Controllers\Api\V1\DocumentController::class)->scoped()->shallow();
    Route::get('students/{student}/documents/all-versions', [\App\Http\Controllers\Api\V1\DocumentController::class, 'allVersions']);
    
    // Document restore routes
    Route::post('documents/{document}/restore', [\App\Http\Controllers\Api\V1\DocumentController::class, 'restore'])->withTrashed();
    Route::delete('documents/{document}/force', [\App\Http\Controllers\Api\V1\DocumentController::class, 'forceDelete'])->withTrashed();
    
    // Enrollment API routes
    Route::apiResource('enrollments', \App\Http\Controllers\Api\V1\EnrollmentController::class);
    Route::post('enrollments/{enrollment}/restore', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'restore'])->withTrashed();
    Route::delete('enrollments/{enrollment}/force', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'forceDelete'])->withTrashed();
    
    // Course restore routes
    Route::post('courses/{course}/restore', [\App\Http\Controllers\Api\V1\CourseController::class, 'restore'])->withTrashed();
    Route::delete('courses/{course}/force', [\App\Http\Controllers\Api\V1\CourseController::class, 'forceDelete'])->withTrashed();
    
    // Admission application restore routes
    Route::post('admission-applications/{admission_application}/restore', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'restore'])->withTrashed();
    Route::delete('admission-applications/{admission_application}/force', [\App\Http\Controllers\Api\V1\AdmissionApplicationController::class, 'forceDelete'])->withTrashed();
    
    // Enrollment management with custom business logic endpoints
    Route::post('enrollments/{enrollment}/withdraw', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'withdraw']);
    Route::post('enrollments/{enrollment}/complete', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'complete']);
    Route::get('students/{student}/enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'byStudent']);
    Route::get('course-sections/{courseSection}/enrollments', [\App\Http\Controllers\Api\V1\EnrollmentController::class, 'byCourseSection']);
    
    // Enrollment swap endpoint
    Route::post('enrollments/swap', [\App\Http\Controllers\Api\V1\EnrollmentSwapController::class, 'store']);
    
    // Notification routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    
    // Import routes (requires specific permissions)
    Route::post('imports/courses', [CourseImportController::class, 'store']);
    Route::post('course-sections/{courseSection}/import-grades', [GradeImportController::class, 'store']);
}); 

// Prometheus metrics endpoint (unauthenticated for monitoring systems)
Route::get('/metrics', [\App\Http\Controllers\MetricsController::class, 'index'])
    ->middleware('throttle:60,1'); // Allow 60 requests per minute for metrics scraping 