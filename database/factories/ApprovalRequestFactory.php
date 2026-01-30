<?php

namespace Database\Factories;

use App\Models\ApprovalRequest;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApprovalRequestFactory extends Factory
{
    protected $model = ApprovalRequest::class;

    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement([
                ApprovalRequest::TYPE_SECTION_OFFERING,
                ApprovalRequest::TYPE_ENROLLMENT_OVERRIDE,
            ]),
            'requestable_type' => CourseSection::class,
            'requestable_id' => CourseSection::factory(),
            'department_id' => Department::factory(),
            'requested_by' => Staff::factory(),
            'status' => 'pending',
            'notes' => $this->faker->optional()->sentence(),
            'metadata' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
            'approved_by' => Staff::factory(),
            'approved_at' => now(),
        ]);
    }

    public function denied(): static
    {
        return $this->state(fn () => [
            'status' => 'denied',
            'approved_by' => Staff::factory(),
            'approved_at' => now(),
            'denial_reason' => $this->faker->sentence(),
        ]);
    }
}
