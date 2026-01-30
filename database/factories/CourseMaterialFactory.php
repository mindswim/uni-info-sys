<?php

namespace Database\Factories;

use App\Models\ClassSession;
use App\Models\CourseMaterial;
use App\Models\CourseSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseMaterial>
 */
class CourseMaterialFactory extends Factory
{
    protected $model = CourseMaterial::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(CourseMaterial::TYPES);

        return [
            'course_section_id' => CourseSection::factory(),
            'class_session_id' => null,
            'title' => $this->generateTitle($type),
            'description' => fake()->optional(0.7)->sentence(),
            'type' => $type,
            'content' => $type === 'lecture_notes' ? fake()->paragraphs(3, true) : null,
            'file_path' => in_array($type, ['file', 'reading']) ? '/uploads/materials/'.fake()->uuid().'.pdf' : null,
            'file_name' => in_array($type, ['file', 'reading']) ? fake()->word().'.pdf' : null,
            'file_size' => in_array($type, ['file', 'reading']) ? fake()->numberBetween(100000, 5000000) : null,
            'mime_type' => in_array($type, ['file', 'reading']) ? 'application/pdf' : null,
            'url' => in_array($type, ['link', 'video']) ? fake()->url() : null,
            'sort_order' => fake()->numberBetween(0, 20),
            'is_published' => fake()->boolean(80),
            'available_from' => fake()->optional(0.3)->dateTimeBetween('-7 days', '+7 days'),
        ];
    }

    /**
     * Generate a realistic title based on material type
     */
    private function generateTitle(string $type): string
    {
        $titles = [
            'syllabus' => [
                'Course Syllabus',
                'Syllabus and Course Policies',
                'Course Overview and Syllabus',
            ],
            'reading' => [
                'Chapter '.fake()->numberBetween(1, 20).' Reading',
                'Required Reading: '.fake()->words(3, true),
                'Supplementary Reading Material',
                'Article: '.fake()->sentence(4),
            ],
            'lecture_notes' => [
                'Lecture '.fake()->numberBetween(1, 30).' Notes',
                'Week '.fake()->numberBetween(1, 15).' Lecture Notes',
                fake()->words(3, true).' - Lecture Notes',
            ],
            'video' => [
                'Lecture Video: '.fake()->words(3, true),
                'Tutorial: '.fake()->words(2, true),
                'Recorded Session '.fake()->numberBetween(1, 20),
            ],
            'link' => [
                'External Resource: '.fake()->words(3, true),
                'Online Tool: '.fake()->word(),
                'Reference: '.fake()->words(2, true),
            ],
            'file' => [
                'Assignment Template',
                'Lab Instructions',
                'Project Guidelines',
                fake()->words(3, true),
            ],
            'other' => [
                'Additional Material',
                'Bonus Content',
                'Extra Resources',
            ],
        ];

        return fake()->randomElement($titles[$type] ?? $titles['other']);
    }

    /**
     * Material is published
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'available_from' => null,
        ]);
    }

    /**
     * Material is unpublished (draft)
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Material is available now
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'available_from' => fake()->dateTimeBetween('-7 days', '-1 hour'),
        ]);
    }

    /**
     * Material is scheduled for future
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'available_from' => fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }

    /**
     * Syllabus type
     */
    public function syllabus(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'syllabus',
            'title' => 'Course Syllabus',
            'content' => fake()->paragraphs(5, true),
            'file_path' => null,
            'url' => null,
            'sort_order' => 0,
        ]);
    }

    /**
     * Reading type
     */
    public function reading(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'reading',
            'title' => $this->generateTitle('reading'),
            'file_path' => '/uploads/materials/'.fake()->uuid().'.pdf',
            'file_name' => fake()->word().'_reading.pdf',
            'file_size' => fake()->numberBetween(500000, 2000000),
            'mime_type' => 'application/pdf',
        ]);
    }

    /**
     * Lecture notes type
     */
    public function lectureNotes(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'lecture_notes',
            'title' => $this->generateTitle('lecture_notes'),
            'content' => fake()->paragraphs(10, true),
        ]);
    }

    /**
     * Video type
     */
    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'video',
            'title' => $this->generateTitle('video'),
            'url' => 'https://youtube.com/watch?v='.fake()->regexify('[A-Za-z0-9]{11}'),
            'file_path' => null,
        ]);
    }

    /**
     * Link type
     */
    public function link(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'link',
            'title' => $this->generateTitle('link'),
            'url' => fake()->url(),
            'file_path' => null,
            'content' => null,
        ]);
    }

    /**
     * Attach to a specific session
     */
    public function forSession(ClassSession $session): static
    {
        return $this->state(fn (array $attributes) => [
            'course_section_id' => $session->course_section_id,
            'class_session_id' => $session->id,
        ]);
    }
}
