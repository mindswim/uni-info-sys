<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Term;
use Barryvdh\DomPDF\Facade\Pdf;

class EnrollmentVerificationService
{
    public function generateLetter(Student $student, ?Term $term = null): \Barryvdh\DomPDF\PDF
    {
        $term = $term ?? Term::where('is_current', true)->firstOrFail();

        $enrollments = Enrollment::where('student_id', $student->id)
            ->where('status', 'enrolled')
            ->whereHas('courseSection', function ($q) use ($term) {
                $q->where('term_id', $term->id);
            })
            ->with('courseSection.course')
            ->get();

        $totalCredits = $enrollments->sum(function ($enrollment) {
            return $enrollment->courseSection->course->credit_hours ?? 0;
        });

        $enrollmentStatus = $totalCredits >= 12 ? 'Full-Time' : ($totalCredits >= 6 ? 'Half-Time' : 'Less than Half-Time');

        $data = [
            'student' => $student->load('user'),
            'term' => $term,
            'enrollments' => $enrollments,
            'total_credits' => $totalCredits,
            'enrollment_status' => $enrollmentStatus,
            'issue_date' => now()->format('F j, Y'),
            'verification_code' => strtoupper(substr(md5($student->id . $term->id . now()->timestamp), 0, 10)),
        ];

        return Pdf::loadView('letters.enrollment-verification', $data);
    }
}
