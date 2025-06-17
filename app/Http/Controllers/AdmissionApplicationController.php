<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\AdmissionApplication;
use App\Services\AdmissionService;
use App\Http\Resources\AdmissionApplicationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Term;

class AdmissionApplicationController extends Controller
{
    public function store(Request $request, Student $student, AdmissionService $admissionService): JsonResponse
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);

        $application = $admissionService->createDraftApplication($student, $validated);

        return response()->json($application, 201);
    }

    public function storeDraft(Request $request, AdmissionService $admissionService): JsonResponse
    {
        // Get the authenticated user's student record
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        // Validate required fields for draft application
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string|in:Fall,Spring,Summer',
        ]);

        // Find or create the term based on academic_year and semester
        $term = Term::firstOrCreate([
            'academic_year' => $validated['academic_year'],
            'semester' => $validated['semester'],
        ], [
            // Default values for new terms
            'name' => $validated['semester'] . ' ' . $validated['academic_year'],
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(120)->toDateString(),
        ]);

        // Create draft application with term_id instead of academic_year/semester
        $application = $admissionService->createDraftApplication($student, [
            'term_id' => $term->id,
        ]);

        // Load the term relationship for response
        $application->load('term');

        return response()->json([
            'data' => new AdmissionApplicationResource($application)
        ], 201);
    }

    public function index(Student $student)
    {
        return response()->json(
            $student->admissionApplications()
                ->with('programChoices.program')
                ->paginate(10)
        );
    }

    public function show(Student $student, AdmissionApplication $application): JsonResponse
    {
        if ($application->student_id !== $student->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($application->load('programChoices.program'));
    }

    public function update(Request $request, Student $student, AdmissionApplication $application): JsonResponse
    {
        if ($application->student_id !== $student->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:draft,submitted,under_review,accepted,rejected',
            'comments' => 'nullable|string'
        ]);

        $application->update($validated);

        return response()->json($application->fresh());
    }

    public function destroy(Student $student, AdmissionApplication $application): JsonResponse
    {
        if ($application->student_id !== $student->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $application->delete();
        return response()->json(null, 204);
    }
}
