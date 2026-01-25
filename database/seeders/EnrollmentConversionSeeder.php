<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Term;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\FinancialAidPackage;
use App\Models\ProgramChoice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class EnrollmentConversionSeeder extends Seeder
{
    /**
     * Convert accepted prospective students into enrolled students.
     * This simulates the matriculation process after a student:
     * 1. Has been accepted
     * 2. Has accepted their financial aid package
     * 3. Is ready to enroll in courses
     */
    public function run(): void
    {
        Log::info('Starting enrollment conversion (matriculation)...');

        $term = Term::where('name', 'Fall 2024')->first();
        if (!$term) {
            Log::warning('No Fall 2024 term found');
            return;
        }

        // Get prospective students with accepted applications and accepted financial aid
        $matriculatingStudents = Student::where('enrollment_status', 'prospective')
            ->whereHas('admissionApplications', function ($query) {
                $query->where('status', 'accepted');
            })
            ->whereHas('financialAidPackages', function ($query) {
                $query->where('status', 'accepted');
            })
            ->with([
                'admissionApplications' => fn($q) => $q->where('status', 'accepted')->with('programChoices'),
                'financialAidPackages' => fn($q) => $q->where('status', 'accepted'),
            ])
            ->get();

        $matriculated = 0;
        $enrolled = 0;

        foreach ($matriculatingStudents as $student) {
            // Update student status
            $this->matriculateStudent($student);
            $matriculated++;

            // Enroll in first semester courses
            $enrollmentCount = $this->enrollInCourses($student, $term);
            $enrolled += $enrollmentCount;
        }

        Log::info("Matriculated {$matriculated} students with {$enrolled} course enrollments");

        // Also process students who were accepted but didn't get/accept financial aid
        // (full-pay students or those who declined aid)
        $fullPayStudents = Student::where('enrollment_status', 'prospective')
            ->whereHas('admissionApplications', function ($query) {
                $query->where('status', 'accepted');
            })
            ->whereDoesntHave('financialAidPackages', function ($query) {
                $query->where('status', 'accepted');
            })
            ->with([
                'admissionApplications' => fn($q) => $q->where('status', 'accepted')->with('programChoices'),
            ])
            ->get();

        // 60% of full-pay students matriculate
        $fullPayMatriculating = $fullPayStudents->filter(fn() => fake()->boolean(60));

        foreach ($fullPayMatriculating as $student) {
            $this->matriculateStudent($student);
            $matriculated++;

            $enrollmentCount = $this->enrollInCourses($student, $term);
            $enrolled += $enrollmentCount;
        }

        Log::info("Total: Matriculated {$matriculated} students with {$enrolled} course enrollments");
    }

    private function matriculateStudent(Student $student): void
    {
        // Get accepted program choice
        $acceptedApplication = $student->admissionApplications->first();
        $acceptedProgramChoice = $acceptedApplication?->programChoices
            ->where('status', 'accepted')
            ->first();

        // Update student record
        $student->enrollment_status = 'full_time';
        $student->admission_date = now();
        $student->class_standing = 'freshman';
        $student->academic_status = 'good_standing';
        $student->total_credits_earned = 0;
        $student->credits_in_progress = 0;

        if ($acceptedProgramChoice) {
            $student->major_program_id = $acceptedProgramChoice->program_id;
        }

        // Calculate expected graduation (4 years from now)
        $student->expected_graduation_date = now()->addYears(4);

        $student->save();

        // Update application status to enrolled
        if ($acceptedApplication) {
            $acceptedApplication->status = 'enrolled';
            $acceptedApplication->save();
        }
    }

    private function enrollInCourses(Student $student, Term $term): int
    {
        // Get available course sections for the term
        $availableSections = CourseSection::where('term_id', $term->id)
            ->where('status', 'open')
            ->withCount('enrollments')
            ->get()
            ->filter(function ($section) {
                return $section->enrollments_count < $section->capacity;
            });

        if ($availableSections->isEmpty()) {
            return 0;
        }

        // Determine course load based on program
        // Typically 4-5 courses (12-15 credits) for full-time freshmen
        $targetCourses = rand(4, 5);
        $targetCredits = rand(12, 15);
        $enrolledCredits = 0;
        $enrollmentCount = 0;

        // Get sections by department to ensure variety
        $sectionsByDept = $availableSections->groupBy(function ($section) {
            return $section->course->department_id;
        });

        // If student has a major, prioritize those courses
        $majorDeptId = $student->majorProgram?->department_id;

        // First, try to enroll in 1-2 major courses
        if ($majorDeptId && isset($sectionsByDept[$majorDeptId])) {
            $majorSections = $sectionsByDept[$majorDeptId]->shuffle()->take(2);
            foreach ($majorSections as $section) {
                if ($enrollmentCount >= $targetCourses || $enrolledCredits >= $targetCredits) {
                    break;
                }

                if ($this->enrollStudentInSection($student, $section)) {
                    $enrolledCredits += $section->course->credits;
                    $enrollmentCount++;
                }
            }
        }

        // Then fill with general education courses from other departments
        $remainingSlots = $targetCourses - $enrollmentCount;
        $shuffledSections = $availableSections->shuffle();

        foreach ($shuffledSections as $section) {
            if ($enrollmentCount >= $targetCourses || $enrolledCredits >= $targetCredits) {
                break;
            }

            // Skip if already enrolled in this course
            $alreadyEnrolled = Enrollment::where('student_id', $student->id)
                ->where('course_section_id', $section->id)
                ->exists();

            if ($alreadyEnrolled) {
                continue;
            }

            if ($this->enrollStudentInSection($student, $section)) {
                $enrolledCredits += $section->course->credits;
                $enrollmentCount++;
            }
        }

        // Update student's credits in progress
        $student->credits_in_progress = $enrolledCredits;
        $student->save();

        return $enrollmentCount;
    }

    private function enrollStudentInSection(Student $student, CourseSection $section): bool
    {
        // Check if already enrolled in this section
        $existingEnrollment = Enrollment::where('student_id', $student->id)
            ->where('course_section_id', $section->id)
            ->exists();

        if ($existingEnrollment) {
            return false;
        }

        // Check if already enrolled in another section of the same course this term
        $enrolledInCourse = Enrollment::where('student_id', $student->id)
            ->whereHas('courseSection', function ($query) use ($section) {
                $query->where('course_id', $section->course_id)
                      ->where('term_id', $section->term_id);
            })
            ->exists();

        if ($enrolledInCourse) {
            return false;
        }

        // Check capacity
        $currentEnrollment = Enrollment::where('course_section_id', $section->id)
            ->whereIn('status', ['enrolled', 'completed'])
            ->count();

        if ($currentEnrollment >= $section->capacity) {
            // Try to add to waitlist instead
            if (fake()->boolean(30)) {
                Enrollment::firstOrCreate([
                    'student_id' => $student->id,
                    'course_section_id' => $section->id,
                ], [
                    'status' => 'waitlisted',
                    'enrollment_date' => now(),
                ]);
            }
            return false;
        }

        Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_section_id' => $section->id,
        ], [
            'status' => 'enrolled',
            'enrollment_date' => now(),
        ]);

        return true;
    }
}
