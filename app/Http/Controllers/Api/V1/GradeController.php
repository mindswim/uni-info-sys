<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitGradeRequest;
use App\Http\Requests\BulkSubmitGradesRequest;
use App\Http\Requests\GradeChangeRequestRequest;
use App\Http\Requests\ApproveGradeChangeRequest;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\GradeChangeRequest;
use App\Services\GradeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Grades",
 *     description="Grade management endpoints"
 * )
 */
class GradeController extends Controller
{
    public function __construct(
        private GradeService $gradeService
    ) {}

    /**
     * @OA\Put(
     *     path="/api/v1/enrollments/{enrollment}/grade",
     *     summary="Submit or update a grade for an enrollment",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="enrollment",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"grade"},
     *             @OA\Property(property="grade", type="string", example="A", description="Letter grade (A+, A, A-, B+, etc.)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Grade submitted successfully"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Invalid grade or deadline passed"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to submit grade"
     *     )
     * )
     */
    public function submitGrade(SubmitGradeRequest $request, Enrollment $enrollment): JsonResponse
    {
        $enrollment = $this->gradeService->submitGrade(
            $enrollment,
            $request->grade,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Grade submitted successfully',
            'data' => $enrollment->load('student.user', 'courseSection.course'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/course-sections/{courseSection}/grades/bulk",
     *     summary="Submit grades for multiple students in bulk",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="courseSection",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"grades"},
     *             @OA\Property(
     *                 property="grades",
     *                 type="object",
     *                 example={"1": "A", "2": "B+", "3": "A-"},
     *                 description="Map of enrollment_id to grade"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bulk grades submitted"
     *     )
     * )
     */
    public function bulkSubmitGrades(BulkSubmitGradesRequest $request, CourseSection $courseSection): JsonResponse
    {
        $result = $this->gradeService->bulkSubmitGrades(
            $courseSection,
            $request->grades,
            $request->user()->id
        );

        $message = "Successfully graded {$result['successful']} out of {$result['total']} enrollments";
        if (count($result['failed']) > 0) {
            $message .= ". " . count($result['failed']) . " failed.";
        }

        return response()->json([
            'message' => $message,
            'data' => $result,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/course-sections/{courseSection}/grade-distribution",
     *     summary="Get grade distribution for a course section",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="courseSection",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Grade distribution data"
     *     )
     * )
     */
    public function getGradeDistribution(CourseSection $courseSection): JsonResponse
    {
        $this->authorize('view', $courseSection);

        $distribution = $this->gradeService->calculateGradeDistribution($courseSection);

        return response()->json([
            'data' => $distribution,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/course-sections/{courseSection}/grading-progress",
     *     summary="Get grading progress for a course section",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="courseSection",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Grading progress data"
     *     )
     * )
     */
    public function getGradingProgress(CourseSection $courseSection): JsonResponse
    {
        $this->authorize('view', $courseSection);

        $progress = $this->gradeService->getGradingProgress($courseSection);

        return response()->json([
            'data' => $progress,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/grade-change-requests",
     *     summary="Request a grade change",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"enrollment_id", "new_grade", "reason"},
     *             @OA\Property(property="enrollment_id", type="integer"),
     *             @OA\Property(property="new_grade", type="string", example="B+"),
     *             @OA\Property(property="reason", type="string", example="Grading error - missed extra credit")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Grade change request created"
     *     )
     * )
     */
    public function requestGradeChange(GradeChangeRequestRequest $request): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($request->enrollment_id);

        $gradeChangeRequest = $this->gradeService->requestGradeChange(
            $enrollment,
            $request->new_grade,
            $request->reason,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Grade change request submitted successfully',
            'data' => $gradeChangeRequest->load('enrollment.student.user', 'requestedBy'),
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/grade-change-requests/{gradeChangeRequest}/approve",
     *     summary="Approve a grade change request",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="gradeChangeRequest",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Grade change approved"
     *     )
     * )
     */
    public function approveGradeChange(Request $request, GradeChangeRequest $gradeChangeRequest): JsonResponse
    {
        $this->authorize('approve', $gradeChangeRequest);

        $enrollment = $this->gradeService->approveGradeChange(
            $gradeChangeRequest,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Grade change approved successfully',
            'data' => [
                'request' => $gradeChangeRequest->fresh(),
                'enrollment' => $enrollment->load('student.user', 'courseSection.course'),
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/grade-change-requests/{gradeChangeRequest}/deny",
     *     summary="Deny a grade change request",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="gradeChangeRequest",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"denial_reason"},
     *             @OA\Property(property="denial_reason", type="string", example="Insufficient justification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Grade change denied"
     *     )
     * )
     */
    public function denyGradeChange(ApproveGradeChangeRequest $request, GradeChangeRequest $gradeChangeRequest): JsonResponse
    {
        $this->authorize('approve', $gradeChangeRequest);

        $gradeChangeRequest = $this->gradeService->denyGradeChange(
            $gradeChangeRequest,
            $request->user()->id,
            $request->denial_reason
        );

        return response()->json([
            'message' => 'Grade change denied',
            'data' => $gradeChangeRequest,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/grade-change-requests",
     *     summary="List grade change requests",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string", enum={"pending", "approved", "denied"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of grade change requests"
     *     )
     * )
     */
    public function listGradeChangeRequests(Request $request): JsonResponse
    {
        $query = GradeChangeRequest::with([
            'enrollment.student.user',
            'enrollment.courseSection.course',
            'requestedBy',
            'approvedBy',
        ]);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Admin sees all, faculty sees only their courses, staff may see department
        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->hasRole('faculty')) {
                $staffId = $request->user()->staff->id;
                $query->whereHas('enrollment.courseSection', function ($q) use ($staffId) {
                    $q->where('instructor_id', $staffId);
                });
            }
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($requests);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/grades/valid-grades",
     *     summary="Get list of valid letter grades",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of valid grades"
     *     )
     * )
     */
    public function getValidGrades(): JsonResponse
    {
        return response()->json([
            'data' => GradeService::getValidGrades(),
        ]);
    }
}
