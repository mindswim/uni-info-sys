<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Program;
use App\Models\Role;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;

class MassiveStudentVolumeSeeder extends Seeder
{
    /**
     * Generate large-scale realistic student data
     * Creates 1000+ students with complete academic profiles
     */
    public function run(): void
    {
        $faker = Faker::create();
        $studentRole = Role::where('name', 'student')->first();
        $programs = Program::all();

        if ($programs->isEmpty()) {
            $this->command->warn('No programs found. Please run ProgramSeeder first.');
            return;
        }

        // Target number of additional students
        $targetStudents = 1000;
        $batchSize = 50; // Process in batches for memory efficiency
        $currentCount = Student::count();

        $this->command->info("Current students: {$currentCount}");
        $this->command->info("Adding {$targetStudents} more students...");

        // Realistic high schools across the US
        $highSchools = [
            'Lincoln High School', 'Washington High School', 'Roosevelt High School',
            'Jefferson High School', 'Madison High School', 'Kennedy High School',
            'Central High School', 'North High School', 'South High School',
            'East High School', 'West High School', 'Riverside High School',
            'Oakwood High School', 'Hillside High School', 'Parkview High School',
            'Valley High School', 'Mountain View High School', 'Sunrise High School',
            'Pine Ridge High School', 'Cedar Grove High School', 'Westfield High',
            'Northside Prep', 'Southdale Academy', 'Eastbrook School',
            'Westgate High', 'Highland Park High', 'Lakeview High School',
            'Crestwood High', 'Fairview High School', 'Ridgemont High',
            'Springfield High', 'Franklin High School', 'Hamilton High',
            'Riverside Prep', 'Metro High School', 'Charter Oak High',
            'Elmwood High', 'Brookside High School', 'Maple Grove High',
            'Sunset High School', 'Clearview High', 'Northwood Academy'
        ];

        $batches = ceil($targetStudents / $batchSize);

        for ($batch = 1; $batch <= $batches; $batch++) {
            $this->command->info("Processing batch {$batch}/{$batches}...");

            $studentsToCreate = min($batchSize, $targetStudents - (($batch - 1) * $batchSize));

            for ($i = 1; $i <= $studentsToCreate; $i++) {
                $studentNumber = 'STU' . str_pad($currentCount + (($batch - 1) * $batchSize) + $i, 6, '0', STR_PAD_LEFT);

                // Generate realistic age distribution (18-26 for undergrad, 22-35 for grad)
                $isGraduateStudent = $faker->boolean(15); // 15% graduate students
                $age = $isGraduateStudent
                    ? $faker->numberBetween(22, 35)
                    : $faker->numberBetween(18, 26);

                $birthYear = now()->year - $age;
                $dateOfBirth = $faker->dateTimeBetween("{$birthYear}-01-01", "{$birthYear}-12-31");

                // Determine academic level based on age and years in school
                $yearsInCollege = max(1, $age - 17);
                $baseCredits = ($yearsInCollege - 1) * 30;
                $creditVariation = $faker->numberBetween(-15, 20);
                $totalCredits = max(0, $baseCredits + $creditVariation);

                $classStanding = $this->determineClassStanding($totalCredits, $yearsInCollege, $isGraduateStudent);

                // Generate realistic GPA distribution
                $gpa = $this->generateRealisticGPA($classStanding);
                $semesterGpa = $faker->randomFloat(2, max(1.0, $gpa - 0.5), min(4.0, $gpa + 0.3));

                // Academic status based on GPA
                $academicStatus = $this->determineAcademicStatus($gpa);

                // Program assignment (higher chance for upperclassmen)
                $majorProgram = $this->assignMajorProgram($programs, $classStanding, $faker);
                $minorProgram = $faker->boolean(30) ? $programs->where('id', '!=', $majorProgram?->id)->random() : null;

                // Financial information (realistic distribution)
                $receivesFinancialAid = $faker->boolean(65); // 65% receive some aid
                $financialHold = $faker->boolean(3); // 3% have holds

                // Test scores (not everyone has recent scores)
                $hasTestScores = $faker->boolean(80);
                $satScore = $hasTestScores && $faker->boolean(70) ? $faker->numberBetween(900, 1600) : null;
                $actScore = $hasTestScores && !$satScore && $faker->boolean(60) ? $faker->numberBetween(15, 36) : null;

                // Diverse gender and pronouns
                $gender = $faker->randomElement(['male', 'female', 'other']);
                $pronouns = $this->assignPronouns($gender, $faker);

                // Admission timeline
                $admissionDate = now()->subYears($yearsInCollege)->subMonths($faker->numberBetween(0, 8));
                $expectedGraduation = $admissionDate->copy()->addYears($isGraduateStudent ? 2 : 4);

                // Enrollment status
                $enrollmentStatus = $this->determineEnrollmentStatus($classStanding, $academicStatus, $age, $faker);
                $creditsInProgress = $enrollmentStatus === 'full_time'
                    ? $faker->numberBetween(12, 18)
                    : $faker->numberBetween(6, 11);

                // Create user account
                $user = User::create([
                    'name' => $faker->name(),
                    'email' => $faker->unique()->safeEmail(),
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ]);

                if ($studentRole) {
                    $user->roles()->attach($studentRole);
                }

                // Create student with complete academic profile
                Student::create([
                    'user_id' => $user->id,
                    'student_number' => $studentNumber,
                    'first_name' => $faker->firstName($gender),
                    'last_name' => $faker->lastName(),
                    'date_of_birth' => $dateOfBirth,
                    'gender' => $gender,
                    'nationality' => $this->assignNationality($faker),
                    'address' => $faker->streetAddress(),
                    'city' => $faker->city(),
                    'state' => $faker->stateAbbr(),
                    'postal_code' => $faker->postcode(),
                    'country' => 'United States',
                    'phone' => $faker->phoneNumber(),
                    'emergency_contact_name' => $faker->name(),
                    'emergency_contact_phone' => $faker->phoneNumber(),

                    // Enhanced academic fields
                    'gpa' => $gpa,
                    'semester_gpa' => $semesterGpa,
                    'class_standing' => $classStanding,
                    'enrollment_status' => $enrollmentStatus,
                    'academic_status' => $academicStatus,
                    'major_program_id' => $majorProgram?->id,
                    'minor_program_id' => $minorProgram?->id,
                    'admission_date' => $admissionDate,
                    'expected_graduation_date' => $expectedGraduation,
                    'total_credits_earned' => $totalCredits,
                    'credits_in_progress' => $creditsInProgress,
                    'financial_hold' => $financialHold,
                    'receives_financial_aid' => $receivesFinancialAid,
                    'high_school' => $faker->randomElement($highSchools),
                    'high_school_graduation_year' => $admissionDate->year,
                    'sat_score' => $satScore,
                    'act_score' => $actScore,
                    'preferred_name' => $faker->boolean(25) ? $faker->firstName($gender) : null,
                    'pronouns' => $pronouns,
                    'parent_guardian_name' => $faker->name(),
                    'parent_guardian_phone' => $faker->phoneNumber(),
                ]);
            }

            // Brief pause between batches to avoid overwhelming the system
            if ($batch < $batches) {
                sleep(1);
            }
        }

        $this->command->info('Massive student volume generation complete!');
        $this->printFinalStatistics();
    }

    private function determineClassStanding(int $credits, int $yearsInCollege, bool $isGraduateStudent): string
    {
        if ($isGraduateStudent) {
            return 'graduate';
        }

        if ($yearsInCollege >= 4 || $credits >= 90) return 'senior';
        if ($yearsInCollege >= 3 || $credits >= 60) return 'junior';
        if ($yearsInCollege >= 2 || $credits >= 30) return 'sophomore';
        return 'freshman';
    }

    private function generateRealisticGPA(string $classStanding): float
    {
        $faker = Faker::create();

        // Real university GPA distributions with slight improvement over time
        return match($classStanding) {
            'freshman' => $faker->randomFloat(2, 2.3, 3.8),
            'sophomore' => $faker->randomFloat(2, 2.5, 3.9),
            'junior' => $faker->randomFloat(2, 2.6, 3.9),
            'senior' => $faker->randomFloat(2, 2.7, 4.0),
            'graduate' => $faker->randomFloat(2, 3.0, 4.0), // Grad students typically higher
            default => $faker->randomFloat(2, 2.5, 3.8)
        };
    }

    private function determineAcademicStatus(float $gpa): string
    {
        if ($gpa >= 2.0) return 'good_standing';
        if ($gpa >= 1.5) return 'academic_warning';
        if ($gpa >= 1.0) return 'academic_probation';
        return 'academic_suspension';
    }

    private function assignMajorProgram($programs, string $classStanding, $faker)
    {
        // Freshmen less likely to have declared major, upperclassmen more likely
        $hasProgram = match($classStanding) {
            'freshman' => $faker->boolean(60),
            'sophomore' => $faker->boolean(85),
            'junior' => $faker->boolean(95),
            'senior' => $faker->boolean(98),
            'graduate' => $faker->boolean(100),
            default => $faker->boolean(80)
        };

        return $hasProgram ? $programs->random() : null;
    }

    private function assignPronouns(string $gender, $faker): string
    {
        $pronounOptions = [
            'male' => ['he/him' => 90, 'he/they' => 5, 'they/them' => 5],
            'female' => ['she/her' => 90, 'she/they' => 5, 'they/them' => 5],
            'other' => ['they/them' => 70, 'he/they' => 15, 'she/they' => 15]
        ];

        return $this->weightedRandom($pronounOptions[$gender], $faker);
    }

    private function assignNationality($faker): string
    {
        // Realistic distribution for US university
        $nationalities = [
            'American' => 75,
            'Chinese' => 8,
            'Indian' => 5,
            'Canadian' => 3,
            'Korean' => 2,
            'Japanese' => 2,
            'Mexican' => 2,
            'German' => 1,
            'British' => 1,
            'Brazilian' => 1
        ];

        return $this->weightedRandom($nationalities, $faker);
    }

    private function determineEnrollmentStatus(string $classStanding, string $academicStatus, int $age, $faker): string
    {
        // Older students and those with academic issues more likely to be part-time
        if ($age > 25) {
            return $faker->boolean(60) ? 'part_time' : 'full_time';
        }

        if ($academicStatus !== 'good_standing') {
            return $faker->boolean(40) ? 'part_time' : 'full_time';
        }

        if ($classStanding === 'senior') {
            return $faker->boolean(80) ? 'full_time' : 'part_time';
        }

        return $faker->boolean(92) ? 'full_time' : 'part_time';
    }

    private function weightedRandom(array $options, $faker): string
    {
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

    private function printFinalStatistics(): void
    {
        $total = Student::count();
        $this->command->info("\n=== MASSIVE UNIVERSITY SCALE ACHIEVED ===");
        $this->command->info("Total Students: {$total}");

        // Class standing distribution
        $standings = Student::selectRaw('class_standing, COUNT(*) as count')
            ->groupBy('class_standing')
            ->pluck('count', 'class_standing')
            ->toArray();

        $this->command->info("\nClass Standing Distribution:");
        foreach ($standings as $standing => $count) {
            $percentage = round(($count / $total) * 100, 1);
            $this->command->info("  {$standing}: {$count} ({$percentage}%)");
        }

        // GPA statistics
        $avgGPA = Student::avg('gpa');
        $minGPA = Student::min('gpa');
        $maxGPA = Student::max('gpa');

        $this->command->info("\nGPA Statistics:");
        $this->command->info("  Average: " . round($avgGPA, 2));
        $this->command->info("  Range: " . round($minGPA, 2) . " - " . round($maxGPA, 2));

        // Financial aid stats
        $aidRecipients = Student::where('receives_financial_aid', true)->count();
        $aidPercentage = round(($aidRecipients / $total) * 100, 1);
        $this->command->info("\nFinancial Aid: {$aidRecipients} students ({$aidPercentage}%)");

        $this->command->info("\n🎓 ENTERPRISE-SCALE UNIVERSITY SYSTEM READY! 🎓");
    }
}