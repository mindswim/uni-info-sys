<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Department;
use App\Models\Faculty;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => Department::factory()->for(Faculty::factory()),
            'course_code' => strtoupper($this->faker->unique()->bothify('???####')),
            'title' => $this->faker->bs() . ' ' . $this->faker->word(),
            'description' => $this->faker->paragraph,
            'credits' => $this->faker->randomElement([1, 2, 3, 4]),
        ];
    }
}
