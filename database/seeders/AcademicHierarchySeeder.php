<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class AcademicHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Faculties
        $engineeringFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Engineering']);
        $scienceFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Science']);
        $businessFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Business']);
        $artsFaculty = Faculty::firstOrCreate(['name' => 'Faculty of Arts']);

        // Create Departments for Engineering Faculty
        $csDepartment = Department::firstOrCreate([
            'faculty_id' => $engineeringFaculty->id,
            'name' => 'Computer Science'
        ]);

        $eeDepartment = Department::firstOrCreate([
            'faculty_id' => $engineeringFaculty->id,
            'name' => 'Electrical Engineering'
        ]);

        $meDepartment = Department::firstOrCreate([
            'faculty_id' => $engineeringFaculty->id,
            'name' => 'Mechanical Engineering'
        ]);

        // Create Departments for Science Faculty
        $mathDepartment = Department::firstOrCreate([
            'faculty_id' => $scienceFaculty->id,
            'name' => 'Mathematics'
        ]);

        $physicsDepartment = Department::firstOrCreate([
            'faculty_id' => $scienceFaculty->id,
            'name' => 'Physics'
        ]);

        $chemistryDepartment = Department::firstOrCreate([
            'faculty_id' => $scienceFaculty->id,
            'name' => 'Chemistry'
        ]);

        // Create Departments for Business Faculty
        $businessAdminDepartment = Department::firstOrCreate([
            'faculty_id' => $businessFaculty->id,
            'name' => 'Business Administration'
        ]);

        $economicsDepartment = Department::firstOrCreate([
            'faculty_id' => $businessFaculty->id,
            'name' => 'Economics'
        ]);

        // Create Departments for Arts Faculty
        $englishDepartment = Department::firstOrCreate([
            'faculty_id' => $artsFaculty->id,
            'name' => 'English Literature'
        ]);

        $historyDepartment = Department::firstOrCreate([
            'faculty_id' => $artsFaculty->id,
            'name' => 'History'
        ]);

        // Create Programs for Computer Science Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $csDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'A comprehensive program covering software development, algorithms, and computer systems.',
            'requirements' => 'High school diploma with strong mathematics background.',
            'capacity' => 120
        ]);

        Program::firstOrCreate([
            'name' => 'Master of Computer Science',
            'department_id' => $csDepartment->id
        ], [
            'degree_level' => 'Master',
            'duration' => 2,
            'description' => 'Advanced study in computer science with specialization options.',
            'requirements' => 'Bachelor degree in Computer Science or related field.',
            'capacity' => 60
        ]);

        // Create Programs for Electrical Engineering Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Electrical Engineering',
            'department_id' => $eeDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Study of electrical systems, electronics, and power engineering.',
            'requirements' => 'High school diploma with physics and mathematics.',
            'capacity' => 100
        ]);

        // Create Programs for Business Administration Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Business Administration',
            'department_id' => $businessAdminDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Comprehensive business education covering management, finance, and marketing.',
            'requirements' => 'High school diploma with good academic standing.',
            'capacity' => 150
        ]);

        Program::firstOrCreate([
            'name' => 'Master of Business Administration',
            'department_id' => $businessAdminDepartment->id
        ], [
            'degree_level' => 'Master',
            'duration' => 2,
            'description' => 'Advanced business degree for leadership and management roles.',
            'requirements' => 'Bachelor degree and 2+ years work experience preferred.',
            'capacity' => 80
        ]);

        // Create Programs for Mathematics Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Mathematics',
            'department_id' => $mathDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Pure and applied mathematics with strong analytical foundation.',
            'requirements' => 'High school diploma with advanced mathematics.',
            'capacity' => 80
        ]);

        // Create Programs for English Literature Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Arts in English Literature',
            'department_id' => $englishDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Study of literature, writing, and critical analysis.',
            'requirements' => 'High school diploma with strong language skills.',
            'capacity' => 90
        ]);

        // Create Programs for Economics Department
        Program::firstOrCreate([
            'name' => 'Bachelor of Economics',
            'department_id' => $economicsDepartment->id
        ], [
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Study of economic theory, policy, and quantitative analysis.',
            'requirements' => 'High school diploma with mathematics and social studies.',
            'capacity' => 110
        ]);
    }
}
