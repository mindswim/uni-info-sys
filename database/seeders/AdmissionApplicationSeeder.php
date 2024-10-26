<?php
namespace Database\Seeders;

use App\Models\Student;
use App\Models\AdmissionApplication;
use Illuminate\Database\Seeder;

class AdmissionApplicationSeeder extends Seeder
{
    public function run(): void
    {
        Student::all()->each(function ($student) {
            AdmissionApplication::create([
                'student_id' => $student->id,
                'academic_year' => '2024-2025',
                'semester' => fake()->randomElement(['Fall', 'Spring']),
                'status' => fake()->randomElement(['draft', 'submitted', 'under_review', 'accepted', 'rejected']),
                'application_date' => now(),
                'decision_date' => fake()->boolean() ? now() : null,
                'decision_status' => null,
                'comments' => fake()->boolean() ? fake()->text() : null,
            ]);
        });
    }
}
