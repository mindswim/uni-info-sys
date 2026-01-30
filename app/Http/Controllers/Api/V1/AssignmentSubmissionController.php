<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use App\Services\AssignmentSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentSubmissionController extends Controller
{
    public function __construct(
        protected AssignmentSubmissionService $submissionService
    ) {}

    /**
     * List submissions with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = AssignmentSubmission::with([
            'assignment.courseSection.course',
            'enrollment.student.user',
            'grader.user',
        ]);

        // Filter by assignment
        if ($request->has('assignment_id')) {
            $query->where('assignment_id', $request->assignment_id);
        }

        // Filter by enrollment
        if ($request->has('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        // Filter pending grading
        if ($request->boolean('pending_grading')) {
            $query->pendingGrading();
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->forStudent((int) $request->student_id);
        }

        // Filter late submissions
        if ($request->boolean('late_only')) {
            $query->late();
        }

        // Order by submission date
        $query->orderByDesc('submitted_at');

        $submissions = $query->paginate($request->get('per_page', 50));

        return response()->json($submissions);
    }

    /**
     * Get a specific submission
     */
    public function show(AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $assignmentSubmission->load([
            'assignment.courseSection.course',
            'enrollment.student.user',
            'grader.user',
        ]);

        $data = $assignmentSubmission->toArray();
        $data['percentage'] = $assignmentSubmission->percentage;
        $data['letter_grade'] = $assignmentSubmission->letter_grade;
        $data['is_passing'] = $assignmentSubmission->isPassing();

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Submit an assignment
     */
    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assignment_id' => 'required|integer|exists:assignments,id',
            'enrollment_id' => 'required|integer|exists:enrollments,id',
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
        ]);

        $assignment = Assignment::findOrFail($validated['assignment_id']);
        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);

        try {
            $submission = $this->submissionService->submit(
                $assignment,
                $enrollment,
                $validated
            );

            return response()->json([
                'message' => 'Assignment submitted successfully.',
                'data' => $submission->load(['assignment', 'enrollment.student.user']),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Save a draft submission
     */
    public function saveDraft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assignment_id' => 'required|integer|exists:assignments,id',
            'enrollment_id' => 'required|integer|exists:enrollments,id',
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
        ]);

        $assignment = Assignment::findOrFail($validated['assignment_id']);
        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);

        $submission = $this->submissionService->saveDraft(
            $assignment,
            $enrollment,
            $validated
        );

        return response()->json([
            'message' => 'Draft saved successfully.',
            'data' => $submission->load(['assignment', 'enrollment.student.user']),
        ]);
    }

    /**
     * Grade a submission
     */
    public function grade(Request $request, AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
            'grader_id' => 'required|integer|exists:staff,id',
        ]);

        $grader = Staff::findOrFail($validated['grader_id']);

        try {
            $submission = $this->submissionService->grade(
                $assignmentSubmission,
                $validated['score'],
                $grader,
                $validated['feedback'] ?? null
            );

            return response()->json([
                'message' => 'Submission graded successfully.',
                'data' => $submission->load(['assignment', 'enrollment.student.user', 'grader.user']),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Batch grade multiple submissions
     */
    public function batchGrade(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grader_id' => 'required|integer|exists:staff,id',
            'grades' => 'required|array|min:1',
            'grades.*.submission_id' => 'required|integer|exists:assignment_submissions,id',
            'grades.*.score' => 'required|numeric|min:0',
            'grades.*.feedback' => 'nullable|string',
        ]);

        $grader = Staff::findOrFail($validated['grader_id']);

        $results = $this->submissionService->batchGrade(
            $validated['grades'],
            $grader
        );

        $successCount = collect($results)->where('success', true)->count();
        $failCount = collect($results)->where('success', false)->count();

        return response()->json([
            'message' => "Graded {$successCount} submissions. {$failCount} failed.",
            'data' => $results,
        ]);
    }

    /**
     * Return a submission for revision
     */
    public function returnForRevision(Request $request, AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $validated = $request->validate([
            'feedback' => 'required|string',
        ]);

        try {
            $submission = $this->submissionService->returnForRevision(
                $assignmentSubmission,
                $validated['feedback']
            );

            return response()->json([
                'message' => 'Submission returned for revision.',
                'data' => $submission->load(['assignment', 'enrollment.student.user']),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Resubmit a returned submission
     */
    public function resubmit(Request $request, AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
        ]);

        try {
            $submission = $this->submissionService->resubmit(
                $assignmentSubmission,
                $validated
            );

            return response()->json([
                'message' => 'Assignment resubmitted successfully.',
                'data' => $submission->load(['assignment', 'enrollment.student.user']),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get submissions for an assignment
     */
    public function forAssignment(Request $request, Assignment $assignment): JsonResponse
    {
        $query = $assignment->submissions()
            ->with(['enrollment.student.user', 'grader.user']);

        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        if ($request->boolean('pending_grading')) {
            $query->pendingGrading();
        }

        $submissions = $query->orderByDesc('submitted_at')->get();

        return response()->json([
            'data' => $submissions,
        ]);
    }

    /**
     * Get statistics for an assignment
     */
    public function assignmentStats(Assignment $assignment): JsonResponse
    {
        $stats = $this->submissionService->getAssignmentStats($assignment);

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get current student's submissions
     */
    public function mySubmissions(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $query = AssignmentSubmission::with([
            'assignment.courseSection.course',
            'grader.user',
        ])->forStudent($student->id);

        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        if ($request->has('assignment_id')) {
            $query->forAssignment((int) $request->assignment_id);
        }

        $submissions = $query->orderByDesc('submitted_at')->get();

        // Add computed attributes
        $submissions->transform(function ($submission) {
            $data = $submission->toArray();
            $data['percentage'] = $submission->percentage;
            $data['letter_grade'] = $submission->letter_grade;
            $data['is_passing'] = $submission->isPassing();

            return $data;
        });

        return response()->json([
            'data' => $submissions,
        ]);
    }

    /**
     * Get student's submission for a specific assignment
     */
    public function mySubmissionForAssignment(Request $request, Assignment $assignment): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Find enrollment for this course section
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('course_section_id', $assignment->course_section_id)
            ->first();

        if (! $enrollment) {
            return response()->json([
                'message' => 'Student is not enrolled in this course section.',
            ], 404);
        }

        $submission = $this->submissionService->getStudentSubmission(
            $assignment,
            $enrollment,
            $request->has('attempt') ? (int) $request->attempt : null
        );

        if (! $submission) {
            return response()->json([
                'data' => null,
                'message' => 'No submission found.',
            ]);
        }

        $submission->load(['grader.user']);

        $data = $submission->toArray();
        $data['percentage'] = $submission->percentage;
        $data['letter_grade'] = $submission->letter_grade;
        $data['is_passing'] = $submission->isPassing();

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Get pending submissions for grading (for instructors)
     */
    public function pendingGrading(Request $request): JsonResponse
    {
        $query = AssignmentSubmission::with([
            'assignment.courseSection.course',
            'enrollment.student.user',
        ])->pendingGrading();

        // Filter by course section
        if ($request->has('course_section_id')) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->where('course_section_id', $request->course_section_id);
            });
        }

        // Filter by assignment
        if ($request->has('assignment_id')) {
            $query->forAssignment((int) $request->assignment_id);
        }

        $submissions = $query->orderBy('submitted_at')->get();

        return response()->json([
            'data' => $submissions,
            'meta' => [
                'count' => $submissions->count(),
            ],
        ]);
    }

    /**
     * Delete a submission (admin only)
     */
    public function destroy(AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        // Only allow deleting non-graded submissions
        if ($assignmentSubmission->isGraded()) {
            return response()->json([
                'message' => 'Cannot delete a graded submission.',
            ], 422);
        }

        $assignmentSubmission->delete();

        return response()->json([
            'message' => 'Submission deleted successfully.',
        ]);
    }
}
