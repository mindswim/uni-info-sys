<?php

namespace App\Services;

use App\Models\Course;
use App\Models\PlannedCourse;
use App\Models\Student;
use App\Models\Term;

class AcademicPlanService
{
    private StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function validatePlan(Student $student): array
    {
        $programId = $student->major_program_id;
        if (! $programId) {
            return ['valid' => false, 'errors' => ['No major program assigned']];
        }

        $degreeProgress = $this->studentService->checkDegreeProgress($student, $programId);
        $plannedCourses = PlannedCourse::where('student_id', $student->id)
            ->where('status', 'planned')
            ->with('course')
            ->get();

        $errors = [];
        $plannedCredits = $plannedCourses->sum(fn ($pc) => $pc->course->credits ?? 0);
        $completedCredits = $degreeProgress['overall_progress']['credits_completed'];
        $totalNeeded = $degreeProgress['overall_progress']['credits_needed'];

        if (($completedCredits + $plannedCredits) < $totalNeeded) {
            $deficit = $totalNeeded - $completedCredits - $plannedCredits;
            $errors[] = "Plan is short by {$deficit} credits to meet degree requirements";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'planned_credits' => $plannedCredits,
            'completed_credits' => $completedCredits,
            'total_needed' => $totalNeeded,
        ];
    }

    public function suggestCourses(Student $student, Term $term): array
    {
        $programId = $student->major_program_id;
        if (! $programId) {
            return [];
        }

        $completedCourseIds = $student->enrollments()
            ->whereIn('status', ['completed'])
            ->whereNotIn('grade', ['F', 'W', 'WF', 'I'])
            ->with('courseSection.course')
            ->get()
            ->pluck('courseSection.course.id')
            ->toArray();

        $plannedCourseIds = PlannedCourse::where('student_id', $student->id)
            ->pluck('course_id')
            ->toArray();

        $enrolledCourseIds = $student->enrollments()
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->with('courseSection.course')
            ->get()
            ->pluck('courseSection.course.id')
            ->toArray();

        $excludeIds = array_merge($completedCourseIds, $plannedCourseIds, $enrolledCourseIds);

        // Get courses from the student's department that they haven't taken
        $program = \App\Models\Program::find($programId);
        if (! $program) {
            return [];
        }

        return Course::where('department_id', $program->department_id)
            ->whereNotIn('id', $excludeIds)
            ->limit(10)
            ->get()
            ->toArray();
    }
}
