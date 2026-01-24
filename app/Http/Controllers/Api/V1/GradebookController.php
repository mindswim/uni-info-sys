<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Services\GradebookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GradebookController extends Controller
{
    public function __construct(
        protected GradebookService $gradebookService
    ) {}

    /**
     * Get student's gradebook for a specific enrollment
     */
    public function studentGradebook(Enrollment $enrollment): JsonResponse
    {
        $gradebook = $this->gradebookService->getStudentGradebook($enrollment);

        return response()->json([
            'data' => $gradebook,
        ]);
    }

    /**
     * Get current student's gradebook for a course
     */
    public function myGradebook(Request $request, CourseSection $courseSection): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('course_section_id', $courseSection->id)
            ->firstOrFail();

        $gradebook = $this->gradebookService->getStudentGradebook($enrollment);

        return response()->json([
            'data' => $gradebook,
        ]);
    }

    /**
     * Get current student's grade across all enrollments
     */
    public function myGrades(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $enrollments = Enrollment::where('student_id', $student->id)
            ->whereIn('status', ['enrolled', 'completed'])
            ->with(['courseSection.course', 'courseSection.term'])
            ->get();

        $grades = $enrollments->map(function ($enrollment) {
            $currentGrade = $this->gradebookService->calculateCurrentGrade($enrollment);

            return [
                'enrollment_id' => $enrollment->id,
                'course_code' => $enrollment->courseSection->course->course_code,
                'course_title' => $enrollment->courseSection->course->title,
                'section_number' => $enrollment->courseSection->section_number,
                'term' => $enrollment->courseSection->term->name ?? null,
                'status' => $enrollment->status,
                'grade' => $enrollment->grade,
                'current_grade' => $currentGrade,
            ];
        });

        return response()->json([
            'data' => $grades,
        ]);
    }

    /**
     * Get grade breakdown by category for a student
     */
    public function gradesByCategory(Enrollment $enrollment): JsonResponse
    {
        $categories = $this->gradebookService->getGradesByCategory($enrollment);

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Calculate what grade student needs on remaining work
     */
    public function calculateNeeded(Request $request, Enrollment $enrollment): JsonResponse
    {
        $validated = $request->validate([
            'target_grade' => 'required|string|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,D-,F',
        ]);

        $result = $this->gradebookService->calculateNeededScore(
            $enrollment,
            $validated['target_grade']
        );

        if ($result === null) {
            return response()->json([
                'message' => 'Invalid target grade.',
            ], 422);
        }

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Get class gradebook (all students) - instructor view
     */
    public function classGradebook(CourseSection $courseSection): JsonResponse
    {
        $gradebook = $this->gradebookService->getClassGradebook($courseSection);

        return response()->json([
            'data' => $gradebook,
        ]);
    }

    /**
     * Export gradebook as CSV
     */
    public function exportGradebook(CourseSection $courseSection): Response
    {
        $export = $this->gradebookService->exportGradebook($courseSection);

        $csv = '';
        $csv .= implode(',', array_map(fn($h) => '"' . str_replace('"', '""', $h) . '"', $export['headers'])) . "\n";

        foreach ($export['rows'] as $row) {
            $csv .= implode(',', array_map(function ($cell) {
                if (is_numeric($cell)) {
                    return $cell;
                }
                return '"' . str_replace('"', '""', (string) $cell) . '"';
            }, $row)) . "\n";
        }

        $filename = 'gradebook_' . $courseSection->course->course_code . '_' . $courseSection->section_number . '_' . date('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Finalize grades for a section (end of term)
     */
    public function finalizeGrades(CourseSection $courseSection): JsonResponse
    {
        $results = $this->gradebookService->finalizeGrades($courseSection);

        $successCount = collect($results)->where('success', true)->count();
        $failCount = collect($results)->where('success', false)->count();

        return response()->json([
            'message' => "Finalized {$successCount} grades. {$failCount} failed.",
            'data' => $results,
        ]);
    }

    /**
     * Get class statistics
     */
    public function classStatistics(CourseSection $courseSection): JsonResponse
    {
        $gradebook = $this->gradebookService->getClassGradebook($courseSection);

        return response()->json([
            'data' => $gradebook['statistics'],
        ]);
    }
}
