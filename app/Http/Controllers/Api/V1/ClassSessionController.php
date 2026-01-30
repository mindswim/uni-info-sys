<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\CourseSection;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Services\ClassSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    public function __construct(
        private ClassSessionService $classSessionService
    ) {}

    /**
     * Display a listing of class sessions with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = ClassSession::with([
            'courseSection.course',
            'courseSection.instructor.user',
            'courseSection.room.building',
            'substituteInstructor.user',
        ]);

        // Filter by course section
        if ($request->has('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->forDate($request->date);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        } elseif ($request->has('start_date')) {
            $query->where('session_date', '>=', $request->start_date);
        } elseif ($request->has('end_date')) {
            $query->where('session_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        // Filter by term
        if ($request->has('term_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('term_id', $request->term_id);
            });
        }

        // Order
        $query->orderBy('session_date')->orderBy('start_time');

        $sessions = $query->paginate($request->get('per_page', 50));

        return response()->json($sessions);
    }

    /**
     * Store a newly created class session
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_section_id' => 'required|integer|exists:course_sections,id',
            'session_number' => 'required|integer|min:1',
            'session_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:scheduled,completed,cancelled',
            'location_override' => 'nullable|string|max:255',
            'substitute_instructor_id' => 'nullable|integer|exists:staff,id',
        ]);

        $session = ClassSession::create($validated);

        return response()->json([
            'message' => 'Class session created successfully.',
            'data' => $session->fresh([
                'courseSection.course',
                'courseSection.instructor.user',
                'substituteInstructor.user',
            ]),
        ], 201);
    }

    /**
     * Display the specified class session
     */
    public function show(ClassSession $classSession): JsonResponse
    {
        $classSession->load([
            'courseSection.course',
            'courseSection.instructor.user',
            'courseSection.room.building',
            'courseSection.term',
            'substituteInstructor.user',
            'attendanceRecords.student.user',
        ]);

        return response()->json([
            'data' => $classSession,
        ]);
    }

    /**
     * Update the specified class session
     */
    public function update(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'session_number' => 'sometimes|integer|min:1',
            'session_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:scheduled,completed,cancelled',
            'cancellation_reason' => 'nullable|string|max:500',
            'location_override' => 'nullable|string|max:255',
            'substitute_instructor_id' => 'nullable|integer|exists:staff,id',
        ]);

        $classSession->update($validated);

        return response()->json([
            'message' => 'Class session updated successfully.',
            'data' => $classSession->fresh([
                'courseSection.course',
                'courseSection.instructor.user',
                'substituteInstructor.user',
            ]),
        ]);
    }

    /**
     * Remove the specified class session
     */
    public function destroy(ClassSession $classSession): JsonResponse
    {
        $classSession->delete();

        return response()->json([
            'message' => 'Class session deleted successfully.',
        ]);
    }

    /**
     * Get sessions for a specific course section
     */
    public function byCourseSection(Request $request, CourseSection $courseSection): JsonResponse
    {
        $query = $courseSection->classSessions()
            ->with(['substituteInstructor.user']);

        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        if ($request->has('upcoming') && $request->boolean('upcoming')) {
            $query->upcoming();
        }

        $sessions = $query->orderBy('session_date')
            ->orderBy('start_time')
            ->paginate($request->get('per_page', 50));

        return response()->json($sessions);
    }

    /**
     * Generate sessions for a course section from its schedule
     */
    public function generateForSection(Request $request, CourseSection $courseSection): JsonResponse
    {
        $validated = $request->validate([
            'exclude_dates' => 'sometimes|array',
            'exclude_dates.*' => 'date',
        ]);

        try {
            $sessions = $this->classSessionService->generateSessionsForSection(
                $courseSection,
                $validated['exclude_dates'] ?? []
            );

            return response()->json([
                'message' => "Generated {$sessions->count()} class sessions successfully.",
                'data' => [
                    'sessions_created' => $sessions->count(),
                    'first_session' => $sessions->first(),
                    'last_session' => $sessions->last(),
                ],
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Generate sessions for all course sections in a term
     */
    public function generateForTerm(Request $request, Term $term): JsonResponse
    {
        $validated = $request->validate([
            'exclude_dates' => 'sometimes|array',
            'exclude_dates.*' => 'date',
        ]);

        $results = $this->classSessionService->generateSessionsForTerm(
            $term,
            $validated['exclude_dates'] ?? []
        );

        return response()->json([
            'message' => "Processed {$results['sections_processed']} sections, created {$results['total_sessions_created']} sessions.",
            'data' => $results,
        ], 201);
    }

    /**
     * Get sessions for a specific date
     */
    public function forDate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $sessions = $this->classSessionService->getSessionsForDate($validated['date']);

        return response()->json([
            'data' => $sessions,
        ]);
    }

    /**
     * Get a student's sessions for today or a specific date
     */
    public function studentSessions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'date' => 'sometimes|date',
        ]);

        $date = $validated['date'] ?? now()->toDateString();
        $sessions = $this->classSessionService->getStudentSessionsForDate(
            $validated['student_id'],
            $date
        );

        return response()->json([
            'data' => $sessions,
            'meta' => [
                'date' => $date,
                'student_id' => $validated['student_id'],
            ],
        ]);
    }

    /**
     * Get current student's sessions for today
     */
    public function mySessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $date = $request->get('date', now()->toDateString());
        $sessions = $this->classSessionService->getStudentSessionsForDate($student->id, $date);

        return response()->json([
            'data' => $sessions,
            'meta' => [
                'date' => $date,
            ],
        ]);
    }

    /**
     * Get an instructor's sessions for today or a specific date
     */
    public function instructorSessions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_id' => 'required|integer|exists:staff,id',
            'date' => 'sometimes|date',
        ]);

        $date = $validated['date'] ?? now()->toDateString();
        $sessions = $this->classSessionService->getInstructorSessionsForDate(
            $validated['staff_id'],
            $date
        );

        return response()->json([
            'data' => $sessions,
            'meta' => [
                'date' => $date,
                'staff_id' => $validated['staff_id'],
            ],
        ]);
    }

    /**
     * Get current instructor's sessions for today
     */
    public function myInstructorSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $staff = Staff::where('user_id', $user->id)->firstOrFail();

        $date = $request->get('date', now()->toDateString());
        $sessions = $this->classSessionService->getInstructorSessionsForDate($staff->id, $date);

        return response()->json([
            'data' => $sessions,
            'meta' => [
                'date' => $date,
            ],
        ]);
    }

    /**
     * Mark a session as completed
     */
    public function complete(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
        ]);

        $session = $this->classSessionService->markSessionComplete(
            $classSession,
            $validated['description'] ?? null
        );

        return response()->json([
            'message' => 'Session marked as completed.',
            'data' => $session,
        ]);
    }

    /**
     * Cancel a session
     */
    public function cancel(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $session = $this->classSessionService->cancelSession(
            $classSession,
            $validated['reason']
        );

        return response()->json([
            'message' => 'Session cancelled.',
            'data' => $session,
        ]);
    }

    /**
     * Reschedule a session
     */
    public function reschedule(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
        ]);

        $session = $this->classSessionService->rescheduleSession(
            $classSession,
            $validated['date'],
            $validated['start_time'] ?? null,
            $validated['end_time'] ?? null,
            $validated['location'] ?? null
        );

        return response()->json([
            'message' => 'Session rescheduled.',
            'data' => $session,
        ]);
    }

    /**
     * Assign a substitute instructor
     */
    public function assignSubstitute(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'substitute_instructor_id' => 'required|integer|exists:staff,id',
        ]);

        $session = $this->classSessionService->assignSubstitute(
            $classSession,
            $validated['substitute_instructor_id']
        );

        return response()->json([
            'message' => 'Substitute instructor assigned.',
            'data' => $session,
        ]);
    }

    /**
     * Get session statistics for a course section
     */
    public function sectionStats(CourseSection $courseSection): JsonResponse
    {
        $stats = $this->classSessionService->getSectionSessionStats($courseSection);

        return response()->json([
            'data' => $stats,
        ]);
    }
}
