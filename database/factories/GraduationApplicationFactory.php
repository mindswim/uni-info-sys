<?php

namespace Database\Factories;

use App\Models\GraduationApplication;
use App\Models\Program;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class GraduationApplicationFactory extends Factory
{
    protected $model = GraduationApplication::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'program_id' => Program::factory(),
            'term_id' => Term::factory(),
            'status' => GraduationApplication::STATUS_PENDING,
            'application_date' => $this->faker->date(),
            'ceremony_date' => $this->faker->optional()->date(),
            'special_requests' => $this->faker->optional()->sentence(),
        ];
    }

    public function clearanceInProgress(): static
    {
        $clearance = [];
        foreach (GraduationApplication::CLEARANCE_DEPARTMENTS as $dept) {
            $clearance[$dept] = [
                'status' => GraduationApplication::CLEARANCE_PENDING,
                'cleared_by' => null,
                'cleared_at' => null,
                'notes' => null,
            ];
        }

        return $this->state(fn () => [
            'status' => GraduationApplication::STATUS_CLEARANCE_IN_PROGRESS,
            'clearance_status' => $clearance,
        ]);
    }

    public function fullyCleared(): static
    {
        $clearance = [];
        foreach (GraduationApplication::CLEARANCE_DEPARTMENTS as $dept) {
            $clearance[$dept] = [
                'status' => GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => 1,
                'cleared_at' => now()->toISOString(),
                'notes' => 'Cleared',
            ];
        }

        return $this->state(fn () => [
            'status' => GraduationApplication::STATUS_CLEARED,
            'clearance_status' => $clearance,
        ]);
    }
}
