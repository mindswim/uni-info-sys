<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\AcademicRecord;
use App\Models\Term;
use App\Services\GradeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GradeSeeder extends Seeder
{
    private GradeService $gradeService;

    /**
     * Realistic grade distribution based on typical university grade curves
     * Higher-performing students get better grades consistently
     */
    private const GRADE_DISTRIBUTION = [
        'A' => 15,   // 15% A
        'A-' => 12,  // 12% A-
        'B+' => 18,  // 18% B+
        'B' => 20,   // 20% B
        'B-' => 15,  // 15% B-
        'C+' => 10,  // 10% C+
        'C' => 7,    // 7% C
        'C-' => 2,   // 2% C-
        'D' => 1,    // 1% D
    ];

    public function __construct()
    {
        $this->gradeService = new GradeService();
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting grade seeding process...');

        // Set grade deadlines on all terms
        $this->setGradeDeadlines();

        // Get all enrollments that need grades
        $enrollments = Enrollment::whereNull('grade')
            ->whereIn('status', ['enrolled', 'completed'])
            ->with(['student.user', 'courseSection.course', 'courseSection.term'])
            ->get();

        if ($enrollments->isEmpty()) {
            $this->command->warn('No enrollments found without grades.');
            return;
        }

        $this->command->info("Found {$enrollments->count()} enrollments to grade");

        // Categorize students by academic performance level
        $studentPerformanceLevels = $this->categorizeStudents();

        $gradedCount = 0;
        $failedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($enrollments as $enrollment) {
                try {
                    // Determine grade based on student's performance level
                    $grade = $this->assignGrade($enrollment, $studentPerformanceLevels);

                    // Get the instructor ID for this course section
                    $instructorId = $enrollment->courseSection->instructor->user_id ?? 1;

                    // Use GradeService to ensure GPA is recalculated
                    $this->gradeService->submitGrade(
                        $enrollment,
                        $grade,
                        $instructorId
                    );

                    $gradedCount++;

                    if ($gradedCount % 50 === 0) {
                        $this->command->info("Graded {$gradedCount} enrollments...");
                    }
                } catch (\Exception $e) {
                    $failedCount++;
                    Log::warning('Failed to grade enrollment', [
                        'enrollment_id' => $enrollment->id,
                        'student_id' => $enrollment->student_id,
                        'error' => $e->getMessage(),
                    ]);

                    // For enrollments past deadline, directly update
                    $enrollment->update([
                        'grade' => $grade ?? 'B',
                        'status' => 'completed',
                        'completion_date' => $enrollment->courseSection->term->end_date,
                    ]);
                    $gradedCount++;
                }
            }

            DB::commit();

            $this->command->info("✓ Successfully graded {$gradedCount} enrollments");
            if ($failedCount > 0) {
                $this->command->warn("⚠ {$failedCount} enrollments had issues but were graded anyway");
            }

            // Update academic records with GPAs
            $this->updateAcademicRecords();

            $this->command->info('✓ Grade seeding completed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Grade seeding failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Set grade deadlines on all terms
     */
    private function setGradeDeadlines(): void
    {
        $terms = Term::all();

        foreach ($terms as $term) {
            // Set grade deadline to 2 weeks after term end date
            $gradeDeadline = \Carbon\Carbon::parse($term->end_date)->addWeeks(2);
            $term->update(['grade_deadline' => $gradeDeadline]);
        }

        $this->command->info("✓ Set grade deadlines for {$terms->count()} terms");
    }

    /**
     * Categorize students into performance tiers based on their student ID
     * This ensures consistency across terms for each student
     */
    private function categorizeStudents(): array
    {
        $students = Student::all();
        $levels = [];

        foreach ($students as $student) {
            // Use student ID hash to determine performance level (consistent across runs)
            $hash = crc32($student->student_id);
            $percentile = ($hash % 100);

            if ($percentile >= 85) {
                $levels[$student->id] = 'high'; // Top 15% - mostly A's
            } elseif ($percentile >= 60) {
                $levels[$student->id] = 'above_average'; // Next 25% - mostly B's
            } elseif ($percentile >= 30) {
                $levels[$student->id] = 'average'; // 30% - mostly B's and C's
            } elseif ($percentile >= 10) {
                $levels[$student->id] = 'below_average'; // 20% - mostly C's
            } else {
                $levels[$student->id] = 'struggling'; // Bottom 10% - C's and D's
            }
        }

        return $levels;
    }

    /**
     * Assign a grade based on student performance level and some randomness
     */
    private function assignGrade(Enrollment $enrollment, array $performanceLevels): string
    {
        $studentId = $enrollment->student_id;
        $level = $performanceLevels[$studentId] ?? 'average';

        // Add some course-specific variation (some courses are harder/easier)
        $courseHash = crc32($enrollment->courseSection->course->course_code);
        $courseDifficulty = ($courseHash % 3) - 1; // -1, 0, or 1

        $gradeOptions = $this->getGradeOptionsForLevel($level, $courseDifficulty);

        // Pick a random grade from the options
        return $gradeOptions[array_rand($gradeOptions)];
    }

    /**
     * Get possible grades for a performance level
     */
    private function getGradeOptionsForLevel(string $level, int $difficulty): array
    {
        $grades = [
            'high' => [
                'A' => 70,    // 70% chance of A
                'A-' => 25,   // 25% chance of A-
                'B+' => 5,    // 5% chance of B+
            ],
            'above_average' => [
                'A-' => 10,
                'B+' => 35,
                'B' => 40,
                'B-' => 15,
            ],
            'average' => [
                'B+' => 15,
                'B' => 30,
                'B-' => 30,
                'C+' => 20,
                'C' => 5,
            ],
            'below_average' => [
                'B-' => 10,
                'C+' => 25,
                'C' => 40,
                'C-' => 20,
                'D' => 5,
            ],
            'struggling' => [
                'C+' => 10,
                'C' => 40,
                'C-' => 30,
                'D' => 15,
                'F' => 5,
            ],
        ];

        $options = $grades[$level] ?? $grades['average'];

        // Adjust for course difficulty
        if ($difficulty < 0) {
            // Easier course - shift grades up slightly
            return $this->shiftGradesUp($options);
        } elseif ($difficulty > 0) {
            // Harder course - shift grades down slightly
            return $this->shiftGradesDown($options);
        }

        // Convert weighted array to simple array for random selection
        return $this->expandWeightedArray($options);
    }

    /**
     * Shift grade distribution up (easier course)
     */
    private function shiftGradesUp(array $weightedGrades): array
    {
        // In an easier course, students tend to get better grades
        // This is a simplified implementation
        return $this->expandWeightedArray($weightedGrades);
    }

    /**
     * Shift grade distribution down (harder course)
     */
    private function shiftGradesDown(array $weightedGrades): array
    {
        // In a harder course, students tend to get lower grades
        // This is a simplified implementation
        return $this->expandWeightedArray($weightedGrades);
    }

    /**
     * Convert weighted array [grade => weight] to expanded array for random selection
     */
    private function expandWeightedArray(array $weighted): array
    {
        $expanded = [];
        foreach ($weighted as $grade => $weight) {
            for ($i = 0; $i < $weight; $i++) {
                $expanded[] = $grade;
            }
        }
        return $expanded;
    }

    /**
     * Update academic records with calculated GPAs
     */
    private function updateAcademicRecords(): void
    {
        $students = Student::with(['enrollments.courseSection.course', 'enrollments.courseSection.term'])->get();

        foreach ($students as $student) {
            // Group enrollments by term
            $enrollmentsByTerm = $student->enrollments
                ->where('status', 'completed')
                ->whereNotNull('grade')
                ->groupBy('courseSection.term_id');

            foreach ($enrollmentsByTerm as $termId => $termEnrollments) {
                $totalPoints = 0;
                $totalCredits = 0;

                foreach ($termEnrollments as $enrollment) {
                    $gradePoints = GradeService::getGradePoints($enrollment->grade);
                    if ($gradePoints !== null) {
                        $credits = $enrollment->courseSection->course->credits;
                        $totalPoints += ($gradePoints * $credits);
                        $totalCredits += $credits;
                    }
                }

                $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;

                // Update or create academic record
                AcademicRecord::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'term_id' => $termId,
                    ],
                    [
                        'gpa' => $gpa,
                        'credits_attempted' => $totalCredits,
                        'credits_earned' => $totalCredits, // Simplified - in reality would check passing grades
                    ]
                );
            }
        }

        $this->command->info('✓ Updated academic records with calculated GPAs');
    }
}
