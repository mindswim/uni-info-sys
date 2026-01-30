<?php

namespace Database\Factories;

use App\Models\Hold;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HoldFactory extends Factory
{
    protected $model = Hold::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'type' => $this->faker->randomElement([
                Hold::TYPE_REGISTRATION,
                Hold::TYPE_FINANCIAL,
                Hold::TYPE_ACADEMIC,
                Hold::TYPE_ADMINISTRATIVE,
            ]),
            'reason' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'severity' => $this->faker->randomElement([
                Hold::SEVERITY_INFO,
                Hold::SEVERITY_WARNING,
                Hold::SEVERITY_CRITICAL,
            ]),
            'prevents_registration' => false,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => User::factory(),
            'department' => $this->faker->randomElement(['financial_aid', 'registrar', 'library']),
            'placed_at' => now(),
        ];
    }

    public function financial(): static
    {
        return $this->state(fn () => [
            'type' => Hold::TYPE_FINANCIAL,
            'prevents_graduation' => true,
        ]);
    }

    public function library(): static
    {
        return $this->state(fn () => [
            'type' => Hold::TYPE_LIBRARY,
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'resolved_at' => now(),
            'resolved_by' => User::factory(),
            'resolution_notes' => 'Resolved',
        ]);
    }
}
