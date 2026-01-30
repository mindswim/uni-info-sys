<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentSwapRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Enrollment Swaps',
    description: 'Endpoints for swapping student enrollments between course sections.'
)]
class EnrollmentSwapController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Swap a student from one course section to another
     */
    #[OA\Post(
        path: '/api/v1/enrollments/swap',
        summary: 'Swap a student from one course section to another',
        description: 'Atomically withdraws a student from one enrollment and enrolls them in a different course section. If the new enrollment fails, the withdrawal is rolled back.',
        tags: ['Enrollment Swaps'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreEnrollmentSwapRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Enrollment swap successful.',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', properties: [
                            new OA\Property(property: 'from_enrollment', ref: '#/components/schemas/EnrollmentResource'),
                            new OA\Property(property: 'to_enrollment', ref: '#/components/schemas/EnrollmentResource'),
                        ], type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized - cannot perform swap (deadline passed, not owner, etc.)'),
            new OA\Response(response: 404, description: 'Enrollment or course section not found'),
            new OA\Response(response: 422, description: 'Validation error or business rule violation (e.g., target section full, duplicate enrollment)'),
        ]
    )]
    public function store(StoreEnrollmentSwapRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $fromEnrollment = Enrollment::with(['courseSection.term', 'student.user'])->findOrFail($validated['from_enrollment_id']);
        $toCourseSection = CourseSection::with('term')->findOrFail($validated['to_course_section_id']);

        // Authorization checks
        $this->authorize('delete', $fromEnrollment); // Can withdraw from current enrollment
        $this->authorize('create', Enrollment::class); // Can create new enrollment

        // Additional authorization: check if user owns the enrollment
        if (auth()->user()->id !== $fromEnrollment->student->user_id) {
            return response()->json([
                'message' => 'Unauthorized.',
                'error' => 'You can only swap your own enrollments.',
            ], 403);
        }

        // Check if both terms allow enrollment/withdrawal (deadline check)
        if ($fromEnrollment->courseSection->term && ! $fromEnrollment->courseSection->term->isWithinAddDropPeriod()) {
            return response()->json([
                'message' => 'Swap not allowed.',
                'error' => 'The add/drop deadline has passed for the current enrollment term.',
            ], 403);
        }

        if ($toCourseSection->term && ! $toCourseSection->term->isWithinAddDropPeriod()) {
            return response()->json([
                'message' => 'Swap not allowed.',
                'error' => 'The add/drop deadline has passed for the target course section term.',
            ], 403);
        }

        // Perform the atomic swap operation
        try {
            $result = DB::transaction(function () use ($fromEnrollment, $toCourseSection) {
                // Step 1: Withdraw from current enrollment
                $this->enrollmentService->withdrawStudent($fromEnrollment);

                // Step 2: Enroll in new course section
                $newEnrollmentData = [
                    'student_id' => $fromEnrollment->student_id,
                    'course_section_id' => $toCourseSection->id,
                ];

                $toEnrollment = $this->enrollmentService->enrollStudent($newEnrollmentData);

                return [
                    'from_enrollment' => $fromEnrollment->fresh(),
                    'to_enrollment' => $toEnrollment,
                ];
            });

            // Load relationships for response
            $result['from_enrollment']->load([
                'student.user',
                'courseSection.course.department',
                'courseSection.term',
                'courseSection.instructor.user',
                'courseSection.room.building',
            ]);

            $result['to_enrollment']->load([
                'student.user',
                'courseSection.course.department',
                'courseSection.term',
                'courseSection.instructor.user',
                'courseSection.room.building',
            ]);

            $message = $result['to_enrollment']->status === 'waitlisted'
                ? 'Enrollment swap successful. You have been added to the waitlist for the new course section.'
                : 'Enrollment swap successful. You have been enrolled in the new course section.';

            return response()->json([
                'message' => $message,
                'data' => [
                    'from_enrollment' => new EnrollmentResource($result['from_enrollment']),
                    'to_enrollment' => new EnrollmentResource($result['to_enrollment']),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Enrollment swap failed.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
