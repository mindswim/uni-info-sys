<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $courseTitles = [
            'Introduction to Computer Science', 'Data Structures and Algorithms', 'Database Systems',
            'Software Engineering', 'Web Development', 'Machine Learning', 'Artificial Intelligence',
            'Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics', 'Discrete Mathematics',
            'General Chemistry', 'Organic Chemistry', 'Physics I', 'Physics II', 'Biology',
            'English Composition', 'Literature and Writing', 'Public Speaking', 'Critical Thinking',
            'Microeconomics', 'Macroeconomics', 'Business Management', 'Marketing Principles',
            'Psychology 101', 'Sociology', 'Political Science', 'History of Civilization',
            'Art History', 'Music Theory', 'Philosophy', 'Ethics and Moral Reasoning',
        ];

        $title = $this->faker->randomElement($courseTitles);
        $level = $this->faker->randomElement(['100', '200', '300', '400', '500']);
        $prefix = $this->faker->randomElement(['CS', 'MATH', 'CHEM', 'PHYS', 'ENG', 'BUS', 'PSYC', 'HIST', 'ART', 'SOC', 'PHIL', 'MUS', 'STAT', 'ECON']);

        // Generate unique course codes with more combinations
        $courseCode = strtoupper($this->faker->unique()->bothify($prefix.'###'));

        return [
            'department_id' => Department::factory()->for(Faculty::factory()),
            'course_code' => $courseCode,
            'title' => $title,
            'description' => $this->faker->realText(200).' This course provides students with fundamental knowledge and practical skills in the subject area.',
            'credits' => $this->faker->randomElement([1, 2, 3, 4, 6]),
        ];
    }
}
