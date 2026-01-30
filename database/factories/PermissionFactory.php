<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Permission>
 */
class PermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'manage-applications',
                'submit-documents',
                'view-own-data',
                'manage-users',
                'view-reports',
                'approve-applications',
                'delete-documents',
            ]),
            'description' => $this->faker->sentence(),
        ];
    }

    public function manageApplications(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'manage-applications',
            'description' => 'Can manage student applications',
        ]);
    }

    public function submitDocuments(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'submit-documents',
            'description' => 'Can submit documents',
        ]);
    }

    public function viewOwnData(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'view-own-data',
            'description' => 'Can view own data',
        ]);
    }
}
