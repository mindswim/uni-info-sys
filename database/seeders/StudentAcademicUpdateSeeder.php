<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class StudentAcademicUpdateSeeder extends Seeder
{
    private array $gradePoints = [
        'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
        'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
        'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
        'D+' => 1.3, 'D' => 1.0, 'D-' => 0.7,
        'F' => 0.0,
    ];

    /**
     * Update student academic records based on completed coursework.
     * Calculates GPA, credits earned, and academic standing.
     */
    public function run(): void
    {
        Log::info('Updating student academic records...');

        $students = Student::where('enrollment_status', 'full_time')
            ->with(['enrollments' => function ($query) {
                $query->with('courseSection.course');
            }])
            ->get();

        $updated = 0;

        foreach ($students as $student) {
            $this->updateStudentAcademics($student);
            $updated++;
        }

        // Also update prospective students who have prior academic records (high school GPA/test scores)
        $prospectiveStudents = Student::where('enrollment_status', 'prospective')
            ->whereNull('gpa')
            ->with('academicRecords')
            ->get();

        foreach ($prospectiveStudents as $student) {
            // Use high school GPA from academic records if available
            $hsRecord = $student->academicRecords
                ->where('qualification_type', 'High School Diploma')
                ->first();

            if ($hsRecord && $hsRecord->gpa) {
                $student->gpa = $hsRecord->gpa;
                $student->save();
            }
        }

        Log::info("Updated {$updated} enrolled student academic records");
    }

    private function updateStudentAcademics(Student $student): void
    {
        $completedEnrollments = $student->enrollments
            ->where('status', 'completed')
            ->filter(fn ($e) => ! empty($e->grade) && isset($this->gradePoints[$e->grade]));

        $inProgressEnrollments = $student->enrollments
            ->where('status', 'enrolled');

        // Calculate cumulative GPA
        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($completedEnrollments as $enrollment) {
            $credits = $enrollment->courseSection->course->credits ?? 3;
            $points = $this->gradePoints[$enrollment->grade];

            $totalPoints += ($points * $credits);
            $totalCredits += $credits;
        }

        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : null;

        // Calculate credits in progress
        $creditsInProgress = 0;
        foreach ($inProgressEnrollments as $enrollment) {
            $creditsInProgress += $enrollment->courseSection->course->credits ?? 3;
        }

        // Calculate semester GPA (from current term's completed courses)
        $semesterGpa = $this->calculateSemesterGpa($student);

        // Determine academic standing
        $academicStatus = $this->determineAcademicStatus($gpa);

        // Determine class standing based on credits
        $classStanding = $this->determineClassStanding($totalCredits);

        // Update student record
        $student->gpa = $gpa;
        $student->semester_gpa = $semesterGpa;
        $student->total_credits_earned = $totalCredits;
        $student->credits_in_progress = $creditsInProgress;
        $student->academic_status = $academicStatus;
        $student->class_standing = $classStanding;
        $student->save();
    }

    private function calculateSemesterGpa(Student $student): ?float
    {
        // Get most recent term's completed enrollments
        $recentCompletedEnrollments = $student->enrollments()
            ->where('status', 'completed')
            ->whereNotNull('grade')
            ->with('courseSection.course')
            ->orderBy('updated_at', 'desc')
            ->take(5) // Approximate a semester's worth
            ->get()
            ->filter(fn ($e) => isset($this->gradePoints[$e->grade]));

        if ($recentCompletedEnrollments->isEmpty()) {
            return null;
        }

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($recentCompletedEnrollments as $enrollment) {
            $credits = $enrollment->courseSection->course->credits ?? 3;
            $points = $this->gradePoints[$enrollment->grade];

            $totalPoints += ($points * $credits);
            $totalCredits += $credits;
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : null;
    }

    private function determineAcademicStatus(?float $gpa): string
    {
        if ($gpa === null) {
            return 'good_standing';
        }

        if ($gpa >= 2.0) {
            return 'good_standing';
        } elseif ($gpa >= 1.8) {
            return 'academic_warning';
        } elseif ($gpa >= 1.5) {
            return 'academic_probation';
        } else {
            return 'academic_suspension';
        }
    }

    private function determineClassStanding(int $credits): string
    {
        if ($credits >= 90) {
            return 'senior';
        } elseif ($credits >= 60) {
            return 'junior';
        } elseif ($credits >= 30) {
            return 'sophomore';
        } else {
            return 'freshman';
        }
    }
}
