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
        $startTime = $this->faker->randomElement(['09:00:00', '11:00:00', '13:00:00', '15:00:00']);
        $endTime = Carbon::createFromTimeString($startTime)->addHours($this->faker->randomElement([1, 2]))->toTimeString();

        $scheduleDays = $this->faker->randomElement([
            ['Monday', 'Wednesday', 'Friday'],
            ['Tuesday', 'Thursday'],
        ]);

        return [
            'course_id' => Course::factory(),
            'term_id' => Term::factory(),
            'instructor_id' => Staff::factory(),
            'room_id' => Room::factory(),
            'section_number' => $this->faker->randomElement(['001', '002', 'A', 'B', 'C']),
            'capacity' => $this->faker->numberBetween(20, 150),
            'status' => 'open',
            'schedule_days' => $scheduleDays,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }
}
