<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\GradeChangeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeChangeRequestFactory extends Factory
{
    protected $model = GradeChangeRequest::class;

    public function definition(): array
    {
        return [
            'enrollment_id' => Enrollment::factory(),
            'old_grade' => $this->faker->randomElement(['C', 'D', 'F']),
            'new_grade' => $this->faker->randomElement(['A', 'B', 'C']),
            'reason' => $this->faker->sentence(),
            'requested_by' => User::factory(),
            'status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
            'approved_by' => User::factory(),
            'approved_at' => now(),
        ]);
    }

    public function denied(): static
    {
        return $this->state(fn () => [
            'status' => 'denied',
            'approved_by' => User::factory(),
            'approved_at' => now(),
            'denial_reason' => $this->faker->sentence(),
        ]);
    }
}
