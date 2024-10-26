<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\AdmissionApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdmissionApplicationController extends Controller
{
    public function store(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
            'status' => 'required|string|in:draft,submitted,under_review,accepted,rejected'
        ]);

        $application = $student->admissionApplications()->create([
            ...$validated,
            'application_date' => now()
        ]);

        return response()->json($application, 201);
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
