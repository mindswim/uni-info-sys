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
        static $departmentIndex = 0;
        $departments = [
            'Computer Science' => 'CS',
            'Electrical Engineering' => 'EE',
            'Mechanical Engineering' => 'ME',
            'Mathematics' => 'MATH',
            'Physics' => 'PHYS',
            'Chemistry' => 'CHEM',
            'Biology' => 'BIO',
            'Economics' => 'ECON',
            'Psychology' => 'PSYC',
            'History' => 'HIST',
            'English Literature' => 'ENGL',
            'Business Administration' => 'BUS',
            'Marketing' => 'MKT',
            'Finance' => 'FIN',
        ];

        $keys = array_keys($departments);
        $name = $keys[$departmentIndex % count($keys)];
        $code = $departments[$name].($departmentIndex > 13 ? '_'.($departmentIndex - 13) : '');
        $departmentIndex++;

        return [
            'faculty_id' => Faculty::factory(),
            'name' => $name.($departmentIndex > 14 ? ' '.($departmentIndex - 14) : ''),
            'code' => $code,
        ];
    }

    public function computerScience(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Computer Science',
            'code' => 'CS',
        ]);
    }

    public function engineering(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Electrical Engineering',
            'code' => 'EE',
        ]);
    }

    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Business Administration',
            'code' => 'BUS',
        ]);
    }
}
