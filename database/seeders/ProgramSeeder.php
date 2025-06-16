<?php
namespace Database\Seeders;

use App\Models\Program;
use App\Models\Faculty;
use App\Models\Department;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        // Create Faculties
        $engineeringFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Engineering']);
        $businessFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Business']);

        // Create Departments
        $eecsDepartment = Department::firstOrCreate(
            ['name' => 'Electrical Engineering and Computer Science'],
            ['faculty_id' => $engineeringFaculty->id]
        );
        $businessDepartment = Department::firstOrCreate(
            ['name' => 'Business Administration'],
            ['faculty_id' => $businessFaculty->id]
        );

        $programs = [
            [
                'name' => 'Computer Science',
                'department_id' => $eecsDepartment->id,
                'degree_level' => 'Bachelor',
                'duration' => 4,
                'description' => 'A comprehensive program in computer science and software engineering.',
                'requirements' => 'High school diploma with strong mathematics background.',
                'capacity' => 100
            ],
            [
                'name' => 'Business Administration',
                'department_id' => $businessDepartment->id,
                'degree_level' => 'Master',
                'duration' => 2,
                'description' => 'Advanced business management and leadership program.',
                'requirements' => "Bachelor's degree with minimum 3.0 GPA.",
                'capacity' => 50
            ],
            [
                'name' => 'Data Science',
                'department_id' => $eecsDepartment->id,
                'degree_level' => 'Master',
                'duration' => 2,
                'description' => 'Advanced program in data analysis and machine learning.',
                'requirements' => "Bachelor's in related field with strong statistics background.",
                'capacity' => 75
            ]
        ];

        foreach ($programs as $programData) {
            Program::firstOrCreate(
                ['name' => $programData['name']],
                $programData
            );
        }
    }
}
