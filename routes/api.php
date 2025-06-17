<?php

use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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

// Test endpoint for rate limiting
Route::get('/test-rate-limit', function () {
    return response()->json([
        'message' => 'Rate limit test endpoint',
        'timestamp' => now()
    ]);
})->middleware('throttle:api');

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
    
    // Enrollment API routes
    Route::apiResource('enrollments', EnrollmentController::class);
    
    // Additional custom routes for business logic
    Route::post('enrollments/{enrollment}/withdraw', [EnrollmentController::class, 'withdraw']);
    Route::post('enrollments/{enrollment}/complete', [EnrollmentController::class, 'complete']);
    Route::get('students/{student}/enrollments', [EnrollmentController::class, 'byStudent']);
    Route::get('course-sections/{courseSection}/enrollments', [EnrollmentController::class, 'byCourseSection']);
    
    // Notification routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
}); 