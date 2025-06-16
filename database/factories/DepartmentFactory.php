<?php

namespace Database\Factories;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'faculty_id' => Faculty::factory(),
            'name' => $this->faker->randomElement([
                'Computer Science',
                'Electrical Engineering',
                'Mechanical Engineering',
                'Mathematics',
                'Physics',
                'Chemistry',
                'Biology',
                'Economics',
                'Psychology',
                'History',
                'English Literature',
                'Business Administration',
                'Marketing',
                'Finance'
            ]),
        ];
    }

    public function computerScience(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Computer Science',
        ]);
    }

    public function engineering(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Electrical Engineering',
        ]);
    }

    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Business Administration',
        ]);
    }
}
