<?php
namespace Database\Seeders;

use App\Models\Student;
use App\Models\AcademicRecord;
use Illuminate\Database\Seeder;

class AcademicRecordSeeder extends Seeder
{
    public function run(): void
    {
        Student::all()->each(function ($student) {
            AcademicRecord::create([
                'student_id' => $student->id,
                'institution_name' => fake()->company() . ' High School',
                'qualification_type' => 'High School Diploma',
                'start_date' => fake()->dateTimeBetween('-6 years', '-4 years'),
                'end_date' => fake()->dateTimeBetween('-4 years', '-2 years'),
                'gpa' => fake()->randomFloat(2, 2.0, 4.0),
                'transcript_url' => null,
                'verified' => fake()->boolean(),
            ]);
        });
    }
}
