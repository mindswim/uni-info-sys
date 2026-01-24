<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'announceable_type' => null,
            'announceable_id' => null,
            'author_id' => Staff::factory(),
            'title' => $this->generateTitle(),
            'content' => fake()->paragraphs(fake()->numberBetween(1, 3), true),
            'priority' => fake()->randomElement(Announcement::PRIORITIES),
            'is_published' => fake()->boolean(80),
            'published_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'expires_at' => fake()->optional(0.3)->dateTimeBetween('+7 days', '+30 days'),
            'is_pinned' => fake()->boolean(10),
        ];
    }

    /**
     * Generate a realistic announcement title
     */
    private function generateTitle(): string
    {
        $titles = [
            'Important Update Regarding ' . fake()->words(3, true),
            'Reminder: ' . fake()->words(4, true),
            'Schedule Change Notice',
            'Upcoming Event: ' . fake()->words(3, true),
            'Office Hours Update',
            'Assignment Deadline Extended',
            'Campus Closure Notice',
            'Guest Speaker Announcement',
            'Exam Information',
            'Course Material Update',
            'Holiday Schedule',
            'New Resource Available',
            'Policy Update',
            'Registration Reminder',
            fake()->sentence(fake()->numberBetween(4, 8)),
        ];

        return fake()->randomElement($titles);
    }

    /**
     * University-wide announcement
     */
    public function universityWide(): static
    {
        return $this->state(fn (array $attributes) => [
            'announceable_type' => null,
            'announceable_id' => null,
        ]);
    }

    /**
     * For a course section
     */
    public function forCourseSection(?CourseSection $section = null): static
    {
        return $this->state(function (array $attributes) use ($section) {
            $section = $section ?? CourseSection::factory()->create();
            return [
                'announceable_type' => CourseSection::class,
                'announceable_id' => $section->id,
            ];
        });
    }

    /**
     * For a department
     */
    public function forDepartment(?Department $department = null): static
    {
        return $this->state(function (array $attributes) use ($department) {
            $department = $department ?? Department::factory()->create();
            return [
                'announceable_type' => Department::class,
                'announceable_id' => $department->id,
            ];
        });
    }

    /**
     * Published and visible
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => fake()->dateTimeBetween('-7 days', '-1 hour'),
            'expires_at' => null,
        ]);
    }

    /**
     * Unpublished (draft)
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Scheduled for future
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }

    /**
     * Expired
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => fake()->dateTimeBetween('-30 days', '-14 days'),
            'expires_at' => fake()->dateTimeBetween('-7 days', '-1 day'),
        ]);
    }

    /**
     * Normal priority
     */
    public function normal(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'normal',
        ]);
    }

    /**
     * Important priority
     */
    public function important(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'important',
            'title' => 'Important: ' . fake()->words(4, true),
        ]);
    }

    /**
     * Urgent priority
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgent',
            'title' => 'URGENT: ' . fake()->words(4, true),
            'is_pinned' => true,
        ]);
    }

    /**
     * Pinned
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }
}
