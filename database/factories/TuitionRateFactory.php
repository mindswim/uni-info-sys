<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\Term;
use App\Testing\TermPool;
use Illuminate\Database\Eloquent\Factories\Factory;

class TuitionRateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'term_id' => app()->runningUnitTests() ? TermPool::getOrCreate()->id : Term::factory(),
            'student_type' => $this->faker->randomElement(['domestic', 'international']),
            'enrollment_status' => $this->faker->randomElement(['full_time', 'part_time']),
            'tuition_per_credit' => $this->faker->randomFloat(2, 200, 1500),
            'base_fee' => $this->faker->randomFloat(2, 500, 5000),
            'technology_fee' => $this->faker->randomFloat(2, 50, 300),
            'activity_fee' => $this->faker->randomFloat(2, 25, 200),
            'health_fee' => $this->faker->randomFloat(2, 100, 500),
            'effective_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
            'notes' => null,
        ];
    }
}
