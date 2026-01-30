<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRequest;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationResponse;
use App\Models\GradeChangeRequest;
use App\Models\Staff;
use App\Models\Term;
use App\Services\ApprovalService;
use App\Services\GradeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentChairController extends Controller
{
    public function __construct(
        private ApprovalService $approvalService,
        private GradeService $gradeService,
    ) {}

    private function getChairContext(Request $request): array
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
        $department = Department::where('chair_id', $staff->id)->firstOrFail();
        return [$staff, $department];
    }

    private function getDepartmentSectionIds(Department $department, ?Term $term): \Illuminate\Support\Collection
    {
        if (!$term) {
            return collect();
        }
        return CourseSection::whereHas('course', function ($q) use ($department) {
            $q->where('department_id', $department->id);
        })->where('term_id', $term->id)->pluck('id');
    }

    public function dashboard(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();

        $facultyCount = Staff::where('department_id', $department->id)->count();
        $sectionCount = 0;
        $totalEnrolled = 0;

        if ($currentTerm) {
            $sectionIds = $this->getDepartmentSectionIds($department, $currentTerm);
            $sectionCount = $sectionIds->count();
            $totalEnrolled = Enrollment::whereIn('course_section_id', $sectionIds)
                ->where('status', 'enrolled')
                ->count();
        }

        $pendingApprovals = ApprovalRequest::forDepartment($department->id)->pending()->count();

        return response()->json([
            'data' => [
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'code' => $department->code,
                ],
                'current_term' => $currentTerm?->name,
                'faculty_count' => $facultyCount,
                'section_count' => $sectionCount,
                'total_enrolled' => $totalEnrolled,
                'pending_approvals' => $pendingApprovals,
            ],
        ]);
    }

    public function facultyList(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $faculty = Staff::where('department_id', $department->id)
            ->with(['user', 'courseSections' => function ($q) {
                $q->whereHas('term', function ($tq) {
                    $tq->where('is_current', true);
                });
            }])
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->user->name,
                    'email' => $s->user->email,
                    'job_title' => $s->job_title,
                    'current_sections' => $s->courseSections->count(),
                    'advisee_count' => $s->advisees()->count(),
                ];
            });

        return response()->json(['data' => $faculty]);
    }

    public function sectionOverview(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();

        if (!$currentTerm) {
            return response()->json(['data' => []]);
        }

        $sections = CourseSection::whereHas('course', function ($q) use ($department) {
            $q->where('department_id', $department->id);
        })
            ->where('term_id', $currentTerm->id)
            ->with(['course', 'instructor.user'])
            ->withCount(['enrollments' => function ($q) {
                $q->where('status', 'enrolled');
            }])
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'course_code' => $section->course->course_code,
                    'course_name' => $section->course->name,
                    'section_number' => $section->section_number,
                    'instructor' => $section->instructor?->user?->name ?? 'TBA',
                    'instructor_id' => $section->instructor_id,
                    'enrolled_count' => $section->enrollments_count,
                    'capacity' => $section->capacity,
                ];
            });

        return response()->json(['data' => $sections]);
    }

    public function gradeDistribution(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();

        if (!$currentTerm) {
            return response()->json(['data' => []]);
        }

        $sectionIds = $this->getDepartmentSectionIds($department, $currentTerm);

        $distribution = Enrollment::whereIn('course_section_id', $sectionIds)
            ->whereNotNull('grade')
            ->selectRaw('grade, COUNT(*) as count')
            ->groupBy('grade')
            ->orderBy('grade')
            ->pluck('count', 'grade');

        return response()->json(['data' => $distribution]);
    }

    // --- Approval Requests (6.2, 6.5) ---

    public function approvalRequests(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $query = ApprovalRequest::forDepartment($department->id)
            ->with(['requestedBy.user', 'approvedBy.user']);

        if ($request->has('type')) {
            $query->ofType($request->type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->pending();
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $requests]);
    }

    public function createApprovalRequest(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $validated = $request->validate([
            'type' => 'required|in:section_offering,enrollment_override',
            'requestable_type' => 'required|string',
            'requestable_id' => 'required|integer',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $modelClass = $validated['requestable_type'] === 'course_section'
            ? CourseSection::class
            : Enrollment::class;

        $requestable = $modelClass::findOrFail($validated['requestable_id']);

        $approval = $this->approvalService->createRequest(
            $validated['type'],
            $requestable,
            $department,
            $staff,
            $validated['notes'] ?? null,
            $validated['metadata'] ?? null,
        );

        return response()->json(['data' => $approval], 201);
    }

    public function approveRequest(Request $request, int $id): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $approval = ApprovalRequest::forDepartment($department->id)->findOrFail($id);

        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending'], 422);
        }

        $result = $this->approvalService->approve($approval, $staff, $request->input('notes'));

        return response()->json(['data' => $result]);
    }

    public function denyRequest(Request $request, int $id): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $approval = ApprovalRequest::forDepartment($department->id)->findOrFail($id);

        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Request is not pending'], 422);
        }

        $validated = $request->validate([
            'denial_reason' => 'required|string',
        ]);

        $result = $this->approvalService->deny($approval, $staff, $validated['denial_reason']);

        return response()->json(['data' => $result]);
    }

    // --- Assign Instructor (6.3) ---

    public function assignInstructor(Request $request, int $sectionId): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);

        $section = CourseSection::whereHas('course', function ($q) use ($department) {
            $q->where('department_id', $department->id);
        })->findOrFail($sectionId);

        $validated = $request->validate([
            'instructor_id' => 'required|exists:staff,id',
        ]);

        // Verify instructor belongs to this department
        $instructor = Staff::where('id', $validated['instructor_id'])
            ->where('department_id', $department->id)
            ->firstOrFail();

        $section->update(['instructor_id' => $instructor->id]);

        return response()->json([
            'data' => [
                'section_id' => $section->id,
                'instructor_id' => $instructor->id,
                'instructor_name' => $instructor->user->name,
            ],
            'message' => 'Instructor assigned successfully',
        ]);
    }

    // --- Grade Change Requests (6.6) ---

    public function departmentGradeChangeRequests(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();

        $sectionIds = $this->getDepartmentSectionIds($department, $currentTerm);

        $query = GradeChangeRequest::whereHas('enrollment', function ($q) use ($sectionIds) {
            $q->whereIn('course_section_id', $sectionIds);
        })->with([
            'enrollment.courseSection.course',
            'enrollment.student.user',
            'requestedBy',
            'approvedBy',
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $requests]);
    }

    public function approveGradeChange(Request $request, int $id): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();
        $sectionIds = $this->getDepartmentSectionIds($department, $currentTerm);

        $gradeChange = GradeChangeRequest::whereHas('enrollment', function ($q) use ($sectionIds) {
            $q->whereIn('course_section_id', $sectionIds);
        })->findOrFail($id);

        $enrollment = $this->gradeService->approveGradeChange($gradeChange, $request->user()->id);

        return response()->json([
            'data' => $enrollment,
            'message' => 'Grade change approved',
        ]);
    }

    public function denyGradeChange(Request $request, int $id): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();
        $sectionIds = $this->getDepartmentSectionIds($department, $currentTerm);

        $gradeChange = GradeChangeRequest::whereHas('enrollment', function ($q) use ($sectionIds) {
            $q->whereIn('course_section_id', $sectionIds);
        })->findOrFail($id);

        $validated = $request->validate([
            'denial_reason' => 'required|string',
        ]);

        $result = $this->gradeService->denyGradeChange($gradeChange, $request->user()->id, $validated['denial_reason']);

        return response()->json([
            'data' => $result,
            'message' => 'Grade change denied',
        ]);
    }

    // --- Faculty Performance (6.7) ---

    public function facultyPerformance(Request $request): JsonResponse
    {
        [$staff, $department] = $this->getChairContext($request);
        $currentTerm = Term::where('is_current', true)->first();

        $faculty = Staff::where('department_id', $department->id)
            ->with('user')
            ->get()
            ->map(function ($member) use ($currentTerm) {
                $sections = $member->courseSections()
                    ->when($currentTerm, fn($q) => $q->where('term_id', $currentTerm->id))
                    ->withCount(['enrollments' => fn($q) => $q->where('status', 'enrolled')])
                    ->get();

                $sectionIds = $sections->pluck('id');
                $totalEnrolled = $sections->sum('enrollments_count');
                $avgEnrollment = $sections->count() > 0
                    ? round($totalEnrolled / $sections->count(), 1)
                    : 0;

                // Grade distribution across sections
                $gradeData = Enrollment::whereIn('course_section_id', $sectionIds)
                    ->whereNotNull('grade')
                    ->selectRaw('grade, COUNT(*) as count')
                    ->groupBy('grade')
                    ->pluck('count', 'grade')
                    ->toArray();

                // Average evaluation rating
                $avgRating = EvaluationAnswer::whereHas('response', function ($q) use ($sectionIds) {
                    $q->whereIn('course_section_id', $sectionIds);
                })->whereNotNull('rating_value')->avg('rating_value');

                return [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'job_title' => $member->job_title,
                    'sections_taught' => $sections->count(),
                    'total_enrolled' => $totalEnrolled,
                    'avg_enrollment' => $avgEnrollment,
                    'avg_evaluation_score' => $avgRating ? round($avgRating, 2) : null,
                    'grade_distribution' => $gradeData,
                ];
            });

        return response()->json(['data' => $faculty]);
    }
}
