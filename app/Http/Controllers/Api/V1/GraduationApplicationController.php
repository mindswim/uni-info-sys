<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GraduationApplication;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GraduationApplicationController extends Controller
{
    /**
     * List graduation applications (admin).
     */
    public function index(Request $request)
    {
        $query = GraduationApplication::with(['student.user', 'program', 'term', 'reviewer'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->paginate($request->input('per_page', 25)));
    }

    /**
     * Student views their own graduation applications.
     */
    public function myApplications(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $applications = GraduationApplication::with(['program', 'term', 'reviewer'])
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Student creates a graduation application.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'term_id' => 'required|exists:terms,id',
            'ceremony_date' => 'nullable|date',
            'special_requests' => 'nullable|string|max:1000',
        ]);

        $student = Student::where('user_id', Auth::id())->firstOrFail();

        // Check for duplicate application
        $existing = GraduationApplication::where('student_id', $student->id)
            ->where('program_id', $validated['program_id'])
            ->where('term_id', $validated['term_id'])
            ->whereNotIn('status', ['denied'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already have an active graduation application for this program and term.',
            ], 422);
        }

        $application = GraduationApplication::create([
            'student_id' => $student->id,
            'program_id' => $validated['program_id'],
            'term_id' => $validated['term_id'],
            'application_date' => now()->toDateString(),
            'ceremony_date' => $validated['ceremony_date'] ?? null,
            'special_requests' => $validated['special_requests'] ?? null,
            'status' => 'pending',
        ]);

        $application->load(['program', 'term']);

        return response()->json([
            'message' => 'Graduation application submitted successfully.',
            'data' => $application,
        ], 201);
    }

    /**
     * Show a specific graduation application.
     */
    public function show(GraduationApplication $graduationApplication)
    {
        $graduationApplication->load(['student.user', 'program', 'term', 'reviewer']);
        return response()->json(['data' => $graduationApplication]);
    }

    /**
     * Approve a graduation application (admin).
     */
    public function approve(Request $request, GraduationApplication $graduationApplication)
    {
        if ($graduationApplication->status !== 'pending' && $graduationApplication->status !== 'under_review') {
            return response()->json(['message' => 'Application cannot be approved in its current state.'], 422);
        }

        $graduationApplication->update([
            'status' => 'approved',
            'reviewer_notes' => $request->input('reviewer_notes'),
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        $graduationApplication->load(['student.user', 'program', 'term', 'reviewer']);

        return response()->json([
            'message' => 'Graduation application approved.',
            'data' => $graduationApplication,
        ]);
    }

    /**
     * Deny a graduation application (admin).
     */
    public function deny(Request $request, GraduationApplication $graduationApplication)
    {
        if ($graduationApplication->status !== 'pending' && $graduationApplication->status !== 'under_review') {
            return response()->json(['message' => 'Application cannot be denied in its current state.'], 422);
        }

        $request->validate([
            'reviewer_notes' => 'required|string|max:1000',
        ]);

        $graduationApplication->update([
            'status' => 'denied',
            'reviewer_notes' => $request->input('reviewer_notes'),
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        $graduationApplication->load(['student.user', 'program', 'term', 'reviewer']);

        return response()->json([
            'message' => 'Graduation application denied.',
            'data' => $graduationApplication,
        ]);
    }
}
