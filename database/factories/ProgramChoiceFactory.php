<?php

namespace Database\Factories;

use App\Models\AdmissionApplication;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProgramChoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'application_id' => AdmissionApplication::factory(),
            'program_id' => Program::factory(),
            'preference_order' => $this->faker->numberBetween(1, 5), // Remove unique() - multiple applications can have same preference order
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected'])
        ];
    }

    public function pending(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending'
        ]);
    }

    public function accepted(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted'
        ]);
    }

    public function rejected(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected'
        ]);
    }

    public function forPreferenceOrder(int $order): self
    {
        return $this->state(fn (array $attributes) => [
            'preference_order' => $order
        ]);
    }
}
