<?php

namespace App\Services;

use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;

class TranscriptService
{
    private StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function generateTranscriptData(Student $student): array
    {
        $student->load(['user', 'majorProgram.department', 'minorProgram']);

        $enrollments = $student->enrollments()
            ->where('status', 'completed')
            ->whereNotNull('grade')
            ->with(['courseSection.course', 'courseSection.term'])
            ->get();

        // Group by term
        $termGroups = $enrollments->groupBy(function ($enrollment) {
            return $enrollment->courseSection->term->name ?? 'Unknown';
        });

        $terms = [];
        $cumulativeCredits = 0;
        $cumulativePoints = 0;

        foreach ($termGroups as $termName => $termEnrollments) {
            $termCredits = 0;
            $termPoints = 0;
            $courses = [];

            foreach ($termEnrollments as $enrollment) {
                $course = $enrollment->courseSection->course;
                $credits = $course->credits;
                $grade = $enrollment->grade;
                $points = $this->gradeToPoints($grade);

                $courses[] = [
                    'code' => $course->course_code,
                    'title' => $course->title,
                    'credits' => $credits,
                    'grade' => $grade,
                    'points' => $points * $credits,
                ];

                if (!in_array($grade, ['W', 'WF', 'I', 'P', 'NP'])) {
                    $termCredits += $credits;
                    $termPoints += ($points * $credits);
                }
            }

            $cumulativeCredits += $termCredits;
            $cumulativePoints += $termPoints;

            $terms[] = [
                'name' => $termName,
                'courses' => $courses,
                'term_credits' => $termCredits,
                'term_gpa' => $termCredits > 0 ? round($termPoints / $termCredits, 2) : 0,
                'cumulative_credits' => $cumulativeCredits,
                'cumulative_gpa' => $cumulativeCredits > 0 ? round($cumulativePoints / $cumulativeCredits, 2) : 0,
            ];
        }

        return [
            'student' => [
                'name' => $student->first_name . ' ' . $student->last_name,
                'student_number' => $student->student_number,
                'email' => $student->user->email ?? '',
                'program' => $student->majorProgram->name ?? 'Undeclared',
                'department' => $student->majorProgram->department->name ?? '',
                'admission_date' => $student->admission_date?->format('F Y'),
                'class_standing' => $student->class_standing,
            ],
            'terms' => $terms,
            'cumulative_gpa' => $cumulativeCredits > 0 ? round($cumulativePoints / $cumulativeCredits, 2) : 0,
            'total_credits' => $cumulativeCredits,
            'issue_date' => now()->format('F j, Y'),
        ];
    }

    public function generatePDF(Student $student)
    {
        $data = $this->generateTranscriptData($student);

        return Pdf::loadView('transcripts.official', $data)
            ->setPaper('a4')
            ->setOption('margin-top', 15)
            ->setOption('margin-bottom', 15);
    }

    private function gradeToPoints(string $grade): float
    {
        $scale = [
            'A+' => 4.3, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'D-' => 0.7,
            'F' => 0.0,
        ];

        return $scale[strtoupper($grade)] ?? 0.0;
    }
}
