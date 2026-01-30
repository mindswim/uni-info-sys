<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EvaluationForm;
use App\Models\EvaluationResponse;
use App\Services\EvaluationService;
use Illuminate\Http\Request;

class EvaluationResponseController extends Controller
{
    private EvaluationService $evaluationService;

    public function __construct(EvaluationService $evaluationService)
    {
        $this->evaluationService = $evaluationService;
    }

    public function pending(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $pending = $this->evaluationService->getPendingEvaluations($student);

        return response()->json(['data' => $pending]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'evaluation_form_id' => 'required|exists:evaluation_forms,id',
            'course_section_id' => 'required|exists:course_sections,id',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:evaluation_questions,id',
            'answers.*.rating_value' => 'nullable|integer',
            'answers.*.text_value' => 'nullable|string',
        ]);

        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        // Check for duplicate submission
        $existing = EvaluationResponse::where('course_section_id', $request->course_section_id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already submitted an evaluation for this course.'], 422);
        }

        $response = EvaluationResponse::create([
            'evaluation_form_id' => $request->evaluation_form_id,
            'course_section_id' => $request->course_section_id,
            'student_id' => $student->id,
            'submitted_at' => now(),
        ]);

        foreach ($request->answers as $answerData) {
            $response->answers()->create([
                'evaluation_question_id' => $answerData['question_id'],
                'rating_value' => $answerData['rating_value'] ?? null,
                'text_value' => $answerData['text_value'] ?? null,
            ]);
        }

        return response()->json(['data' => $response->load('answers')], 201);
    }

    public function results(Request $request, int $courseSectionId)
    {
        $courseSection = \App\Models\CourseSection::findOrFail($courseSectionId);

        $results = $this->evaluationService->aggregateResults($courseSection);

        return response()->json(['data' => $results]);
    }
}
