<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Department;
use App\Models\Faculty;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'department_id' => Department::factory()->for(Faculty::factory()),
            'job_title' => $this->faker->jobTitle,
            'bio' => $this->faker->paragraph,
            'office_location' => 'Building ' . $this->faker->buildingNumber . ', Room ' . $this->faker->randomNumber(3),
        ];
    }
}
