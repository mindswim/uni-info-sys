<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of enrollments with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Apply filters
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        if ($request->filled('status')) {
            $statuses = is_array($request->status) ? $request->status : [$request->status];
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('term_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('term_id', $request->term_id);
            });
        }

        if ($request->filled('course_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }

        if ($request->filled('department_id')) {
            $query->whereHas('courseSection.course', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->filled('instructor_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('instructor_id', $request->instructor_id);
            });
        }

        // Add enrollment counts to course sections
        $query->with(['courseSection' => function ($q) {
            $q->withCount(['enrollments' => function ($subQ) {
                $subQ->where('status', 'enrolled');
            }]);
        }]);

        $enrollments = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => EnrollmentResource::collection($enrollments->items()),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    /**
     * Store a newly created enrollment
     */
    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        // Get all validated data including fields added via merge()
        $data = $request->only(['student_id', 'course_section_id', 'status']);
        
        // Debug: Log what we're about to create
        \Log::info('Creating enrollment with data:', $data);

        // Create the enrollment
        $enrollment = Enrollment::create($data);
        
        // Debug: Log what was actually created
        \Log::info('Created enrollment:', $enrollment->toArray());

        // Load relationships for response
        $enrollment->load([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Add enrollment count to course section
        $enrollment->courseSection->loadCount(['enrollments' => function ($q) {
            $q->where('status', 'enrolled');
        }]);

        $message = $enrollment->status === 'waitlisted' 
            ? 'Student has been added to the waitlist for this course section.'
            : 'Student has been successfully enrolled in the course section.';

        return response()->json([
            'message' => $message,
            'data' => new EnrollmentResource($enrollment),
        ], 201);
    }

    /**
     * Display the specified enrollment
     */
    public function show(Enrollment $enrollment): JsonResponse
    {
        $enrollment->load([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Add enrollment count to course section
        $enrollment->courseSection->loadCount(['enrollments' => function ($q) {
            $q->where('status', 'enrolled');
        }]);

        return response()->json([
            'data' => new EnrollmentResource($enrollment),
        ]);
    }

    /**
     * Update the specified enrollment
     */
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): JsonResponse
    {
        $validated = $request->validated();
        
        $oldStatus = $enrollment->status;
        $enrollment->update($validated);

        // Handle waitlist promotion if enrollment status changed from waitlisted to enrolled
        if ($oldStatus === 'waitlisted' && $enrollment->status === 'enrolled') {
            $this->handleWaitlistPromotion($enrollment->courseSection);
        }

        // Handle capacity opening if enrollment was withdrawn
        if (in_array($enrollment->status, ['withdrawn', 'completed']) && $oldStatus === 'enrolled') {
            $this->promoteFromWaitlist($enrollment->courseSection);
        }

        // Reload relationships
        $enrollment->load([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Add enrollment count to course section
        $enrollment->courseSection->loadCount(['enrollments' => function ($q) {
            $q->where('status', 'enrolled');
        }]);

        return response()->json([
            'message' => 'Enrollment updated successfully.',
            'data' => new EnrollmentResource($enrollment),
        ]);
    }

    /**
     * Remove the specified enrollment (withdraw)
     */
    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $wasEnrolled = $enrollment->status === 'enrolled';
        $courseSection = $enrollment->courseSection;
        
        // Update status to withdrawn instead of deleting
        $enrollment->update(['status' => 'withdrawn']);

        // If student was enrolled, try to promote someone from waitlist
        if ($wasEnrolled) {
            $this->promoteFromWaitlist($courseSection);
        }

        return response()->json([
            'message' => 'Student has been withdrawn from the course section.',
        ]);
    }

    /**
     * Withdraw a student from enrollment
     */
    public function withdraw(Enrollment $enrollment): JsonResponse
    {
        if (in_array($enrollment->status, ['withdrawn', 'completed'])) {
            return response()->json([
                'message' => 'Cannot withdraw from this enrollment.',
                'error' => 'Enrollment is already ' . $enrollment->status . '.',
            ], 422);
        }

        $wasEnrolled = $enrollment->status === 'enrolled';
        $courseSection = $enrollment->courseSection;
        
        $enrollment->update(['status' => 'withdrawn']);

        // If student was enrolled, try to promote someone from waitlist
        if ($wasEnrolled) {
            $this->promoteFromWaitlist($courseSection);
        }

        return response()->json([
            'message' => 'Student has been withdrawn from the course section.',
        ]);
    }

    /**
     * Mark enrollment as completed
     */
    public function complete(Enrollment $enrollment, Request $request): JsonResponse
    {
        if ($enrollment->status !== 'enrolled') {
            return response()->json([
                'message' => 'Cannot complete this enrollment.',
                'error' => 'Only enrolled students can be marked as completed.',
            ], 422);
        }

        $request->validate([
            'grade' => 'required|string|max:5',
        ]);

        $enrollment->update([
            'status' => 'completed',
            'grade' => $request->grade,
        ]);

        // Try to promote someone from waitlist
        $this->promoteFromWaitlist($enrollment->courseSection);

        return response()->json([
            'message' => 'Enrollment marked as completed with grade.',
        ]);
    }

    /**
     * Get enrollments for a specific student
     */
    public function byStudent(Student $student, Request $request): JsonResponse
    {
        $query = $student->enrollments()->with([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Apply status filter if provided
        if ($request->filled('status')) {
            $statuses = is_array($request->status) ? $request->status : [$request->status];
            $query->whereIn('status', $statuses);
        }

        // Apply term filter if provided
        if ($request->filled('term_id')) {
            $query->whereHas('courseSection', function ($q) use ($request) {
                $q->where('term_id', $request->term_id);
            });
        }

        // Add enrollment counts to course sections
        $query->with(['courseSection' => function ($q) {
            $q->withCount(['enrollments' => function ($subQ) {
                $subQ->where('status', 'enrolled');
            }]);
        }]);

        $enrollments = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => EnrollmentResource::collection($enrollments->items()),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    /**
     * Get enrollments for a specific course section
     */
    public function byCourseSection(CourseSection $courseSection, Request $request): JsonResponse
    {
        $query = $courseSection->enrollments()->with([
            'student.user',
        ]);

        // Apply status filter if provided
        if ($request->filled('status')) {
            $statuses = is_array($request->status) ? $request->status : [$request->status];
            $query->whereIn('status', $statuses);
        }

        $enrollments = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => EnrollmentResource::collection($enrollments->items()),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    /**
     * Handle waitlist promotion logic
     */
    private function handleWaitlistPromotion(CourseSection $courseSection): void
    {
        // This method can be expanded to handle complex waitlist promotion logic
        // For now, it's a placeholder for future enhancement
    }

    /**
     * Promote the next student from waitlist to enrolled
     */
    private function promoteFromWaitlist(CourseSection $courseSection): void
    {
        // Check if there's capacity
        $enrolledCount = $courseSection->enrollments()->where('status', 'enrolled')->count();
        
        if ($enrolledCount >= $courseSection->capacity) {
            return; // No capacity available
        }

        // Find the next waitlisted student (FIFO - first in, first out)
        $nextWaitlisted = $courseSection->enrollments()
            ->where('status', 'waitlisted')
            ->orderBy('created_at')
            ->first();

        if ($nextWaitlisted) {
            $nextWaitlisted->update(['status' => 'enrolled']);
            
            // Here you could send a notification to the student
            // NotificationService::notifyWaitlistPromotion($nextWaitlisted);
        }
    }
}
