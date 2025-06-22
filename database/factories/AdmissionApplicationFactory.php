<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Term;
use App\Testing\TermPool;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'term_id' => $this->getTermId(),
            'status' => $this->faker->randomElement(['draft', 'submitted', 'under_review', 'accepted', 'rejected']),
            'application_date' => now(),
            'decision_date' => null,
            'decision_status' => null,
            'comments' => null
        ];
    }

    /**
     * Get term ID using appropriate strategy based on environment
     */
    private function getTermId(): int
    {
        // In testing: Use TermPool for deterministic, collision-free term creation
        if (app()->runningUnitTests()) {
            return TermPool::getOrCreate()->id;
        }

        // In production/development: Create new terms as needed
        return Term::factory()->create()->id;
    }

    public function draft(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'draft',
                'decision_date' => null,
                'decision_status' => null
            ];
        });
    }

    public function submitted(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'submitted',
                'application_date' => now(),
                'decision_date' => null,
                'decision_status' => null
            ];
        });
    }

    /**
     * Use a specific term (useful for related data in tests)
     */
    public function forTerm(Term $term): self
    {
        return $this->state(['term_id' => $term->id]);
    }

    /**
     * Use a specific student (useful for authorization tests)
     */
    public function forStudent(Student $student): self
    {
        return $this->state(['student_id' => $student->id]);
    }
}
