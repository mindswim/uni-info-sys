<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Services\EnrollmentService;
use App\Filters\EnrollmentFilter;
use App\Jobs\ProcessWaitlistPromotion;
use App\Exceptions\CourseSectionUnavailableException;
use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\StudentNotActiveException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Enrollments",
    description: "Endpoints for managing student enrollments in course sections."
)]
class EnrollmentController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private EnrollmentFilter $enrollmentFilter
    ) {
    }
    /**
     * Display a listing of enrollments with filtering
     */
    #[OA\Get(
        path: "/api/v1/enrollments",
        summary: "List and filter enrollments",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(ref: "#/components/parameters/enrollment_student_id_filter"),
            new OA\Parameter(ref: "#/components/parameters/enrollment_course_section_id_filter"),
            new OA\Parameter(ref: "#/components/parameters/enrollment_status_filter"),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "A paginated list of enrollments.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/EnrollmentResource")),
                        new OA\Property(property: "meta", type: "object", properties: [
                            new OA\Property(property: "current_page", type: "integer"),
                            new OA\Property(property: "last_page", type: "integer"),
                            new OA\Property(property: "per_page", type: "integer"),
                            new OA\Property(property: "total", type: "integer"),
                        ]),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Enrollment::class);

        $query = Enrollment::with([
            'student.user',
            'courseSection.course.department',
            'courseSection.term',
            'courseSection.instructor.user',
            'courseSection.room.building'
        ]);

        // Apply filters using the filter class
        $query = $this->enrollmentFilter->apply($query, $request->all());

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
    #[OA\Post(
        path: "/api/v1/enrollments",
        summary: "Enroll a student in a course section",
        description: "Enrolls a student. If the course is full, they may be placed on the waitlist.",
        tags: ["Enrollments"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreEnrollmentRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Enrollment successful or waitlisted.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", ref: "#/components/schemas/EnrollmentResource"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error or business rule violation (e.g., duplicate enrollment, prerequisites not met)."),
        ]
    )]
    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $this->authorize('create', Enrollment::class);

        $enrollment = $this->enrollmentService->enrollStudent($request->validated());

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
    #[OA\Get(
        path: "/api/v1/enrollments/{enrollment}",
        summary: "Get a single enrollment record",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, description: "ID of the enrollment record", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "The requested enrollment record.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/EnrollmentResource"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Enrollment $enrollment): JsonResponse
    {
        $this->authorize('view', $enrollment);

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
    #[OA\Put(
        path: "/api/v1/enrollments/{enrollment}",
        summary: "Update an enrollment record",
        description: "Updates the status or grade of an enrollment. Certain status transitions are restricted.",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, description: "ID of the enrollment record", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateEnrollmentRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Enrollment updated successfully.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", ref: "#/components/schemas/EnrollmentResource"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error or invalid status transition."),
        ]
    )]
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): JsonResponse
    {
        $this->authorize('update', $enrollment);

        $validated = $request->validated();
        
        // Set reason for change for audit trail if grade is being changed
        if (isset($validated['grade']) && $request->has('reason_for_change')) {
            $enrollment->reasonForChange = $request->input('reason_for_change');
        }
        
        $oldStatus = $enrollment->status;
        $enrollment->update($validated);

        // Handle waitlist promotion if enrollment status changed from waitlisted to enrolled
        if ($oldStatus === 'waitlisted' && $enrollment->status === 'enrolled') {
            $this->handleWaitlistPromotion($enrollment->courseSection);
        }

        // Handle capacity opening if enrollment was withdrawn
        if (in_array($enrollment->status, ['withdrawn', 'completed']) && $oldStatus === 'enrolled') {
            ProcessWaitlistPromotion::dispatch($enrollment->courseSection);
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
    #[OA\Delete(
        path: "/api/v1/enrollments/{enrollment}",
        summary: "Withdraw a student from a course section (soft delete)",
        description: "This is the standard 'delete' action, which updates the enrollment status to 'withdrawn'.",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, description: "ID of the enrollment record", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Student withdrawn successfully.",
                content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string")])
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $this->authorize('delete', $enrollment);

        $this->enrollmentService->withdrawStudent($enrollment);

        return response()->json([
            'message' => 'Student has been withdrawn from the course section.',
        ]);
    }

    /**
     * Withdraw a student from enrollment
     */
    #[OA\Post(
        path: "/api/v1/enrollments/{enrollment}/withdraw",
        summary: "Explicitly withdraw a student from an enrollment",
        description: "Sets the enrollment status to 'withdrawn' and may trigger waitlist promotions.",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, description: "ID of the enrollment to withdraw from", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Student withdrawn successfully.",
                content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string")])
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Enrollment already withdrawn or completed."),
        ]
    )]
    public function withdraw(Enrollment $enrollment): JsonResponse
    {
        $this->authorize('update', $enrollment);

        if (in_array($enrollment->status, ['withdrawn', 'completed'])) {
            return response()->json([
                'message' => 'Cannot withdraw from this enrollment.',
                'error' => 'Enrollment is already ' . $enrollment->status . '.',
            ], 422);
        }

        $this->enrollmentService->withdrawStudent($enrollment);

        return response()->json([
            'message' => 'Student has been withdrawn from the course section.',
        ]);
    }

    /**
     * Mark enrollment as completed
     */
    #[OA\Post(
        path: "/api/v1/enrollments/{enrollment}/complete",
        summary: "Mark an enrollment as completed",
        description: "Sets the enrollment status to 'completed' and assigns a grade.",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, description: "ID of the enrollment to complete", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["grade"],
                properties: [new OA\Property(property: "grade", type: "string", maxLength: 5, example: "B+")]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Enrollment marked as completed.",
                content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string")])
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error (e.g., not an enrolled student, missing grade)."),
        ]
    )]
    public function complete(Enrollment $enrollment, Request $request): JsonResponse
    {
        $this->authorize('update', $enrollment);

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
        ProcessWaitlistPromotion::dispatch($enrollment->courseSection);

        return response()->json([
            'message' => 'Enrollment marked as completed with grade.',
        ]);
    }

    /**
     * Get enrollments for a specific student
     */
    #[OA\Get(
        path: "/api/v1/students/{student}/enrollments",
        summary: "Get all enrollments for a specific student",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, description: "ID of the student", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(ref: "#/components/parameters/enrollment_status_filter"),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: "A paginated list of the student's enrollments.", content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/EnrollmentResource")),
                    new OA\Property(property: "meta", type: "object"),
                ]
            )),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Student Not Found"),
        ]
    )]
    public function byStudent(Student $student, Request $request): JsonResponse
    {
        $this->authorize('view', $student);

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
    #[OA\Get(
        path: "/api/v1/course-sections/{courseSection}/enrollments",
        summary: "Get all enrollments for a specific course section",
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "courseSection", in: "path", required: true, description: "ID of the course section", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(ref: "#/components/parameters/enrollment_status_filter"),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: "A paginated list of the course section's enrollments.", content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/EnrollmentResource")),
                    new OA\Property(property: "meta", type: "object"),
                ]
            )),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Course Section Not Found"),
        ]
    )]
    public function byCourseSection(CourseSection $courseSection, Request $request): JsonResponse
    {
        $this->authorize('view', $courseSection);

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
     * Restore a soft-deleted enrollment
     */
    #[OA\Post(
        path: "/api/v1/enrollments/{enrollment}/restore",
        summary: "Restore a soft-deleted enrollment",
        description: "Restore a soft-deleted enrollment record. Requires admin permissions.",
        security: [["sanctum" => []]],
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Enrollment restored successfully",
                content: new OA\JsonContent(ref: "#/components/schemas/EnrollmentResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function restore($id): JsonResponse
    {
        $enrollment = Enrollment::withTrashed()->findOrFail($id);
        $this->authorize('restore', $enrollment);
        
        $enrollment->restore();
        
        return response()->json([
            'message' => 'Enrollment restored successfully',
            'data' => new EnrollmentResource($enrollment)
        ], 200);
    }

    /**
     * Permanently delete an enrollment
     */
    #[OA\Delete(
        path: "/api/v1/enrollments/{enrollment}/force",
        summary: "Permanently delete an enrollment",
        description: "Permanently delete an enrollment record. Requires admin permissions. This action cannot be undone.",
        security: [["sanctum" => []]],
        tags: ["Enrollments"],
        parameters: [
            new OA\Parameter(name: "enrollment", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Enrollment permanently deleted"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function forceDelete($id): JsonResponse
    {
        $enrollment = Enrollment::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $enrollment);
        
        $enrollment->forceDelete();
        
        return response()->json(null, 204);
    }
}
