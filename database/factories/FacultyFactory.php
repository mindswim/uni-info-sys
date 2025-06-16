<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Faculty>
 */
class FacultyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Faculty of Engineering',
                'Faculty of Science',
                'Faculty of Arts',
                'Faculty of Business',
                'Faculty of Medicine',
                'Faculty of Law',
                'Faculty of Education',
                'Faculty of Social Sciences'
            ]),
        ];
    }

    public function engineering(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Faculty of Engineering',
        ]);
    }

    public function science(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Faculty of Science',
        ]);
    }

    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Faculty of Business',
        ]);
    }
}
