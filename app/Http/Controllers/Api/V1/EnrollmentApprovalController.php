<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentApproval;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;

class EnrollmentApprovalController extends Controller
{
    private EnrollmentService $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    public function index(Request $request)
    {
        $query = EnrollmentApproval::with(['student', 'advisor.user', 'courseSection.course']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        return response()->json(['data' => $query->orderBy('requested_at', 'desc')->paginate(20)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_section_id' => 'required|exists:course_sections,id',
        ]);

        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        if (!$student->requires_advisor_approval) {
            return response()->json(['message' => 'Advisor approval is not required for this student.'], 422);
        }

        if (!$student->advisor_id) {
            return response()->json(['message' => 'No advisor assigned. Contact your department.'], 422);
        }

        // Check for existing pending request
        $existing = EnrollmentApproval::where('student_id', $student->id)
            ->where('course_section_id', $request->course_section_id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A pending approval request already exists for this course.'], 422);
        }

        $approval = EnrollmentApproval::create([
            'student_id' => $student->id,
            'advisor_id' => $student->advisor_id,
            'course_section_id' => $request->course_section_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        return response()->json(['data' => $approval->load(['student', 'courseSection.course'])], 201);
    }

    public function approve(Request $request, EnrollmentApproval $enrollmentApproval)
    {
        if (!$enrollmentApproval->isPending()) {
            return response()->json(['message' => 'This request has already been processed.'], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $enrollmentApproval->update([
            'status' => 'approved',
            'notes' => $request->notes,
            'responded_at' => now(),
        ]);

        // Create the enrollment
        $enrollment = $this->enrollmentService->enrollStudent([
            'student_id' => $enrollmentApproval->student_id,
            'course_section_id' => $enrollmentApproval->course_section_id,
        ]);

        $enrollmentApproval->update(['enrollment_id' => $enrollment->id]);

        return response()->json([
            'data' => $enrollmentApproval->fresh()->load(['student', 'courseSection.course', 'enrollment']),
        ]);
    }

    public function deny(Request $request, EnrollmentApproval $enrollmentApproval)
    {
        if (!$enrollmentApproval->isPending()) {
            return response()->json(['message' => 'This request has already been processed.'], 422);
        }

        $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        $enrollmentApproval->update([
            'status' => 'denied',
            'notes' => $request->notes,
            'responded_at' => now(),
        ]);

        return response()->json(['data' => $enrollmentApproval->fresh()->load(['student', 'courseSection.course'])]);
    }

    public function pending(Request $request)
    {
        $staff = $request->user()->staff;

        if (!$staff) {
            return response()->json(['message' => 'No staff record found.'], 404);
        }

        $pending = EnrollmentApproval::where('advisor_id', $staff->id)
            ->pending()
            ->with(['student', 'courseSection.course', 'courseSection.term'])
            ->orderBy('requested_at', 'asc')
            ->get();

        return response()->json(['data' => $pending]);
    }
}
