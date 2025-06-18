<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicRecord>
 */
class AcademicRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $schools = [
            'Lincoln High School', 'Washington High School', 'Roosevelt High School',
            'Jefferson High School', 'Madison High School', 'Monroe High School',
            'Jackson High School', 'Adams High School', 'Kennedy High School',
            'Wilson High School', 'Franklin High School', 'Hamilton High School'
        ];

        $subjects = [
            'Mathematics', 'English', 'Science', 'History', 'Chemistry', 'Physics',
            'Biology', 'Literature', 'Foreign Language', 'Computer Science',
            'Art', 'Music', 'Physical Education', 'Social Studies'
        ];

        return [
            'student_id' => Student::factory(),
            'institution_name' => $this->faker->randomElement($schools),
            'qualification_type' => $this->faker->randomElement(['High School Diploma', 'Associate Degree', 'Bachelor Degree', 'Master Degree', 'Doctorate']),
            'gpa' => $this->faker->randomFloat(2, 2.0, 4.0),
            'start_date' => $this->faker->dateTimeBetween('-8 years', '-2 years')->format('Y-m-d'),
            'end_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'transcript_url' => $this->faker->optional(0.7)->url(),
            'verified' => $this->faker->boolean(80), // 80% verified
        ];
    }
}
