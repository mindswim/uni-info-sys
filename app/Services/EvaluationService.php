<?php

namespace App\Services;

use App\Models\CourseSection;
use App\Models\EvaluationForm;
use App\Models\EvaluationResponse;
use App\Models\Student;

class EvaluationService
{
    public function getPendingEvaluations(Student $student): array
    {
        $activeForm = EvaluationForm::active()
            ->where(function ($q) {
                $q->whereNull('available_until')
                    ->orWhere('available_until', '>=', now());
            })
            ->first();

        if (! $activeForm) {
            return [];
        }

        // Get completed course sections that haven't been evaluated yet
        $completedSectionIds = $student->enrollments()
            ->whereIn('status', ['completed', 'enrolled'])
            ->pluck('course_section_id');

        $evaluatedSectionIds = EvaluationResponse::where('student_id', $student->id)
            ->pluck('course_section_id');

        $pendingSectionIds = $completedSectionIds->diff($evaluatedSectionIds);

        $sections = CourseSection::with(['course', 'term', 'instructor.user'])
            ->whereIn('id', $pendingSectionIds)
            ->get();

        return $sections->map(function ($section) use ($activeForm) {
            return [
                'form_id' => $activeForm->id,
                'course_section_id' => $section->id,
                'course_code' => $section->course->course_code,
                'course_title' => $section->course->title,
                'section_number' => $section->section_number,
                'term' => $section->term->name ?? '',
                'instructor' => $section->instructor?->user?->name ?? 'TBA',
            ];
        })->values()->toArray();
    }

    public function aggregateResults(CourseSection $courseSection): array
    {
        $responses = EvaluationResponse::where('course_section_id', $courseSection->id)
            ->with('answers.question')
            ->get();

        $questionAggregates = [];
        $textAnswers = [];

        foreach ($responses as $response) {
            foreach ($response->answers as $answer) {
                $questionId = $answer->evaluation_question_id;
                $question = $answer->question;

                if (! isset($questionAggregates[$questionId])) {
                    $questionAggregates[$questionId] = [
                        'question_text' => $question->question_text,
                        'question_type' => $question->question_type,
                        'ratings' => [],
                        'text_answers' => [],
                    ];
                }

                if ($answer->rating_value !== null) {
                    $questionAggregates[$questionId]['ratings'][] = $answer->rating_value;
                }

                if ($answer->text_value) {
                    $questionAggregates[$questionId]['text_answers'][] = $answer->text_value;
                }
            }
        }

        // Calculate averages
        $results = [];
        foreach ($questionAggregates as $questionId => $data) {
            $ratings = $data['ratings'];
            $results[] = [
                'question_id' => $questionId,
                'question_text' => $data['question_text'],
                'question_type' => $data['question_type'],
                'average_rating' => ! empty($ratings) ? round(array_sum($ratings) / count($ratings), 2) : null,
                'response_count' => count($ratings),
                'text_answers' => $data['text_answers'],
            ];
        }

        return [
            'course_section_id' => $courseSection->id,
            'total_responses' => $responses->count(),
            'questions' => $results,
        ];
    }
}
