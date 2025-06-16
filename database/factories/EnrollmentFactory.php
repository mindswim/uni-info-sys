<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Student;
use App\Models\CourseSection;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enrollment>
 */
class EnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory()->for(User::factory()),
            'course_section_id' => CourseSection::factory(),
            'enrollment_date' => $this->faker->dateTimeThisYear(),
            'status' => $this->faker->randomElement(['enrolled', 'waitlisted', 'completed', 'withdrawn']),
            'grade' => $this->faker->optional(0.7)->randomElement(['A', 'B', 'C', 'D', 'F']),
        ];
    }
}
