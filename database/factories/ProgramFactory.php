<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProgramFactory extends Factory
{
    public function definition(): array
    {
        $degree = $this->faker->randomElement(['B.Sc.', 'B.A.', 'M.Sc.', 'M.A.', 'Ph.D.']);
        $subject = $this->faker->jobTitle(); // Using jobTitle for more variety
        
        return [
            'name' => $this->faker->unique()->name(),
            'department_id' => Department::factory(),
            'degree_level' => $this->faker->randomElement(['Bachelors', 'Masters', 'Doctorate']),
            'duration' => $this->faker->numberBetween(1, 5),
            'description' => $this->faker->paragraph(),
            'requirements' => $this->faker->paragraph(),
            'capacity' => $this->faker->numberBetween(30, 200)
        ];
    }
}
