<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\Request;

class DegreeAuditController extends Controller
{
    private StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function current(Student $student)
    {
        $programId = $student->major_program_id;

        if (! $programId) {
            return response()->json(['message' => 'Student has no major program assigned.'], 422);
        }

        $audit = $this->studentService->checkDegreeProgress($student, $programId);

        return response()->json(['data' => $audit]);
    }

    public function whatIf(Request $request, Student $student)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
        ]);

        $currentAudit = null;
        if ($student->major_program_id) {
            $currentAudit = $this->studentService->checkDegreeProgress($student, $student->major_program_id);
        }

        $whatIfAudit = $this->studentService->checkDegreeProgress($student, $request->program_id);

        return response()->json([
            'data' => [
                'current' => $currentAudit,
                'what_if' => $whatIfAudit,
            ],
        ]);
    }
}
