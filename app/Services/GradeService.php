<?php

namespace App\Services;

use App\Exceptions\GradingDeadlinePassedException;
use App\Exceptions\InvalidGradeException;
use App\Exceptions\UnauthorizedGradeSubmissionException;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\GradeChangeRequest;
use App\Models\Student;
use App\Models\Term;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Grade Service
 *
 * Handles all grade-related business logic including:
 * - Grade submission and validation
 * - Grade change workflow with approval
 * - Deadline enforcement
 * - GPA recalculation
 * - Audit trail integration
 */
class GradeService
{
    /**
     * Valid letter grades and their point values
     * Configurable for different grading scales
     */
    private const GRADE_POINTS = [
        'A+' => 4.0,
        'A' => 4.0,
        'A-' => 3.7,
        'B+' => 3.3,
        'B' => 3.0,
        'B-' => 2.7,
        'C+' => 2.3,
        'C' => 2.0,
        'C-' => 1.7,
        'D+' => 1.3,
        'D' => 1.0,
        'D-' => 0.7,
        'F' => 0.0,
        'P' => null, // Pass (not counted in GPA)
        'NP' => null, // No Pass (not counted in GPA)
        'W' => null, // Withdrawn (not counted in GPA)
        'I' => null, // Incomplete (not counted in GPA)
    ];

    /**
     * Submit a grade for an enrollment
     *
     * @throws InvalidGradeException
     * @throws GradingDeadlinePassedException
     * @throws UnauthorizedGradeSubmissionException
     */
    public function submitGrade(Enrollment $enrollment, string $grade, int $submittedByUserId): Enrollment
    {
        return DB::transaction(function () use ($enrollment, $grade, $submittedByUserId) {
            // Validate grade format
            if (! $this->isValidGrade($grade)) {
                throw new InvalidGradeException("Invalid grade: {$grade}. Must be one of: ".implode(', ', array_keys(self::GRADE_POINTS)));
            }

            // Check if enrollment is in gradable status
            if (! in_array($enrollment->status, ['enrolled', 'completed'])) {
                throw new InvalidGradeException("Cannot grade enrollment with status: {$enrollment->status}");
            }

            // Verify instructor authorization
            $courseSection = $enrollment->courseSection;
            $instructor = $courseSection->instructor;
            $isInstructor = $instructor && $instructor->user_id === $submittedByUserId;
            if (! $isInstructor && ! $this->isAdmin($submittedByUserId)) {
                throw new UnauthorizedGradeSubmissionException("User {$submittedByUserId} is not authorized to grade this course section");
            }

            // Check grading deadline (allow admin override)
            if (! $this->isAdmin($submittedByUserId)) {
                $this->enforceGradingDeadline($courseSection);
            }

            $oldGrade = $enrollment->grade;

            // Update enrollment with grade
            $enrollment->update([
                'grade' => $grade,
                'status' => 'completed',
                'completion_date' => $enrollment->completion_date ?? now()->toDateString(),
            ]);

            // Recalculate student's GPA
            $this->recalculateStudentGPA($enrollment->student);

            Log::info('Grade submitted', [
                'enrollment_id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'course_section_id' => $enrollment->course_section_id,
                'old_grade' => $oldGrade,
                'new_grade' => $grade,
                'submitted_by' => $submittedByUserId,
            ]);

            return $enrollment->fresh();
        });
    }

    /**
     * Submit grades for multiple enrollments in bulk
     *
     * @param  array  $grades  Format: ['enrollment_id' => 'grade']
     * @return array ['successful' => int, 'failed' => array]
     */
    public function bulkSubmitGrades(CourseSection $courseSection, array $grades, int $submittedByUserId): array
    {
        $successful = 0;
        $failed = [];

        // Verify authorization once for the whole batch
        $instructor = $courseSection->instructor;
        $isInstructor = $instructor && $instructor->user_id === $submittedByUserId;
        if (! $isInstructor && ! $this->isAdmin($submittedByUserId)) {
            throw new UnauthorizedGradeSubmissionException("User {$submittedByUserId} is not authorized to grade this course section");
        }

        // Check deadline once
        if (! $this->isAdmin($submittedByUserId)) {
            $this->enforceGradingDeadline($courseSection);
        }

        foreach ($grades as $enrollmentId => $grade) {
            try {
                $enrollment = Enrollment::findOrFail($enrollmentId);

                // Verify enrollment belongs to this course section
                if ($enrollment->course_section_id !== $courseSection->id) {
                    throw new InvalidGradeException("Enrollment {$enrollmentId} does not belong to this course section");
                }

                $this->submitGrade($enrollment, $grade, $submittedByUserId);
                $successful++;
            } catch (\Exception $e) {
                $failed[$enrollmentId] = [
                    'grade' => $grade,
                    'error' => $e->getMessage(),
                ];
                Log::warning('Bulk grade submission failed for enrollment', [
                    'enrollment_id' => $enrollmentId,
                    'grade' => $grade,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'successful' => $successful,
            'failed' => $failed,
            'total' => count($grades),
        ];
    }

    /**
     * Request a grade change (requires approval after deadline)
     */
    public function requestGradeChange(Enrollment $enrollment, string $newGrade, string $reason, int $requestedByUserId): GradeChangeRequest
    {
        if (! $this->isValidGrade($newGrade)) {
            throw new InvalidGradeException("Invalid grade: {$newGrade}");
        }

        if (empty($enrollment->grade)) {
            throw new InvalidGradeException('Cannot change grade for enrollment without existing grade. Use submitGrade instead.');
        }

        $gradeChangeRequest = GradeChangeRequest::create([
            'enrollment_id' => $enrollment->id,
            'old_grade' => $enrollment->grade,
            'new_grade' => $newGrade,
            'reason' => $reason,
            'requested_by' => $requestedByUserId,
            'status' => 'pending',
        ]);

        Log::info('Grade change requested', [
            'request_id' => $gradeChangeRequest->id,
            'enrollment_id' => $enrollment->id,
            'old_grade' => $enrollment->grade,
            'new_grade' => $newGrade,
            'requested_by' => $requestedByUserId,
        ]);

        return $gradeChangeRequest;
    }

    /**
     * Approve a grade change request
     */
    public function approveGradeChange(GradeChangeRequest $request, int $approvedByUserId): Enrollment
    {
        return DB::transaction(function () use ($request, $approvedByUserId) {
            if ($request->status !== 'pending') {
                throw new InvalidGradeException('Grade change request is not pending');
            }

            $enrollment = $request->enrollment;

            // Update grade change request
            $request->update([
                'status' => 'approved',
                'approved_by' => $approvedByUserId,
                'approved_at' => now(),
            ]);

            // Submit the new grade
            $this->submitGrade($enrollment, $request->new_grade, $approvedByUserId);

            Log::info('Grade change approved', [
                'request_id' => $request->id,
                'enrollment_id' => $enrollment->id,
                'old_grade' => $request->old_grade,
                'new_grade' => $request->new_grade,
                'approved_by' => $approvedByUserId,
            ]);

            return $enrollment->fresh();
        });
    }

    /**
     * Deny a grade change request
     */
    public function denyGradeChange(GradeChangeRequest $request, int $deniedByUserId, string $denialReason): GradeChangeRequest
    {
        if ($request->status !== 'pending') {
            throw new InvalidGradeException('Grade change request is not pending');
        }

        $request->update([
            'status' => 'denied',
            'approved_by' => $deniedByUserId,
            'approved_at' => now(),
            'denial_reason' => $denialReason,
        ]);

        Log::info('Grade change denied', [
            'request_id' => $request->id,
            'enrollment_id' => $request->enrollment_id,
            'denied_by' => $deniedByUserId,
            'reason' => $denialReason,
        ]);

        return $request->fresh();
    }

    /**
     * Calculate grade distribution for a course section
     */
    public function calculateGradeDistribution(CourseSection $courseSection): array
    {
        $enrollments = $courseSection->enrollments()
            ->whereNotNull('grade')
            ->where('status', 'completed')
            ->get();

        $distribution = [];
        $totalStudents = $enrollments->count();

        foreach (array_keys(self::GRADE_POINTS) as $grade) {
            $count = $enrollments->where('grade', $grade)->count();
            $distribution[$grade] = [
                'count' => $count,
                'percentage' => $totalStudents > 0 ? round(($count / $totalStudents) * 100, 2) : 0,
            ];
        }

        // Calculate average GPA
        $gradedEnrollments = $enrollments->filter(function ($enrollment) {
            return isset(self::GRADE_POINTS[$enrollment->grade]) && self::GRADE_POINTS[$enrollment->grade] !== null;
        });

        $averageGPA = $gradedEnrollments->count() > 0
            ? $gradedEnrollments->avg(function ($enrollment) {
                return self::GRADE_POINTS[$enrollment->grade];
            })
            : 0;

        return [
            'distribution' => $distribution,
            'total_students' => $totalStudents,
            'average_gpa' => round($averageGPA, 2),
            'graded_count' => $enrollments->count(),
            'pending_count' => $courseSection->enrollments()->whereNull('grade')->count(),
        ];
    }

    /**
     * Get grading progress for a course section
     */
    public function getGradingProgress(CourseSection $courseSection): array
    {
        $totalEnrollments = $courseSection->enrollments()
            ->whereIn('status', ['enrolled', 'completed'])
            ->count();

        $gradedEnrollments = $courseSection->enrollments()
            ->whereNotNull('grade')
            ->count();

        $percentage = $totalEnrollments > 0
            ? round(($gradedEnrollments / $totalEnrollments) * 100, 2)
            : 0;

        return [
            'total' => $totalEnrollments,
            'graded' => $gradedEnrollments,
            'pending' => $totalEnrollments - $gradedEnrollments,
            'percentage' => $percentage,
            'is_complete' => $gradedEnrollments === $totalEnrollments && $totalEnrollments > 0,
        ];
    }

    /**
     * Recalculate student's GPA based on all completed enrollments
     */
    private function recalculateStudentGPA(Student $student): float
    {
        $completedEnrollments = $student->enrollments()
            ->where('status', 'completed')
            ->whereNotNull('grade')
            ->with('courseSection.course')
            ->get();

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($completedEnrollments as $enrollment) {
            $grade = $enrollment->grade;
            $gradePoints = self::GRADE_POINTS[$grade] ?? null;

            // Only count grades that have GPA impact
            if ($gradePoints !== null) {
                $credits = $enrollment->courseSection->course->credits;
                $totalPoints += ($gradePoints * $credits);
                $totalCredits += $credits;
            }
        }

        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;

        // Update student's cumulative GPA
        $student->update(['gpa' => $gpa]);

        Log::debug('Student GPA recalculated', [
            'student_id' => $student->id,
            'gpa' => $gpa,
            'total_credits' => $totalCredits,
        ]);

        return $gpa;
    }

    /**
     * Enforce grading deadline for a course section
     *
     * @throws GradingDeadlinePassedException
     */
    private function enforceGradingDeadline(CourseSection $courseSection): void
    {
        $term = $courseSection->term;

        if (! $term->grade_deadline) {
            return; // No deadline set
        }

        $deadline = Carbon::parse($term->grade_deadline);

        if (now()->greaterThan($deadline)) {
            throw new GradingDeadlinePassedException(
                "Grading deadline for {$term->name} has passed ({$deadline->format('Y-m-d')}). ".
                'Grade changes now require approval through the grade change request process.'
            );
        }
    }

    /**
     * Check if a grade is valid
     */
    private function isValidGrade(string $grade): bool
    {
        return array_key_exists($grade, self::GRADE_POINTS);
    }

    /**
     * Check if user is an admin
     */
    private function isAdmin(int $userId): bool
    {
        $user = \App\Models\User::find($userId);

        return $user && $user->hasRole('admin');
    }

    /**
     * Get current term
     */
    private function getCurrentTerm(): Term
    {
        return Term::where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->firstOr(function () {
                // Fallback to most recent term
                return Term::orderBy('start_date', 'desc')->first();
            });
    }

    /**
     * Get all valid grades
     */
    public static function getValidGrades(): array
    {
        return array_keys(self::GRADE_POINTS);
    }

    /**
     * Get grade point value
     */
    public static function getGradePoints(string $grade): ?float
    {
        return self::GRADE_POINTS[$grade] ?? null;
    }
}
