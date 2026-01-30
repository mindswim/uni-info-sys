<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\TranscriptService;

class TranscriptController extends Controller
{
    private TranscriptService $transcriptService;

    public function __construct(TranscriptService $transcriptService)
    {
        $this->transcriptService = $transcriptService;
    }

    public function show(Student $student)
    {
        $data = $this->transcriptService->generateTranscriptData($student);

        return response()->json(['data' => $data]);
    }

    public function download(Student $student)
    {
        $pdf = $this->transcriptService->generatePDF($student);

        $filename = 'transcript_'.$student->student_number.'_'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }
}
