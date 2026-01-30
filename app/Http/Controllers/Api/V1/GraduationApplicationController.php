<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GraduationApplication;
use App\Models\Student;
use App\Services\GraduationClearanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GraduationApplicationController extends Controller
{
    public function __construct(
        private GraduationClearanceService $clearanceService,
    ) {}

    /**
     * List graduation applications (admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = GraduationApplication::with(['student.user', 'program', 'term', 'reviewer'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $applications = $query->paginate($request->input('per_page', 25));

        // Append clearance summary to each application
        $applications->getCollection()->transform(function ($app) {
            $app->clearance_summary = $app->getClearanceSummary();

            return $app;
        });

        return response()->json($applications);
    }

    /**
     * Student views their own graduation applications.
     */
    public function myApplications(Request $request): JsonResponse
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $applications = GraduationApplication::with(['program', 'term', 'reviewer'])
            ->where('student_id', $student->id)
            ->latest()
            ->get()
            ->map(function ($app) {
                $app->clearance_summary = $app->getClearanceSummary();

                return $app;
            });

        return response()->json(['data' => $applications]);
    }

    /**
     * Student creates a graduation application and initiates clearance.
     */
    public function store(Request $request): JsonResponse
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

        // Initiate multi-step clearance
        $application = $this->clearanceService->initiateClearance($application);
        $application->load(['program', 'term']);
        $application->clearance_summary = $application->getClearanceSummary();

        return response()->json([
            'message' => 'Graduation application submitted. Clearance review has been initiated.',
            'data' => $application,
        ], 201);
    }

    /**
     * Show a specific graduation application with clearance detail.
     */
    public function show(GraduationApplication $graduationApplication): JsonResponse
    {
        $graduationApplication->load(['student.user', 'program', 'term', 'reviewer']);
        $graduationApplication->clearance_summary = $graduationApplication->getClearanceSummary();

        return response()->json(['data' => $graduationApplication]);
    }

    /**
     * Get detailed clearance status for an application.
     */
    public function clearanceStatus(GraduationApplication $graduationApplication): JsonResponse
    {
        return response()->json([
            'data' => [
                'application_id' => $graduationApplication->id,
                'status' => $graduationApplication->status,
                'clearance_status' => $graduationApplication->clearance_status,
                'clearance_summary' => $graduationApplication->getClearanceSummary(),
                'is_fully_cleared' => $graduationApplication->isFullyCleared(),
                'degree_audit_snapshot' => $graduationApplication->degree_audit_snapshot,
            ],
        ]);
    }

    /**
     * Clear a specific department (admin).
     */
    public function clearDepartment(Request $request, GraduationApplication $graduationApplication, string $department): JsonResponse
    {
        if (! in_array($graduationApplication->status, ['clearance_in_progress', 'cleared'])) {
            return response()->json(['message' => 'Application is not in clearance stage.'], 422);
        }

        $application = $this->clearanceService->clearDepartment(
            $graduationApplication,
            $department,
            Auth::id(),
            $request->input('notes'),
        );

        $application->clearance_summary = $application->getClearanceSummary();

        return response()->json([
            'message' => "Department '{$department}' has been cleared.",
            'data' => $application,
        ]);
    }

    /**
     * Block a specific department (admin).
     */
    public function blockDepartment(Request $request, GraduationApplication $graduationApplication, string $department): JsonResponse
    {
        if (! in_array($graduationApplication->status, ['clearance_in_progress', 'cleared'])) {
            return response()->json(['message' => 'Application is not in clearance stage.'], 422);
        }

        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $application = $this->clearanceService->blockDepartment(
            $graduationApplication,
            $department,
            Auth::id(),
            $request->input('notes'),
        );

        $application->clearance_summary = $application->getClearanceSummary();

        return response()->json([
            'message' => "Department '{$department}' has a hold.",
            'data' => $application,
        ]);
    }

    /**
     * Final approval after all departments cleared (admin/registrar).
     */
    public function finalApprove(Request $request, GraduationApplication $graduationApplication): JsonResponse
    {
        if ($graduationApplication->status !== 'cleared') {
            return response()->json([
                'message' => 'Application must be fully cleared before final approval.',
            ], 422);
        }

        $application = $this->clearanceService->finalApprove($graduationApplication, Auth::id());
        $application->load(['student.user', 'program', 'term', 'reviewer']);

        return response()->json([
            'message' => 'Graduation application has been approved.',
            'data' => $application,
        ]);
    }

    /**
     * Approve a graduation application directly (legacy, kept for backward compat).
     */
    public function approve(Request $request, GraduationApplication $graduationApplication): JsonResponse
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
    public function deny(Request $request, GraduationApplication $graduationApplication): JsonResponse
    {
        $allowedStatuses = ['pending', 'under_review', 'clearance_in_progress', 'cleared'];
        if (! in_array($graduationApplication->status, $allowedStatuses)) {
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
