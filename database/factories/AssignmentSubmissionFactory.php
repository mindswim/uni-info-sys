<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssignmentSubmission>
 */
class AssignmentSubmissionFactory extends Factory
{
    protected $model = AssignmentSubmission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['submitted', 'graded']);
        $lateDays = $this->faker->randomElement([0, 0, 0, 0, 1, 2, 3]); // Mostly on-time

        return [
            'assignment_id' => Assignment::factory(),
            'enrollment_id' => Enrollment::factory(),
            'submitted_at' => $this->faker->dateTimeBetween('-2 weeks', 'now'),
            'content' => $this->faker->optional(0.7)->paragraphs(3, true),
            'file_path' => $this->faker->optional(0.3)->filePath(),
            'file_name' => function (array $attributes) {
                if ($attributes['file_path']) {
                    return $this->faker->word().'_submission.'.$this->faker->randomElement(['pdf', 'docx', 'txt']);
                }

                return null;
            },
            'status' => $status,
            'late_days' => $lateDays,
            'attempt_number' => 1,
        ];
    }

    /**
     * Indicate the submission is not started.
     */
    public function notStarted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'not_started',
            'submitted_at' => null,
            'content' => null,
            'file_path' => null,
            'file_name' => null,
            'score' => null,
            'feedback' => null,
            'graded_at' => null,
            'graded_by' => null,
            'late_days' => 0,
            'late_penalty_applied' => 0,
            'final_score' => null,
        ]);
    }

    /**
     * Indicate the submission is in progress (draft).
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'submitted_at' => null,
            'content' => $this->faker->paragraphs(2, true),
            'score' => null,
            'feedback' => null,
            'graded_at' => null,
            'graded_by' => null,
            'late_days' => 0,
            'late_penalty_applied' => 0,
            'final_score' => null,
        ]);
    }

    /**
     * Indicate the submission is submitted (pending grading).
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted',
            'submitted_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'content' => $this->faker->paragraphs(3, true),
            'score' => null,
            'feedback' => null,
            'graded_at' => null,
            'graded_by' => null,
            'late_days' => 0,
            'late_penalty_applied' => 0,
            'final_score' => null,
        ]);
    }

    /**
     * Indicate the submission is late.
     */
    public function late(): static
    {
        $lateDays = $this->faker->numberBetween(1, 5);

        return $this->state(fn (array $attributes) => [
            'status' => 'late',
            'submitted_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'content' => $this->faker->paragraphs(3, true),
            'late_days' => $lateDays,
            'score' => null,
            'feedback' => null,
            'graded_at' => null,
            'graded_by' => null,
            'late_penalty_applied' => 0,
            'final_score' => null,
        ]);
    }

    /**
     * Indicate the submission is graded.
     */
    public function graded(): static
    {
        return $this->state(function (array $attributes) {
            $score = $this->faker->randomFloat(2, 50, 100);
            $lateDays = $attributes['late_days'] ?? 0;
            $latePenalty = $lateDays * 5; // 5% per day
            $finalScore = max(0, $score - ($score * $latePenalty / 100));

            return [
                'status' => 'graded',
                'score' => $score,
                'feedback' => $this->faker->optional(0.8)->paragraph(),
                'graded_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
                'graded_by' => Staff::factory(),
                'late_penalty_applied' => $latePenalty,
                'final_score' => round($finalScore, 2),
            ];
        });
    }

    /**
     * Indicate the submission is returned for revision.
     */
    public function returned(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'returned',
                'score' => $this->faker->randomFloat(2, 40, 80),
                'feedback' => 'Please revise: '.$this->faker->sentence(),
                'graded_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
                'graded_by' => Staff::factory(),
            ];
        });
    }

    /**
     * Indicate this is a resubmission (attempt > 1).
     */
    public function resubmission(int $attemptNumber = 2): static
    {
        return $this->state(fn (array $attributes) => [
            'attempt_number' => $attemptNumber,
        ]);
    }

    /**
     * Mark submission as on time.
     */
    public function onTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'late_days' => 0,
            'late_penalty_applied' => 0,
        ]);
    }

    /**
     * Set a specific score for the submission.
     */
    public function withScore(float $score): static
    {
        return $this->state(function (array $attributes) use ($score) {
            $lateDays = $attributes['late_days'] ?? 0;
            $latePenalty = $lateDays * 5;
            $finalScore = max(0, $score - ($score * $latePenalty / 100));

            return [
                'score' => $score,
                'final_score' => round($finalScore, 2),
                'late_penalty_applied' => $latePenalty,
            ];
        });
    }

    /**
     * Create a submission for a specific assignment and enrollment.
     */
    public function forAssignmentAndEnrollment(Assignment $assignment, Enrollment $enrollment): static
    {
        return $this->state(fn (array $attributes) => [
            'assignment_id' => $assignment->id,
            'enrollment_id' => $enrollment->id,
        ]);
    }
}
