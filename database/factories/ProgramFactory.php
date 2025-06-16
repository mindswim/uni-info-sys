<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProgramFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Computer Science',
                'Business Administration',
                'Data Science',
                'Electrical Engineering',
                'Psychology',
                'Medicine'
            ]),
            'department_id' => Department::factory(),
            'degree_level' => $this->faker->randomElement(['Bachelor', 'Master', 'PhD']),
            'duration' => $this->faker->numberBetween(1, 5),
            'description' => $this->faker->paragraph(),
            'requirements' => $this->faker->paragraph(),
            'capacity' => $this->faker->numberBetween(30, 200)
        ];
    }
}
