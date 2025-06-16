<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Term;
use Carbon\Carbon;

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
        $year = $this->faker->unique()->numberBetween(2023, 2030);
        $semester = $this->faker->randomElement(['Fall', 'Spring', 'Summer']);
        $name = "{$semester} {$year}";

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

        return [
            'name' => $name,
            'academic_year' => $year,
            'semester' => $semester,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ];
    }
}
