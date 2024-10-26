<?php
namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            [
                'name' => 'Computer Science',
                'department' => 'Engineering',
                'degree_level' => 'Bachelor',
                'duration' => 4,
                'description' => 'A comprehensive program in computer science and software engineering',
                'requirements' => 'High school diploma with strong mathematics background',
                'capacity' => 100
            ],
            [
                'name' => 'Business Administration',
                'department' => 'Business',
                'degree_level' => 'Master',
                'duration' => 2,
                'description' => 'Advanced business management and leadership program',
                'requirements' => "Bachelor's degree with minimum 3.0 GPA",
                'capacity' => 50
            ],
            [
                'name' => 'Data Science',
                'department' => 'Engineering',
                'degree_level' => 'Master',
                'duration' => 2,
                'description' => 'Advanced program in data analysis and machine learning',
                'requirements' => "Bachelor's in related field with strong statistics background",
                'capacity' => 75
            ]
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
