<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\AcademicRecordController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AdmissionApplicationController;
use App\Http\Controllers\ProgramChoiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Students
    Route::apiResource('students', StudentController::class);

    // Programs
    Route::apiResource('programs', ProgramController::class);

    // Academic Records (nested under students)
    Route::apiResource('students.academic-records', AcademicRecordController::class);

    // Documents (nested under students)
    Route::apiResource('students.documents', DocumentController::class);

    // Admission Applications (nested under students)
    Route::apiResource('students.applications', AdmissionApplicationController::class);

    // Program Choices (nested under applications)
    Route::apiResource('applications.program-choices', ProgramChoiceController::class);
});

require __DIR__.'/auth.php';
