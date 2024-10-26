<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'academic_year' => '2024-2025',
            'semester' => $this->faker->randomElement(['Fall', 'Spring', 'Summer']),
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
