<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Course;
use App\Models\Term;
use App\Models\Staff;
use App\Models\Room;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseSection>
 */
class CourseSectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTimes = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'];
        $startTime = $this->faker->randomElement($startTimes);
        $duration = $this->faker->randomElement([1, 1.5, 2, 2.5, 3]); // More realistic class durations
        $endTime = Carbon::createFromTimeString($startTime)->addHours($duration)->toTimeString();

        $scheduleDays = $this->faker->randomElement([
            ['Monday', 'Wednesday', 'Friday'],
            ['Tuesday', 'Thursday'],
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Daily classes
            ['Saturday'], // Weekend classes
            ['Monday', 'Wednesday'], // Two days per week
            ['Tuesday', 'Thursday', 'Friday'] // Three days per week
        ]);

        // Create some variety in capacity including small seminars and large lectures
        $capacity = $this->faker->randomElement([
            $this->faker->numberBetween(8, 15),   // Small seminars
            $this->faker->numberBetween(15, 30),  // Normal classes
            $this->faker->numberBetween(30, 50),  // Medium classes
            $this->faker->numberBetween(50, 100), // Large classes
            $this->faker->numberBetween(100, 300) // Lecture halls
        ]);

        // Include some closed/full sections for edge case testing
        $status = $this->faker->randomElement(['open', 'open', 'open', 'open', 'closed', 'cancelled']);

        return [
            'course_id' => Course::factory(),
            'term_id' => Term::factory(),
            'instructor_id' => Staff::factory(),
            'room_id' => Room::factory(),
            'section_number' => $this->faker->randomElement(['001', '002', '003', '004', 'A', 'B', 'C', 'D', 'LAB']),
            'capacity' => $capacity,
            'status' => $status,
            'schedule_days' => $scheduleDays,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }

    /**
     * Create a full course section (for testing waitlists)
     */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open', // Will be set to closed programmatically when full
            'capacity' => $this->faker->numberBetween(15, 30), // Smaller capacity to fill easier
        ]);
    }

    /**
     * Create a closed course section
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
        ]);
    }
}
