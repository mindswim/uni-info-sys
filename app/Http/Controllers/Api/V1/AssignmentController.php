<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * Display a listing of assignments with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Assignment::with(['courseSection.course', 'courseSection.term']);

        // Filter by course section
        if ($request->has('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by published status
        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        // Filter by term
        if ($request->has('term_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('term_id', $request->term_id);
            });
        }

        // Filter due soon
        if ($request->has('due_within_days')) {
            $query->dueSoon((int) $request->due_within_days);
        }

        // Filter past due
        if ($request->boolean('past_due')) {
            $query->pastDue();
        }

        // Order
        $query->orderByDueDate();

        $assignments = $query->paginate($request->get('per_page', 50));

        return response()->json($assignments);
    }

    /**
     * Store a newly created assignment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_section_id' => 'required|integer|exists:course_sections,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:' . implode(',', Assignment::TYPES),
            'due_date' => 'required|date|after:now',
            'available_from' => 'nullable|date|before:due_date',
            'max_points' => 'sometimes|numeric|min:0|max:99999',
            'weight' => 'nullable|numeric|min:0|max:100',
            'passing_score' => 'nullable|numeric|min:0',
            'allows_late' => 'sometimes|boolean',
            'late_penalty_per_day' => 'sometimes|numeric|min:0|max:100',
            'max_late_days' => 'nullable|integer|min:0',
            'instructions_file' => 'nullable|string|max:500',
            'is_published' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $assignment = Assignment::create($validated);

        return response()->json([
            'message' => 'Assignment created successfully.',
            'data' => $assignment->fresh(['courseSection.course']),
        ], 201);
    }

    /**
     * Display the specified assignment
     */
    public function show(Assignment $assignment): JsonResponse
    {
        $assignment->load([
            'courseSection.course',
            'courseSection.instructor.user',
            'courseSection.term',
        ]);

        // Add computed attributes
        $data = $assignment->toArray();

        // Submission counts (may not be available until Phase 1.3)
        try {
            $data['submission_count'] = $assignment->submission_count;
            $data['graded_count'] = $assignment->graded_count;
        } catch (\Exception $e) {
            $data['submission_count'] = 0;
            $data['graded_count'] = 0;
        }

        $data['is_available'] = $assignment->isAvailable();
        $data['is_past_due'] = $assignment->isPastDue();
        $data['time_remaining'] = $assignment->time_remaining;

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update the specified assignment
     */
    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|string|in:' . implode(',', Assignment::TYPES),
            'due_date' => 'sometimes|date',
            'available_from' => 'nullable|date',
            'max_points' => 'sometimes|numeric|min:0|max:99999',
            'weight' => 'nullable|numeric|min:0|max:100',
            'passing_score' => 'nullable|numeric|min:0',
            'allows_late' => 'sometimes|boolean',
            'late_penalty_per_day' => 'sometimes|numeric|min:0|max:100',
            'max_late_days' => 'nullable|integer|min:0',
            'instructions_file' => 'nullable|string|max:500',
            'is_published' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $assignment->update($validated);

        return response()->json([
            'message' => 'Assignment updated successfully.',
            'data' => $assignment->fresh(['courseSection.course']),
        ]);
    }

    /**
     * Remove the specified assignment
     */
    public function destroy(Assignment $assignment): JsonResponse
    {
        // Check if there are submissions (if submissions table exists)
        try {
            $submissionCount = $assignment->submissions()->count();

            if ($submissionCount > 0) {
                return response()->json([
                    'message' => "Cannot delete assignment with {$submissionCount} existing submissions. Archive instead.",
                ], 422);
            }
        } catch (\Exception $e) {
            // Submissions table may not exist yet (Phase 1.3)
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Assignment deleted successfully.',
        ]);
    }

    /**
     * Get assignments for a specific course section
     */
    public function byCourseSection(Request $request, CourseSection $courseSection): JsonResponse
    {
        $query = $courseSection->assignments();

        // For students, only show published and available
        if ($request->boolean('student_view')) {
            $query->available();
        }

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $assignments = $query->ordered()->get();

        return response()->json([
            'data' => $assignments,
        ]);
    }

    /**
     * Get all assignments for a student across their enrollments
     */
    public function forStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'term_id' => 'sometimes|integer|exists:terms,id',
        ]);

        $studentId = $validated['student_id'];

        // Get student's enrolled course sections
        $query = Enrollment::where('student_id', $studentId)
            ->whereIn('status', ['enrolled'])
            ->with(['courseSection.assignments' => function ($q) {
                $q->available()->orderByDueDate();
            }, 'courseSection.course']);

        if (isset($validated['term_id'])) {
            $query->whereHas('courseSection', function ($q) use ($validated) {
                $q->where('term_id', $validated['term_id']);
            });
        }

        $enrollments = $query->get();

        // Flatten assignments with course info
        $assignments = $enrollments->flatMap(function ($enrollment) {
            return $enrollment->courseSection->assignments->map(function ($assignment) use ($enrollment) {
                $data = $assignment->toArray();
                $data['course_code'] = $enrollment->courseSection->course->course_code;
                $data['course_title'] = $enrollment->courseSection->course->title;
                $data['enrollment_id'] = $enrollment->id;
                $data['is_past_due'] = $assignment->isPastDue();
                $data['time_remaining'] = $assignment->time_remaining;
                return $data;
            });
        })->sortBy('due_date')->values();

        return response()->json([
            'data' => $assignments,
        ]);
    }

    /**
     * Get current student's assignments
     */
    public function myAssignments(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Reuse the forStudent logic
        $request->merge(['student_id' => $student->id]);
        return $this->forStudent($request);
    }

    /**
     * Get assignments due soon for a student
     */
    public function myUpcoming(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $days = $request->get('days', 7);

        $enrollments = Enrollment::where('student_id', $student->id)
            ->whereIn('status', ['enrolled'])
            ->with(['courseSection.assignments' => function ($q) use ($days) {
                $q->available()->dueSoon($days)->orderByDueDate();
            }, 'courseSection.course'])
            ->get();

        $assignments = $enrollments->flatMap(function ($enrollment) {
            return $enrollment->courseSection->assignments->map(function ($assignment) use ($enrollment) {
                $data = $assignment->toArray();
                $data['course_code'] = $enrollment->courseSection->course->course_code;
                $data['course_title'] = $enrollment->courseSection->course->title;
                $data['enrollment_id'] = $enrollment->id;
                $data['time_remaining'] = $assignment->time_remaining;
                return $data;
            });
        })->sortBy('due_date')->values();

        return response()->json([
            'data' => $assignments,
            'meta' => [
                'days_ahead' => $days,
                'count' => $assignments->count(),
            ],
        ]);
    }

    /**
     * Publish an assignment
     */
    public function publish(Assignment $assignment): JsonResponse
    {
        $assignment->update(['is_published' => true]);

        return response()->json([
            'message' => 'Assignment published successfully.',
            'data' => $assignment->fresh(),
        ]);
    }

    /**
     * Unpublish an assignment
     */
    public function unpublish(Assignment $assignment): JsonResponse
    {
        $assignment->update(['is_published' => false]);

        return response()->json([
            'message' => 'Assignment unpublished successfully.',
            'data' => $assignment->fresh(),
        ]);
    }

    /**
     * Duplicate an assignment
     */
    public function duplicate(Request $request, Assignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'course_section_id' => 'sometimes|integer|exists:course_sections,id',
            'due_date' => 'sometimes|date',
            'available_from' => 'nullable|date',
        ]);

        $newAssignment = $assignment->replicate();
        $newAssignment->title = $assignment->title . ' (Copy)';
        $newAssignment->is_published = false;

        if (isset($validated['course_section_id'])) {
            $newAssignment->course_section_id = $validated['course_section_id'];
        }
        if (isset($validated['due_date'])) {
            $newAssignment->due_date = $validated['due_date'];
        }
        if (array_key_exists('available_from', $validated)) {
            $newAssignment->available_from = $validated['available_from'];
        }

        $newAssignment->save();

        return response()->json([
            'message' => 'Assignment duplicated successfully.',
            'data' => $newAssignment->fresh(['courseSection.course']),
        ], 201);
    }

    /**
     * Get assignment types
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'data' => Assignment::TYPES,
        ]);
    }

    /**
     * Get grading progress for an assignment
     */
    public function gradingProgress(Assignment $assignment): JsonResponse
    {
        $totalSubmissions = 0;
        $gradedSubmissions = 0;

        // Try to get submission counts (table may not exist yet in Phase 1.3)
        try {
            $totalSubmissions = $assignment->submissions()->count();
            $gradedSubmissions = $assignment->submissions()->where('status', 'graded')->count();
        } catch (\Exception $e) {
            // Submissions table may not exist yet
        }

        $pendingSubmissions = $totalSubmissions - $gradedSubmissions;

        // Get enrolled students count for this section
        $enrolledCount = Enrollment::where('course_section_id', $assignment->course_section_id)
            ->where('status', 'enrolled')
            ->count();

        $notSubmitted = $enrolledCount - $totalSubmissions;

        return response()->json([
            'data' => [
                'enrolled_students' => $enrolledCount,
                'total_submissions' => $totalSubmissions,
                'graded' => $gradedSubmissions,
                'pending_grading' => $pendingSubmissions,
                'not_submitted' => max(0, $notSubmitted),
                'submission_rate' => $enrolledCount > 0
                    ? round(($totalSubmissions / $enrolledCount) * 100, 2)
                    : 0,
                'grading_progress' => $totalSubmissions > 0
                    ? round(($gradedSubmissions / $totalSubmissions) * 100, 2)
                    : 0,
            ],
        ]);
    }
}
