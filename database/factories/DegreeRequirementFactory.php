<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

class DegreeRequirementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'category' => $this->faker->randomElement(['core', 'elective', 'general_education', 'major', 'capstone']),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'required_credit_hours' => $this->faker->randomElement([3, 6, 12, 18, 24, 36]),
            'min_courses' => $this->faker->numberBetween(1, 6),
            'max_courses' => null,
            'min_gpa' => null,
            'allowed_courses' => null,
            'excluded_courses' => null,
            'is_required' => true,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}
