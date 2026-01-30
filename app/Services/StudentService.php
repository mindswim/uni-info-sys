<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Collection;

class StudentService
{
    /**
     * Calculate GPA using the standard 4.0 scale with credit weighting
     * Based on research: A+=4.3, A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, etc.
     */
    public function calculateGPA(Student $student, ?string $termType = null): float
    {
        $enrollments = $student->enrollments()
            ->whereNotNull('grade')
            ->whereNotIn('grade', ['W', 'WF', 'I', 'P', 'NP']) // Exclude non-graded courses
            ->when($termType, function ($query, $termType) {
                $query->whereHas('courseSection.term', function ($q) use ($termType) {
                    $q->where('name', 'like', "%$termType%");
                });
            })
            ->with('courseSection.course')
            ->get();

        return $this->calculateGPAFromEnrollments($enrollments);
    }

    private function calculateGPAFromEnrollments(Collection $enrollments): float
    {
        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($enrollments as $enrollment) {
            $points = $this->gradeToPoints($enrollment->grade);
            $credits = $enrollment->courseSection->course->credits;

            $totalPoints += ($points * $credits);
            $totalCredits += $credits;
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;
    }

    private function gradeToPoints(string $grade): float
    {
        $scale = [
            'A+' => 4.3, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'D-' => 0.7,
            'F' => 0.0,
        ];

        return $scale[strtoupper($grade)] ?? 0.0;
    }

    /**
     * Calculate cumulative GPA across all completed courses
     */
    public function calculateCumulativeGPA(Student $student): float
    {
        return $this->calculateGPA($student);
    }

    /**
     * Calculate semester GPA for a specific term
     */
    public function calculateSemesterGPA(Student $student, string $termName): float
    {
        return $this->calculateGPA($student, $termName);
    }

    /**
     * Determine academic standing based on GPA and credit hours
     * Based on research: Good Standing (2.0+), Probation (<2.0), Dean's List (3.5+)
     */
    public function getAcademicStanding(Student $student): array
    {
        $cumulativeGPA = $this->calculateCumulativeGPA($student);
        $totalCredits = $this->getTotalCompletedCredits($student);

        $standing = 'good_standing';
        $description = 'Good Academic Standing';

        if ($cumulativeGPA < 2.0 && $totalCredits > 12) {
            $standing = 'probation';
            $description = 'Academic Probation';
        } elseif ($cumulativeGPA >= 3.7) {
            $standing = 'honors';
            $description = 'Honors';
        } elseif ($cumulativeGPA >= 3.5) {
            $standing = 'deans_list';
            $description = "Dean's List";
        }

        return [
            'status' => $standing,
            'description' => $description,
            'gpa' => $cumulativeGPA,
            'total_credits' => $totalCredits,
        ];
    }

    /**
     * Get total completed credit hours
     */
    public function getTotalCompletedCredits(Student $student): int
    {
        return $student->enrollments()
            ->whereIn('status', ['completed'])
            ->whereNotIn('grade', ['F', 'W', 'WF', 'I'])
            ->with('courseSection.course')
            ->get()
            ->sum(function ($enrollment) {
                return $enrollment->courseSection->course->credits;
            });
    }

    /**
     * Check degree progress for a student in a specific program
     */
    public function checkDegreeProgress(Student $student, $programId): array
    {
        $program = \App\Models\Program::with('degreeRequirements')->findOrFail($programId);
        $completedCourses = $this->getCompletedCourses($student);

        $requirements = [];

        foreach ($program->degreeRequirements as $requirement) {
            $satisfied = $this->checkRequirementSatisfaction($requirement, $completedCourses);
            $requirements[] = [
                'requirement' => $requirement,
                'satisfied' => $satisfied['satisfied'],
                'credits_completed' => $satisfied['credits_completed'],
                'credits_needed' => max(0, $requirement->required_credit_hours - $satisfied['credits_completed']),
                'courses_completed' => $satisfied['courses_completed'],
                'courses_needed' => max(0, $requirement->min_courses - count($satisfied['courses_completed'])),
            ];
        }

        $totalCreditsCompleted = $this->getTotalCompletedCredits($student);
        $totalCreditsNeeded = $program->total_credit_hours;

        return [
            'program' => $program,
            'requirements' => $requirements,
            'overall_progress' => [
                'credits_completed' => $totalCreditsCompleted,
                'credits_needed' => $totalCreditsNeeded,
                'percentage_complete' => $totalCreditsNeeded > 0 ? round(($totalCreditsCompleted / $totalCreditsNeeded) * 100, 1) : 0,
            ],
            'graduation_eligible' => $this->isGraduationEligible($requirements, $totalCreditsCompleted, $totalCreditsNeeded),
        ];
    }

    private function getCompletedCourses(Student $student): Collection
    {
        return $student->enrollments()
            ->whereIn('status', ['completed'])
            ->whereNotIn('grade', ['F', 'W', 'WF', 'I'])
            ->with('courseSection.course')
            ->get();
    }

    private function checkRequirementSatisfaction($requirement, Collection $completedCourses): array
    {
        $satisfyingCourses = $completedCourses->filter(function ($enrollment) use ($requirement) {
            return $requirement->satisfiedByCourse($enrollment->courseSection->course);
        });

        $creditsCompleted = $satisfyingCourses->sum(function ($enrollment) {
            return $enrollment->courseSection->course->credits;
        });

        $satisfied = $creditsCompleted >= $requirement->required_credit_hours &&
                    count($satisfyingCourses) >= $requirement->min_courses;

        return [
            'satisfied' => $satisfied,
            'credits_completed' => $creditsCompleted,
            'courses_completed' => $satisfyingCourses->toArray(),
        ];
    }

    private function isGraduationEligible(array $requirements, int $totalCreditsCompleted, int $totalCreditsNeeded): bool
    {
        if ($totalCreditsCompleted < $totalCreditsNeeded) {
            return false;
        }

        foreach ($requirements as $req) {
            if ($req['requirement']->is_required && ! $req['satisfied']) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate prerequisite completion before enrollment
     */
    public function validatePrerequisites(Student $student, \App\Models\Course $course): array
    {
        if (! $course->prerequisites || empty($course->prerequisites)) {
            return ['satisfied' => true, 'missing' => []];
        }

        $completedCourseIds = $student->enrollments()
            ->whereIn('status', ['completed'])
            ->whereNotIn('grade', ['F', 'W', 'WF', 'I'])
            ->with('courseSection.course')
            ->get()
            ->pluck('courseSection.course.id')
            ->toArray();

        $missing = array_diff($course->prerequisites, $completedCourseIds);

        return [
            'satisfied' => empty($missing),
            'missing' => $missing,
            'required' => $course->prerequisites,
            'completed' => array_intersect($course->prerequisites, $completedCourseIds),
        ];
    }
}
