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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Application routes
    Route::post('/applications/draft', [AdmissionApplicationController::class, 'createDraft']);
    Route::apiResource('students.applications', AdmissionApplicationController::class);
    Route::apiResource('applications.program-choices', ProgramChoiceController::class);

    // Other resources
    Route::apiResource('students', StudentController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('students.academic-records', AcademicRecordController::class);
    Route::apiResource('students.documents', DocumentController::class);
});

require __DIR__.'/auth.php';
