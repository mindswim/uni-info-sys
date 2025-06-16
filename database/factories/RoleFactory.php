<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement(['admin', 'student', 'moderator', 'staff', 'guest']),
            'description' => $this->faker->sentence(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'admin',
            'description' => 'Administrator with full system access',
        ]);
    }

    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'student',
            'description' => 'Student with limited access to own data',
        ]);
    }
}
