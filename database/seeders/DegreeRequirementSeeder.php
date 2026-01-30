<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DegreeRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $programs = Program::with('department')->get();

        if ($programs->isEmpty()) {
            Log::warning('DegreeRequirementSeeder: No programs found. Run ProgramSeeder first.');

            return;
        }

        foreach ($programs as $program) {
            $this->seedRequirementsForProgram($program);
        }

        Log::info('DegreeRequirementSeeder: Seeded degree requirements for '.$programs->count().' programs.');
    }

    private function seedRequirementsForProgram(Program $program): void
    {
        // Skip if already has requirements
        if ($program->degreeRequirements()->exists()) {
            return;
        }

        $departmentId = $program->department_id;
        $totalCredits = $program->credits_required ?? 120;

        // Get courses from the program's department for major requirements
        $deptCourses = Course::where('department_id', $departmentId)->pluck('id')->toArray();

        // Get general education courses (from other departments)
        $genEdCourses = Course::where('department_id', '!=', $departmentId)
            ->inRandomOrder()
            ->limit(20)
            ->pluck('id')
            ->toArray();

        // Split gen-ed courses into categories
        $mathCourses = Course::where('course_code', 'like', 'MATH%')->pluck('id')->toArray();
        $engCourses = Course::where('course_code', 'like', 'ENG%')->pluck('id')->toArray();

        $requirements = [
            [
                'category' => 'core',
                'name' => $program->name.' Core',
                'description' => 'Required core courses for the '.$program->name.' program.',
                'required_credit_hours' => (int) round($totalCredits * 0.30),
                'min_courses' => max(1, (int) round(count($deptCourses) * 0.4)),
                'allowed_courses' => array_slice($deptCourses, 0, 15),
                'is_required' => true,
                'sort_order' => 1,
            ],
            [
                'category' => 'major',
                'name' => $program->name.' Electives',
                'description' => 'Elective courses within the major field.',
                'required_credit_hours' => (int) round($totalCredits * 0.15),
                'min_courses' => 3,
                'allowed_courses' => $deptCourses,
                'is_required' => true,
                'sort_order' => 2,
            ],
            [
                'category' => 'general_education',
                'name' => 'Mathematics',
                'description' => 'Required mathematics courses.',
                'required_credit_hours' => 12,
                'min_courses' => 3,
                'allowed_courses' => ! empty($mathCourses) ? $mathCourses : null,
                'is_required' => true,
                'sort_order' => 3,
            ],
            [
                'category' => 'general_education',
                'name' => 'English Composition',
                'description' => 'Required writing and composition courses.',
                'required_credit_hours' => 6,
                'min_courses' => 2,
                'allowed_courses' => ! empty($engCourses) ? $engCourses : null,
                'is_required' => true,
                'sort_order' => 4,
            ],
            [
                'category' => 'general_education',
                'name' => 'Humanities & Social Sciences',
                'description' => 'Breadth requirement in humanities and social sciences.',
                'required_credit_hours' => 12,
                'min_courses' => 4,
                'allowed_courses' => ! empty($genEdCourses) ? array_slice($genEdCourses, 0, 10) : null,
                'is_required' => true,
                'sort_order' => 5,
            ],
            [
                'category' => 'capstone',
                'name' => 'Senior Capstone',
                'description' => 'Capstone project or thesis required for graduation.',
                'required_credit_hours' => 6,
                'min_courses' => 1,
                'min_gpa' => 2.5,
                'is_required' => true,
                'sort_order' => 6,
            ],
            [
                'category' => 'elective',
                'name' => 'Free Electives',
                'description' => 'Any course may count toward free elective credit.',
                'required_credit_hours' => $totalCredits - (int) round($totalCredits * 0.30) - (int) round($totalCredits * 0.15) - 12 - 6 - 12 - 6,
                'is_required' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($requirements as $req) {
            // Ensure non-negative credit hours
            if (($req['required_credit_hours'] ?? 0) < 1) {
                $req['required_credit_hours'] = 3;
            }

            $program->degreeRequirements()->create($req);
        }
    }
}
