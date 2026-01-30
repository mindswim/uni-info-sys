<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\CourseSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assignment>
 */
class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(Assignment::TYPES);
        $dueDate = fake()->dateTimeBetween('+1 day', '+30 days');
        $availableFrom = fake()->optional(0.7)->dateTimeBetween('-7 days', $dueDate);

        return [
            'course_section_id' => CourseSection::factory(),
            'title' => $this->generateTitle($type),
            'description' => fake()->optional(0.8)->paragraph(),
            'type' => $type,
            'due_date' => $dueDate,
            'available_from' => $availableFrom,
            'max_points' => fake()->randomElement([10, 20, 25, 50, 100]),
            'weight' => fake()->optional(0.6)->randomFloat(2, 5, 30),
            'passing_score' => fake()->optional(0.3)->randomFloat(2, 50, 70),
            'allows_late' => fake()->boolean(80),
            'late_penalty_per_day' => fake()->randomElement([5, 10, 15, 20]),
            'max_late_days' => fake()->optional(0.5)->numberBetween(1, 7),
            'instructions_file' => null,
            'is_published' => fake()->boolean(70),
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }

    /**
     * Generate a realistic title based on assignment type
     */
    private function generateTitle(string $type): string
    {
        $titles = [
            'homework' => [
                'Homework '.fake()->numberBetween(1, 10),
                'Problem Set '.fake()->numberBetween(1, 10),
                'Chapter '.fake()->numberBetween(1, 15).' Exercises',
                'Weekly Assignment '.fake()->numberBetween(1, 15),
            ],
            'quiz' => [
                'Quiz '.fake()->numberBetween(1, 10),
                'Pop Quiz',
                'Reading Quiz - Chapter '.fake()->numberBetween(1, 15),
                'Concept Check '.fake()->numberBetween(1, 10),
            ],
            'exam' => [
                'Exam '.fake()->numberBetween(1, 3),
                'Unit '.fake()->numberBetween(1, 5).' Exam',
                'Comprehensive Exam',
            ],
            'midterm' => [
                'Midterm Exam',
                'Midterm Examination',
                'Mid-Semester Exam',
            ],
            'final' => [
                'Final Exam',
                'Final Examination',
                'Comprehensive Final',
            ],
            'project' => [
                'Course Project',
                'Group Project',
                'Research Project',
                'Final Project',
                'Term Project',
            ],
            'paper' => [
                'Research Paper',
                'Term Paper',
                'Essay Assignment',
                'Literature Review',
                'Analysis Paper',
            ],
            'presentation' => [
                'Class Presentation',
                'Group Presentation',
                'Research Presentation',
                'Final Presentation',
            ],
            'lab' => [
                'Lab '.fake()->numberBetween(1, 12),
                'Laboratory Report '.fake()->numberBetween(1, 12),
                'Practical Exercise '.fake()->numberBetween(1, 10),
            ],
            'participation' => [
                'Class Participation',
                'Discussion Participation',
                'Weekly Participation',
            ],
            'other' => [
                'Extra Credit Assignment',
                'Bonus Assignment',
                'Special Assignment',
            ],
        ];

        return fake()->randomElement($titles[$type] ?? $titles['other']);
    }

    /**
     * Assignment is published
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    /**
     * Assignment is unpublished (draft)
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Assignment is past due
     */
    public function pastDue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-30 days', '-1 day'),
            'available_from' => fake()->dateTimeBetween('-60 days', '-31 days'),
            'is_published' => true,
        ]);
    }

    /**
     * Assignment is due soon (within 3 days)
     */
    public function dueSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('+1 hour', '+3 days'),
            'available_from' => fake()->dateTimeBetween('-7 days', '-1 day'),
            'is_published' => true,
        ]);
    }

    /**
     * Assignment is available now
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'available_from' => fake()->dateTimeBetween('-7 days', '-1 hour'),
            'due_date' => fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }

    /**
     * Assignment doesn't allow late submissions
     */
    public function noLateSubmissions(): static
    {
        return $this->state(fn (array $attributes) => [
            'allows_late' => false,
        ]);
    }

    /**
     * Homework type
     */
    public function homework(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'homework',
            'title' => $this->generateTitle('homework'),
            'max_points' => fake()->randomElement([10, 20, 25]),
            'weight' => fake()->randomFloat(2, 2, 10),
        ]);
    }

    /**
     * Exam type
     */
    public function exam(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'exam',
            'title' => $this->generateTitle('exam'),
            'max_points' => 100,
            'weight' => fake()->randomFloat(2, 15, 25),
            'allows_late' => false,
        ]);
    }

    /**
     * Midterm type
     */
    public function midterm(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'midterm',
            'title' => 'Midterm Exam',
            'max_points' => 100,
            'weight' => fake()->randomFloat(2, 20, 30),
            'allows_late' => false,
        ]);
    }

    /**
     * Final exam type
     */
    public function final(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'final',
            'title' => 'Final Exam',
            'max_points' => 100,
            'weight' => fake()->randomFloat(2, 25, 40),
            'allows_late' => false,
        ]);
    }

    /**
     * Project type
     */
    public function project(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'project',
            'title' => $this->generateTitle('project'),
            'max_points' => 100,
            'weight' => fake()->randomFloat(2, 15, 30),
        ]);
    }

    /**
     * Quiz type
     */
    public function quiz(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'quiz',
            'title' => $this->generateTitle('quiz'),
            'max_points' => fake()->randomElement([10, 15, 20]),
            'weight' => fake()->randomFloat(2, 2, 5),
        ]);
    }
}
