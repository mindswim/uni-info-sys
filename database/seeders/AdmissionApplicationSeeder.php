<?php

namespace Database\Seeders;

use App\Models\AdmissionApplication;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Seeder;

class AdmissionApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $term = Term::firstOrCreate(
            ['academic_year' => 2024, 'semester' => 'Fall'],
            [
                'name' => 'Fall 2024',
                'start_date' => '2024-09-01',
                'end_date' => '2024-12-20',
            ]
        );

        Student::all()->each(function ($student) use ($term) {
            AdmissionApplication::factory()->create([
                'student_id' => $student->id,
                'term_id' => $term->id,
            ]);
        });
    }
}
