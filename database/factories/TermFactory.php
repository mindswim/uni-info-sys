<?php

namespace Database\Factories;

use App\Models\Term;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Term>
 */
class TermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Production/Staging: Use random data for realistic seeding
        if (app()->environment('production', 'staging')) {
            return $this->productionDefinition();
        }

        // Testing: Use deterministic data to prevent unique constraint violations
        if (app()->runningUnitTests()) {
            return $this->testingDefinition();
        }

        // Development: Use random data but with broader range to reduce collisions
        return $this->developmentDefinition();
    }

    /**
     * Production definition - random realistic data
     */
    private function productionDefinition(): array
    {
        $year = $this->faker->numberBetween(2020, 2035);
        $semester = $this->faker->randomElement(['Fall', 'Spring', 'Summer']);

        return $this->buildTermData($year, $semester);
    }

    /**
     * Testing definition - deterministic sequential data
     */
    private function testingDefinition(): array
    {
        // Use sequential, deterministic values to ensure uniqueness
        static $counter = 0;
        $counter++;

        $semesters = ['Fall', 'Spring', 'Summer'];
        $startYear = 2025; // Start from 2025 to avoid conflicts with seeded data

        // Keep within reasonable MySQL datetime limits (avoid 2038 problem)
        $year = $startYear + intval($counter / 3);
        // Cap at 2034 to stay well within MySQL datetime limits
        if ($year > 2034) {
            $year = 2025 + (($counter / 3) % 10); // Cycle through 2025-2034
        }
        $semester = $semesters[$counter % 3];

        return $this->buildTermData($year, $semester);
    }

    /**
     * Development definition - random with broader range
     */
    private function developmentDefinition(): array
    {
        // Broader range reduces collision probability in development
        $year = $this->faker->numberBetween(2020, 2050);
        $semester = $this->faker->randomElement(['Fall', 'Spring', 'Summer']);

        return $this->buildTermData($year, $semester);
    }

    /**
     * Build term data array from year and semester
     */
    private function buildTermData(int $year, string $semester): array
    {
        $name = "{$semester} {$year}";

        // Calculate dates based on semester
        if ($semester === 'Fall') {
            $start_date = Carbon::create($year, 9, 1);
            $end_date = Carbon::create($year, 12, 20);
        } elseif ($semester === 'Spring') {
            $start_date = Carbon::create($year, 1, 15);
            $end_date = Carbon::create($year, 5, 10);
        } else { // Summer
            $start_date = Carbon::create($year, 6, 1);
            $end_date = Carbon::create($year, 8, 15);
        }

        // Set add/drop deadline to 2 weeks after start date
        $add_drop_deadline = $start_date->copy()->addWeeks(2);

        return [
            'name' => $name,
            'academic_year' => $year,
            'semester' => $semester,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'add_drop_deadline' => $add_drop_deadline,
        ];
    }

    /**
     * State for creating unique terms in testing
     */
    public function unique(): static
    {
        return $this->state(function (array $attributes) {
            // In tests, ensure we get a unique combination
            if (app()->runningUnitTests()) {
                static $uniqueCounter = 0;
                $uniqueCounter++;

                $semesters = ['Fall', 'Spring', 'Summer'];
                $year = 2030 + intval($uniqueCounter / 3);
                // Cap at 2034 to stay within MySQL datetime limits
                if ($year > 2034) {
                    $year = 2030 + (($uniqueCounter / 3) % 5); // Cycle through 2030-2034
                }
                $semester = $semesters[$uniqueCounter % 3];

                return array_merge($attributes, $this->buildTermData($year, $semester));
            }

            return $attributes;
        });
    }
}
