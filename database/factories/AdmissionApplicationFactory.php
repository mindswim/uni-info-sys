<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'term_id' => Term::factory(),
            'status' => $this->faker->randomElement(['draft', 'submitted', 'under_review', 'accepted', 'rejected']),
            'application_date' => now(),
            'decision_date' => null,
            'decision_status' => null,
            'comments' => null
        ];
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
}
