<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Program;
use App\Models\Course;
use App\Models\DegreeRequirement;

class UpdateCipCodesAndCourseLevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update all programs with CIP codes and credit hours
        $programs = Program::all();
        foreach ($programs as $program) {
            $program->update([
                'cip_code' => $program->assignCIPCode(),
                'total_credit_hours' => match($program->degree_level) {
                    'Bachelor' => 120,
                    'Master' => 36,
                    'PhD' => 72,
                    'Associate' => 60,
                    default => 120
                }
            ]);
        }

        // Update all courses with levels and course numbers
        $courses = Course::all();
        foreach ($courses as $course) {
            $course->save(); // This will trigger the boot method to set course_number and level
        }

        // Create realistic degree requirements for Computer Science Bachelor program
        $csProgram = Program::where('name', 'Computer Science')->first();
        if ($csProgram) {
            $this->createCSRequirements($csProgram);
        }

        // Create requirements for Business Administration Bachelor program  
        $businessProgram = Program::where('name', 'Business Administration')->first();
        if ($businessProgram) {
            $this->createBusinessRequirements($businessProgram);
        }

        $this->command->info('Updated CIP codes, course levels, and created degree requirements');
    }

    private function createCSRequirements(Program $program): void
    {
        // General Education Requirements
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education',
            'name' => 'Writing Skills',
            'description' => 'Complete composition and technical writing courses',
            'required_credit_hours' => 6,
            'min_courses' => 2,
            'sort_order' => 1
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education', 
            'name' => 'Mathematics',
            'description' => 'Calculus I, II, and Discrete Mathematics',
            'required_credit_hours' => 12,
            'min_courses' => 4,
            'sort_order' => 2
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education',
            'name' => 'Natural Sciences',
            'description' => 'Physics and Chemistry with labs',
            'required_credit_hours' => 8,
            'min_courses' => 2,
            'sort_order' => 3
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education',
            'name' => 'Social Sciences & Humanities',
            'description' => 'History, Psychology, Philosophy, Literature',
            'required_credit_hours' => 12,
            'min_courses' => 4,
            'sort_order' => 4
        ]);

        // Major Core Requirements
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_core',
            'name' => 'Programming Fundamentals',
            'description' => 'CS 101, CS 102 - Introduction to Programming',
            'required_credit_hours' => 8,
            'min_courses' => 2,
            'min_gpa' => 2.0,
            'sort_order' => 5
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_core',
            'name' => 'Data Structures and Algorithms', 
            'description' => 'CS 201, CS 202 - Core CS theory and implementation',
            'required_credit_hours' => 8,
            'min_courses' => 2,
            'min_gpa' => 2.5,
            'sort_order' => 6
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_core',
            'name' => 'Systems Programming',
            'description' => 'Computer Organization, Operating Systems, Networks',
            'required_credit_hours' => 12,
            'min_courses' => 3,
            'min_gpa' => 2.0,
            'sort_order' => 7
        ]);

        // Major Electives
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_electives',
            'name' => 'CS Upper Division Electives',
            'description' => 'Choose from AI, Database, Graphics, Security, etc.',
            'required_credit_hours' => 18,
            'min_courses' => 6,
            'min_gpa' => 2.0,
            'sort_order' => 8
        ]);

        // Capstone
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'capstone',
            'name' => 'Senior Project',
            'description' => 'CS 490 - Capstone project or internship',
            'required_credit_hours' => 3,
            'min_courses' => 1,
            'min_gpa' => 2.0,
            'sort_order' => 9
        ]);

        // Free Electives
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'free_electives',
            'name' => 'Free Electives',
            'description' => 'Any courses to reach 120 total credit hours',
            'required_credit_hours' => 21,
            'min_courses' => 7,
            'sort_order' => 10
        ]);
    }

    private function createBusinessRequirements(Program $program): void
    {
        // General Education
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education',
            'name' => 'Communication Skills',
            'description' => 'Business Communication and Public Speaking',
            'required_credit_hours' => 6,
            'min_courses' => 2,
            'sort_order' => 1
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'general_education',
            'name' => 'Quantitative Skills',
            'description' => 'Statistics, College Algebra, Business Calculus',
            'required_credit_hours' => 9,
            'min_courses' => 3,
            'sort_order' => 2
        ]);

        // Business Core
        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_core',
            'name' => 'Business Foundations',
            'description' => 'Accounting, Economics, Finance, Marketing, Management',
            'required_credit_hours' => 30,
            'min_courses' => 10,
            'min_gpa' => 2.0,
            'sort_order' => 3
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'major_electives',
            'name' => 'Business Concentration',
            'description' => 'Choose specialization area: Finance, Marketing, Operations, etc.',
            'required_credit_hours' => 15,
            'min_courses' => 5,
            'min_gpa' => 2.5,
            'sort_order' => 4
        ]);

        DegreeRequirement::create([
            'program_id' => $program->id,
            'category' => 'capstone',
            'name' => 'Business Capstone',
            'description' => 'Strategic Management and Business Plan Project',
            'required_credit_hours' => 6,
            'min_courses' => 2,
            'min_gpa' => 2.5,
            'sort_order' => 5
        ]);
    }
}