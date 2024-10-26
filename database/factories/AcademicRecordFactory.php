<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'institution_name' => $this->faker->company() . ' University',
            'qualification_type' => $this->faker->randomElement([
                'High School Diploma',
                'Bachelor Degree',
                'Master Degree',
                'PhD',
                'Associate Degree'
            ]),
            'start_date' => $this->faker->dateTimeBetween('-6 years', '-3 years'),
            'end_date' => $this->faker->dateTimeBetween('-2 years', '+1 year'),
            'gpa' => $this->faker->randomFloat(2, 2.0, 4.0),
            'transcript_url' => $this->faker->optional()->url(),
            'verified' => $this->faker->boolean(),
        ];
    }

    /**
     * Indicate that the academic record is verified.
     */
    public function verified()
    {
        return $this->state(fn (array $attributes) => [
            'verified' => true,
        ]);
    }

    /**
     * Indicate that the academic record is unverified.
     */
    public function unverified()
    {
        return $this->state(fn (array $attributes) => [
            'verified' => false,
        ]);
    }
}
