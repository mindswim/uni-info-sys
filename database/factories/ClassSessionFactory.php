<?php

namespace Database\Factories;

use App\Models\ClassSession;
use App\Models\CourseSection;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClassSession>
 */
class ClassSessionFactory extends Factory
{
    protected $model = ClassSession::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $courseSection = CourseSection::inRandomOrder()->first() ?? CourseSection::factory();
        $sessionDate = fake()->dateTimeBetween('-30 days', '+60 days');

        return [
            'course_section_id' => $courseSection,
            'session_number' => fake()->numberBetween(1, 30),
            'session_date' => $sessionDate,
            'start_time' => '09:00',
            'end_time' => '10:15',
            'title' => fake()->optional(0.3)->sentence(3),
            'description' => fake()->optional(0.2)->paragraph(),
            'status' => 'scheduled',
            'cancellation_reason' => null,
            'location_override' => null,
            'substitute_instructor_id' => null,
        ];
    }

    /**
     * Indicate that the session is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'session_date' => fake()->dateTimeBetween('-30 days', '-1 day'),
            'description' => fake()->paragraph(),
        ]);
    }

    /**
     * Indicate that the session is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancellation_reason' => fake()->randomElement([
                'Instructor illness',
                'University closure',
                'Inclement weather',
                'Holiday',
                'Conference attendance',
            ]),
        ]);
    }

    /**
     * Indicate that the session has a substitute instructor.
     */
    public function withSubstitute(): static
    {
        return $this->state(fn (array $attributes) => [
            'substitute_instructor_id' => Staff::inRandomOrder()->first()?->id ?? Staff::factory(),
        ]);
    }

    /**
     * Indicate that the session has a location override.
     */
    public function withLocationOverride(): static
    {
        return $this->state(fn (array $attributes) => [
            'location_override' => fake()->randomElement([
                'Online - Zoom',
                'Library Room 101',
                'Auditorium A',
                'Lab Building 205',
            ]),
        ]);
    }

    /**
     * Set the session to happen today.
     */
    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'session_date' => now()->toDateString(),
        ]);
    }

    /**
     * Set the session to be in the future.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'session_date' => fake()->dateTimeBetween('+1 day', '+30 days'),
            'status' => 'scheduled',
        ]);
    }

    /**
     * Set the session to be in the past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'session_date' => fake()->dateTimeBetween('-60 days', '-1 day'),
        ]);
    }
}
