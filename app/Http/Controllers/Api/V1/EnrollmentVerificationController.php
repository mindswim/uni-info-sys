<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\EnrollmentVerificationService;

class EnrollmentVerificationController extends Controller
{
    public function __construct(
        private EnrollmentVerificationService $service
    ) {}

    public function generate(Student $student)
    {
        $pdf = $this->service->generateLetter($student);

        return $pdf->download("enrollment-verification-{$student->id}.pdf");
    }
}
