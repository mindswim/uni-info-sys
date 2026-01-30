<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PlannedCourse;
use App\Services\AcademicPlanService;
use Illuminate\Http\Request;

class PlannedCourseController extends Controller
{
    private AcademicPlanService $planService;

    public function __construct(AcademicPlanService $planService)
    {
        $this->planService = $planService;
    }

    public function index(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $plans = PlannedCourse::where('student_id', $student->id)
            ->with(['course', 'term'])
            ->orderBy('term_id')
            ->get();

        $validation = $this->planService->validatePlan($student);

        return response()->json([
            'data' => $plans,
            'validation' => $validation,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'term_id' => 'required|exists:terms,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $plan = PlannedCourse::create([
            'student_id' => $student->id,
            'course_id' => $request->course_id,
            'term_id' => $request->term_id,
            'status' => 'planned',
            'notes' => $request->notes,
        ]);

        return response()->json(['data' => $plan->load(['course', 'term'])], 201);
    }

    public function update(Request $request, PlannedCourse $plannedCourse)
    {
        $request->validate([
            'term_id' => 'exists:terms,id',
            'status' => 'in:planned,enrolled,completed,dropped',
            'notes' => 'nullable|string|max:500',
        ]);

        $plannedCourse->update($request->only(['term_id', 'status', 'notes']));

        return response()->json(['data' => $plannedCourse->fresh()->load(['course', 'term'])]);
    }

    public function destroy(PlannedCourse $plannedCourse)
    {
        $plannedCourse->delete();

        return response()->noContent();
    }

    public function byTerm(Request $request, int $termId)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $plans = PlannedCourse::where('student_id', $student->id)
            ->where('term_id', $termId)
            ->with(['course', 'term'])
            ->get();

        return response()->json(['data' => $plans]);
    }

    public function suggest(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $request->validate([
            'term_id' => 'required|exists:terms,id',
        ]);

        $term = \App\Models\Term::findOrFail($request->term_id);
        $suggestions = $this->planService->suggestCourses($student, $term);

        return response()->json(['data' => $suggestions]);
    }
}
