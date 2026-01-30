<?php

namespace App\Services;

use App\Models\AssignmentSubmission;
use App\Models\SubmissionRubricScore;
use Illuminate\Support\Facades\DB;

class RubricGradingService
{
    public function scoreSubmission(AssignmentSubmission $submission, array $criteriaScores): AssignmentSubmission
    {
        return DB::transaction(function () use ($submission, $criteriaScores) {
            // Delete existing scores
            $submission->rubricScores()->delete();

            $totalPoints = 0;

            foreach ($criteriaScores as $score) {
                SubmissionRubricScore::create([
                    'assignment_submission_id' => $submission->id,
                    'rubric_criteria_id' => $score['rubric_criteria_id'],
                    'rubric_level_id' => $score['rubric_level_id'] ?? null,
                    'points_awarded' => $score['points_awarded'],
                    'feedback' => $score['feedback'] ?? null,
                ]);

                $totalPoints += $score['points_awarded'];
            }

            // Update the submission score
            $submission->update([
                'score' => $totalPoints,
                'final_score' => $totalPoints,
                'status' => 'graded',
                'graded_at' => now(),
            ]);

            return $submission->fresh(['rubricScores.criteria', 'rubricScores.level']);
        });
    }

    public function getRubricResults(AssignmentSubmission $submission): array
    {
        $scores = $submission->rubricScores()
            ->with(['criteria', 'level'])
            ->get();

        $totalAwarded = $scores->sum('points_awarded');
        $maxPoints = $submission->assignment->rubric?->max_points ?? 0;

        return [
            'scores' => $scores,
            'total_awarded' => $totalAwarded,
            'max_points' => $maxPoints,
            'percentage' => $maxPoints > 0 ? round(($totalAwarded / $maxPoints) * 100, 2) : 0,
        ];
    }
}
