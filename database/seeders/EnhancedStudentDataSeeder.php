<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Program;
use App\Models\Enrollment;
use Faker\Factory as Faker;

class EnhancedStudentDataSeeder extends Seeder
{
    /**
     * Enhance existing students with realistic academic data
     * This seeder adds GPA, majors, class standing, and other academic fields
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get all existing students
        $students = Student::all();
        $programs = Program::all();

        if ($programs->isEmpty()) {
            $this->command->warn('No programs found. Please run ProgramSeeder first.');
            return;
        }

        $this->command->info("Enhancing {$students->count()} students with realistic academic data...");

        // Realistic high schools
        $highSchools = [
            'Lincoln High School', 'Washington High School', 'Roosevelt High School',
            'Jefferson High School', 'Madison High School', 'Kennedy High School',
            'Central High School', 'North High School', 'South High School',
            'East High School', 'West High School', 'Riverside High School',
            'Oakwood High School', 'Hillside High School', 'Parkview High School',
            'Valley High School', 'Mountain View High School', 'Sunrise High School',
            'Pine Ridge High School', 'Cedar Grove High School'
        ];

        // Realistic pronouns distribution
        $pronounsOptions = [
            'he/him' => 45,
            'she/her' => 45,
            'they/them' => 8,
            'he/they' => 1,
            'she/they' => 1
        ];

        foreach ($students as $student) {
            // Calculate years since birth to determine realistic class standing
            $age = now()->diffInYears($student->date_of_birth);
            $yearsInCollege = max(1, $age - 17); // Assuming started college at 18

            // Determine class standing based on age and credits
            $baseCredits = ($yearsInCollege - 1) * 30; // 30 credits per year average
            $creditVariation = $faker->numberBetween(-10, 15); // Some variation
            $totalCredits = max(0, $baseCredits + $creditVariation);

            $classStanding = $this->determineClassStanding($totalCredits, $yearsInCollege);

            // Generate realistic GPA (most students have 2.5-3.8)
            $gpa = $this->generateRealisticGPA($classStanding);
            $semesterGpa = $faker->randomFloat(2, max(1.0, $gpa - 0.5), min(4.0, $gpa + 0.3));

            // Determine academic status based on GPA
            $academicStatus = $this->determineAcademicStatus($gpa);

            // Assign major program (90% have majors, 10% undeclared)
            $majorProgram = $faker->boolean(90) ? $programs->random() : null;
            $minorProgram = $faker->boolean(25) ? $programs->where('id', '!=', $majorProgram?->id)->random() : null;

            // Generate admission and graduation dates
            $admissionDate = now()->subYears($yearsInCollege)->subMonths($faker->numberBetween(0, 8));
            $expectedGraduation = $admissionDate->copy()->addYears(4); // 4-year degree

            // Financial aid (60% receive some form)
            $receivesFinancialAid = $faker->boolean(60);
            $financialHold = $faker->boolean(5); // 5% have financial holds

            // Test scores (not everyone has them)
            $satScore = $faker->boolean(75) ? $faker->numberBetween(900, 1600) : null;
            $actScore = $satScore ? null : ($faker->boolean(60) ? $faker->numberBetween(15, 36) : null);

            // Pronouns with realistic distribution
            $pronouns = $this->weightedRandom($pronounsOptions);

            // Generate preferred name (20% use preferred name)
            $preferredName = $faker->boolean(20) ? $faker->firstName($student->gender) : null;

            // Parent/guardian info
            $parentName = $faker->name();
            $parentPhone = $faker->phoneNumber();

            // Credits in progress based on enrollment status
            $enrollmentStatus = $this->determineEnrollmentStatus($classStanding, $academicStatus);
            $creditsInProgress = $enrollmentStatus === 'full_time'
                ? $faker->numberBetween(12, 18)
                : $faker->numberBetween(6, 11);

            // Update the student
            $student->update([
                // Academic Performance
                'gpa' => $gpa,
                'semester_gpa' => $semesterGpa,

                // Academic Standing
                'class_standing' => $classStanding,
                'enrollment_status' => $enrollmentStatus,
                'academic_status' => $academicStatus,

                // Program Information
                'major_program_id' => $majorProgram?->id,
                'minor_program_id' => $minorProgram?->id,

                // Academic Timeline
                'admission_date' => $admissionDate,
                'expected_graduation_date' => $expectedGraduation,
                'total_credits_earned' => $totalCredits,
                'credits_in_progress' => $creditsInProgress,

                // Financial Information
                'financial_hold' => $financialHold,
                'receives_financial_aid' => $receivesFinancialAid,

                // Academic History
                'high_school' => $faker->randomElement($highSchools),
                'high_school_graduation_year' => $admissionDate->year,
                'sat_score' => $satScore,
                'act_score' => $actScore,

                // Contact Enhancement
                'preferred_name' => $preferredName,
                'pronouns' => $pronouns,
                'parent_guardian_name' => $parentName,
                'parent_guardian_phone' => $parentPhone,
            ]);
        }

        $this->command->info('Enhanced all students with realistic academic data!');
        $this->printStatistics($students);
    }

    private function determineClassStanding(int $credits, int $yearsInCollege): string
    {
        // Adjust based on years in college too
        if ($yearsInCollege >= 4 || $credits >= 90) return 'senior';
        if ($yearsInCollege >= 3 || $credits >= 60) return 'junior';
        if ($yearsInCollege >= 2 || $credits >= 30) return 'sophomore';
        return 'freshman';
    }

    private function generateRealisticGPA(string $classStanding): float
    {
        $faker = Faker::create();

        // GPAs tend to improve over time
        $baseGPA = match($classStanding) {
            'freshman' => $faker->randomFloat(2, 2.5, 3.8),
            'sophomore' => $faker->randomFloat(2, 2.6, 3.9),
            'junior' => $faker->randomFloat(2, 2.7, 3.9),
            'senior' => $faker->randomFloat(2, 2.8, 4.0),
            default => $faker->randomFloat(2, 2.5, 3.8)
        };

        return round($baseGPA, 2);
    }

    private function determineAcademicStatus(float $gpa): string
    {
        if ($gpa >= 2.0) return 'good_standing';
        if ($gpa >= 1.5) return 'academic_warning';
        if ($gpa >= 1.0) return 'academic_probation';
        return 'academic_suspension';
    }

    private function determineEnrollmentStatus(string $classStanding, string $academicStatus): string
    {
        $faker = Faker::create();

        // Most students are full-time, but seniors and those with academic issues might be part-time
        if ($academicStatus !== 'good_standing') {
            return $faker->boolean(70) ? 'part_time' : 'full_time';
        }

        if ($classStanding === 'senior') {
            return $faker->boolean(85) ? 'full_time' : 'part_time';
        }

        return $faker->boolean(95) ? 'full_time' : 'part_time';
    }

    private function weightedRandom(array $options): string
    {
        $faker = Faker::create();
        $rand = $faker->numberBetween(1, 100);
        $cumulative = 0;

        foreach ($options as $option => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $option;
            }
        }

        return array_key_first($options);
    }

    private function printStatistics($students): void
    {
        $this->command->info("\n=== Enhanced Student Statistics ===");
        $this->command->info("Total Students: " . $students->count());

        // Class standing distribution
        $classStanding = Student::selectRaw('class_standing, COUNT(*) as count')
            ->groupBy('class_standing')
            ->pluck('count', 'class_standing')
            ->toArray();

        $this->command->info("\nClass Standing Distribution:");
        foreach ($classStanding as $standing => $count) {
            $this->command->info("  {$standing}: {$count}");
        }

        // GPA statistics
        $avgGPA = Student::avg('gpa');
        $this->command->info("\nAverage GPA: " . round($avgGPA, 2));

        // Academic status
        $academicStatus = Student::selectRaw('academic_status, COUNT(*) as count')
            ->groupBy('academic_status')
            ->pluck('count', 'academic_status')
            ->toArray();

        $this->command->info("\nAcademic Status Distribution:");
        foreach ($academicStatus as $status => $count) {
            $this->command->info("  {$status}: {$count}");
        }
    }
}