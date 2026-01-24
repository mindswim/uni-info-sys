<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;

class AssignmentSubmissionService
{
    /**
     * Submit an assignment for a student
     */
    public function submit(
        Assignment $assignment,
        Enrollment $enrollment,
        array $data
    ): AssignmentSubmission {
        // Validate enrollment is for the same course section
        if ($enrollment->course_section_id !== $assignment->course_section_id) {
            throw new \InvalidArgumentException(
                'Enrollment does not match assignment course section.'
            );
        }

        // Check if assignment is available
        if (!$assignment->isAvailable()) {
            throw new \InvalidArgumentException(
                'Assignment is not available for submission.'
            );
        }

        // Check if late submissions are allowed
        $daysLate = $assignment->getDaysLate();
        if ($daysLate > 0 && !$assignment->acceptsLateSubmissions()) {
            throw new \InvalidArgumentException(
                'Late submissions are not accepted for this assignment.'
            );
        }

        // Get the next attempt number
        $attemptNumber = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('enrollment_id', $enrollment->id)
            ->max('attempt_number') ?? 0;
        $attemptNumber++;

        // Determine status based on whether it's late
        $status = $daysLate > 0 ? 'late' : 'submitted';

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $enrollment->id,
            'submitted_at' => now(),
            'content' => $data['content'] ?? null,
            'file_path' => $data['file_path'] ?? null,
            'file_name' => $data['file_name'] ?? null,
            'status' => $status,
            'late_days' => $daysLate,
            'attempt_number' => $attemptNumber,
        ]);

        return $submission->fresh();
    }

    /**
     * Save a draft submission (not yet submitted)
     */
    public function saveDraft(
        Assignment $assignment,
        Enrollment $enrollment,
        array $data
    ): AssignmentSubmission {
        // Find existing draft or create new one
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('enrollment_id', $enrollment->id)
            ->whereIn('status', ['not_started', 'in_progress'])
            ->first();

        if ($submission) {
            $submission->update([
                'content' => $data['content'] ?? $submission->content,
                'file_path' => $data['file_path'] ?? $submission->file_path,
                'file_name' => $data['file_name'] ?? $submission->file_name,
                'status' => 'in_progress',
            ]);
            return $submission->fresh();
        }

        // Get the next attempt number
        $attemptNumber = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('enrollment_id', $enrollment->id)
            ->max('attempt_number') ?? 0;
        $attemptNumber++;

        return AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $enrollment->id,
            'content' => $data['content'] ?? null,
            'file_path' => $data['file_path'] ?? null,
            'file_name' => $data['file_name'] ?? null,
            'status' => 'in_progress',
            'attempt_number' => $attemptNumber,
        ]);
    }

    /**
     * Grade a submission
     */
    public function grade(
        AssignmentSubmission $submission,
        float $score,
        Staff $grader,
        ?string $feedback = null
    ): AssignmentSubmission {
        if (!$submission->isSubmitted()) {
            throw new \InvalidArgumentException(
                'Cannot grade a submission that has not been submitted.'
            );
        }

        $assignment = $submission->assignment;

        // Validate score doesn't exceed max points
        if ($score > $assignment->max_points) {
            throw new \InvalidArgumentException(
                "Score cannot exceed maximum points ({$assignment->max_points})."
            );
        }

        if ($score < 0) {
            throw new \InvalidArgumentException('Score cannot be negative.');
        }

        // Calculate late penalty and final score
        $latePenalty = $assignment->calculateLatePenalty($submission->late_days);
        $finalScore = $assignment->calculateFinalScore($score, $submission->late_days);

        $submission->update([
            'score' => $score,
            'feedback' => $feedback,
            'graded_at' => now(),
            'graded_by' => $grader->id,
            'late_penalty_applied' => $latePenalty,
            'final_score' => $finalScore,
            'status' => 'graded',
        ]);

        return $submission->fresh();
    }

    /**
     * Return a graded submission for revision
     */
    public function returnForRevision(
        AssignmentSubmission $submission,
        string $feedback
    ): AssignmentSubmission {
        if (!$submission->isGraded()) {
            throw new \InvalidArgumentException(
                'Can only return graded submissions for revision.'
            );
        }

        $submission->update([
            'status' => 'returned',
            'feedback' => $feedback,
        ]);

        return $submission->fresh();
    }

    /**
     * Resubmit a returned submission
     */
    public function resubmit(
        AssignmentSubmission $submission,
        array $data
    ): AssignmentSubmission {
        if ($submission->status !== 'returned') {
            throw new \InvalidArgumentException(
                'Can only resubmit returned submissions.'
            );
        }

        $assignment = $submission->assignment;
        $daysLate = $assignment->getDaysLate();

        $submission->update([
            'content' => $data['content'] ?? $submission->content,
            'file_path' => $data['file_path'] ?? $submission->file_path,
            'file_name' => $data['file_name'] ?? $submission->file_name,
            'submitted_at' => now(),
            'status' => $daysLate > 0 ? 'late' : 'submitted',
            'late_days' => $daysLate,
            // Clear grading fields for re-grading
            'score' => null,
            'final_score' => null,
            'late_penalty_applied' => 0,
            'graded_at' => null,
            'graded_by' => null,
        ]);

        return $submission->fresh();
    }

    /**
     * Batch grade submissions
     */
    public function batchGrade(
        array $grades,
        Staff $grader
    ): array {
        $results = [];

        DB::transaction(function () use ($grades, $grader, &$results) {
            foreach ($grades as $gradeData) {
                $submission = AssignmentSubmission::find($gradeData['submission_id']);

                if (!$submission) {
                    $results[] = [
                        'submission_id' => $gradeData['submission_id'],
                        'success' => false,
                        'error' => 'Submission not found.',
                    ];
                    continue;
                }

                try {
                    $this->grade(
                        $submission,
                        $gradeData['score'],
                        $grader,
                        $gradeData['feedback'] ?? null
                    );
                    $results[] = [
                        'submission_id' => $gradeData['submission_id'],
                        'success' => true,
                    ];
                } catch (\Exception $e) {
                    $results[] = [
                        'submission_id' => $gradeData['submission_id'],
                        'success' => false,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        });

        return $results;
    }

    /**
     * Get submission statistics for an assignment
     */
    public function getAssignmentStats(Assignment $assignment): array
    {
        $submissions = $assignment->submissions;

        $gradedSubmissions = $submissions->where('status', 'graded');
        $scores = $gradedSubmissions->pluck('final_score')->filter();

        return [
            'total_submissions' => $submissions->count(),
            'submitted' => $submissions->whereIn('status', ['submitted', 'late'])->count(),
            'graded' => $gradedSubmissions->count(),
            'returned' => $submissions->where('status', 'returned')->count(),
            'late' => $submissions->where('late_days', '>', 0)->count(),
            'average_score' => $scores->isNotEmpty() ? round($scores->avg(), 2) : null,
            'median_score' => $scores->isNotEmpty() ? round($scores->median(), 2) : null,
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'passing_count' => $gradedSubmissions->filter(fn($s) => $s->isPassing())->count(),
        ];
    }

    /**
     * Get student's submission for an assignment
     */
    public function getStudentSubmission(
        Assignment $assignment,
        Enrollment $enrollment,
        ?int $attemptNumber = null
    ): ?AssignmentSubmission {
        $query = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('enrollment_id', $enrollment->id);

        if ($attemptNumber !== null) {
            return $query->where('attempt_number', $attemptNumber)->first();
        }

        // Return the latest attempt
        return $query->orderByDesc('attempt_number')->first();
    }
}
